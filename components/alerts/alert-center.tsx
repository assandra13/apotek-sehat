"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from "react"

interface Alert {
  id: string
  type: "low_stock" | "expiring" | "expired"
  title: string
  message: string
  drug_id?: string
  drug_name?: string
  severity: "high" | "medium" | "low"
  created_at: string
}

interface AlertCenterProps {
  isOpen: boolean
  onClose: () => void
}

export function AlertCenter({ isOpen, onClose }: AlertCenterProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  const fetchAlerts = async () => {
    setIsLoading(true)
    try {
      const currentDate = new Date()
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(currentDate.getDate() + 30)

      // Get low stock drugs
      const { data: lowStockDrugs } = await supabase
        .from("drugs")
        .select("*")
        .lte("stock_quantity", supabase.raw("minimum_stock"))

      // Get expiring drugs (within 30 days)
      const { data: expiringDrugs } = await supabase
        .from("drugs")
        .select("*")
        .lte("expiry_date", thirtyDaysFromNow.toISOString().split("T")[0])
        .gte("expiry_date", currentDate.toISOString().split("T")[0])

      // Get expired drugs
      const { data: expiredDrugs } = await supabase
        .from("drugs")
        .select("*")
        .lt("expiry_date", currentDate.toISOString().split("T")[0])

      const alertsList: Alert[] = []

      // Process low stock alerts
      lowStockDrugs?.forEach((drug) => {
        const severity = drug.stock_quantity === 0 ? "high" : drug.stock_quantity <= 5 ? "medium" : "low"
        alertsList.push({
          id: `low_stock_${drug.id}`,
          type: "low_stock",
          title: drug.stock_quantity === 0 ? "Stok Habis" : "Stok Menipis",
          message: `${drug.name} - Stok tersisa: ${drug.stock_quantity} ${drug.unit} (Minimum: ${drug.minimum_stock})`,
          drug_id: drug.id,
          drug_name: drug.name,
          severity,
          created_at: new Date().toISOString(),
        })
      })

      // Process expiring alerts
      expiringDrugs?.forEach((drug) => {
        const daysUntilExpiry = Math.ceil(
          (new Date(drug.expiry_date).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
        )
        const severity = daysUntilExpiry <= 7 ? "high" : daysUntilExpiry <= 14 ? "medium" : "low"

        alertsList.push({
          id: `expiring_${drug.id}`,
          type: "expiring",
          title: "Akan Kedaluwarsa",
          message: `${drug.name} akan kedaluwarsa dalam ${daysUntilExpiry} hari (${new Date(drug.expiry_date).toLocaleDateString("id-ID")})`,
          drug_id: drug.id,
          drug_name: drug.name,
          severity,
          created_at: new Date().toISOString(),
        })
      })

      // Process expired alerts
      expiredDrugs?.forEach((drug) => {
        alertsList.push({
          id: `expired_${drug.id}`,
          type: "expired",
          title: "Sudah Kedaluwarsa",
          message: `${drug.name} sudah kedaluwarsa sejak ${new Date(drug.expiry_date).toLocaleDateString("id-ID")}`,
          drug_id: drug.id,
          drug_name: drug.name,
          severity: "high",
          created_at: new Date().toISOString(),
        })
      })

      // Sort by severity and date
      alertsList.sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 }
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
          return severityOrder[b.severity] - severityOrder[a.severity]
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })

      setAlerts(alertsList)
    } catch (error) {
      console.error("Error fetching alerts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchAlerts()
    }
  }, [isOpen])

  const getAlertIcon = (type: string, severity: string) => {
    const iconClass = `w-5 h-5 ${
      severity === "high" ? "text-red-500" : severity === "medium" ? "text-orange-500" : "text-yellow-500"
    }`

    switch (type) {
      case "low_stock":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        )
      case "expiring":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
      case "expired":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      default:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge variant="destructive">Tinggi</Badge>
      case "medium":
        return <Badge variant="secondary">Sedang</Badge>
      case "low":
        return <Badge variant="outline">Rendah</Badge>
      default:
        return <Badge variant="outline">-</Badge>
    }
  }

  const getAlertsByType = (type: string) => {
    return alerts.filter((alert) => alert.type === type)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-5 5v-5zM4 19h10a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span>Pusat Peringatan</span>
            {alerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {alerts.length}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>Peringatan stok menipis dan obat kedaluwarsa</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Memuat peringatan...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-gray-600">Tidak ada peringatan saat ini</p>
              <p className="text-sm text-gray-500">Semua obat dalam kondisi baik</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* High Priority Alerts */}
              {alerts.filter((alert) => alert.severity === "high").length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-red-600 mb-3">Prioritas Tinggi</h3>
                  <div className="space-y-2">
                    {alerts
                      .filter((alert) => alert.severity === "high")
                      .map((alert) => (
                        <div
                          key={alert.id}
                          className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                        >
                          {getAlertIcon(alert.type, alert.severity)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-red-800">{alert.title}</h4>
                              {getSeverityBadge(alert.severity)}
                            </div>
                            <p className="text-sm text-red-700 mt-1">{alert.message}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Medium Priority Alerts */}
              {alerts.filter((alert) => alert.severity === "medium").length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-orange-600 mb-3">Prioritas Sedang</h3>
                  <div className="space-y-2">
                    {alerts
                      .filter((alert) => alert.severity === "medium")
                      .map((alert) => (
                        <div
                          key={alert.id}
                          className="flex items-start space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg"
                        >
                          {getAlertIcon(alert.type, alert.severity)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-orange-800">{alert.title}</h4>
                              {getSeverityBadge(alert.severity)}
                            </div>
                            <p className="text-sm text-orange-700 mt-1">{alert.message}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Low Priority Alerts */}
              {alerts.filter((alert) => alert.severity === "low").length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-yellow-600 mb-3">Prioritas Rendah</h3>
                  <div className="space-y-2">
                    {alerts
                      .filter((alert) => alert.severity === "low")
                      .map((alert) => (
                        <div
                          key={alert.id}
                          className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                        >
                          {getAlertIcon(alert.type, alert.severity)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-yellow-800">{alert.title}</h4>
                              {getSeverityBadge(alert.severity)}
                            </div>
                            <p className="text-sm text-yellow-700 mt-1">{alert.message}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Tutup</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
