[6:13 pm, 12/07/2026] Enny_Adeoluwa:   retur…
[6:14 pm, 12/07/2026] 🤎ADE M🤎: "use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default function SubmitJournalPage() {
  const [form, setForm] = useState({
    title: "",
    author_name: "",
    author_email: "",
    category: "Aviation Law",
    abstract: "",
    body: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const supabase = createClient();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim() || !form.author_name.trim() || !form.author_email.trim() || !form.abstract.trim()) {
      setError("Please fill in the title, your name, email, and an abstract.");
      return;
    }

    setLoading(true);
    const { error: err } = await supabase.from("journal_submissions").insert({
      title: form.title.trim(),
      author_name: form.author_name.trim(),
      author_email: form.author_email.trim(),
      category: form.category,
      abstract: form.abstract.trim(),
      body: form.body.trim() || null,
    });
    setLoading(false);

    if (err) {
      setError(err.message);
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-5 py-16 text-center">
        <h1 className="text-2xl font-display mb-2">Submission received</h1>
        <p className="text-[15px] font-body text-[#4a4335] mb-6">
          Thank you — your paper has been submitted for review. We'll be in touch at{" "}
          <strong>{form.author_email}</strong> once it's been reviewed.
        </p>
        <Link href="/journal" className="text-chambers underline font-ui text-sm">Back to the Journal</Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-5 py-14">
      <p className="text-sm tracking-[0.2em] mb-3 font-mono text-brass">SUBMIT A PAPER</p>
      <h1 className="text-3xl font-display mb-2">Aviation Law Journal</h1>
      <p className="text-[15px] font-body text-[#4a4335] mb-8">
        Submit your paper for editorial review. Once approved, it'll be published on the Journal page.
      </p>

      <form onSubmit={submit} className="space-y-4">
        <input
          value={form.title}
          onChange={update("title")}
          placeholder="Paper title"
          required
          className="w-full px-4 py-3 rounded-sm border border-parchment2 font-ui text-[15px]"
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            value={form.author_name}
            onChange={update("author_name")}
            placeholder="Your name"
            required
            className="w-full px-4 py-3 rounded-sm border border-parchment2 font-ui text-[15px]"
          />
          <input
            type="email"
            value={form.author_email}
            onChange={update("author_email")}
            placeholder="Your email"
            required
            className="w-full px-4 py-3 rounded-sm border border-parchment2 font-ui text-[15px]"
          />
        </div>
        <select
          value={form.category}
          onChange={update("category")}
          className="w-full px-4 py-3 rounded-sm border border-parchment2 font-ui text-[15px] bg-white"
        >
          <option>Aviation Law</option>
          <option>Space Law</option>
          <option>Aviation Regulation</option>
          <option>Maritime & Aviation</option>
          <option>Other</option>
        </select>
        <textarea
          value={form.abstract}
          onChange={update("abstract")}
          placeholder="Abstract (a short summary of the paper)"
          required
          rows={3}
          className="w-full px-4 py-3 rounded-sm border border-parchment2 font-ui text-[15px]"
        />
        <textarea
          value={form.body}
          onChange={update("body")}
          placeholder="Full paper text (optional — you can also just send the abstract and follow up by email)"
          rows={10}
          className="w-full px-4 py-3 rounded-sm border border-parchment2 font-ui text-[15px]"
        />
        {error && <p className="text-sm text-seal font-ui">{error}</p>}
        <button
          disabled={loading}
          className="w-full px-6 py-3 rounded-sm text-sm font-ui font-semibold bg-chambers text-parchment disabled:opacity-50"
        >
          {loading ? "Submitting…" : "Submit for Review"}
        </button>
      </form>
    </div>
  );
}