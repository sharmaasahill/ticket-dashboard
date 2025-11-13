"use client";
import { FormEvent, useState } from "react";
import { useAuth } from "@/store/useAuth";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const { issueOtp, verifyOtp } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function onIssue(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await issueOtp(email);
      setSent(true);
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function onVerify(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await verifyOtp(email, code);
      onSuccess();
      onClose();
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setSent(false);
    setEmail("");
    setCode("");
    setError("");
    onClose();
  }

  return (
    <div 
      className="modal-overlay" 
      onClick={handleClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)'
      }}
    >
      <div 
        className="modal" 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1a1a1a',
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '450px',
          width: '90%',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
          border: '1px solid #2a2a2a'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', color: '#ffffff' }}>
            {!sent ? 'Welcome back' : 'Verify your email'}
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '15px', margin: 0 }}>
            {!sent ? 'Sign in to your account' : 'Enter the 6-digit code sent to your email'}
          </p>
        </div>

        {error && (
          <div style={{
                background: '#2a1a1a',
                border: '1px solid #ef4444',
                color: '#ef4444',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {!sent ? (
          <form onSubmit={onIssue}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#d1d5db', 
                marginBottom: '8px' 
              }}>
                Email address
              </label>
              <input 
                className="input" 
                placeholder="you@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                style={{ 
                  width: '100%',
                  fontSize: '16px', 
                  padding: '14px 16px',
                  borderRadius: '8px',
                  border: '1px solid #2a2a2a',
                  background: '#0f0f0f',
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
                padding: '14px 16px',
                borderRadius: '8px',
                background: '#ffffff',
                border: 'none',
                fontWeight: '600',
                color: '#0f0f0f',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'Sending code...' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={onVerify}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#d1d5db', 
                marginBottom: '8px' 
              }}>
                Verification Code
              </label>
              <input 
                className="input" 
                placeholder="000000" 
                value={code} 
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                required
                style={{ 
                  width: '100%',
                  fontSize: '24px', 
                  textAlign: 'center', 
                  letterSpacing: '8px',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #2a2a2a',
                  background: '#0f0f0f',
                  transition: 'border-color 0.2s',
                  fontFamily: 'monospace'
                }}
              />
              <p style={{ 
                fontSize: '12px', 
                color: '#9ca3af', 
                marginTop: '8px',
                textAlign: 'center'
              }}>
                Code sent to {email}
              </p>
            </div>
            <button 
              className="btn" 
              type="submit" 
              disabled={loading || code.length !== 6}
              style={{ 
                width: '100%', 
                fontSize: '16px', 
                padding: '14px 16px',
                borderRadius: '8px',
                background: '#ffffff',
                border: 'none',
                fontWeight: '600',
                color: '#0f0f0f',
                cursor: loading || code.length !== 6 ? 'not-allowed' : 'pointer',
                opacity: loading || code.length !== 6 ? 0.7 : 1,
                marginBottom: '12px'
              }}
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
            <button 
              type="button"
              onClick={() => {
                setSent(false);
                setCode("");
                setError("");
              }}
              style={{ 
                width: '100%', 
                padding: '12px 16px',
                borderRadius: '8px',
                background: 'transparent',
                border: '1px solid #d1d5db',
                color: '#9ca3af',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#252525';
                e.currentTarget.style.borderColor = '#3a3a3a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = '#2a2a2a';
              }}
            >
              Use a different email
            </button>
          </form>
        )}

        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            fontSize: '24px',
            color: '#9ca3af',
            cursor: 'pointer',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#252525';
            e.currentTarget.style.color = '#d1d5db';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#9ca3af';
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

