"use client"

import { Sidebar } from "@/components/ui/sidebar"
import ProtectedRoute from "@/components/ProtectedRoute"
import { HeartPulse } from "lucide-react"

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <Sidebar>
        <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-600 text-white">
            <HeartPulse className="h-10 w-10" />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-blue-600">Welcome to HealthSync</h1>
            <p className="mt-2 text-xl text-muted-foreground">Your personal health companion</p>
          </div>
        </div>
      </Sidebar>
    </ProtectedRoute>
  )
}
