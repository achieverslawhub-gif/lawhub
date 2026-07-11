import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ArticleDetailPage({ params }) {
  const supabase = createClient();
  const { data: a } = await supabase.from("articles").select("*").eq("slug", params.slug).single();

  if (!a) return <div className="max-w-2xl mx-auto px-5 py-12 font-body">Article not found.</div>;

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <Link href="/articles" className="text-sm font-ui text-chambers mb-6 inline-block">← All articles</Link>
      <span className="text-xs font-mono text-brass">{(a.tag || "").toUpperCase()}</span>
      <h1 className="text-3xl mt-2 mb-6 font-display">{a.title}</h1>
      <p className="text-[17px] leading-relaxed font-body whitespace-pre-line">{a.body}</p>
      {a.attachment_url && (
        <a href={a.attachment_url} target="_blank" rel="noreferrer" className="mt-6 inline-block text-sm text-chambers underline font-ui">
          Download original document
        </a>
      )}
    </div>
  );
}
