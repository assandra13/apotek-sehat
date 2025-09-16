-- Create sales transactions table
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number TEXT NOT NULL UNIQUE,
  cashier_id UUID NOT NULL REFERENCES public.users(id),
  customer_name TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sales table
CREATE POLICY "sales_select_authenticated" ON public.sales 
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "sales_insert_authenticated" ON public.sales 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_sales_date ON public.sales(transaction_date);
CREATE INDEX IF NOT EXISTS idx_sales_cashier ON public.sales(cashier_id);
