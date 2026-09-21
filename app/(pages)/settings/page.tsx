"use client";
import { useAuth } from "@/app/providers/AuthProvider";
import Tabs from "@/components/Tabs";
import About from "./steps/About";
import EditProfile from "./steps/EditProfile";
import { ManageAccounts } from "./steps/ManageAccounts";
import { ManageBalances } from "./steps/ManageBalances";
import { ManageBanks } from "./steps/ManageBanks";
import { ManageUsers } from "./steps/ManageUsers";
import type { ITabItemProps } from "@/components/Tabs";

export default function Settings() {
  const { selfUser } = useAuth();
  const isAdmin = selfUser?.role === "admin";
  const aboutTabKey = isAdmin ? 5 : 4;

  const tabItems: ITabItemProps[] = [
    { key: 0, label: "Edit profile", children: <EditProfile /> },
    { key: 1, label: "Manage Accounts", children: <ManageAccounts /> },
    { key: 2, label: "Manage Banks", children: <ManageBanks /> },
    { key: 3, label: "Manage Balances", children: <ManageBalances /> },
  ];
  if (isAdmin) tabItems.push({ key: 4, label: "Manage Users", children: <ManageUsers /> });
  tabItems.push({ key: aboutTabKey, label: "About", children: <About /> });

  return (
    <div className="flex flex-col h-full w-full max-w-300 mx-auto">
      <main className="flex flex-col bg-white p-8 m-8 rounded-lg overflow-hidden flex-1 min-h-0">
        <Tabs items={tabItems} minWidth="25rem" />
      </main>
    </div>
  );
}
