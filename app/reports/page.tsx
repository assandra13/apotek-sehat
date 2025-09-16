"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"

interface SalesReport {
  date: string
  total_transactions: number
  total_revenue: number
  total_items_sold: number
}

interface Transaction {
  id: string
  transaction_number: string
  customer_name: string
  total_amount: number
  payment_method: string
  transaction_date: string
  cashier: {
    full_name: string
  }
  items: {
    drug: {
      name: string
    }
    quantity: number
    unit_price: number
    subtotal: number
  }[]
}

interface TopSellingDrug {
  drug_name: string
  total_quantity: number
  total_revenue: number
}

export default function ReportsPage() {
  const [dailyReports, setDailyReports] = useState<SalesReport[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [topSellingDrugs, setTopSellingDrugs] = useState<TopSellingDrug[]>([])
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split("T")[0])
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0])
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  const fetchDailyReports = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("sales")
        .select("transaction_date, total_amount")
        .gte("transaction_date", `${dateFrom}T00:00:00`)
        .lte("transaction_date", `${dateTo}T23:59:59`)
        .order("transaction_date", { ascending: false })

      if (error) throw error

      // Group by date
      const groupedData: { [key: string]: SalesReport } = {}

      data?.forEach((sale) => {
        const date = new Date(sale.transaction_date).toISOString().split("T")[0]
        if (!groupedData[date]) {
          groupedData[date] = {
            date,
            total_transactions: 0,
            total_revenue: 0,
            total_items_sold: 0,
          }
        }
        groupedData[date].total_transactions += 1
        groupedData[date].total_revenue += Number(sale.total_amount)
      })

      // Get item counts for each date
      const { data: itemsData } = await supabase
        .from("sale_items")
        .select("quantity, sales!inner(transaction_date)")
        .gte("sales.transaction_date", `${dateFrom}T00:00:00`)
        .lte("sales.transaction_date", `${dateTo}T23:59:59`)

      itemsData?.forEach((item: any) => {
        const date = new Date(item.sales.transaction_date).toISOString().split("T")[0]
        if (groupedData[date]) {
          groupedData[date].total_items_sold += item.quantity
        }
      })

      setDailyReports(Object.values(groupedData).sort((a, b) => b.date.localeCompare(a.date)))
    } catch (error) {
      console.error("Error fetching daily reports:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("sales")
        .select(
          `
          *,
          users!sales_cashier_id_fkey(full_name),
          sale_items(
            quantity,
            unit_price,
            subtotal,
            drugs(name)
          )
        `,
        )
        .gte("transaction_date", `${dateFrom}T00:00:00`)
        .lte("transaction_date", `${dateTo}T23:59:59`)
        .order("transaction_date", { ascending: false })

      if (error) throw error

      const formattedTransactions: Transaction[] =
        data?.map((sale) => ({
          id: sale.id,
          transaction_number: sale.transaction_number,
          customer_name: sale.customer_name || "",
          total_amount: sale.total_amount,
          payment_method: sale.payment_method,
          transaction_date: sale.transaction_date,
          cashier: {
            full_name: sale.users?.full_name || "Unknown",
          },
          items:
            sale.sale_items?.map((item: any) => ({
              drug: {
                name: item.drugs?.name || "Unknown",
              },
              quantity: item.quantity,
              unit_price: item.unit_price,
              subtotal: item.subtotal,
            })) || [],
        })) || []

      setTransactions(formattedTransactions)
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTopSellingDrugs = async () => {
    try {
      const { data, error } = await supabase
        .from("sale_items")
        .select(
          `
          quantity,
          subtotal,
          drugs(name),
          sales!inner(transaction_date)
        `,
        )
        .gte("sales.transaction_date", `${dateFrom}T00:00:00`)
        .lte("sales.transaction_date", `${dateTo}T23:59:59`)

      if (error) throw error

      // Group by drug name
      const drugStats: { [key: string]: TopSellingDrug } = {}

      data?.forEach((item: any) => {
        const drugName = item.drugs?.name || "Unknown"
        if (!drugStats[drugName]) {
          drugStats[drugName] = {
            drug_name: drugName,
            total_quantity: 0,
            total_revenue: 0,
          }
        }
        drugStats[drugName].total_quantity += item.quantity
        drugStats[drugName].total_revenue += Number(item.subtotal)
      })

      const sortedDrugs = Object.values(drugStats)
        .sort((a, b) => b.total_quantity - a.total_quantity)
        .slice(0, 10)

      setTopSellingDrugs(sortedDrugs)
    } catch (error) {
      console.error("Error fetching top selling drugs:", error)
    }
  }

  useEffect(() => {
    fetchDailyReports()
    fetchTransactions()
    fetchTopSellingDrugs()
  }, [dateFrom, dateTo])

  const handleExportReport = () => {
    const csvContent = [
      ["Tanggal", "Total Transaksi", "Total Pendapatan", "Total Item Terjual"],
      ...dailyReports.map((report) => [
        report.date,
        report.total_transactions.toString(),
        report.total_revenue.toString(),
        report.total_items_sold.toString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `laporan-penjualan-${dateFrom}-${dateTo}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
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

  const getTotalRevenue = () => {
    return dailyReports.reduce((total, report) => total + report.total_revenue, 0)
  }

  const getTotalTransactions = () => {
    return dailyReports.reduce((total, report) => total + report.total_transactions, 0)
  }

  const getTotalItemsSold = () => {
    return dailyReports.reduce((total, report) => total + report.total_items_sold, 0)
  }

  return (
    <div className="space-y-6">
      {/* Date Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Laporan</CardTitle>
          <CardDescription>Pilih rentang tanggal untuk melihat laporan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end space-x-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Dari Tanggal</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">Sampai Tanggal</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-40"
              />
            </div>
            <Button onClick={handleExportReport} variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Rp {getTotalRevenue().toLocaleString("id-ID")}</div>
            <p className="text-xs text-muted-foreground">
              Periode {dateFrom} - {dateTo}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{getTotalTransactions()}</div>
            <p className="text-xs text-muted-foreground">Jumlah transaksi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Item Terjual</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{getTotalItemsSold()}</div>
            <p className="text-xs text-muted-foreground">Unit obat terjual</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Laporan Harian</TabsTrigger>
          <TabsTrigger value="transactions">Riwayat Transaksi</TabsTrigger>
          <TabsTrigger value="top-selling">Obat Terlaris</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Penjualan Harian</CardTitle>
              <CardDescription>Ringkasan penjualan per hari</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Memuat laporan...</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Total Transaksi</TableHead>
                        <TableHead>Total Pendapatan</TableHead>
                        <TableHead>Item Terjual</TableHead>
                        <TableHead>Rata-rata per Transaksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dailyReports.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            Tidak ada data untuk periode yang dipilih
                          </TableCell>
                        </TableRow>
                      ) : (
                        dailyReports.map((report) => (
                          <TableRow key={report.date}>
                            <TableCell className="font-medium">
                              {new Date(report.date).toLocaleDateString("id-ID", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </TableCell>
                            <TableCell>{report.total_transactions}</TableCell>
                            <TableCell className="font-medium text-green-600">
                              Rp {report.total_revenue.toLocaleString("id-ID")}
                            </TableCell>
                            <TableCell>{report.total_items_sold}</TableCell>
                            <TableCell>
                              Rp{" "}
                              {report.total_transactions > 0
                                ? Math.round(report.total_revenue / report.total_transactions).toLocaleString("id-ID")
                                : 0}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Transaksi</CardTitle>
              <CardDescription>Detail semua transaksi dalam periode yang dipilih</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Memuat transaksi...</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No. Transaksi</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Pelanggan</TableHead>
                        <TableHead>Kasir</TableHead>
                        <TableHead>Pembayaran</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Item</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            Tidak ada transaksi untuk periode yang dipilih
                          </TableCell>
                        </TableRow>
                      ) : (
                        transactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-medium">{transaction.transaction_number}</TableCell>
                            <TableCell>
                              {new Date(transaction.transaction_date).toLocaleString("id-ID", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </TableCell>
                            <TableCell>{transaction.customer_name || "-"}</TableCell>
                            <TableCell>{transaction.cashier.full_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{formatPaymentMethod(transaction.payment_method)}</Badge>
                            </TableCell>
                            <TableCell className="font-medium text-green-600">
                              Rp {transaction.total_amount.toLocaleString("id-ID")}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {transaction.items.slice(0, 2).map((item, index) => (
                                  <div key={index}>
                                    {item.drug.name} ({item.quantity})
                                  </div>
                                ))}
                                {transaction.items.length > 2 && (
                                  <div className="text-gray-500">+{transaction.items.length - 2} lainnya</div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-selling">
          <Card>
            <CardHeader>
              <CardTitle>Obat Terlaris</CardTitle>
              <CardDescription>10 obat dengan penjualan tertinggi dalam periode yang dipilih</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ranking</TableHead>
                      <TableHead>Nama Obat</TableHead>
                      <TableHead>Jumlah Terjual</TableHead>
                      <TableHead>Total Pendapatan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topSellingDrugs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                          Tidak ada data penjualan untuk periode yang dipilih
                        </TableCell>
                      </TableRow>
                    ) : (
                      topSellingDrugs.map((drug, index) => (
                        <TableRow key={drug.drug_name}>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="font-bold text-lg mr-2">#{index + 1}</span>
                              {index < 3 && (
                                <svg
                                  className={`w-5 h-5 ${
                                    index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-400" : "text-orange-600"
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{drug.drug_name}</TableCell>
                          <TableCell className="font-medium text-blue-600">{drug.total_quantity} unit</TableCell>
                          <TableCell className="font-medium text-green-600">
                            Rp {drug.total_revenue.toLocaleString("id-ID")}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
