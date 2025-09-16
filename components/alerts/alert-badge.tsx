"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { AlertCenter } from "./alert-center"

export function AlertBadge() {
  const [alertCount, setAlertCount] = useState(0)
  const [isAlertCenterOpen, setIsAlertCenterOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  const fetchAlertCount = async () => {
    try {
      const currentDate = new Date()
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(currentDate.getDate() + 30)

      // Count low stock drugs
      const { count: lowStockCount } = await supabase
        .from("drugs")
        .select("*", { count: "exact", head: true })
        .lte("stock_quantity", supabase.raw("minimum_stock"))

      // Count expiring drugs (within 30 days)
      const { count: expiringCount } = await supabase
        .from("drugs")
        .select("*", { count: "exact", head: true })
        .lte("expiry_date", thirtyDaysFromNow.toISOString().split("T")[0])
        .gte("expiry_date", currentDate.toISOString().split("T")[0])

      // Count expired drugs
      const { count: expiredCount } = await supabase
        .from("drugs")
        .select("*", { count: "exact", head: true })
        .lt("expiry_date", currentDate.toISOString().split("T")[0])

      const totalAlerts = (lowStockCount || 0) + (expiringCount || 0) + (expiredCount || 0)
      setAlertCount(totalAlerts)
    } catch (error) {
      console.error("Error fetching alert count:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAlertCount()
    // Refresh alert count every 5 minutes
    const interval = setInterval(fetchAlertCount, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </Button>
    )
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsAlertCenterOpen(true)}
        className="relative hover:bg-orange-50"
      >
        <svg
          className={`w-5 h-5 ${alertCount > 0 ? "text-orange-500" : "text-gray-500"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-5 5v-5zM4 19h10a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        {alertCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {alertCount > 99 ? "99+" : alertCount}
          </Badge>
        )}
      </Button>

      <AlertCenter isOpen={isAlertCenterOpen} onClose={() => setIsAlertCenterOpen(false)} />
    </>
  )
}
