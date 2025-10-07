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
      background: 'var(--background)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)
        `,
        zIndex: 0
      }} />
      
      <div className="card" style={{ 
        maxWidth: 420, 
        width: '100%', 
        margin: '20px',
        position: 'relative',
        zIndex: 1,
        border: '1px solid var(--border)',
        background: 'var(--card)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ 
            width: 64, 
            height: 64, 
            background: 'var(--primary)', 
            borderRadius: '16px', 
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: 'white',
            fontWeight: 'bold'
          }}>
            TD
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: 'var(--foreground)' }}>
            Welcome to Ticket Dashboard
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 16, margin: 0 }}>
            {!sent ? 'Enter your email to get started' : 'Enter the verification code'}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={onIssue}>
            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                display: 'block', 
                fontSize: 14, 
                fontWeight: 500, 
                color: 'var(--foreground)', 
                marginBottom: 8 
              }}>
                Email Address
              </label>
              <input 
                className="input" 
                placeholder="you@company.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                style={{ fontSize: 16 }}
              />
            </div>
            <button 
              className="btn" 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', fontSize: 16, padding: '14px 20px' }}
            >
              {loading ? (
                <>
                  <div style={{ 
                    width: 16, 
                    height: 16, 
                    border: '2px solid transparent', 
                    borderTop: '2px solid currentColor', 
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite',
                    marginRight: 8
                  }} />
                  Sending...
                </>
              ) : (
                'Send Verification Code'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={onVerify}>
            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                display: 'block', 
                fontSize: 14, 
                fontWeight: 500, 
                color: 'var(--foreground)', 
                marginBottom: 8 
              }}>
                Verification Code
              </label>
              <input 
                className="input" 
                placeholder="123456" 
                value={code} 
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                required
                style={{ fontSize: 16, textAlign: 'center', letterSpacing: '4px' }}
              />
            </div>
            <button 
              className="btn" 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', fontSize: 16, padding: '14px 20px' }}
            >
              {loading ? (
                <>
                  <div style={{ 
                    width: 16, 
                    height: 16, 
                    border: '2px solid transparent', 
                    borderTop: '2px solid currentColor', 
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite',
                    marginRight: 8
                  }} />
                  Verifying...
                </>
              ) : (
                'Verify & Continue'
              )}
            </button>
            <button 
              type="button"
              className="btn btn-ghost" 
              onClick={() => setSent(false)}
              style={{ width: '100%', marginTop: 12 }}
            >
              ← Back to Email
            </button>
          </form>
        )}

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
            {!sent ? 
              'We\'ll send you a secure verification code' : 
              'Check your email for the 6-digit code'
            }
          </p>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
