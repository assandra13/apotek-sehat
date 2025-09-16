-- Create sale items table for transaction details
CREATE TABLE IF NOT EXISTS public.sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  drug_id UUID NOT NULL REFERENCES public.drugs(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sale_items table
CREATE POLICY "sale_items_select_authenticated" ON public.sale_items 
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "sale_items_insert_authenticated" ON public.sale_items 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_drug ON public.sale_items(drug_id);
