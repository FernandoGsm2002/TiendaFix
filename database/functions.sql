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
declare
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
  
  -- Variables para gráficos
  v_weekly_repairs jsonb := '[]';
  v_weekly_revenue jsonb := '[]';
  v_status_distribution jsonb := '{}';
  v_device_types jsonb := '{}';
  
  -- Variables temporales
  v_day_count int;
  v_current_date date;
  v_day_repairs int;
  v_day_revenue decimal;
  
begin
  -- Validar que el organization_id no sea null
  if p_org_id is null then
    return jsonb_build_object(
      'error', true,
      'message', 'Organization ID is required'
    );
  end if;

  -- Contadores básicos
  select count(*) into v_total_repairs 
  from repairs where organization_id = p_org_id;
  
  select count(*) into v_pending_repairs 
  from repairs where organization_id = p_org_id and status = 'received';
  
  select count(*) into v_in_progress_repairs 
  from repairs where organization_id = p_org_id and status in ('diagnosed', 'in_progress', 'waiting_parts');
  
  select count(*) into v_completed_repairs 
  from repairs where organization_id = p_org_id and status in ('completed', 'delivered');
  
  select count(*) into v_total_customers 
  from customers where organization_id = p_org_id;
  
  select count(*) into v_total_devices 
  from devices where organization_id = p_org_id;
  
  select coalesce(sum(cost), 0) into v_total_revenue 
  from repairs where organization_id = p_org_id and status in ('completed', 'delivered') and cost is not null;
  
  select count(*) into v_today_repairs 
  from repairs where organization_id = p_org_id and created_at >= v_today_start and created_at < v_today_end;

  -- Datos semanales de reparaciones
  v_weekly_repairs := '[]'::jsonb;
  for v_day_count in 0..6 loop
    v_current_date := (v_seven_days_ago + (v_day_count || ' days')::interval)::date;
    
    select count(*) into v_day_repairs
    from repairs 
    where organization_id = p_org_id 
      and created_at::date = v_current_date;
    
    v_weekly_repairs := v_weekly_repairs || jsonb_build_object(
      'date', v_current_date,
      'count', v_day_repairs
    );
  end loop;

  -- Datos semanales de ingresos
  v_weekly_revenue := '[]'::jsonb;
  for v_day_count in 0..6 loop
    v_current_date := (v_seven_days_ago + (v_day_count || ' days')::interval)::date;
    
    select coalesce(sum(cost), 0) into v_day_revenue
    from repairs 
    where organization_id = p_org_id 
      and created_at::date = v_current_date
      and status in ('completed', 'delivered')
      and cost is not null;
    
    v_weekly_revenue := v_weekly_revenue || jsonb_build_object(
      'date', v_current_date,
      'revenue', v_day_revenue
    );
  end loop;

  -- Distribución por estado
  v_status_distribution := jsonb_build_object(
    'pending', v_pending_repairs,
    'in_progress', v_in_progress_repairs,
    'completed', v_completed_repairs
  );

  -- Distribución por tipo de dispositivo
  select jsonb_object_agg(device_type, count) into v_device_types
  from (
    select device_type, count(*) as count
    from devices 
    where organization_id = p_org_id
    group by device_type
    order by count desc
    limit 5
  ) t;

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
      'todayRepairs', v_today_repairs
    ),
    'charts', jsonb_build_object(
      'weeklyRepairs', v_weekly_repairs,
      'weeklyRevenue', v_weekly_revenue,
      'statusDistribution', v_status_distribution,
      'deviceTypes', coalesce(v_device_types, '{}'::jsonb)
    )
  );

  return result;

exception
  when others then
    return jsonb_build_object(
      'error', true,
      'message', 'Error getting dashboard stats: ' || SQLERRM
    );
end;
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
