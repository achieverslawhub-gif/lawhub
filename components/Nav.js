"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Gavel, Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/courses", label: "Courses", part: "II" },
  { href: "/articles", label: "Articles", part: "III" },
  { href: "/case-law", label: "Case Law", part: "IV" },
  { href: "/engage-researcher", label: "Engage a Researcher", part: "V" },
  { href: "/tutorials", label: "Book a Tutorial", part: "VI" },
];

export default function Nav() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => sub.subscription.unsubscribe();
  }, []); // eslint-disable-line

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-chambersDark border-brass/30">
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Gavel size={22} className="text-brass" />
          <span className="text-lg tracking-wide font-display text-parchment">Achievers Law Hub</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 font-ui">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="px-3 py-2 text-sm rounded-sm text-parchment hover:text-brass">
              {item.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/dashboard" className="px-3 py-2 text-sm rounded-sm text-parchment hover:text-brass">
                My Dashboard
              </Link>
              <button onClick={signOut} className="ml-2 px-3 py-2 text-sm rounded-sm border border-parchment/25 text-parchment2">
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" className="ml-2 px-4 py-2 text-sm rounded-sm bg-brass text-chambersDark font-medium">
              Sign in
            </Link>
          )}
        </nav>

        <button className="md:hidden text-parchment" onClick={() => setOpen((o) => !o)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden px-5 pb-4 flex flex-col gap-1 font-ui">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="px-3 py-2 text-sm text-parchment">
              {item.part}. {item.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="px-3 py-2 text-sm text-parchment">
                My Dashboard
              </Link>
              <button onClick={signOut} className="text-left px-3 py-2 text-sm text-parchment2">Sign out</button>
            </>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)} className="px-3 py-2 text-sm text-brass">Sign in</Link>
          )}
        </div>
      )}
    </header>
  );
}
