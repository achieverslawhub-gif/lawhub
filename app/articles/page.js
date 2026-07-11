import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  const supabase = createClient();
  const { data: articles } = await supabase.from("articles").select("*").order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <h1 className="text-3xl mb-8 font-display">Articles</h1>
      <div className="space-y-6">
        {(articles || []).map((a) => (
          <Link key={a.id} href={`/articles/${a.slug}`} className="block p-6 rounded-sm border border-parchment2 bg-white">
            <span className="text-xs font-mono text-brass">{(a.tag || "").toUpperCase()}</span>
            <h3 className="text-xl mt-1 mb-2 font-display">{a.title}</h3>
            <p className="text-[15px] font-body text-[#4a4335]">{a.excerpt}</p>
          </Link>
        ))}
        {(!articles || articles.length === 0) && (
          <p className="font-body text-[#4a4335]">No articles published yet — add some from the Admin dashboard.</p>
        )}
      </div>
    </div>
  );
}
