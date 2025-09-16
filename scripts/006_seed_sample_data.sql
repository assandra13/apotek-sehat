-- Insert sample drugs data
INSERT INTO public.drugs (name, generic_name, manufacturer, category, unit, price, stock_quantity, minimum_stock, expiry_date, batch_number, description) VALUES
('Paracetamol 500mg', 'Paracetamol', 'Kimia Farma', 'Analgesik', 'tablet', 500.00, 100, 20, '2025-12-31', 'PCM001', 'Obat penurun demam dan pereda nyeri'),
('Amoxicillin 500mg', 'Amoxicillin', 'Indofarma', 'Antibiotik', 'kapsul', 2500.00, 50, 10, '2025-06-30', 'AMX001', 'Antibiotik untuk infeksi bakteri'),
('OBH Combi', 'Dextromethorphan HBr', 'OBH', 'Batuk & Flu', 'botol', 15000.00, 25, 5, '2025-08-15', 'OBH001', 'Obat batuk berdahak'),
('Betadine Solution', 'Povidone Iodine', 'Mundipharma', 'Antiseptik', 'botol', 25000.00, 30, 5, '2026-01-20', 'BTD001', 'Antiseptik untuk luka'),
('Vitamin C 1000mg', 'Ascorbic Acid', 'Blackmores', 'Vitamin', 'tablet', 150000.00, 20, 5, '2025-11-30', 'VTC001', 'Suplemen vitamin C'),
('Antangin JRG', 'Jahe, Ginseng', 'Delta Djakarta', 'Herbal', 'sachet', 3000.00, 200, 50, '2025-09-15', 'ATG001', 'Obat masuk angin herbal'),
('Mylanta Tablet', 'Aluminium Hydroxide', 'Johnson & Johnson', 'Maag', 'tablet', 8000.00, 75, 15, '2025-07-10', 'MYL001', 'Obat sakit maag'),
('Bodrex Extra', 'Paracetamol, Caffeine', 'Tempo Scan Pacific', 'Analgesik', 'tablet', 2000.00, 150, 30, '2025-10-25', 'BDX001', 'Obat sakit kepala extra'),
('Promag Tablet', 'Attapulgite', 'Kalbe Farma', 'Diare', 'tablet', 5000.00, 60, 12, '2025-05-20', 'PMG001', 'Obat diare dan sakit perut'),
('Decolgen', 'Phenylpropanolamine HCl', 'Taisho', 'Flu', 'tablet', 4000.00, 80, 16, '2025-12-05', 'DCG001', 'Obat flu dan hidung tersumbat');
