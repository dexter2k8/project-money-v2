"use client";
import { type PropsWithChildren } from "react";
import { FileSpreadsheet, LayoutDashboard, Settings } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { PAGE_CONTAINER } from "./constants";
import Header from "./Header";
import SessionExpiringModal from "./SessionExpiringModal";
import SidebarHead from "./SidebarHead";
import { AuthProvider } from "../providers/AuthProvider";
import { BalanceProvider } from "../providers/BalanceProvider";
import { SessionTimerProvider } from "../providers/SessionTimerProvider";
import type { ISidebarItemProps } from "@/components/Sidebar";

const sidebarItems: ISidebarItemProps[] = [
  { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard /> },
  { label: "Analytics", path: "/analytics", icon: <FileSpreadsheet /> },
  { label: "Settings", path: "/settings", icon: <Settings /> },
];

export default function PagesLayout({ children }: PropsWithChildren) {
  return (
    <AuthProvider>
      <SessionTimerProvider>
        <BalanceProvider>
          <Header />
          <div className={PAGE_CONTAINER}>
            <Sidebar header={SidebarHead} items={sidebarItems} />
            {children}
          </div>
          <SessionExpiringModal />
        </BalanceProvider>
      </SessionTimerProvider>
    </AuthProvider>
  );
}
