import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get statistics
  const [{ count: totalDrugs }, { count: lowStockDrugs }, { data: expiringSoon }, { data: todaySales }] =
    await Promise.all([
      supabase.from("drugs").select("*", { count: "exact", head: true }),
      supabase.from("drugs").select("*", { count: "exact", head: true }).lt("stock_quantity", 20),
      supabase
        .from("drugs")
        .select("name, expiry_date, stock_quantity")
        .lt("expiry_date", new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
        .limit(5),
      supabase.from("sales").select("total_amount").gte("transaction_date", new Date().toISOString().split("T")[0]),
    ])

  const todayRevenue = todaySales?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0

  const currentDate = new Date()
  const { data: criticalAlerts } = await supabase
    .from("drugs")
    .select("name, stock_quantity, minimum_stock, expiry_date")
    .or(
      `stock_quantity.eq.0,and(stock_quantity.lte.5,stock_quantity.gt.0),expiry_date.lt.${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}`,
    )
    .limit(5)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Obat</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDrugs || 0}</div>
            <p className="text-xs text-muted-foreground">Jenis obat tersedia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Menipis</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockDrugs || 0}</div>
            <p className="text-xs text-muted-foreground">Obat perlu restok</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendapatan Hari Ini</CardTitle>
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
            <div className="text-2xl font-bold text-green-600">Rp {todayRevenue.toLocaleString("id-ID")}</div>
            <p className="text-xs text-muted-foreground">Total penjualan hari ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Akan Kedaluwarsa</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiringSoon?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Dalam 30 hari</p>
          </CardContent>
        </Card>
      </div>

      {criticalAlerts && criticalAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <CardTitle className="text-red-800">Peringatan Kritis</CardTitle>
              </div>
              <Badge variant="destructive">{criticalAlerts.length}</Badge>
            </div>
            <CardDescription className="text-red-700">Obat yang memerlukan perhatian segera</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalAlerts.map((drug, index) => {
                const isExpiringSoon = new Date(drug.expiry_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                const isOutOfStock = drug.stock_quantity === 0
                const isLowStock = drug.stock_quantity > 0 && drug.stock_quantity <= drug.minimum_stock

                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center space-x-3">
                      {isOutOfStock ? (
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      ) : isExpiringSoon ? (
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      ) : (
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      )}
                      <div>
                        <span className="font-medium text-gray-900">{drug.name}</span>
                        <div className="text-sm text-gray-600">
                          {isOutOfStock && <span className="text-red-600 font-medium">Stok habis</span>}
                          {isLowStock && !isOutOfStock && (
                            <span className="text-orange-600">
                              Stok menipis: {drug.stock_quantity} (Min: {drug.minimum_stock})
                            </span>
                          )}
                          {isExpiringSoon && (
                            <span className="text-orange-600 ml-2">
                              Kedaluwarsa: {new Date(drug.expiry_date).toLocaleDateString("id-ID")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {isOutOfStock || isLowStock ? (
                        <Badge variant="destructive" className="text-xs">
                          {isOutOfStock ? "Habis" : "Menipis"}
                        </Badge>
                      ) : null}
                      {isExpiringSoon && (
                        <Badge variant="secondary" className="text-xs">
                          Segera Kedaluwarsa
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-red-200">
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/drugs">Kelola Stok Obat</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {expiringSoon && expiringSoon.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Obat Akan Kedaluwarsa</CardTitle>
            <CardDescription>Obat yang akan kedaluwarsa dalam 30 hari ke depan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringSoon.map((drug, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <div>
                    <span className="font-medium">{drug.name}</span>
                    <div className="text-sm text-gray-600">Stok: {drug.stock_quantity}</div>
                  </div>
                  <span className="text-sm text-red-600">
                    Kedaluwarsa: {new Date(drug.expiry_date).toLocaleDateString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
