"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default function JournalEntryPage() {
  const { slug } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("journal_submissions")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single()
      .then(({ data }) => {
        setEntry(data);
        setLoading(false);
      });
  }, [slug]); // eslint-disable-line

  if (loading) {
    return <div className="max-w-3xl mx-auto px-5 py-16 text-center font-body text-sage">Loading…</div>;
  }

  if (!entry) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-16 text-center">
        <h1 className="text-2xl font-display mb-2">Not found</h1>
        <p className="text-sm font-ui text-sage">This paper isn't published, or doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <p className="text-xs font-mono text-brass mb-3">{entry.category}</p>
      <h1 className="text-3xl md:text-4xl font-display mb-3">{entry.title}</h1>
      <p className="text-sm font-ui text-sage mb-8">By {entry.author_name}</p>

      <p className="text-lg font-body italic text-[#4a4335] mb-8 border-l-2 border-brass pl-4">
        {entry.abstract}
      </p>

      {entry.body && (
        <div className="text-[15px] font-body text-[#4a4335] leading-relaxed whitespace-pre-line">
          {entry.body}
        </div>
      )}

      {entry.attachment_url && (
        <a
          href={entry.attachment_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-8 px-5 py-3 rounded-sm text-sm font-ui font-semibold border border-chambers text-chambers"
        >
          <FileText size={16} /> View full paper
        </a>
      )}
    </div>
  );
}