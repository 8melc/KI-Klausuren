-- Add stripe_customer_id column to users table for customer history tracking
-- This allows Stripe to link payments to the same customer across sessions

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON public.users(stripe_customer_id);

-- Add comment
COMMENT ON COLUMN public.users.stripe_customer_id IS 'Stripe Customer ID for linking payment history';







