import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: courses } = await supabase.from("courses").select("*");
  const { data: progressRows } = await supabase.from("course_progress").select("*").eq("user_id", user.id);
  const { data: requests } = await supabase.from("researcher_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  const { data: bookings } = await supabase.from("tutorial_bookings").select("*").eq("user_id", user.id).order("created_at", { ascending: false });

  const progressByCourseId = Object.fromEntries((progressRows || []).map((p) => [p.course_id, p]));

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <h1 className="text-3xl mb-1 font-display">Welcome back, {profile?.full_name || user.email}</h1>
      {profile?.role === "admin" && (
        <a href="/admin" className="text-sm font-ui text-brass underline">Go to Admin Dashboard →</a>
      )}

      <h2 className="text-xl mt-10 mb-4 font-display">Course Progress</h2>
      <div className="space-y-3">
        {(courses || []).map((c) => {
          const p = progressByCourseId[c.id];
          const pct = p ? Math.round(((p.completed_lesson_ids || []).length / 3) * 100) : 0;
          return (
            <div key={c.id} className="p-5 rounded-sm border border-parchment2 bg-white">
              <div className="flex items-center justify-between mb-2 font-ui">
                <span className="font-medium">{c.title}</span>
                <span className="text-sm text-sage">{p?.quiz_passed ? "Certified" : `${pct}%`}</span>
              </div>
              <div className="h-1.5 rounded-full bg-parchment2 overflow-hidden">
                <div className="h-full bg-chambers" style={{ width: `${p?.quiz_passed ? 100 : pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="text-xl mt-10 mb-4 font-display">My Researcher Requests</h2>
      {(requests || []).length === 0 ? (
        <p className="font-body text-[#4a4335] text-sm">No requests submitted yet.</p>
      ) : (
        <div className="space-y-2">
          {requests.map((r) => (
            <div key={r.id} className="p-4 rounded-sm border border-parchment2 bg-white flex justify-between items-center font-ui text-sm">
              <span>{r.topic} — {r.duration}</span>
              <span className="capitalize text-sage">{r.status}{r.fee ? ` · ₦${r.fee}` : ""}</span>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-xl mt-10 mb-4 font-display">My Tutorial Bookings</h2>
      {(bookings || []).length === 0 ? (
        <p className="font-body text-[#4a4335] text-sm">No bookings submitted yet.</p>
      ) : (
        <div className="space-y-2">
          {bookings.map((b) => (
            <div key={b.id} className="p-4 rounded-sm border border-parchment2 bg-white flex justify-between items-center font-ui text-sm">
              <span>{b.subject} — {b.hours}h ({b.currency}{b.total})</span>
              <span className="capitalize text-sage">{b.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
