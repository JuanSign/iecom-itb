"use client"

import * as React from "react"
import {
  Trophy,
  Calendar,
  FileQuestionMarkIcon,
  LogOut,
} from "lucide-react"

import { NavMain } from "./nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarRail,
  useSidebar, 
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { logout } from "@/actions/server/auth"

export const data = {
  navMain: [
    {
      title: "Competition",
      url: "/dashboard",
      icon: Trophy,
    },
    {
      title: "Event",
      url: "/dashboard/event",
      icon: Calendar,
    },
    {
      title: "FAQ",
      url: "/dashboard/faq",
      icon: FileQuestionMarkIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar()
  
  const collapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <div className="flex h-full flex-col">
          <div className="flex-1">
            <NavMain items={data.navMain} />
          </div>

          <div className="mt-auto pb-4">
            <form action={logout}>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="submit"
                      variant="ghost"
                      className="w-full justify-start"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {!collapsed && <span>Logout</span>}
                    </Button>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">
                      Logout
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </form>
          </div>
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}