"use client";
import { FormEvent, useState } from "react";
import { useAuth } from "@/store/useAuth";
import { redirect } from "next/navigation";

export default function Home() {
  const { token, issueOtp, verifyOtp } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (token) {
    if (typeof window !== "undefined") redirect("/projects");
  }

  async function onIssue(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await issueOtp(email);
      setSent(true);
    } catch (error) {
      console.error('Failed to send OTP:', error);
    } finally {
      setLoading(false);
    }
  }

  async function onVerify(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyOtp(email, code);
      // Use router.push for better navigation
      if (typeof window !== "undefined") {
        window.location.href = "/projects";
      }
    } catch (error) {
      console.error('Failed to verify OTP:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="card" style={{ maxWidth: 420, width: '100%', margin: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#1e293b' }}>
            Ticket Dashboard
          </h1>
          <p style={{ color: '#64748b', fontSize: 16 }}>
            {!sent ? 'Enter your email to get started' : 'Enter the verification code'}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={onIssue}>
            <div style={{ marginBottom: 20 }}>
              <input 
                className="input" 
                placeholder="Enter your email address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
            </div>
            <button 
              className="btn" 
              type="submit" 
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={onVerify}>
            <div style={{ marginBottom: 20 }}>
              <input 
                className="input" 
                placeholder="Enter 6-digit code" 
                value={code} 
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                required
              />
            </div>
            <button 
              className="btn" 
              type="submit" 
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            <button 
              type="button"
              className="btn btn-secondary" 
              onClick={() => setSent(false)}
              style={{ width: '100%', marginTop: 12 }}
            >
              Back to Email
            </button>
          </form>
        )}

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>
            We'll send you a verification code via email
          </p>
        </div>
      </div>
    </div>
  );
}
