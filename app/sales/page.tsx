"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useState, useEffect } from "react"
import { DrugSearchDialog } from "@/components/sales/drug-search-dialog"
import { ReceiptDialog } from "@/components/sales/receipt-dialog"

interface Drug {
  id: string
  name: string
  generic_name: string
  manufacturer: string
  category: string
  unit: string
  price: number
  stock_quantity: number
}

interface CartItem {
  drug: Drug
  quantity: number
  subtotal: number
}

interface Sale {
  id: string
  transaction_number: string
  customer_name: string
  total_amount: number
  payment_method: string
  transaction_date: string
  items: {
    drug: Drug
    quantity: number
    unit_price: number
    subtotal: number
  }[]
}

export default function SalesPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false)
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false)
  const [currentSale, setCurrentSale] = useState<Sale | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [user, setUser] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()
        setUser(profile)
      }
    }
    getUser()
  }, [])

  const addToCart = (drug: Drug, quantity: number) => {
    const existingItem = cart.find((item) => item.drug.id === drug.id)

    if (existingItem) {
      // Update quantity if item already exists
      setCart(
        cart.map((item) =>
          item.drug.id === drug.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                subtotal: (item.quantity + quantity) * drug.price,
              }
            : item,
        ),
      )
    } else {
      // Add new item to cart
      setCart([
        ...cart,
        {
          drug,
          quantity,
          subtotal: quantity * drug.price,
        },
      ])
    }
  }

  const updateCartItemQuantity = (drugId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(drugId)
      return
    }

    setCart(
      cart.map((item) =>
        item.drug.id === drugId
          ? {
              ...item,
              quantity: newQuantity,
              subtotal: newQuantity * item.drug.price,
            }
          : item,
      ),
    )
  }

  const removeFromCart = (drugId: string) => {
    setCart(cart.filter((item) => item.drug.id !== drugId))
  }

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0)
  }

  const processTransaction = async () => {
    if (cart.length === 0) {
      alert("Keranjang kosong")
      return
    }

    if (!user) {
      alert("User tidak ditemukan")
      return
    }

    setIsProcessing(true)

    try {
      // Check stock availability
      for (const item of cart) {
        if (item.quantity > item.drug.stock_quantity) {
          alert(`Stok ${item.drug.name} tidak mencukupi. Stok tersedia: ${item.drug.stock_quantity}`)
          setIsProcessing(false)
          return
        }
      }

      // Generate transaction number
      const { data: transactionData, error: transactionError } = await supabase.rpc("generate_transaction_number")

      if (transactionError) throw transactionError

      const transactionNumber = transactionData

      // Create sale record
      const saleData = {
        transaction_number: transactionNumber,
        cashier_id: user.id,
        customer_name: customerName || null,
        total_amount: getTotalAmount(),
        payment_method: paymentMethod,
      }

      const { data: sale, error: saleError } = await supabase.from("sales").insert([saleData]).select().single()

      if (saleError) throw saleError

      // Create sale items
      const saleItems = cart.map((item) => ({
        sale_id: sale.id,
        drug_id: item.drug.id,
        quantity: item.quantity,
        unit_price: item.drug.price,
        subtotal: item.subtotal,
      }))

      const { error: itemsError } = await supabase.from("sale_items").insert(saleItems)

      if (itemsError) throw itemsError

      // Prepare receipt data
      const receiptData: Sale = {
        id: sale.id,
        transaction_number: sale.transaction_number,
        customer_name: sale.customer_name || "",
        total_amount: sale.total_amount,
        payment_method: sale.payment_method,
        transaction_date: sale.transaction_date,
        items: cart.map((item) => ({
          drug: item.drug,
          quantity: item.quantity,
          unit_price: item.drug.price,
          subtotal: item.subtotal,
        })),
      }

      setCurrentSale(receiptData)
      setIsReceiptDialogOpen(true)

      // Clear cart and form
      setCart([])
      setCustomerName("")
      setPaymentMethod("cash")
    } catch (error: any) {
      console.error("Error processing transaction:", error)
      alert("Gagal memproses transaksi: " + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Cart Section */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Keranjang Belanja</CardTitle>
                <CardDescription>Tambah obat ke keranjang untuk memproses transaksi</CardDescription>
              </div>
              <Button onClick={() => setIsSearchDialogOpen(true)}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Obat
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                  />
                </svg>
                <p>Keranjang kosong</p>
                <p className="text-sm">Klik "Tambah Obat" untuk mulai transaksi</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Obat</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Subtotal</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map((item) => (
                      <TableRow key={item.drug.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.drug.name}</div>
                            <div className="text-sm text-gray-500">{item.drug.manufacturer}</div>
                            <Badge variant="outline" className="text-xs">
                              Stok: {item.drug.stock_quantity} {item.drug.unit}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>Rp {item.drug.price.toLocaleString("id-ID")}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartItemQuantity(item.drug.id, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <span className="w-12 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartItemQuantity(item.drug.id, item.quantity + 1)}
                              disabled={item.quantity >= item.drug.stock_quantity}
                            >
                              +
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">Rp {item.subtotal.toLocaleString("id-ID")}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromCart(item.drug.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Hapus
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction Summary */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Transaksi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Nama Pelanggan (Opsional)</Label>
              <Input
                id="customer_name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Masukkan nama pelanggan"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Metode Pembayaran</Label>
              <select
                id="payment_method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cash">Tunai</option>
                <option value="debit">Kartu Debit</option>
                <option value="credit">Kartu Kredit</option>
                <option value="transfer">Transfer Bank</option>
              </select>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Jumlah Item:</span>
                <span>{cart.reduce((total, item) => total + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>Rp {getTotalAmount().toLocaleString("id-ID")}</span>
              </div>
            </div>

            <Button
              onClick={processTransaction}
              disabled={cart.length === 0 || isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? "Memproses..." : "Proses Transaksi"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <DrugSearchDialog
        isOpen={isSearchDialogOpen}
        onClose={() => setIsSearchDialogOpen(false)}
        onAddToCart={addToCart}
      />

      <ReceiptDialog
        isOpen={isReceiptDialogOpen}
        onClose={() => setIsReceiptDialogOpen(false)}
        sale={currentSale}
        cashierName={user?.full_name}
      />
    </div>
  )
}
