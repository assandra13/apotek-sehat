# API Documentation - Sistem Informasi Apotek Sehat

## Overview

Sistem ini menggunakan Next.js API Routes dan Supabase untuk backend operations. Semua API endpoints dilindungi dengan authentication dan role-based access control.

## Authentication

### Base URL
\`\`\`
https://your-domain.vercel.app/api
\`\`\`

### Headers
\`\`\`
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json
\`\`\`

## Database Schema

### Users Table
\`\`\`sql
users (
  id: UUID (Primary Key, Foreign Key to auth.users)
  email: TEXT (Unique, Not Null)
  full_name: TEXT (Not Null)
  role: TEXT (admin | cashier)
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
)
\`\`\`

### Drugs Table
\`\`\`sql
drugs (
  id: UUID (Primary Key)
  name: TEXT (Not Null)
  generic_name: TEXT
  manufacturer: TEXT (Not Null)
  category: TEXT (Not Null)
  unit: TEXT (Not Null)
  price: DECIMAL(10,2) (Not Null)
  stock_quantity: INTEGER (Default: 0)
  minimum_stock: INTEGER (Default: 10)
  expiry_date: DATE (Not Null)
  batch_number: TEXT
  description: TEXT
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
)
\`\`\`

### Sales Table
\`\`\`sql
sales (
  id: UUID (Primary Key)
  transaction_number: TEXT (Unique, Not Null)
  cashier_id: UUID (Foreign Key to users.id)
  customer_name: TEXT
  total_amount: DECIMAL(10,2) (Not Null)
  payment_method: TEXT (Default: 'cash')
  transaction_date: TIMESTAMP
  created_at: TIMESTAMP
)
\`\`\`

### Sale Items Table
\`\`\`sql
sale_items (
  id: UUID (Primary Key)
  sale_id: UUID (Foreign Key to sales.id)
  drug_id: UUID (Foreign Key to drugs.id)
  quantity: INTEGER (Not Null)
  unit_price: DECIMAL(10,2) (Not Null)
  subtotal: DECIMAL(10,2) (Not Null)
  created_at: TIMESTAMP
)
\`\`\`

## Supabase Client Operations

### Authentication Operations

#### Sign Up
\`\`\`typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: {
      full_name: 'John Doe',
      role: 'cashier'
    }
  }
})
\`\`\`

#### Sign In
\`\`\`typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
\`\`\`

#### Sign Out
\`\`\`typescript
const { error } = await supabase.auth.signOut()
\`\`\`

#### Get Current User
\`\`\`typescript
const { data: { user } } = await supabase.auth.getUser()
\`\`\`

### Drug Operations

#### Get All Drugs
\`\`\`typescript
const { data, error } = await supabase
  .from('drugs')
  .select('*')
  .order('name')
\`\`\`

#### Get Drug by ID
\`\`\`typescript
const { data, error } = await supabase
  .from('drugs')
  .select('*')
  .eq('id', drugId)
  .single()
\`\`\`

#### Create Drug (Admin Only)
\`\`\`typescript
const { data, error } = await supabase
  .from('drugs')
  .insert([{
    name: 'Paracetamol 500mg',
    generic_name: 'Paracetamol',
    manufacturer: 'Kimia Farma',
    category: 'Analgesik',
    unit: 'tablet',
    price: 500.00,
    stock_quantity: 100,
    minimum_stock: 20,
    expiry_date: '2025-12-31',
    batch_number: 'PCM001',
    description: 'Obat penurun demam'
  }])
\`\`\`

#### Update Drug (Admin Only)
\`\`\`typescript
const { data, error } = await supabase
  .from('drugs')
  .update({
    stock_quantity: 150,
    price: 600.00
  })
  .eq('id', drugId)
\`\`\`

#### Delete Drug (Admin Only)
\`\`\`typescript
const { data, error } = await supabase
  .from('drugs')
  .delete()
  .eq('id', drugId)
\`\`\`

#### Search Drugs
\`\`\`typescript
const { data, error } = await supabase
  .from('drugs')
  .select('*')
  .or(`name.ilike.%${searchTerm}%,generic_name.ilike.%${searchTerm}%,manufacturer.ilike.%${searchTerm}%`)
  .gt('stock_quantity', 0)
\`\`\`

#### Get Low Stock Drugs
\`\`\`typescript
const { data, error } = await supabase
  .from('drugs')
  .select('*')
  .lte('stock_quantity', supabase.raw('minimum_stock'))
\`\`\`

#### Get Expiring Drugs
\`\`\`typescript
const { data, error } = await supabase
  .from('drugs')
  .select('*')
  .lte('expiry_date', thirtyDaysFromNow)
  .gte('expiry_date', currentDate)
\`\`\`

### Sales Operations

#### Create Sale Transaction
\`\`\`typescript
// 1. Create sale header
const { data: sale, error: saleError } = await supabase
  .from('sales')
  .insert([{
    transaction_number: 'TRX20241215001',
    cashier_id: userId,
    customer_name: 'John Doe',
    total_amount: 15000.00,
    payment_method: 'cash'
  }])
  .select()
  .single()

// 2. Create sale items
const { error: itemsError } = await supabase
  .from('sale_items')
  .insert([
    {
      sale_id: sale.id,
      drug_id: 'drug-uuid-1',
      quantity: 2,
      unit_price: 5000.00,
      subtotal: 10000.00
    },
    {
      sale_id: sale.id,
      drug_id: 'drug-uuid-2',
      quantity: 1,
      unit_price: 5000.00,
      subtotal: 5000.00
    }
  ])
\`\`\`

#### Get Sales with Items
\`\`\`typescript
const { data, error } = await supabase
  .from('sales')
  .select(`
    *,
    users!sales_cashier_id_fkey(full_name),
    sale_items(
      quantity,
      unit_price,
      subtotal,
      drugs(name, unit)
    )
  `)
  .gte('transaction_date', startDate)
  .lte('transaction_date', endDate)
  .order('transaction_date', { ascending: false })
\`\`\`

#### Get Daily Sales Report
\`\`\`typescript
const { data, error } = await supabase
  .from('sales')
  .select('transaction_date, total_amount')
  .gte('transaction_date', startDate)
  .lte('transaction_date', endDate)
\`\`\`

#### Get Top Selling Drugs
\`\`\`typescript
const { data, error } = await supabase
  .from('sale_items')
  .select(`
    quantity,
    subtotal,
    drugs(name),
    sales!inner(transaction_date)
  `)
  .gte('sales.transaction_date', startDate)
  .lte('sales.transaction_date', endDate)
\`\`\`

### User Operations

#### Get User Profile
\`\`\`typescript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single()
\`\`\`

#### Update User Profile
\`\`\`typescript
const { data, error } = await supabase
  .from('users')
  .update({
    full_name: 'Updated Name',
    role: 'admin'
  })
  .eq('id', userId)
\`\`\`

## Database Functions

### Generate Transaction Number
\`\`\`sql
SELECT generate_transaction_number();
-- Returns: 'TRX20241215001'
\`\`\`

### Usage in Code
\`\`\`typescript
const { data: transactionNumber, error } = await supabase
  .rpc('generate_transaction_number')
\`\`\`

## Row Level Security (RLS) Policies

### Users Table
- Users can only view/edit their own profile
- Admins can view all users

### Drugs Table
- All authenticated users can read drugs
- Only admins can create/update/delete drugs

### Sales Table
- All authenticated users can read sales
- All authenticated users can create sales (as cashier)

### Sale Items Table
- All authenticated users can read/create sale items

## Error Handling

### Common Error Responses

#### Authentication Error
\`\`\`json
{
  "error": {
    "message": "Invalid login credentials",
    "status": 400
  }
}
\`\`\`

#### Authorization Error
\`\`\`json
{
  "error": {
    "message": "Insufficient permissions",
    "status": 403
  }
}
\`\`\`

#### Validation Error
\`\`\`json
{
  "error": {
    "message": "Invalid input data",
    "details": "Price must be a positive number",
    "status": 422
  }
}
\`\`\`

#### Not Found Error
\`\`\`json
{
  "error": {
    "message": "Resource not found",
    "status": 404
  }
}
\`\`\`

## Rate Limiting

- Authentication endpoints: 5 requests per minute per IP
- CRUD operations: 100 requests per minute per user
- Read operations: 1000 requests per minute per user

## Best Practices

### Client-Side
1. Always handle errors gracefully
2. Use loading states for better UX
3. Implement proper form validation
4. Cache frequently accessed data
5. Use optimistic updates where appropriate

### Security
1. Never expose service role key on client
2. Always validate user permissions
3. Use RLS policies for data protection
4. Sanitize user inputs
5. Implement proper session management

### Performance
1. Use select() to limit returned fields
2. Implement pagination for large datasets
3. Use indexes for frequently queried fields
4. Cache static data when possible
5. Optimize database queries

## Testing

### Unit Tests
\`\`\`bash
npm run test
\`\`\`

### Integration Tests
\`\`\`bash
npm run test:integration
\`\`\`

### E2E Tests
\`\`\`bash
npm run test:e2e
\`\`\`

## Monitoring

### Supabase Dashboard
- Monitor database performance
- Check API usage
- View error logs
- Manage user authentication

### Vercel Analytics
- Track application performance
- Monitor user interactions
- Analyze error rates
- View deployment metrics
