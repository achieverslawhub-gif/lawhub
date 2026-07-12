"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Supabase fires this event once it reads the recovery token from the URL
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    // Also mark ready if a session already exists (in case the event already fired)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []); // eslint-disable-line

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (err) {
      setError(err.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 2000);
  };

  if (done) {
    return (
      <div className="max-w-sm mx-auto px-5 py-16 text-center">
        <h1 className="text-2xl font-display mb-2">Password updated</h1>
        <p className="text-sm font-ui text-sage">Redirecting you to sign in…</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="max-w-sm mx-auto px-5 py-16 text-center">
        <p className="text-sm font-ui text-sage">
          Verifying your reset link… If this doesn't update in a few seconds, the link may have expired — request a new one from the sign-in page.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-5 py-16">
      <h1 className="text-2xl font-display mb-1 text-center">Set a new password</h1>
      <form onSubmit={submit} className="space-y-4 mt-8">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          required
          className="w-full px-4 py-3 rounded-sm border border-parchment2 font-ui text-[15px]"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          required
          className="w-full px-4 py-3 rounded-sm border border-parchment2 font-ui text-[15px]"
        />
        {error && <p className="text-sm text-seal font-ui">{error}</p>}
        <button
          disabled={loading}
          className="w-full px-6 py-3 rounded-sm text-sm font-ui bg-chambers text-parchment disabled:opacity-50"
        >
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}