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