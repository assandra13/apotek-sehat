"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"

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

interface DrugSearchDialogProps {
  isOpen: boolean
  onClose: () => void
  onAddToCart: (drug: Drug, quantity: number) => void
}

export function DrugSearchDialog({ isOpen, onClose, onAddToCart }: DrugSearchDialogProps) {
  const [drugs, setDrugs] = useState<Drug[]>([])
  const [filteredDrugs, setFilteredDrugs] = useState<Drug[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({})

  const supabase = createClient()

  const fetchDrugs = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from("drugs")
      .select("*")
      .gt("stock_quantity", 0) // Only show drugs with stock
      .order("name")

    if (error) {
      console.error("Error fetching drugs:", error)
    } else {
      setDrugs(data || [])
      setFilteredDrugs(data || [])
      // Initialize quantities
      const initialQuantities: { [key: string]: number } = {}
      data?.forEach((drug) => {
        initialQuantities[drug.id] = 1
      })
      setQuantities(initialQuantities)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (isOpen) {
      fetchDrugs()
      setSearchTerm("")
    }
  }, [isOpen])

  useEffect(() => {
    const filtered = drugs.filter(
      (drug) =>
        drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.generic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.category.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredDrugs(filtered)
  }, [searchTerm, drugs])

  const handleQuantityChange = (drugId: string, quantity: number) => {
    setQuantities({
      ...quantities,
      [drugId]: Math.max(1, quantity),
    })
  }

  const handleAddToCart = (drug: Drug) => {
    const quantity = quantities[drug.id] || 1
    if (quantity > drug.stock_quantity) {
      alert(`Jumlah melebihi stok yang tersedia (${drug.stock_quantity})`)
      return
    }
    onAddToCart(drug, quantity)
    onClose()
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Habis", variant: "destructive" as const }
    if (stock <= 10) return { label: "Menipis", variant: "secondary" as const }
    return { label: "Tersedia", variant: "default" as const }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Pilih Obat</DialogTitle>
          <DialogDescription>Cari dan pilih obat untuk ditambahkan ke keranjang</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="search">Cari Obat</Label>
            <Input
              id="search"
              placeholder="Cari berdasarkan nama, generik, produsen, atau kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Memuat data obat...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Obat</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrugs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        {searchTerm ? "Tidak ada obat yang sesuai dengan pencarian" : "Tidak ada obat dengan stok"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDrugs.map((drug) => {
                      const stockStatus = getStockStatus(drug.stock_quantity)
                      return (
                        <TableRow key={drug.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{drug.name}</div>
                              {drug.generic_name && <div className="text-sm text-gray-500">{drug.generic_name}</div>}
                              <div className="text-sm text-gray-500">{drug.manufacturer}</div>
                              <Badge variant="outline" className="text-xs mt-1">
                                {drug.category}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">Rp {drug.price.toLocaleString("id-ID")}</div>
                            <div className="text-sm text-gray-500">per {drug.unit}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span>
                                {drug.stock_quantity} {drug.unit}
                              </span>
                              <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(drug.id, (quantities[drug.id] || 1) - 1)}
                                disabled={(quantities[drug.id] || 1) <= 1}
                              >
                                -
                              </Button>
                              <span className="w-12 text-center">{quantities[drug.id] || 1}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(drug.id, (quantities[drug.id] || 1) + 1)}
                                disabled={(quantities[drug.id] || 1) >= drug.stock_quantity}
                              >
                                +
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button onClick={() => handleAddToCart(drug)} size="sm">
                              Tambah
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
