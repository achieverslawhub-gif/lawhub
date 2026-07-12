"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BookMarked } from "lucide-react";

export const dynamic = "force-dynamic";

export default function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("journal_submissions")
      .select("id, slug, title, author_name, category, abstract, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        setEntries(data || []);
        setLoading(false);
      });
  }, []); // eslint-disable-line

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <p className="text-sm tracking-[0.2em] mb-3 font-mono text-brass">LAW JOURNAL</p>
      <h1 className="text-3xl md:text-4xl mb-3 font-display">Aviation Law Journal</h1>
      <p className="text-[15px] font-body text-[#4a4335] mb-8 max-w-xl">
        Peer-reviewed and editorially screened writing on aviation law, published from submissions to the hub.
      </p>

      <div className="flex mb-10">
        <Link href="/journal/submit" className="px-6 py-3 rounded-sm text-sm font-ui font-semibold bg-chambers text-parchment">
          Submit a Paper
        </Link>
      </div>

      {loading && <p className="text-[15px] font-body text-sage">Loading…</p>}

      {!loading && entries.length === 0 && (
        <p className="text-[15px] font-body text-sage">No papers published yet. Check back soon.</p>
      )}

      <div className="space-y-6">
        {entries.map((e) => (
          <Link
            key={e.id}
            href={/journal/${e.slug}}
            className="group block p-6 rounded-sm border border-parchment2 hover:border-chambers bg-white transition-colors"
          >
            <div className="flex items-center gap-2 mb-2 text-xs font-mono text-brass">
              <BookMarked size={14} />
              {e.category}
            </div>
            <h2 className="text-xl font-display mb-1.5 group-hover:text-chambers transition-colors">{e.title}</h2>
            <p className="text-sm font-ui text-sage mb-2">By {e.author_name}</p>
            <p className="text-[15px] font-body text-[#4a4335]">{e.abstract}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}