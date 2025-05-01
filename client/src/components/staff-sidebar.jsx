"use client";

import * as React from "react";
import {
  CircleXIcon,
  ShoppingCartIcon,
  ListIcon,
  LogOutIcon,
  TruckIcon,
  House,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

const data = {
  user: {
    name: "Staff",
    email: "staff@MW-IMS.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Order Dashboard",
      url: "./OrderDashboard",
      icon: House,
      path: "OrderDashboard",
    },
    {
      title: "Orders",
      url: "./orders",
      icon: ShoppingCartIcon,
      path: "orders",
    },
    {
      title: "Products",
      url: "./products",
      icon: ListIcon,
      path: "products",
    },
    {
      title: "Deliveries",
      url: "./deliveries",
      icon: TruckIcon,
      path: "deliveries",
    },
    {
      title: "Deleted Transactions",
      url: "./deleted",
      icon: CircleXIcon,
      path: "deleted",
    },
  ],
};

export function AppSidebar({ ...props }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  const navMainWithActive = data.navMain.map((item) => ({
    ...item,
    isActive: pathname.includes(item.path),
  }));

  return (
    <>
      {/* Mobile toggle button */}
      <SidebarTrigger
        className="fixed top-4 left-4 z-50 bg-white rounded-full p-2 shadow-md hover:bg-gray-200 md:hidden"
        onClick={() => setCollapsed((prev) => !prev)}
      />

      <Sidebar
        variant="inset"
        collapsible="icon"
        className="bg-white hover:bg-muted/50"
        {...props}
      >
        <SidebarHeader className="bg-white">
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/">
                <SidebarMenuButton size="xl" tooltip="Home">
                  <div className="flex justify-center items-center">
                    <img
                      src="/logo1.svg"
                      alt="Music World IMS Logo"
                      className="h-30 w-auto object-contain"
                    />
                  </div>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="bg-white">
          <NavMain items={navMainWithActive} collapsed={collapsed} />
        </SidebarContent>

        <SidebarFooter className="bg-white">
          <SidebarMenu className="bg-white items-left justify-center">
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip="Log Out">
                <LogOutIcon className="w-5 h-5" />
                <span className="ml-2">Log Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
