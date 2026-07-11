"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload } from "lucide-react";
export const dynamic = "force-dynamic";

const REQUEST_STATUSES = ["pending", "quoted", "in-progress", "delivered", "paid"];
const BOOKING_STATUSES = ["pending", "confirmed", "completed", "paid"];

export default function AdminPage() {
  const supabase = createClient();
  const [tab, setTab] = useState("requests");
  const [requests, setRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [articles, setArticles] = useState([]);
  const [cases, setCases] = useState([]);

  const load = async () => {
    const [r, b, c, a, cl] = await Promise.all([
      supabase.from("researcher_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("tutorial_bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("courses").select("*").order("part"),
      supabase.from("articles").select("*").order("created_at", { ascending: false }),
      supabase.from("case_law").select("*").order("created_at", { ascending: false }),
    ]);
    setRequests(r.data || []);
    setBookings(b.data || []);
    setCourses(c.data || []);
    setArticles(a.data || []);
    setCases(cl.data || []);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const updateRequest = async (id, patch) => {
    await supabase.from("researcher_requests").update(patch).eq("id", id);
    load();
  };
  const updateBooking = async (id, patch) => {
    await supabase.from("tutorial_bookings").update(patch).eq("id", id);
    load();
  };

  const uploadFile = async (file) => {
    if (!file) return null;
    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("uploads").upload(path, file);
    if (error) { alert("Upload failed: " + error.message); return null; }
    const { data } = supabase.storage.from("uploads").getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <h1 className="text-3xl mb-6 font-display">Administration</h1>

      <div className="flex gap-2 mb-8 flex-wrap">
        {["requests", "bookings", "courses", "articles", "case-law"].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-sm text-sm font-ui border border-chambers ${tab === t ? "bg-chambers text-parchment" : "bg-white text-ink"}`}>
            {t.replace("-", " ")}
          </button>
        ))}
      </div>

      {tab === "requests" && (
        <Table
          rows={requests}
          columns={["client_name", "topic", "duration", "description"]}
          statusField="status" statusOptions={REQUEST_STATUSES}
          extraField="fee" extraLabel="Fee (₦)"
          onSave={(id, patch) => updateRequest(id, patch)}
        />
      )}

      {tab === "bookings" && (
        <Table
          rows={bookings}
          columns={["student_name", "subject", "student_type", "hours", "preferred_time"]}
          statusField="status" statusOptions={BOOKING_STATUSES}
          onSave={(id, patch) => updateBooking(id, patch)}
        />
      )}

      {tab === "courses" && <CourseManager courses={courses} supabase={supabase} uploadFile={uploadFile} reload={load} />}
      {tab === "articles" && <ArticleManager articles={articles} supabase={supabase} uploadFile={uploadFile} reload={load} />}
      {tab === "case-law" && <CaseLawManager cases={cases} supabase={supabase} reload={load} />}
    </div>
  );
}

function Table({ rows, columns, statusField, statusOptions, extraField, extraLabel, onSave }) {
  const [drafts, setDrafts] = useState({});
  const draftFor = (r) => drafts[r.id] || { [statusField]: r[statusField], [extraField]: r[extraField] || "" };
  const setDraft = (id, patch) => setDrafts((d) => ({ ...d, [id]: { ...draftFor({ id }), ...d[id], ...patch } }));

  if (rows.length === 0) return <p className="font-body text-[#4a4335]">Nothing here yet.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-sm font-ui">
        <thead>
          <tr className="border-b-2 border-chambers">
            {columns.map((c) => <th key={c} className="py-2.5 pr-4 capitalize text-chambers">{c.replace("_", " ")}</th>)}
            <th className="py-2.5 pr-4 text-chambers">Status</th>
            {extraField && <th className="py-2.5 pr-4 text-chambers">{extraLabel}</th>}
            <th className="py-2.5 pr-4 text-chambers">Save</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const d = draftFor(r);
            return (
              <tr key={r.id} className="border-b border-parchment2">
                {columns.map((c) => <td key={c} className="py-3 pr-4 align-top max-w-[220px]">{String(r[c] ?? "")}</td>)}
                <td className="py-3 pr-4 align-top">
                  <select value={d[statusField]} onChange={(e) => setDraft(r.id, { [statusField]: e.target.value })} className="px-2 py-1.5 rounded-sm border border-parchment2 text-sm">
                    {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                {extraField && (
                  <td className="py-3 pr-4 align-top">
                    <input value={d[extraField]} onChange={(e) => setDraft(r.id, { [extraField]: e.target.value })} placeholder="e.g. 45000" className="w-24 px-2 py-1.5 rounded-sm border border-parchment2 text-sm" />
                  </td>
                )}
                <td className="py-3 pr-4 align-top">
                  <button onClick={() => onSave(r.id, d)} className="px-3 py-1.5 rounded-sm text-sm bg-brass text-chambersDark">Save</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ArticleManager({ articles, supabase, uploadFile, reload }) {
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    const attachment_url = file ? await uploadFile(file) : null;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await supabase.from("articles").insert({ title, tag, excerpt, body, slug, attachment_url });
    setTitle(""); setTag(""); setExcerpt(""); setBody(""); setFile(null);
    setSaving(false);
    reload();
  };

  return (
    <div>
      <div className="p-6 rounded-sm border border-parchment2 bg-white mb-8 space-y-3">
        <h3 className="font-display text-lg mb-2">Add Article</h3>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full px-4 py-2.5 rounded-sm border border-parchment2 text-sm font-ui" />
        <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Tag (e.g. Aviation Law)" className="w-full px-4 py-2.5 rounded-sm border border-parchment2 text-sm font-ui" />
        <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short excerpt" className="w-full px-4 py-2.5 rounded-sm border border-parchment2 text-sm font-ui" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} placeholder="Full body — paste your own writing here, mixed with any placeholder text you like"
          className="w-full px-4 py-2.5 rounded-sm border border-parchment2 text-sm font-ui" />
        <label className="flex items-center gap-2 text-sm font-ui text-sage">
          <Upload size={15} /> Optional: attach original document (PDF/DOCX)
          <input type="file" onChange={(e) => setFile(e.target.files[0])} className="text-xs" />
        </label>
        <button onClick={submit} disabled={saving} className="px-5 py-2.5 rounded-sm text-sm font-ui bg-chambers text-parchment disabled:opacity-50">
          {saving ? "Saving…" : "Publish Article"}
        </button>
      </div>
      <h3 className="font-display text-lg mb-3">Existing Articles</h3>
      <ul className="space-y-2 font-ui text-sm">
        {articles.map((a) => <li key={a.id} className="p-3 rounded-sm border border-parchment2 bg-white">{a.title} {a.attachment_url && <span className="text-sage">· has attachment</span>}</li>)}
      </ul>
    </div>
  );
}

function CaseLawManager({ cases, supabase, reload }) {
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [summary, setSummary] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim() || !summary.trim()) return;
    setSaving(true);
    await supabase.from("case_law").insert({ name, area, summary });
    setName(""); setArea(""); setSummary("");
    setSaving(false);
    reload();
  };

  return (
    <div>
      <div className="p-6 rounded-sm border border-parchment2 bg-white mb-8 space-y-3">
        <h3 className="font-display text-lg mb-2">Add Case Law Explainer</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Case name" className="w-full px-4 py-2.5 rounded-sm border border-parchment2 text-sm font-ui" />
        <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Area of law" className="w-full px-4 py-2.5 rounded-sm border border-parchment2 text-sm font-ui" />
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} placeholder="Summary" className="w-full px-4 py-2.5 rounded-sm border border-parchment2 text-sm font-ui" />
        <button onClick={submit} disabled={saving} className="px-5 py-2.5 rounded-sm text-sm font-ui bg-chambers text-parchment disabled:opacity-50">
          {saving ? "Saving…" : "Publish"}
        </button>
      </div>
      <ul className="space-y-2 font-ui text-sm">
        {cases.map((c) => <li key={c.id} className="p-3 rounded-sm border border-parchment2 bg-white">{c.name}</li>)}
      </ul>
    </div>
  );
}

function CourseManager({ courses, supabase, uploadFile, reload }) {
  const [title, setTitle] = useState("");
  const [blurb, setBlurb] = useState("");
  const [part, setPart] = useState("");
  const [saving, setSaving] = useState(false);

  const [lessonCourseId, setLessonCourseId] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonBody, setLessonBody] = useState("");
  const [lessonFile, setLessonFile] = useState(null);

  const addCourse = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await supabase.from("courses").insert({ title, blurb, part, slug });
    setTitle(""); setBlurb(""); setPart("");
    setSaving(false);
    reload();
  };

  const addLesson = async () => {
    if (!lessonCourseId || !lessonTitle.trim()) return;
    const attachment_url = lessonFile ? await uploadFile(lessonFile) : null;
    await supabase.from("lessons").insert({ course_id: lessonCourseId, title: lessonTitle, body: lessonBody, attachment_url, position: 99 });
    setLessonTitle(""); setLessonBody(""); setLessonFile(null);
    reload();
  };

  return (
    <div className="space-y-8">
      <div className="p-6 rounded-sm border border-parchment2 bg-white space-y-3">
        <h3 className="font-display text-lg mb-2">Add Course</h3>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Course title" className="w-full px-4 py-2.5 rounded-sm border border-parchment2 text-sm font-ui" />
        <input value={blurb} onChange={(e) => setBlurb(e.target.value)} placeholder="Short blurb" className="w-full px-4 py-2.5 rounded-sm border border-parchment2 text-sm font-ui" />
        <input value={part} onChange={(e) => setPart(e.target.value)} placeholder="Part label (e.g. III)" className="w-full px-4 py-2.5 rounded-sm border border-parchment2 text-sm font-ui" />
        <button onClick={addCourse} disabled={saving} className="px-5 py-2.5 rounded-sm text-sm font-ui bg-chambers text-parchment disabled:opacity-50">
          {saving ? "Saving…" : "Create Course"}
        </button>
      </div>

      <div className="p-6 rounded-sm border border-parchment2 bg-white space-y-3">
        <h3 className="font-display text-lg mb-2">Add Lesson to a Course</h3>
        <select value={lessonCourseId} onChange={(e) => setLessonCourseId(e.target.value)} className="w-full px-4 py-2.5 rounded-sm border border-parchment2 text-sm font-ui">
          <option value="">Select course…</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <input value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} placeholder="Lesson title" className="w-full px-4 py-2.5 rounded-sm border border-parchment2 text-sm font-ui" />
        <textarea value={lessonBody} onChange={(e) => setLessonBody(e.target.value)} rows={5} placeholder="Lesson content — your own writing, mixed with placeholder as needed"
          className="w-full px-4 py-2.5 rounded-sm border border-parchment2 text-sm font-ui" />
        <label className="flex items-center gap-2 text-sm font-ui text-sage">
          <Upload size={15} /> Optional: attach a document
          <input type="file" onChange={(e) => setLessonFile(e.target.files[0])} className="text-xs" />
        </label>
        <button onClick={addLesson} className="px-5 py-2.5 rounded-sm text-sm font-ui bg-brass text-chambersDark">Add Lesson</button>
      </div>

      <ul className="space-y-2 font-ui text-sm">
        {courses.map((c) => <li key={c.id} className="p-3 rounded-sm border border-parchment2 bg-white">{c.title}</li>)}
      </ul>
    </div>
  );
}
