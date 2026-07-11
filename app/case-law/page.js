import { createClient } from "@/lib/supabase/server";

export default async function CaseLawPage() {
  const supabase = createClient();
  const { data: cases } = await supabase.from("case_law").select("*").order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <h1 className="text-3xl mb-8 font-display">Case Law Explainers</h1>
      <div className="space-y-5">
        {(cases || []).map((c) => (
          <div key={c.id} className="p-6 rounded-sm border border-parchment2 bg-white">
            <span className="text-xs font-mono text-brass">{(c.area || "").toUpperCase()}</span>
            <h3 className="text-xl mt-1 mb-2 italic font-display">{c.name}</h3>
            <p className="text-[15px] leading-relaxed font-body text-[#4a4335]">{c.summary}</p>
          </div>
        ))}
        {(!cases || cases.length === 0) && (
          <p className="font-body text-[#4a4335]">No case law entries yet — add some from the Admin dashboard.</p>
        )}
      </div>
    </div>
  );
}
