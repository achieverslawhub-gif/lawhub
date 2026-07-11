"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, Circle, ChevronDown, ChevronRight, Award } from "lucide-react";

export default function CourseDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState(null);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quiz, setQuiz] = useState([]);
  const [progress, setProgress] = useState({ completed_lesson_ids: [], quiz_passed: false });
  const [openLesson, setOpenLesson] = useState(null);
  const [quizMode, setQuizMode] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user || null);

      const { data: courseData } = await supabase.from("courses").select("*").eq("slug", slug).single();
      if (!courseData) return;
      setCourse(courseData);

      const { data: lessonData } = await supabase.from("lessons").select("*").eq("course_id", courseData.id).order("position");
      setLessons(lessonData || []);
      setOpenLesson(lessonData?.[0]?.id || null);

      const { data: quizData } = await supabase.from("quiz_questions").select("*").eq("course_id", courseData.id).order("position");
      setQuiz(quizData || []);

      if (userData.user) {
        const { data: p } = await supabase
          .from("course_progress")
          .select("*")
          .eq("user_id", userData.user.id)
          .eq("course_id", courseData.id)
          .single();
        if (p) setProgress(p);
      }
    })();
  }, [slug]); // eslint-disable-line

  const markDone = async (lessonId) => {
    if (!user) { router.push(`/login?next=/courses/${slug}`); return; }
    const nextIds = Array.from(new Set([...(progress.completed_lesson_ids || []), lessonId]));
    const updated = { ...progress, completed_lesson_ids: nextIds };
    setProgress(updated);
    await supabase.from("course_progress").upsert(
      { user_id: user.id, course_id: course.id, completed_lesson_ids: nextIds, quiz_passed: progress.quiz_passed || false },
      { onConflict: "user_id,course_id" }
    );
  };

  const allDone = lessons.length > 0 && lessons.every((l) => (progress.completed_lesson_ids || []).includes(l.id));
  const score = submitted ? quiz.reduce((a, q, i) => a + (answers[i] === q.correct_index ? 1 : 0), 0) : 0;
  const passed = submitted && score >= Math.ceil(quiz.length * 0.67);

  const submitQuiz = async () => {
    setSubmitted(true);
    const ok = quiz.reduce((a, q, i) => a + (answers[i] === q.correct_index ? 1 : 0), 0) >= Math.ceil(quiz.length * 0.67);
    if (ok) {
      const updated = { ...progress, quiz_passed: true };
      setProgress(updated);
      await supabase.from("course_progress").upsert(
        { user_id: user.id, course_id: course.id, completed_lesson_ids: progress.completed_lesson_ids || [], quiz_passed: true },
        { onConflict: "user_id,course_id" }
      );
    }
  };

  if (!course) return <div className="max-w-3xl mx-auto px-5 py-12 font-body">Loading…</div>;

  if (quizMode) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-12">
        <button onClick={() => setQuizMode(false)} className="text-sm font-ui text-chambers mb-6">← Back to lessons</button>
        <h2 className="text-2xl mb-6 font-display">Quiz — {course.title}</h2>
        {!submitted ? (
          <div className="space-y-8">
            {quiz.map((q, i) => (
              <div key={q.id}>
                <p className="mb-3 text-[17px] font-body">{i + 1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                      className={`w-full text-left px-4 py-2.5 rounded-sm border text-[15px] flex items-center gap-2.5 font-ui ${answers[i] === oi ? "border-chambers bg-chambers/5" : "border-parchment2 bg-white"}`}
                    >
                      {answers[i] === oi ? <CheckCircle2 size={16} className="text-chambers" /> : <Circle size={16} className="text-sage" />}
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button
              disabled={Object.keys(answers).length < quiz.length}
              onClick={submitQuiz}
              className="px-6 py-3 rounded-sm text-sm font-ui bg-chambers text-parchment disabled:opacity-40"
            >
              Submit Answers
            </button>
          </div>
        ) : (
          <div className={`p-6 rounded-sm border ${passed ? "border-chambers bg-chambers/5" : "border-seal bg-seal/5"}`}>
            <p className="text-xl font-display mb-1">{score} / {quiz.length} correct</p>
            {passed ? (
              <div className="flex items-center gap-2 mt-3 text-chambers font-ui"><Award size={18} /> Certificate earned — see your Dashboard.</div>
            ) : (
              <button onClick={() => { setSubmitted(false); setAnswers({}); }} className="mt-3 px-5 py-2 rounded-sm text-sm font-ui border border-chambers text-chambers">
                Retake Quiz
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <h1 className="text-3xl mb-2 font-display">{course.title}</h1>
      <p className="text-[16px] mb-8 font-body text-[#4a4335]">{course.blurb}</p>

      <div className="space-y-3 mb-8">
        {lessons.map((l, i) => {
          const done = (progress.completed_lesson_ids || []).includes(l.id);
          const isOpen = openLesson === l.id;
          return (
            <div key={l.id} className="border border-parchment2 rounded-sm overflow-hidden">
              <button onClick={() => setOpenLesson(isOpen ? null : l.id)} className="w-full flex items-center justify-between px-5 py-4 text-left bg-white">
                <span className="flex items-center gap-3 font-ui font-medium">
                  {done ? <CheckCircle2 size={18} className="text-chambers" /> : <Circle size={18} className="text-sage" />}
                  {i + 1}. {l.title}
                </span>
                {isOpen ? <ChevronDown size={18} className="text-sage" /> : <ChevronRight size={18} className="text-sage" />}
              </button>
              {isOpen && (
                <div className="px-5 pb-5 bg-white">
                  <p className="text-[15.5px] leading-relaxed mb-4 font-body">{l.body}</p>
                  {l.attachment_url && (
                    <a href={l.attachment_url} target="_blank" rel="noreferrer" className="text-sm text-chambers underline font-ui block mb-4">
                      View attached document
                    </a>
                  )}
                  {!done && (
                    <button onClick={() => markDone(l.id)} className="text-sm px-4 py-2 rounded-sm font-ui bg-chambers text-parchment">
                      Mark lesson complete
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        disabled={!allDone || quiz.length === 0}
        onClick={() => setQuizMode(true)}
        className="px-6 py-3 rounded-sm text-sm font-ui bg-brass text-chambersDark disabled:opacity-40"
      >
        {quiz.length === 0 ? "Quiz not yet published" : allDone ? "Take the Quiz" : "Complete all lessons to unlock the quiz"}
      </button>
    </div>
  );
}
