import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar";
import SideBar from "@/components/custom/SideBar";

function layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="bg-pink-500 w-full h-20">navbar</div>
      <div className="flex">
        <div
            className="w-[20%] bg-amber-500"
        >
          <SideBar />
        </div>
        <div>{children}</div>
      </div>
    </>
  );
}

export default layout;
