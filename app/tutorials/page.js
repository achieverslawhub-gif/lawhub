"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Send } from "lucide-react";

const LAW_SUBJECTS = [
  "Constitutional Law", "Administrative Law", "Law of Contract", "Law of Tort", "Jurisprudence",
  "Nigerian Legal System", "Revenue Law (Taxation)", "Labour Law", "Civil Procedure", "Criminal Law",
  "Criminal Procedure", "Aviation Law", "Space Law", "Equity and Trusts", "Company Law", "Law of Evidence",
  "Public International Law", "Private International Law (Conflict of Laws)", "Human Rights Law",
  "Land Law / Property Law", "Family Law", "Commercial Law", "Banking Law", "Insurance Law",
  "Intellectual Property Law", "Environmental Law", "Admiralty / Maritime Law", "Oil and Gas Law",
  "Law of Succession (Wills & Probate)", "Legal Drafting & Conveyancing", "Alternative Dispute Resolution (ADR)",
  "Information Technology / Cyber Law", "Immigration Law", "Competition Law", "Islamic Law", "Customary Law",
];
const RATE_USD = 50;
const RATE_NGN = 10000;

export default function TutorialsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [studentType, setStudentType] = useState("nigerian");
  const [subject, setSubject] = useState(LAW_SUBJECTS[0]);
  const [hours, setHours] = useState(1);
  const [preferredTime, setPreferredTime] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user || null));
  }, []); // eslint-disable-line

  const rate = studentType === "nigerian" ? RATE_NGN : RATE_USD;
  const currency = studentType === "nigerian" ? "₦" : "$";
  const total = rate * Number(hours || 0);

  const submit = async () => {
    if (!user) { router.push("/login?next=/tutorials"); return; }
    if (!preferredTime.trim() || !hours || Number(hours) <= 0) {
      setError("Please add your preferred time and number of hours.");
      return;
    }
    setError(""); setLoading(true);

    const payload = {
      user_id: user.id,
      student_name: user.user_metadata?.full_name || user.email,
      email: user.email,
      subject, student_type: studentType, hours: Number(hours),
      currency, rate, total, preferred_time: preferredTime.trim(),
    };

    const { error: err } = await supabase.from("tutorial_bookings").insert(payload);
    if (err) { setError(err.message); setLoading(false); return; }

    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "tutorial_booking", ...payload }),
    });

    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-16 text-center">
        <h1 className="text-2xl font-display mb-2">Booking Received</h1>
        <p className="font-body text-[#4a4335]">Your tutorial request for <strong>{subject}</strong> has been logged and the administration has been notified.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-12">
      <h1 className="text-3xl mb-2 font-display">Book a One-on-One Tutorial</h1>
      <p className="text-[15px] mb-6 font-body text-[#4a4335]">Pick a subject and hours — the administration will confirm and invoice you.</p>

      <div className="flex flex-wrap gap-3 mb-8">
        <div className="px-5 py-3 rounded-sm border border-brass bg-brass/10 font-ui text-sm font-semibold">$50 / hour <span className="text-xs text-sage font-normal">international</span></div>
        <div className="px-5 py-3 rounded-sm border border-chambers bg-chambers/5 font-ui text-sm font-semibold">₦10,000 / hour <span className="text-xs text-sage font-normal">Nigerian</span></div>
      </div>

      <h2 className="text-lg mb-3 font-display">Subjects Available</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 mb-10">
        {LAW_SUBJECTS.map((s) => (
          <button key={s} onClick={() => setSubject(s)}
            className={`text-left px-3.5 py-2.5 rounded-sm border text-[13.5px] font-ui ${subject === s ? "border-chambers bg-chambers/5 text-chambers font-semibold" : "border-parchment2 bg-white"}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="p-6 rounded-sm border border-parchment2 bg-white">
        <h2 className="text-lg mb-5 font-display">Complete Your Booking</h2>
        <div className="space-y-5">
          <div className="px-4 py-3 rounded-sm border border-parchment2 font-ui text-[15px] bg-parchment">{subject}</div>
          <div className="flex gap-3">
            <button onClick={() => setStudentType("nigerian")} className={`flex-1 px-4 py-3 rounded-sm border text-[14px] font-ui ${studentType === "nigerian" ? "border-chambers bg-chambers/5" : "border-parchment2 bg-white"}`}>Nigerian student — ₦10,000/hr</button>
            <button onClick={() => setStudentType("international")} className={`flex-1 px-4 py-3 rounded-sm border text-[14px] font-ui ${studentType === "international" ? "border-brass bg-brass/10" : "border-parchment2 bg-white"}`}>International — $50/hr</button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <input type="number" min={1} value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Hours" className="w-full px-4 py-3 rounded-sm border border-parchment2 font-ui text-[15px]" />
            <input value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} placeholder="Preferred date/time" className="w-full px-4 py-3 rounded-sm border border-parchment2 font-ui text-[15px]" />
          </div>
          <div className="flex items-center justify-between px-5 py-4 rounded-sm bg-parchment">
            <span className="text-sm font-ui">Estimated total</span>
            <span className="text-xl font-display text-chambers">{currency}{total.toLocaleString()}</span>
          </div>
          {!user && <p className="text-sm font-ui text-sage">You'll be asked to sign in before submitting.</p>}
          {error && <p className="text-sm text-seal font-ui">{error}</p>}
          <button onClick={submit} disabled={loading} className="flex items-center gap-2 px-6 py-3 rounded-sm text-sm font-ui bg-chambers text-parchment disabled:opacity-50">
            <Send size={16} /> {loading ? "Submitting…" : "Submit Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}
