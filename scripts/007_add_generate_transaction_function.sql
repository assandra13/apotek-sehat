-- Create function to generate transaction number (if not exists)
CREATE OR REPLACE FUNCTION generate_transaction_number()
RETURNS TEXT AS $$
DECLARE
  current_date TEXT;
  sequence_num INTEGER;
BEGIN
  current_date := TO_CHAR(NOW(), 'YYYYMMDD');
  
  -- Get the next sequence number for today
  SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 10) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM public.sales
  WHERE transaction_number LIKE 'TRX' || current_date || '%';
  
  RETURN 'TRX' || current_date || LPAD(sequence_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
