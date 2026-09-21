"use client";
import { CircleUserRound } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/app/providers/AuthProvider";

export default function SidebarFooter() {
  const { selfUser } = useAuth();

  return (
    <div className="flex items-center py-4">
      <figure className="px-2.5">
        {selfUser?.photoURL ? (
          <Image
            src={selfUser.photoURL}
            alt={selfUser.displayName ?? "avatar"}
            width={40}
            height={40}
            className="rounded-full object-cover min-w-10 min-h-10"
          />
        ) : (
          <CircleUserRound className="w-10 h-10 text-neutral-400" />
        )}
      </figure>
      <section>
        <p className="font-semibold leading-3">{selfUser?.displayName ?? "Usuário"}</p>
        <small className="text-neutral-500">{selfUser?.email ?? "—"}</small>
      </section>
    </div>
  );
}
