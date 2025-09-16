import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("users").select("*").eq("id", data.user.id).single()

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden lg:flex lg:w-64 lg:flex-col">
        <Sidebar userRole={profile?.role} />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          title="Dashboard"
          user={
            profile
              ? {
                  full_name: profile.full_name,
                  role: profile.role,
                }
              : undefined
          }
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
