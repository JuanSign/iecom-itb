"use client"

import * as React from "react"
import {
  Trophy,
  Calendar,
  FileQuestionMarkIcon
} from "lucide-react"

import { NavMain } from "./nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarRail,
} from "@/components/ui/sidebar"

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
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}