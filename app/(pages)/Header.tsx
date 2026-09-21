import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import Divisor from "@/components/Divisor";
import { SignOut } from "../services/fetchers/auth";

function HeaderContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSignOut = async () => {
    const result = await SignOut();
    if (result) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("returnTo");
      const query = params.toString();
      const returnTo = encodeURIComponent(pathname + (query ? `?${query}` : ""));
      router.replace(`/?returnTo=${returnTo}`);
    }
  };

  return (
    <header className="flex items-center justify-between p-2 bg-yellow-100 shrink-0">
      <Link className="flex items-center gap-2 w-fit" href="/dashboard">
        <Image className="dark:invert" src="/money.svg" alt="money logo" width={40} height={40} />
        <h3 className="whitespace-nowrap">Project Money</h3>
      </Link>
      <div className="flex gap-4">
        <Divisor vertical />
        <Button variant="link" onClick={handleSignOut}>
          Logout
        </Button>
      </div>
    </header>
  );
}

export default function Header() {
  return (
    <Suspense>
      <HeaderContent />
    </Suspense>
  );
}
