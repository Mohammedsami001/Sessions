import React from "react";
import Sidebar from "@/components/ui/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex">
      {/* 
        Fixed sidebar is 250px wide. 
        Hidden on smaller screens if we want to make it responsive later. 
        For now, it's fixed 250px as requested in the slice.
      */}
      <Sidebar />
      <div className="flex-1 ml-[250px] relative w-full h-screen overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
