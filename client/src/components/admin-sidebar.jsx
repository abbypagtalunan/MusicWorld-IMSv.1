"use client"
import * as React from "react"
import {
  CircleXIcon,
  ShoppingCartIcon,
  TicketPercentIcon,
  LogOutIcon,
  TruckIcon,
  Undo2Icon,
  ListIcon,
  ChartNoAxesCombinedIcon,
  SettingsIcon,
} from "lucide-react"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link";

const data = {
  user: {
    name: "Admin",
    email: "admin@MW-IMS.com",
    avatar: "/avatars/shadcn.jpg",
  },

  navMain: [
    {
      title: "Products",
      url: "./products",
      icon: ListIcon,
      isActive: true,
    },
    {
      title: "Orders",
      url: "./orders",
      icon: ShoppingCartIcon,
      isActive: true,
    },
    {
      title: "Deliveries",
      url: "./deliveries",
      icon: TruckIcon,
    },
    {
      title: "Returns",
      url: "./returns",
      icon: Undo2Icon,
    },
    {
      title: "Discounts",
      url: "./discounts",
      icon: TicketPercentIcon,
    },
    {
      title: "Deleted Transactions",
      url: "./deleted",
      icon: CircleXIcon,
    },
    {
      title: "Reports",
      url: "./reports",
      icon: ChartNoAxesCombinedIcon
    },
    {
        title: "Configurations",
        url: "./configurations",
        icon: SettingsIcon
      }
  ]
};

export function AppSidebar({
  ...props
}) {
  return (
    <Sidebar variant="inset" {...props} className="bg-white">
      <SidebarHeader className="bg-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/">
              <SidebarMenuButton size="xl">
                <div className="flex justify-center items-center">
                  <img
                    src="/logo1.svg"
                    alt="Music World IMS Logo"
                    className="h-30 object-contain"
                  />
                </div>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="bg-white">
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter className="bg-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <LogOutIcon className="size-5" />
              <span className="ml-2">Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

        </SidebarMenu>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
