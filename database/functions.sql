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
begin
  -- Aggregate all stats in a single query
  select jsonb_build_object(
    'stats', jsonb_build_object(
      'customers', (select count(*) from customers where organization_id = p_org_id),
      'devices', (select count(*) from devices where organization_id = p_org_id),
      'repairs', (select count(*) from repairs where organization_id = p_org_id and status in ('received', 'diagnosed', 'in_progress', 'waiting_parts')),
      'potentialRevenue', (select coalesce(sum(estimated_cost), 0) from repairs where organization_id = p_org_id and status in ('received', 'diagnosed', 'in_progress', 'waiting_parts')),
      'inventory', (select count(*) from inventory where organization_id = p_org_id and is_active = true),
      'unlocks', (select count(*) from unlocks where organization_id = p_org_id),
      'dailySales', (select count(*) from sales where organization_id = p_org_id and created_at >= v_today_start and created_at < v_today_end),
      'dailyRevenue', (select coalesce(sum(total), 0) from sales where organization_id = p_org_id and created_at >= v_today_start and created_at < v_today_end)
    ),
    'chartData', jsonb_build_object(
      'repairsByStatus', (
        select jsonb_object_agg(status, count)
        from (
          select status, count(*) as count
          from repairs
          where organization_id = p_org_id
          group by status
        ) as grouped_repairs
      ),
      'salesLast7Days', (
        with series as (
          select generate_series(v_seven_days_ago, v_today_start, '1 day') as day
        )
        select jsonb_agg(t.daily_data order by t.day)
        from (
          select
            series.day,
            jsonb_build_object(
              'day', to_char(series.day, 'Dy'),
              'total', coalesce(sum(sales.total), 0)
            ) as daily_data
          from series
          left join sales on date_trunc('day', sales.created_at) = series.day and sales.organization_id = p_org_id
          group by series.day
        ) t
      )
    ),
    'recentActivity', (
        select jsonb_agg(activity order by activity->>'time' desc)
        from (
            (select 
                jsonb_build_object(
                    'type', 'reparación',
                    'title', r.title || ' (' || d.brand || ' ' || d.model || ')',
                    'time', r.created_at,
                    'customer', coalesce(c.name, c.anonymous_identifier, 'Sistema')
                ) as activity
            from repairs r
            join devices d on r.device_id = d.id
            left join customers c on r.customer_id = c.id
            where r.organization_id = p_org_id
            order by r.created_at desc
            limit 3)
            union all
            (select 
                jsonb_build_object(
                    'type', 'venta',
                    'title', 'Venta por ' || s.total,
                    'time', s.created_at,
                    'customer', coalesce(c.name, c.anonymous_identifier, 'Sistema')
                ) as activity
            from sales s
            left join customers c on s.customer_id = c.id
            where s.organization_id = p_org_id
            order by s.created_at desc
            limit 3)
        ) as recent_items
    )
  ) into result;

  return result;
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
        coalesce(sum(estimated_cost), 0) as total_estimated_cost,
        coalesce(sum(final_cost), 0) as total_final_cost,
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
        sum(si.quantity) as total_quantity
      from sales s
      join sale_items si on s.id = si.sale_id
      join inventory i on si.inventory_id = i.id
      where s.organization_id = p_org_id
      and s.created_at between p_start_date and p_end_date
      group by i.category
    )
  select jsonb_build_object(
    'stats', (
      select jsonb_build_object(
        'total_revenue', total_revenue,
        'total_sales', total_sales,
        'total_repairs', total_repairs,
        'completed_repairs', completed_repairs,
        'new_customers', new_customers,
        'avg_sale_value', avg_sale_value,
        'total_devices', total_devices
      )
      from sales_stats, repairs_stats, customers_stats, devices_stats
    ),
    'charts', jsonb_build_object(
      'sales_over_time', (
        select jsonb_agg(
          jsonb_build_object(
            'date', to_char(d.day, 'YYYY-MM-DD'),
            'sales', coalesce(s.daily_total, 0),
            'count', coalesce(s.daily_count, 0)
          )
          order by d.day
        )
        from date_series d
        left join daily_sales s on d.day = s.sale_date
      ),
      'repairs_by_status', (
        select jsonb_object_agg(status, count)
        from repairs_by_status
      ),
      'repairs_by_priority', (
        select jsonb_object_agg(priority, count)
        from repairs_by_priority
      ),
      'sales_by_category', (
        select jsonb_agg(
          jsonb_build_object(
            'category', category,
            'revenue', total_revenue,
            'quantity', total_quantity
          )
        )
        from sales_by_category
      )
    ),
    'top_products', (
      select jsonb_agg(
        jsonb_build_object(
          'id', id,
          'name', name,
          'category', category,
          'units_sold', total_quantity,
          'total_revenue', total_revenue
        )
      )
      from top_products
    ),
    'repair_summary', (
      select jsonb_build_object(
        'total_estimated_cost', total_estimated_cost,
        'total_final_cost', total_final_cost,
        'avg_completion_time', avg_completion_time
      )
      from repairs_stats
    )
  ) into result;

  return result;
end;
$$; 