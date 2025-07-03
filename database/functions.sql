-- Function to get the organization_id for the currently authenticated user
create or replace function get_user_org_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select organization_id
  from users
  where auth_user_id = auth.uid();
$$;

-- Function to get the public user profile ID for the currently authenticated user
create or replace function get_user_profile_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select id
  from users
  where auth_user_id = auth.uid();
$$;

-- Function to update last_login for the current user
create or replace function update_user_last_login()
returns void
language sql
security definer
set search_path = public
as $$
  update users 
  set last_login = now() 
  where auth_user_id = auth.uid();
$$;

create or replace function get_dashboard_stats(p_org_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
DECLARE
  result jsonb;
  v_today_start timestamptz := date_trunc('day', now());
  v_today_end timestamptz := v_today_start + interval '1 day';
  v_seven_days_ago timestamptz := v_today_start - interval '6 days';
  
  -- Variables para contadores
  v_total_repairs int := 0;
  v_pending_repairs int := 0;
  v_in_progress_repairs int := 0;
  v_completed_repairs int := 0;
  v_total_customers int := 0;
  v_total_devices int := 0;
  v_total_revenue decimal := 0;
  v_today_repairs int := 0;
  v_daily_revenue decimal := 0;
  v_total_unlocks int := 0;
  v_today_unlocks int := 0;
  
  -- Variables para gráficos
  v_weekly_repairs jsonb := '[]';
  v_weekly_revenue jsonb := '[]';
  v_status_distribution jsonb := '{}';
  v_device_types jsonb := '{}';
  v_recent_activity jsonb := '[]';
  
  -- Variables temporales
  v_day_count int;
  v_current_date date;
  v_day_repairs int;
  v_day_revenue decimal;
  
BEGIN
  -- Validar que el organization_id no sea null
  IF p_org_id IS NULL THEN
    RETURN jsonb_build_object(
      'error', true,
      'message', 'Organization ID is required'
    );
  END IF;

  -- Contadores básicos
  SELECT count(*) INTO v_total_repairs FROM repairs WHERE organization_id = p_org_id;
  SELECT count(*) INTO v_pending_repairs FROM repairs WHERE organization_id = p_org_id AND status = 'received';
  SELECT count(*) INTO v_in_progress_repairs FROM repairs WHERE organization_id = p_org_id AND status IN ('diagnosed', 'in_progress', 'waiting_parts');
  SELECT count(*) INTO v_completed_repairs FROM repairs WHERE organization_id = p_org_id AND status IN ('completed', 'delivered');
  SELECT count(*) INTO v_total_customers FROM customers WHERE organization_id = p_org_id;
  SELECT count(*) INTO v_total_devices FROM devices WHERE organization_id = p_org_id;
  
  -- Calcular ingresos totales incluyendo reparaciones, desbloqueos y ventas
  SELECT 
    coalesce(
      (SELECT sum(cost) FROM repairs 
       WHERE organization_id = p_org_id 
       AND status IN ('completed', 'delivered') 
       AND cost IS NOT NULL), 0
    ) +
    coalesce(
      (SELECT sum(cost) FROM unlocks 
       WHERE organization_id = p_org_id 
       AND status = 'completed'), 0
    ) +
    coalesce(
      (SELECT sum(total) FROM sales 
       WHERE organization_id = p_org_id 
       AND status = 'completed'), 0
    )
  INTO v_total_revenue;
  
  SELECT count(*) INTO v_today_repairs FROM repairs WHERE organization_id = p_org_id AND created_at >= v_today_start AND created_at < v_today_end;
  
  -- Calcular ingresos diarios incluyendo reparaciones, desbloqueos y ventas
  SELECT 
    coalesce(
      (SELECT sum(cost) FROM repairs 
       WHERE organization_id = p_org_id 
       AND status IN ('completed', 'delivered') 
       AND updated_at >= v_today_start), 0
    ) +
    coalesce(
      (SELECT sum(cost) FROM unlocks 
       WHERE organization_id = p_org_id 
       AND status = 'completed' 
       AND updated_at >= v_today_start), 0
    ) +
    coalesce(
      (SELECT sum(total) FROM sales 
       WHERE organization_id = p_org_id 
       AND status = 'completed' 
       AND updated_at >= v_today_start), 0
    )
  INTO v_daily_revenue;
  
  SELECT count(*) INTO v_total_unlocks FROM unlocks WHERE organization_id = p_org_id;
  SELECT count(*) INTO v_today_unlocks FROM unlocks WHERE organization_id = p_org_id AND created_at >= v_today_start;

  -- Datos semanales de reparaciones
  v_weekly_repairs := '[]'::jsonb;
  FOR v_day_count IN 0..6 LOOP
    v_current_date := (v_seven_days_ago + (v_day_count || ' days')::interval)::date;
    SELECT count(*) INTO v_day_repairs FROM repairs WHERE organization_id = p_org_id AND created_at::date = v_current_date;
    v_weekly_repairs := v_weekly_repairs || jsonb_build_object('date', v_current_date, 'count', v_day_repairs);
  END LOOP;

  -- Datos semanales de ingresos (incluyendo reparaciones, desbloqueos y ventas)
  v_weekly_revenue := '[]'::jsonb;
  FOR v_day_count IN 0..6 LOOP
    v_current_date := (v_seven_days_ago + (v_day_count || ' days')::interval)::date;
    
    SELECT 
      coalesce(
        (SELECT sum(cost) FROM repairs 
         WHERE organization_id = p_org_id 
         AND created_at::date = v_current_date 
         AND status IN ('completed', 'delivered') 
         AND cost IS NOT NULL), 0
      ) +
      coalesce(
        (SELECT sum(cost) FROM unlocks 
         WHERE organization_id = p_org_id 
         AND created_at::date = v_current_date 
         AND status = 'completed'), 0
      ) +
      coalesce(
        (SELECT sum(total) FROM sales 
         WHERE organization_id = p_org_id 
         AND created_at::date = v_current_date 
         AND status = 'completed'), 0
      )
    INTO v_day_revenue;
    
    v_weekly_revenue := v_weekly_revenue || jsonb_build_object('date', v_current_date, 'revenue', v_day_revenue);
  END LOOP;

  -- Distribución por estado
  v_status_distribution := jsonb_build_object('pending', v_pending_repairs, 'in_progress', v_in_progress_repairs, 'completed', v_completed_repairs);

  -- Distribución por tipo de dispositivo
  SELECT jsonb_object_agg(device_type, count) INTO v_device_types FROM (SELECT device_type, count(*) AS count FROM devices WHERE organization_id = p_org_id GROUP BY device_type ORDER BY count DESC LIMIT 5) t;

  -- Actividad reciente
  SELECT jsonb_agg(activity) INTO v_recent_activity FROM (
    SELECT 
      'reparacion' AS type, 
      r.id, 
      coalesce('Reparación: ' || d.brand || ' ' || d.model, 'Nueva Reparación Registrada') AS title,
      r.created_at AS "timestamp"
    FROM repairs r
    LEFT JOIN devices d ON r.device_id = d.id
    WHERE r.organization_id = p_org_id
    UNION ALL
    SELECT 
      'desbloqueo' AS type, 
      id, 
      'Desbloqueo: ' || brand || ' ' || model AS title, 
      created_at AS "timestamp" 
    FROM unlocks 
    WHERE organization_id = p_org_id
    UNION ALL
    SELECT 
      'venta' AS type, 
      s.id, 
      'Venta POS - Total: $' || s.total AS title, 
      s.created_at AS "timestamp" 
    FROM sales s
    WHERE s.organization_id = p_org_id
    ORDER BY "timestamp" DESC
    LIMIT 5
  ) AS activity;

  -- Construir resultado final
  result := jsonb_build_object(
    'counters', jsonb_build_object(
      'totalRepairs', v_total_repairs,
      'pendingRepairs', v_pending_repairs,
      'inProgressRepairs', v_in_progress_repairs,
      'completedRepairs', v_completed_repairs,
      'totalCustomers', v_total_customers,
      'totalDevices', v_total_devices,
      'totalRevenue', v_total_revenue,
      'todayRepairs', v_today_repairs,
      'dailyRevenue', v_daily_revenue,
      'totalUnlocks', v_total_unlocks,
      'todayUnlocks', v_today_unlocks
    ),
    'charts', jsonb_build_object(
      'weeklyRepairs', v_weekly_repairs,
      'weeklyRevenue', v_weekly_revenue,
      'statusDistribution', v_status_distribution,
      'deviceTypes', coalesce(v_device_types, '{}'::jsonb)
    ),
    'recentActivity', coalesce(v_recent_activity, '[]'::jsonb)
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'error', true,
      'message', 'Error getting dashboard stats: ' || SQLERRM
    );
END;
$$;

create or replace function get_reports_data(p_org_id uuid, p_start_date timestamptz, p_end_date timestamptz)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  with 
    -- Estadísticas de ventas
    sales_stats as (
      select
        coalesce(sum(s.total), 0) as total_revenue,
        count(*) as total_sales,
        coalesce(avg(s.total), 0) as avg_sale_value
      from sales s
      where s.organization_id = p_org_id
      and s.created_at between p_start_date and p_end_date
    ),
    -- Total de reparaciones
    repairs_stats as (
      select
        count(*) as total_repairs,
        count(*) filter (where status = 'delivered') as completed_repairs,
        coalesce(sum(cost), 0) as total_repair_cost,
        coalesce(extract(epoch from avg(delivered_date - received_date) filter (where status = 'delivered'))/86400, 0) as avg_completion_time
      from repairs
      where organization_id = p_org_id
      and created_at between p_start_date and p_end_date
    ),
    -- Nuevos clientes
    customers_stats as (
      select count(*) as new_customers
      from customers
      where organization_id = p_org_id
      and created_at between p_start_date and p_end_date
    ),
    -- Total de dispositivos
    devices_stats as (
      select count(*) as total_devices
      from devices
      where organization_id = p_org_id
      and created_at between p_start_date and p_end_date
    ),
    -- Ventas por día
    daily_sales as (
      select 
        date_trunc('day', s.created_at)::date as sale_date,
        sum(s.total) as daily_total,
        count(*) as daily_count
      from sales s
      where s.organization_id = p_org_id
      and s.created_at between p_start_date and p_end_date
      group by date_trunc('day', s.created_at)::date
    ),
    -- Serie de fechas completa
    date_series as (
      select generate_series(
        date_trunc('day', p_start_date),
        date_trunc('day', p_end_date),
        '1 day'::interval
      )::date as day
    ),
    -- Reparaciones por estado
    repairs_by_status as (
      select 
        status,
        count(*) as count
      from repairs
      where organization_id = p_org_id
      and created_at between p_start_date and p_end_date
      group by status
    ),
    -- Reparaciones por prioridad
    repairs_by_priority as (
      select 
        priority,
        count(*) as count
      from repairs
      where organization_id = p_org_id
      and created_at between p_start_date and p_end_date
      group by priority
    ),
    -- Top productos
    top_products as (
      select 
        i.id,
        i.name,
        i.category,
        sum(si.quantity) as total_quantity,
        sum(si.total_price) as total_revenue
      from sales s
      join sale_items si on s.id = si.sale_id
      join inventory i on si.inventory_id = i.id
      where s.organization_id = p_org_id
      and s.created_at between p_start_date and p_end_date
      group by i.id, i.name, i.category
      order by sum(si.quantity) desc
      limit 5
    ),
    -- Ventas por categoría
    sales_by_category as (
      select 
        i.category,
        sum(si.total_price) as total_revenue,
        count(*) as total_sales
      from sales s
      join sale_items si on s.id = si.sale_id
      join inventory i on si.inventory_id = i.id
      where s.organization_id = p_org_id
      and s.created_at between p_start_date and p_end_date
      group by i.category
    ),
    activity_calc as (
      select
        jsonb_agg(
          jsonb_build_object(
            'type', a.type,
            'title', a.title,
            'created_at', a.created_at,
            'customer', a.customer
          ) order by a.created_at desc
        ) as "recentActivity"
      from (
        (
          select
            'venta' as type,
            i.name as title,
            s.created_at,
            c.name as customer
          from sales s
          join sale_items si on s.id = si.sale_id
          join inventory i on si.inventory_id = i.id
          left join customers c on s.customer_id = c.id
          where s.organization_id = p_org_id
          order by s.created_at desc
          limit 3
        )
        union all
        (
          select
            'reparación' as type,
            r.title,
            r.created_at,
            coalesce(c.name, r.unregistered_customer_name) as customer
          from repairs r
          left join customers c on r.customer_id = c.id
          where r.organization_id = p_org_id
          order by r.created_at desc
          limit 3
        )
      ) as a
    )
  -- Construir el resultado final
  select jsonb_build_object(
    'summary', (
      select jsonb_build_object(
        'totalRevenue', s.total_revenue,
        'totalSales', s.total_sales,
        'avgSaleValue', s.avg_sale_value,
        'totalRepairs', r.total_repairs,
        'completedRepairs', r.completed_repairs,
        'totalRepairRevenue', r.total_repair_cost,
        'avgCompletionTime', r.avg_completion_time,
        'newCustomers', c.new_customers,
        'newDevices', d.total_devices
      )
      from sales_stats s
      cross join repairs_stats r
      cross join customers_stats c
      cross join devices_stats d
    ),
    'dailySales', (
      select jsonb_agg(
        jsonb_build_object(
          'date', ds.day,
          'total', coalesce(d.daily_total, 0),
          'count', coalesce(d.daily_count, 0)
        )
        order by ds.day
      )
      from date_series ds
      left join daily_sales d on ds.day = d.sale_date
    ),
    'repairsByStatus', (
      select jsonb_object_agg(
        status,
        count
      )
      from repairs_by_status
    ),
    'repairsByPriority', (
      select jsonb_object_agg(
        priority,
        count
      )
      from repairs_by_priority
    ),
    'topProducts', (
      select jsonb_agg(
        jsonb_build_object(
          'id', id,
          'name', name,
          'category', category,
          'quantity', total_quantity,
          'revenue', total_revenue
        )
      )
      from top_products
    ),
    'salesByCategory', (
      select jsonb_agg(
        jsonb_build_object(
          'category', category,
          'revenue', total_revenue,
          'count', total_sales
        )
      )
      from sales_by_category
    ),
    'recentActivity', (
      select "recentActivity" from activity_calc
    )
  ) into result;

  return result;
end;
$$;

create or replace function get_reports_data_v2(p_org_id uuid, p_start_date timestamptz, p_end_date timestamptz)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  with 
    sales_stats as (
      select
        coalesce(sum(s.total), 0) as total_revenue,
        count(*) as total_sales,
        coalesce(avg(s.total), 0) as avg_sale_value
      from sales s
      where s.organization_id = p_org_id
      and s.created_at between p_start_date and p_end_date
    ),
    repair_stats as (
      select
        count(*) as total_repairs,
        count(*) filter (where status = 'completed') as completed_repairs
      from repairs r
      where r.organization_id = p_org_id
      and r.created_at between p_start_date and p_end_date
    ),
    customer_stats as (
      select
        count(*) as new_customers
      from customers c
      where c.organization_id = p_org_id
      and c.created_at between p_start_date and p_end_date
    ),
    repairs_by_status as (
      select
        jsonb_object_agg(status, count) as status_counts
      from (
        select status, count(*)
        from repairs
        where organization_id = p_org_id
        and created_at between p_start_date and p_end_date
        group by status
      ) s
    ),
    repairs_by_priority as (
      select
        jsonb_object_agg(priority, count) as priority_counts
      from (
        select priority, count(*)
        from repairs
        where organization_id = p_org_id
        and created_at between p_start_date and p_end_date
        group by priority
      ) p
    ),
    sales_by_category as (
      select
        jsonb_agg(
          jsonb_build_object(
            'category', category,
            'total', total_amount
          )
        ) as category_data
      from (
        select 
          i.category,
          sum(si.quantity * si.unit_price) as total_amount
        from sales s
        join sale_items si on s.id = si.sale_id
        join inventory i on si.inventory_id = i.id
        where s.organization_id = p_org_id
        and s.created_at between p_start_date and p_end_date
        group by i.category
      ) c
    ),
    sales_over_time as (
      select
        jsonb_agg(
          jsonb_build_object(
            'date', date,
            'total', daily_total
          ) order by date
        ) as time_data
      from (
        select 
          date_trunc('day', created_at)::date as date,
          sum(total) as daily_total
        from sales
        where organization_id = p_org_id
        and created_at between p_start_date and p_end_date
        group by date_trunc('day', created_at)::date
      ) t
    )
  select 
    jsonb_build_object(
      'stats', jsonb_build_object(
        'total_revenue', (select total_revenue from sales_stats),
        'total_sales', (select total_sales from sales_stats),
        'avg_sale_value', (select avg_sale_value from sales_stats),
        'total_repairs', (select total_repairs from repair_stats),
        'completed_repairs', (select completed_repairs from repair_stats),
        'new_customers', (select new_customers from customer_stats)
      ),
      'charts', jsonb_build_object(
        'repairs_by_status', coalesce((select status_counts from repairs_by_status), '{}'),
        'repairs_by_priority', coalesce((select priority_counts from repairs_by_priority), '{}'),
        'sales_by_category', coalesce((select category_data from sales_by_category), '[]'),
        'sales_over_time', coalesce((select time_data from sales_over_time), '[]')
      )
    ) into result;
    
  return result;
end;
$$; 
$$; 
