import React from "react";
import SidebarLayout from "@/components/ui/sidebar-layout";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarLayout>
      {children}
    </SidebarLayout>
  );
}
