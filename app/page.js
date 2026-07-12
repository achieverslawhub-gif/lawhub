import Link from "next/link";
import { GraduationCap, Feather, BookOpen, BookMarked, ArrowRight, Search, MessageSquareText } from "lucide-react";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-parchment2">
        <div className="absolute -right-24 -top-24 w-[420px] h-[420px] rounded-full bg-chambers/5 blur-3xl" aria-hidden="true" />
        <div className="absolute -left-16 bottom-0 w-[300px] h-[300px] rounded-full bg-brass/10 blur-3xl" aria-hidden="true" />

        <div className="max-w-6xl mx-auto px-5 pt-20 pb-16 relative">
          <p className="text-sm tracking-[0.25em] mb-5 font-mono text-brass">ACHIEVERS LAW HUB</p>
          <h1 className="text-5xl md:text-7xl leading-[1.05] mb-7 font-display max-w-3xl">
            Study law like you'll <span className="text-chambers">argue it</span> tomorrow.
          </h1>
          <p className="text-lg md:text-xl leading-relaxed mb-10 font-body text-[#4a4335] max-w-xl">
            One-on-one tutorials, hands-on research support, structured courses, and case law that's actually
            readable — everything a serious law student needs, in one place.
          </p>

          <div className="flex flex-wrap gap-4 mb-14">
            <Link
              href="/tutorials"
              className="group flex items-center gap-2 px-7 py-4 rounded-sm text-base font-ui font-semibold bg-chambers text-parchment hover:bg-chambers/90 transition-colors"
            >
              Book a Tutorial
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/engage-researcher"
              className="group flex items-center gap-2 px-7 py-4 rounded-sm text-base font-ui font-semibold border-2 border-chambers text-chambers hover:bg-chambers/5 transition-colors"
            >
              Engage a Researcher
              <Search size={17} />
            </Link>
          </div>

          {/* Quick stats strip - signature element */}
          <div className="flex flex-wrap gap-x-10 gap-y-4 pt-8 border-t border-parchment2 font-mono text-sm text-sage">
            <span><strong className="text-chambers text-base">1-on-1</strong> tutorial sessions</span>
            <span><strong className="text-chambers text-base">₦10,000</strong> / hr for Nigerian students</span>
            <span><strong className="text-chambers text-base">$50</strong> / hr international</span>
          </div>
        </div>
      </section>

      {/* Two priority actions, spelled out */}
      <section className="max-w-6xl mx-auto px-5 py-16 grid md:grid-cols-2 gap-6">
        <Link
          href="/tutorials"
          className="group p-8 rounded-sm border border-parchment2 hover:border-chambers transition-colors bg-white"
        >
          <MessageSquareText className="text-chambers mb-4" size={28} />
          <h2 className="text-2xl font-display mb-2">Book a Tutorial</h2>
          <p className="text-[15px] font-body text-[#4a4335] mb-4">
            Get direct, one-on-one time with a tutor on any subject — from Constitutional Law to Oil and Gas Law.
            Pick your hours, pick your time, get confirmed.
          </p>
          <span className="inline-flex items-center gap-1.5 text-sm font-ui font-semibold text-chambers">
            Choose a subject <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        <Link
          href="/engage-researcher"
          className="group p-8 rounded-sm border border-parchment2 hover:border-chambers transition-colors bg-white"
        >
          <Search className="text-chambers mb-4" size={28} />
          <h2 className="text-2xl font-display mb-2">Engage a Researcher</h2>
          <p className="text-[15px] font-body text-[#4a4335] mb-4">
            Working on a thesis, a memo, or a moot? Bring in a researcher who'll dig into the authority and
            get you a properly cited answer.
          </p>
          <span className="inline-flex items-center gap-1.5 text-sm font-ui font-semibold text-chambers">
            Start a request <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </section>

      {/* Everything else */}
      <section className="border-t border-parchment2 bg-parchment2">
        <div className="max-w-6xl mx-auto px-5 py-14">
          <h3 className="text-2xl font-display mb-8">Also on the hub</h3>
         <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
                { Icon: GraduationCap, title: "Courses", desc: "Structured lessons with a graded quiz and a certificate on completion.", href: "/courses" },
              { Icon: Feather, title: "Articles", desc: "Original writing on aviation law, ODR, court technology, and legal method.", href: "/articles" },
              { Icon: BookOpen, title: "Case Law", desc: "Short, honest explainers of landmark cases.", href: "/case-law" },
              { Icon: BookMarked, title: "Law Journal", desc: "Peer-reviewed aviation law papers, published from submissions to the hub.", href: "/journal" },
            ].map((f) => (
              <Link key={f.title} href={f.href} className="group">
                <f.Icon className="text-chambers mb-3" size={26} />
                <h4 className="text-xl mb-1.5 font-display group-hover:text-chambers transition-colors">{f.title}</h4>
                <p className="text-[15px] font-body text-[#4a4335]">{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}