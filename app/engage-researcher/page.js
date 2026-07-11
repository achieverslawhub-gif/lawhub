"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Send } from "lucide-react";

const RESEARCH_TOPICS = [
  "Nigerian Aviation Law", "Online Dispute Resolution (ODR)", "Court Administration & Judicial Technology",
  "Corporate Income Taxation (Nigeria/UK)", "Labour Law & International Labour Standards",
  "Corporate Regulation & CSR", "Criminal Procedure", "Other (describe below)",
];
const DURATIONS = ["3 days", "1 week", "2 weeks", "1 month", "Custom (describe below)"];

export default function EngageResearcherPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [topic, setTopic] = useState(RESEARCH_TOPICS[0]);
  const [customTopic, setCustomTopic] = useState("");
  const [duration, setDuration] = useState(DURATIONS[0]);
  const [customDuration, setCustomDuration] = useState("");
  const [description, setDescription] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user || null));
  }, []); // eslint-disable-line

  const submit = async () => {
    if (!user) { router.push("/login?next=/engage-researcher"); return; }
    if (!description.trim()) { setError("Please add a brief description of the task."); return; }
    setError(""); setLoading(true);

    const payload = {
      user_id: user.id,
      client_name: user.user_metadata?.full_name || user.email,
      email: user.email,
      topic: topic === "Other (describe below)" ? (customTopic || "Other") : topic,
      duration: duration === "Custom (describe below)" ? (customDuration || "Custom") : duration,
      description: description.trim(),
    };

    const { error: err } = await supabase.from("researcher_requests").insert(payload);
    if (err) { setError(err.message); setLoading(false); return; }

    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "researcher_request", ...payload }),
    });

    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-16 text-center">
        <h1 className="text-2xl font-display mb-2">Request Received</h1>
        <p className="font-body text-[#4a4335]">Your research brief has been logged and the administration has been notified by email.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <h1 className="text-3xl mb-2 font-display">Engage a Legal Researcher</h1>
      <p className="text-[15px] mb-8 font-body text-[#4a4335]">
        Commission original research. Tell us the topic and timeline, and we'll follow up with a quote.
      </p>
      <div className="space-y-5">
        <div>
          <label className="text-sm mb-1.5 block font-ui font-medium">Topic</label>
          <select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full px-4 py-3 rounded-sm border border-parchment2 font-ui text-[15px]">
            {RESEARCH_TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {topic === "Other (describe below)" && (
            <input value={customTopic} onChange={(e) => setCustomTopic(e.target.value)} placeholder="Describe the topic"
              className="w-full px-4 py-3 rounded-sm border border-parchment2 font-ui text-[15px] mt-2" />
          )}
        </div>
        <div>
          <label className="text-sm mb-1.5 block font-ui font-medium">Delivery duration</label>
          <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full px-4 py-3 rounded-sm border border-parchment2 font-ui text-[15px]">
            {DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {duration === "Custom (describe below)" && (
            <input value={customDuration} onChange={(e) => setCustomDuration(e.target.value)} placeholder="e.g. by 20 August"
              className="w-full px-4 py-3 rounded-sm border border-parchment2 font-ui text-[15px] mt-2" />
          )}
        </div>
        <div>
          <label className="text-sm mb-1.5 block font-ui font-medium">Brief / description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5}
            placeholder="Describe the task — scope, jurisdiction, sources required, format expected…"
            className="w-full px-4 py-3 rounded-sm border border-parchment2 font-ui text-[15px]" />
        </div>
        {!user && <p className="text-sm font-ui text-sage">You'll be asked to sign in before submitting.</p>}
        {error && <p className="text-sm text-seal font-ui">{error}</p>}
        <button onClick={submit} disabled={loading} className="flex items-center gap-2 px-6 py-3 rounded-sm text-sm font-ui bg-chambers text-parchment disabled:opacity-50">
          <Send size={16} /> {loading ? "Submitting…" : "Submit Request"}
        </button>
      </div>
    </div>
  );
}
