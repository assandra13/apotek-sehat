"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { DrugFormDialog } from "@/components/drugs/drug-form-dialog"

interface Drug {
  id: string
  name: string
  generic_name: string
  manufacturer: string
  category: string
  unit: string
  price: number
  stock_quantity: number
  minimum_stock: number
  expiry_date: string
  batch_number: string
  description: string
}

export default function DrugsPage() {
  const [drugs, setDrugs] = useState<Drug[]>([])
  const [filteredDrugs, setFilteredDrugs] = useState<Drug[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDrug, setEditingDrug] = useState<Drug | null>(null)

  const supabase = createClient()

  const fetchDrugs = async () => {
    setIsLoading(true)
    const { data, error } = await supabase.from("drugs").select("*").order("name")

    if (error) {
      console.error("Error fetching drugs:", error)
    } else {
      setDrugs(data || [])
      setFilteredDrugs(data || [])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchDrugs()
  }, [])

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

  const handleEdit = (drug: Drug) => {
    setEditingDrug(drug)
    setIsDialogOpen(true)
  }

  const handleDelete = async (drugId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus obat ini?")) {
      const { error } = await supabase.from("drugs").delete().eq("id", drugId)

      if (error) {
        console.error("Error deleting drug:", error)
        alert("Gagal menghapus obat")
      } else {
        fetchDrugs()
      }
    }
  }

  const getStockStatus = (stock: number, minimum: number) => {
    if (stock === 0) return { label: "Habis", variant: "destructive" as const }
    if (stock <= minimum) return { label: "Menipis", variant: "secondary" as const }
    return { label: "Tersedia", variant: "default" as const }
  }

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return expiry <= thirtyDaysFromNow
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Manajemen Obat</CardTitle>
              <CardDescription>Kelola data obat dan stok apotek</CardDescription>
            </div>
            <Button
              onClick={() => {
                setEditingDrug(null)
                setIsDialogOpen(true)
              }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Obat
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Cari obat berdasarkan nama, generik, produsen, atau kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Memuat data obat...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Obat</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Produsen</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Kedaluwarsa</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrugs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        {searchTerm ? "Tidak ada obat yang sesuai dengan pencarian" : "Belum ada data obat"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDrugs.map((drug) => {
                      const stockStatus = getStockStatus(drug.stock_quantity, drug.minimum_stock)
                      const expiringSoon = isExpiringSoon(drug.expiry_date)

                      return (
                        <TableRow key={drug.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{drug.name}</div>
                              {drug.generic_name && <div className="text-sm text-gray-500">{drug.generic_name}</div>}
                            </div>
                          </TableCell>
                          <TableCell>{drug.category}</TableCell>
                          <TableCell>{drug.manufacturer}</TableCell>
                          <TableCell>Rp {drug.price.toLocaleString("id-ID")}</TableCell>
                          <TableCell>
                            {drug.stock_quantity} {drug.unit}
                          </TableCell>
                          <TableCell>
                            <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className={expiringSoon ? "text-red-600 font-medium" : ""}>
                              {new Date(drug.expiry_date).toLocaleDateString("id-ID")}
                              {expiringSoon && <div className="text-xs text-red-500">Segera kedaluwarsa</div>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(drug)}>
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(drug.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Hapus
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <DrugFormDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false)
          setEditingDrug(null)
        }}
        drug={editingDrug}
        onSuccess={() => {
          fetchDrugs()
          setIsDialogOpen(false)
          setEditingDrug(null)
        }}
      />
    </div>
  )
}
