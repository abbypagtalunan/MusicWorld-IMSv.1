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
  User,
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
import { usePathname } from "next/navigation";


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
      path: "products"
    },
    {
      title: "Orders",
      url: "./orders",
      icon: ShoppingCartIcon,
      path: "orders"
    },
    {
      title: "Deliveries",
      url: "./deliveries",
      icon: TruckIcon,
      path: "deliveries"
    },
    {
      title: "Returns",
      url: "./returns",
      icon: Undo2Icon,
      path: "returns"
    },
    {
      title: "Discounts",
      url: "./discounts",
      icon: TicketPercentIcon,
      path: "discounts"
    },
    {
      title: "Deleted Transactions",
      url: "./deleted",
      icon: CircleXIcon,
      path: "deleted"
    },
    {
      title: "Reports",
      url: "./reports",
      icon: ChartNoAxesCombinedIcon,
      path: "reports"
    },
    {
      title: "Configurations",
      url: "./configurations",
      icon: SettingsIcon,
      path: "configurations"
    },
    {
      title: "Manage Accounts",
      url: "./accounts",
      icon: User,
      path: "accounts"
    }



  ]
};


export function AppSidebar({
  ...props
}) {
  const pathname = usePathname();

  const navMainWithActive = data.navMain.map(item => ({
    ...item,
    isActive: pathname.includes(item.path)
  }));
  return (
    <Sidebar variant="inset" {...props} className="bg-white hover:bg-muted/50">
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
        <NavMain items={navMainWithActive} />
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
