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
      // Force a page reload to ensure state is properly set
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
      background: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ 
        maxWidth: 400, 
        width: '100%', 
        margin: '20px',
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #d1d5db',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              background: '#10a37f', 
              borderRadius: '8px', 
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              color: 'white',
              fontWeight: '600'
            }}>
              TD
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px', color: '#202123' }}>
              Welcome back
            </h1>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
              {!sent ? 'Sign in to your account' : 'Enter verification code'}
            </p>
          </div>

        {!sent ? (
          <form onSubmit={onIssue}>
            <div style={{ marginBottom: '24px' }}>
               <label style={{ 
                 display: 'block', 
                 fontSize: '14px', 
                 fontWeight: '500', 
                 color: '#374151', 
                 marginBottom: '8px' 
               }}>
                 Email
               </label>
               <input 
                 className="input" 
                 placeholder="Enter your email" 
                 value={email} 
                 onChange={(e) => setEmail(e.target.value)}
                 type="email"
                 required
                 style={{ 
                   width: '100%',
                   fontSize: '16px', 
                   padding: '12px 16px',
                   borderRadius: '6px',
                   border: '1px solid #d1d5db',
                   background: '#ffffff',
                   transition: 'border-color 0.2s'
                 }}
               />
            </div>
            <button 
              className="btn" 
              type="submit" 
              disabled={loading}
              style={{ 
                width: '100%', 
                fontSize: '16px', 
                padding: '12px 16px',
                borderRadius: '6px',
                background: '#10a37f',
                border: 'none',
                fontWeight: '500',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Sending...' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={onVerify}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                Verification Code
              </label>
              <input 
                className="input" 
                placeholder="Enter 6-digit code" 
                value={code} 
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                required
                 style={{ 
                   width: '100%',
                   fontSize: '16px', 
                   textAlign: 'center', 
                   letterSpacing: '4px',
                   padding: '12px 16px',
                   borderRadius: '6px',
                   border: '1px solid #d1d5db',
                   background: '#ffffff',
                   transition: 'border-color 0.2s'
                 }}
              />
            </div>
              <button 
                className="btn" 
                type="submit" 
                disabled={loading}
                style={{ 
                  width: '100%', 
                  fontSize: '16px', 
                  padding: '12px 16px',
                  borderRadius: '6px',
                  background: '#10a37f',
                  border: 'none',
                  fontWeight: '500',
                  color: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            <button 
              type="button"
              onClick={() => setSent(false)}
              style={{ 
                width: '100%', 
                marginTop: '12px',
                padding: '12px 16px',
                borderRadius: '6px',
                background: 'transparent',
                border: '1px solid #d1d5db',
                color: '#6b7280',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Back
            </button>
          </form>
        )}

        </div>
      </div>
    </div>
  );
}
