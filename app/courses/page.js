import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function CoursesPage() {
  const supabase = createClient();
  const { data: courses } = await supabase.from("courses").select("*").order("part");

  return (
    <div className="max-w-5xl mx-auto px-5 py-12">
      <h1 className="text-3xl mb-8 font-display">Courses</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {(courses || []).map((c) => (
          <Link key={c.id} href={`/courses/${c.slug}`} className="block p-6 rounded-sm border border-parchment2 bg-white hover:shadow-md">
            <span className="text-xs font-mono text-brass">PART {c.part}</span>
            <h3 className="text-xl mt-1 mb-2 font-display">{c.title}</h3>
            <p className="text-[15px] font-body text-[#4a4335]">{c.blurb}</p>
          </Link>
        ))}
        {(!courses || courses.length === 0) && (
          <p className="font-body text-[#4a4335]">No courses published yet — add some from the Admin dashboard.</p>
        )}
      </div>
    </div>
  );
}
