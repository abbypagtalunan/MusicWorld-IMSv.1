// components/AppSidebar.tsx
"use client";

import * as React from "react";
import Link from "next/link"; // ← Added import
import {
  CircleXIcon,
  ShoppingCartIcon,
  TruckIcon,
  Undo2Icon,
  ListIcon,
  TicketPercentIcon,
  ChartNoAxesCombinedIcon,
  User,
  LogOutIcon,
  SettingsIcon,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

// Import the logout handler
import { handleSignOut } from "@/utils/auth";

export function AppSidebar({ ...props }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  // 🔄 Get real user data from localStorage (bugged)
  // const userFromStorage = JSON.parse(localStorage.getItem("user")) || {};
  
  // fix:
  // 🔄 Get real user data from localStorage (client-only)
  const [userFromStorage, setUserFromStorage] = React.useState({})

  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);

  React.useEffect(() => {
    const stored = localStorage.getItem("user")
    setUserFromStorage(stored ? JSON.parse(stored) : {})
  }, [])

  // ✅ Format the user object for the sidebar
  const user = {
    name: userFromStorage.firstName && userFromStorage.lastName
      ? `${userFromStorage.firstName} ${userFromStorage.lastName}`
      : "Guest",
    email: userFromStorage.accountID,
    avatar: userFromStorage.avatar || "/avatars/guest.png", // fallback avatar
  };

  const navMain = [
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
  ];

  const navMainWithActive = navMain.map((item) => ({
    ...item,
    isActive: pathname.includes(item.path),
  }));

  return (
    <>
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
              <Link href="products">
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
              <SidebarMenuButton
                size="lg"
                tooltip="Log Out"
                onClick={() => setShowLogoutDialog(true)}
              >
                <LogOutIcon className="w-5 h-5" />
                <span className="ml-2">Log Out</span>
              </SidebarMenuButton>
              <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
              <DialogContent className="max-w-md p-6">
                <DialogHeader>
                  <DialogTitle>Confirm Logout</DialogTitle>
                </DialogHeader>
                <p className="text-gray-700 mt-2">
                  Are you sure you want to log out?
                </p>
                <DialogFooter className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowLogoutDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-red-500 text-white"
                    onClick={handleSignOut}
                  >
                    Log Out
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            </SidebarMenuItem>
          </SidebarMenu>
          <NavUser user={user} /> 
        </SidebarFooter>
      </Sidebar>
    </>
  );
}