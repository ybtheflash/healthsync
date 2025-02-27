"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Settings, LogOut } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function NotePage() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-slate-50">
        <Sidebar className="bg-white shadow-lg border-r border-slate-200">
          <SidebarHeader className="flex items-center px-6 py-4 border-b border-slate-100">
            <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              HealthSync
            </h2>
          </SidebarHeader>
          <SidebarTrigger className="bg-white rounded-full p-1.5 shadow-md hover:shadow-lg transition-all border border-slate-200" />
          <SidebarContent className="h-full flex flex-col justify-between bg-white">
            <div>
              <SidebarMenu>
                {/* Toggle for Pulse/Notes */}
                <div className="px-4 py-3">
                  <div className="flex rounded-xl bg-slate-100/80 p-1.5 border border-slate-200">
                    <button
                      onClick={() => router.push('/pulse')}
                      className={`flex-1 rounded-lg py-2.5 px-4 text-sm font-medium transition-all duration-200 ${
                        pathname === '/pulse'
                          ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/80'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Pulse
                    </button>
                    <button
                      onClick={() => router.push('/note')}
                      className={`flex-1 rounded-lg py-2.5 px-4 text-sm font-medium transition-all duration-200 ${
                        pathname === '/note'
                          ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/80'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Notes
                    </button>
                  </div>
                </div>

                <div className="px-4 mt-2">
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      tooltip="Medkit"
                      size="lg"
                      className="hover:bg-slate-100 rounded-lg"
                    >
                      <svg
                        className={`size-5 transition-colors duration-200 ${
                          pathname === '/medkit' ? 'text-blue-600' : 'text-slate-600'
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7h-3V4a1 1 0 00-1-1H8a1 1 0 00-1 1v3H4a1 1 0 00-1 1v12a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1zM9 5h6v2H9V5zm1 5h4m-2-2v4" />
                      </svg>
                      <span className={pathname === '/medkit' ? 'text-blue-600' : 'text-slate-600'}>
                        Medkit
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      tooltip="Settings"
                      size="lg"
                      className="hover:bg-slate-100 rounded-lg"
                    >
                      <Settings className={`transition-colors duration-200 ${
                        pathname === '/settings' ? 'text-blue-600' : 'text-slate-600'
                      }`} />
                      <span className={pathname === '/settings' ? 'text-blue-600' : 'text-slate-600'}>
                        Settings
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </div>
              </SidebarMenu>
            </div>

            <SidebarFooter className="p-4 border-t border-slate-100">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Logout"
                    size="lg"
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200"
                  >
                    <LogOut className="size-5" />
                    <span className="font-medium">Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 overflow-auto bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <section className="mb-12">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-4">
                  Health Notes
                </h1>
                <p className="text-slate-600">
                  Keep track of your health notes and observations here
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}