import Link from "next/link";
import { GraduationCap, Feather, BookOpen } from "lucide-react";

export default function Home() {
  return (
    <div>
      <section className="max-w-3xl mx-auto px-5 pt-16 pb-14 text-center">
        <p className="text-sm tracking-[0.2em] mb-4 font-mono text-brass">AN ACT FOR THE EDUCATION OF THE LEGAL MIND</p>
        <h1 className="text-4xl md:text-5xl leading-tight mb-6 font-display">Preamble</h1>
        <p className="text-lg md:text-xl leading-relaxed mb-2 font-body">
          <em>Whereas</em> legal education ought to be rigorous, accessible, and grounded in real authority —
        </p>
        <p className="text-lg md:text-xl leading-relaxed mb-8 font-body">
          <strong>Be it resolved</strong> that Achievers Law Hub shall provide structured courses, case law explainers,
          and original legal writing, verified and cited, for every learner who arrives at its door.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/courses" className="px-6 py-3 rounded-sm text-sm font-ui bg-chambers text-parchment">Begin a Course</Link>
          <Link href="/case-law" className="px-6 py-3 rounded-sm text-sm font-ui border border-chambers text-chambers">Browse Case Law</Link>
        </div>
      </section>

      <section className="border-t border-parchment2 bg-parchment2">
        <div className="max-w-6xl mx-auto px-5 py-12 grid md:grid-cols-3 gap-8">
          {[
            { Icon: GraduationCap, title: "Courses", desc: "Structured lessons with a graded quiz and a certificate on completion." },
            { Icon: Feather, title: "Articles", desc: "Original writing on aviation law, ODR, court technology, and legal method." },
            { Icon: BookOpen, title: "Case Law", desc: "Short, honest explainers of landmark cases." },
          ].map((f) => (
            <div key={f.title}>
              <f.Icon className="text-chambers mb-3" size={26} />
              <h3 className="text-xl mb-1.5 font-display">{f.title}</h3>
              <p className="text-[15px] font-body text-[#4a4335]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
