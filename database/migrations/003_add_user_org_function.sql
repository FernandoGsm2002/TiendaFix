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