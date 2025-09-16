"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

interface Sale {
  id: string
  transaction_number: string
  customer_name: string
  total_amount: number
  payment_method: string
  transaction_date: string
  items: {
    drug: {
      name: string
      unit: string
    }
    quantity: number
    unit_price: number
    subtotal: number
  }[]
}

interface ReceiptDialogProps {
  isOpen: boolean
  onClose: () => void
  sale: Sale | null
  cashierName?: string
}

export function ReceiptDialog({ isOpen, onClose, sale, cashierName }: ReceiptDialogProps) {
  if (!sale) return null

  const handlePrint = () => {
    const printContent = document.getElementById("receipt-content")
    if (printContent) {
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Struk Transaksi - ${sale.transaction_number}</title>
              <style>
                body { font-family: monospace; font-size: 12px; margin: 20px; }
                .header { text-align: center; margin-bottom: 20px; }
                .separator { border-top: 1px dashed #000; margin: 10px 0; }
                .item-row { display: flex; justify-content: space-between; margin: 5px 0; }
                .total { font-weight: bold; font-size: 14px; }
                @media print {
                  body { margin: 0; }
                }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  const formatPaymentMethod = (method: string) => {
    const methods: { [key: string]: string } = {
      cash: "Tunai",
      debit: "Kartu Debit",
      credit: "Kartu Kredit",
      transfer: "Transfer Bank",
    }
    return methods[method] || method
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Struk Transaksi</DialogTitle>
          <DialogDescription>Transaksi berhasil diproses</DialogDescription>
        </DialogHeader>

        <div id="receipt-content" className="space-y-4 font-mono text-sm">
          <div className="text-center">
            <h2 className="text-lg font-bold">APOTEK SEHAT</h2>
            <p className="text-sm text-gray-600">Jl. Sehat No. 123, Jakarta</p>
            <p className="text-sm text-gray-600">Telp: (021) 123-4567</p>
          </div>

          <Separator />

          <div className="space-y-1">
            <div className="flex justify-between">
              <span>No. Transaksi:</span>
              <span className="font-bold">{sale.transaction_number}</span>
            </div>
            <div className="flex justify-between">
              <span>Tanggal:</span>
              <span>{new Date(sale.transaction_date).toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span>Kasir:</span>
              <span>{cashierName || "Admin"}</span>
            </div>
            {sale.customer_name && (
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span>{sale.customer_name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Pembayaran:</span>
              <span>{formatPaymentMethod(sale.payment_method)}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="font-bold">DETAIL PEMBELIAN:</div>
            {sale.items.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="font-medium">{item.drug.name}</div>
                <div className="flex justify-between text-sm">
                  <span>
                    {item.quantity} {item.drug.unit} x Rp {item.unit_price.toLocaleString("id-ID")}
                  </span>
                  <span>Rp {item.subtotal.toLocaleString("id-ID")}</span>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Total Item:</span>
              <span>{sale.items.reduce((total, item) => total + item.quantity, 0)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>TOTAL:</span>
              <span>Rp {sale.total_amount.toLocaleString("id-ID")}</span>
            </div>
          </div>

          <Separator />

          <div className="text-center text-xs text-gray-600">
            <p>Terima kasih atas kunjungan Anda</p>
            <p>Semoga lekas sembuh</p>
          </div>
        </div>

        <div className="flex space-x-2 pt-4">
          <Button onClick={handlePrint} className="flex-1">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Cetak Struk
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
