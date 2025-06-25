-- Add a dedicated column to store the authentication user ID
ALTER TABLE public.users ADD COLUMN auth_user_id UUID UNIQUE;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);

-- Backfill the new column for existing users
-- This assumes that the email address is a reliable unique identifier to link the two tables.
UPDATE public.users u
SET auth_user_id = au.id
FROM auth.users au
WHERE u.email = au.email;

-- For the specific user having issues, ensure the main ID is also aligned.
-- This is a critical step to fix the immediate problem without breaking existing foreign keys.
UPDATE public.users
SET id = (SELECT id FROM auth.users WHERE email = 'fernandoapplehtml@gmail.com')
WHERE email = 'fernandoapplehtml@gmail.com'; 