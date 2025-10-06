"use client";
import { FormEvent, useState } from "react";
import { useAuth } from "@/store/useAuth";
import { redirect } from "next/navigation";

export default function Home() {
  const { token, issueOtp, verifyOtp } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);

  if (token) {
    if (typeof window !== "undefined") redirect("/projects");
  }

  async function onIssue(e: FormEvent) {
    e.preventDefault();
    await issueOtp(email);
    setSent(true);
  }
  async function onVerify(e: FormEvent) {
    e.preventDefault();
    await verifyOtp(email, code);
    redirect("/projects");
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>Login</h1>
      {!sent ? (
        <form onSubmit={onIssue}>
          <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div style={{ height: 12 }} />
          <button className="btn" type="submit">Send code</button>
        </form>
      ) : (
        <form onSubmit={onVerify}>
          <input className="input" placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value)} />
          <div style={{ height: 12 }} />
          <button className="btn" type="submit">Verify</button>
        </form>
      )}
    </div>
  );
}
