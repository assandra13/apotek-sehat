"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  minimum_stock: number
  expiry_date: string
  batch_number: string
  description: string
}

interface DrugFormDialogProps {
  isOpen: boolean
  onClose: () => void
  drug?: Drug | null
  onSuccess: () => void
}

export function DrugFormDialog({ isOpen, onClose, drug, onSuccess }: DrugFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    generic_name: "",
    manufacturer: "",
    category: "",
    unit: "",
    price: "",
    stock_quantity: "",
    minimum_stock: "",
    expiry_date: "",
    batch_number: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (drug) {
      setFormData({
        name: drug.name,
        generic_name: drug.generic_name || "",
        manufacturer: drug.manufacturer,
        category: drug.category,
        unit: drug.unit,
        price: drug.price.toString(),
        stock_quantity: drug.stock_quantity.toString(),
        minimum_stock: drug.minimum_stock.toString(),
        expiry_date: drug.expiry_date,
        batch_number: drug.batch_number || "",
        description: drug.description || "",
      })
    } else {
      setFormData({
        name: "",
        generic_name: "",
        manufacturer: "",
        category: "",
        unit: "",
        price: "",
        stock_quantity: "",
        minimum_stock: "10",
        expiry_date: "",
        batch_number: "",
        description: "",
      })
    }
    setError(null)
  }, [drug, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const drugData = {
        name: formData.name,
        generic_name: formData.generic_name || null,
        manufacturer: formData.manufacturer,
        category: formData.category,
        unit: formData.unit,
        price: Number.parseFloat(formData.price),
        stock_quantity: Number.parseInt(formData.stock_quantity),
        minimum_stock: Number.parseInt(formData.minimum_stock),
        expiry_date: formData.expiry_date,
        batch_number: formData.batch_number || null,
        description: formData.description || null,
      }

      if (drug) {
        // Update existing drug
        const { error } = await supabase.from("drugs").update(drugData).eq("id", drug.id)

        if (error) throw error
      } else {
        // Create new drug
        const { error } = await supabase.from("drugs").insert([drugData])

        if (error) throw error
      }

      onSuccess()
    } catch (error: any) {
      setError(error.message || "Terjadi kesalahan")
    } finally {
      setIsLoading(false)
    }
  }

  const categories = [
    "Analgesik",
    "Antibiotik",
    "Batuk & Flu",
    "Antiseptik",
    "Vitamin",
    "Herbal",
    "Maag",
    "Diare",
    "Lainnya",
  ]

  const units = ["tablet", "kapsul", "botol", "sachet", "strip", "tube", "ampul", "vial"]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{drug ? "Edit Obat" : "Tambah Obat Baru"}</DialogTitle>
          <DialogDescription>
            {drug ? "Ubah informasi obat di bawah ini" : "Masukkan informasi obat baru"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Obat *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="generic_name">Nama Generik</Label>
              <Input
                id="generic_name"
                value={formData.generic_name}
                onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Produsen *</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Satuan *</Label>
              <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih satuan" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Harga (Rp) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Stok *</Label>
              <Input
                id="stock_quantity"
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minimum_stock">Stok Minimum *</Label>
              <Input
                id="minimum_stock"
                type="number"
                min="0"
                value={formData.minimum_stock}
                onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry_date">Tanggal Kedaluwarsa *</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch_number">Nomor Batch</Label>
              <Input
                id="batch_number"
                value={formData.batch_number}
                onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : drug ? "Update" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
