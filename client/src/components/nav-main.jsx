"use client"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import Link from "next/link";


export function NavMain({ items }) {
  return (
    <SidebarGroup >
      <SidebarMenu className="bg-white">
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={`size-lg ${
                  item.isActive
                    ? "bg-gray-200 text-indigo-600 hover:text-black"
                    : ""
                }`}
              >
                <Link href={item.url} className="flex items-center gap-2">
                  {item.icon && <item.icon className="w-5 h-5" />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
      </SidebarGroup>
  );
}
