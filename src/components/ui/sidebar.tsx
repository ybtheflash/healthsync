"use client"

import * as React from "react"
import { FileText, HeartPulse, Settings, X, LogOut, PanelLeft } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface SidebarProps {
  children?: React.ReactNode
}

export function Sidebar({ children }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { signout } = useAuth()

  const handleLogout = async () => {
    try {
      await signout()
      router.push('/login')
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isMobileOpen) {
        setIsMobileOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isMobileOpen])

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsMobileOpen(!isMobileOpen)
    } else {
      setIsCollapsed(!isCollapsed)
    }
  }

  const navItems = [
    {
      title: "Medkit",
      icon: HeartPulse,
      href: "/medications",
    },
    {
      title: "Reports",
      icon: FileText,
      href: "/reports",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/profile",
    },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Toggle button (outside sidebar) */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "fixed z-50 transition-all duration-300 ease-in-out",
          isCollapsed ? "md:left-4" : "md:left-[248px]",
          "left-4 top-4",
          "hover:bg-transparent",
          "px-4 py-2",
        )}
        onClick={toggleSidebar}
      >
        {isMobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <PanelLeft
            className={cn(isCollapsed && "rotate-180")}
            style={{ width: 22, height: 22 }}
          />
        )}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col border-r bg-white transition-all duration-300 ease-in-out",
          isCollapsed ? "md:translate-x-[-100%] w-0" : "w-[240px]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isCollapsed && "md:opacity-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div
            className={cn(
              "flex items-center gap-2 transition-all duration-300",
              isCollapsed && "justify-center w-full"
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <HeartPulse className="h-6 w-6" />
            </div>
            {!isCollapsed && <span className="text-xl font-bold text-blue-600">HealthSync</span>}
          </div>
        </div>

        {/* Tabs */}
        <div className="p-2">
          <Tabs defaultValue="/pulse" value={pathname} className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <Link href="/pulse" className="w-full">
                <TabsTrigger value="/pulse" className="flex items-center gap-2 w-full">
                  <HeartPulse className="h-5 w-5" />
                  {!isCollapsed && "Pulse"}
                </TabsTrigger>
              </Link>
              <Link href="/notes" className="w-full">
                <TabsTrigger value="/notes" className="flex items-center gap-2 w-full">
                  <FileText className="h-4 w-4" />
                  {!isCollapsed && "MySpace"}
                </TabsTrigger>
              </Link>
            </TabsList>
          </Tabs>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => (
            <Link key={item.title} href={item.href} className="block">
              <Button
                variant="ghost"
                className={cn("w-full", isCollapsed ? "justify-center px-2" : "justify-start")}
              >
                <item.icon className={cn("h-8 w-8", !isCollapsed && "mr-2")} />
                {!isCollapsed && <span className="text-xl">{item.title}</span>}
              </Button>
            </Link>
          ))}
        </nav>

        {/* User/Logout */}
        <div className="border-t p-2">
          <Button
            variant="ghost"
            className={cn(
              "w-full",
              isCollapsed ? "justify-center px-2" : "justify-start",
              "bg-red-50/10 hover:bg-red-500/20 text-red-600 hover:text-red-700",
              "backdrop-blur-sm transition-colors"
            )}
            onClick={handleLogout}
          >
            {isCollapsed ? (
              <LogOut className="h-5 w-5" />
            ) : (
              <>
                <Avatar className="mr-2 h-6 w-6">
                  <AvatarFallback>N</AvatarFallback>
                </Avatar>
                <span>Logout</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          "md:ml-[240px]",
          "pl-16"
        )}
      >
        <div className="container p-4 md:p-8">{children}</div>
      </main>
    </div>
  )
}
