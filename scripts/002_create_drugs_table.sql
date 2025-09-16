-- Create drugs table for medicine inventory
CREATE TABLE IF NOT EXISTS public.drugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  generic_name TEXT,
  manufacturer TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL, -- tablet, botol, strip, etc.
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  minimum_stock INTEGER NOT NULL DEFAULT 10,
  expiry_date DATE NOT NULL,
  batch_number TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.drugs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for drugs table - both admin and cashier can read
CREATE POLICY "drugs_select_authenticated" ON public.drugs 
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admin can insert, update, delete drugs
CREATE POLICY "admin_drugs_insert" ON public.drugs 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "admin_drugs_update" ON public.drugs 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "admin_drugs_delete" ON public.drugs 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_drugs_name ON public.drugs(name);
CREATE INDEX IF NOT EXISTS idx_drugs_expiry ON public.drugs(expiry_date);
CREATE INDEX IF NOT EXISTS idx_drugs_stock ON public.drugs(stock_quantity);
