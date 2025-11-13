"use client";
import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { LoginModal } from "./components/LoginModal";
import { useAuth } from "@/store/useAuth";
import { useRouter } from "next/navigation";

export default function Home() {
  const { token } = useAuth();
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);

  function handleGetStarted(e: React.MouseEvent) {
    e.preventDefault();
    if (token) {
      router.push("/projects");
    } else {
      setShowLoginModal(true);
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#0f0f0f',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#ffffff'
    }}>
      <Navbar />
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => setShowLoginModal(false)}
      />

      {/* Hero Section */}
      <section style={{
        paddingTop: '120px',
        paddingBottom: '100px',
        maxWidth: '1200px',
        margin: '0 auto',
        paddingLeft: '24px',
        paddingRight: '24px'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '800px',
          margin: '0 auto',
          marginBottom: '80px'
        }}>
          <h1 style={{
            fontSize: 'clamp(40px, 8vw, 72px)',
            fontWeight: '400',
            lineHeight: '1.1',
            marginBottom: '24px',
            color: '#ffffff',
            letterSpacing: '-0.02em'
          }}>
            Manage Projects with
            <br />
            Real-Time Collaboration
          </h1>
          <p style={{
            fontSize: 'clamp(18px, 2.5vw, 22px)',
            color: '#9ca3af',
            lineHeight: '1.6',
            marginBottom: '40px',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Streamline your workflow with our intuitive Kanban board,
            <br />
            real-time updates, and seamless team collaboration.
            <br />
            <span style={{ whiteSpace: 'nowrap' }}>No passwords needed. Just your email.</span>
          </p>
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleGetStarted}
              style={{
                padding: '16px 32px',
                borderRadius: '12px',
                background: '#ffffff',
                color: '#0f0f0f',
                border: 'none',
                fontSize: '16px',
                fontWeight: '600',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s',
                display: 'inline-block',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e5e5e5';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.3)';
              }}
            >
              Get Started →
            </button>
          </div>
        </div>

        {/* Hero Image/Preview */}
        <div style={{
          borderRadius: '20px',
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            background: '#252525',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e5e7eb',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px'
          }}>
            {['TODO', 'IN PROGRESS', 'DONE'].map((status, idx) => (
              <div key={status} style={{
                background: '#1a1a1a',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
                    {status}
                  </h3>
                  <span style={{
                    background: '#2a2a2a',
                    color: '#9ca3af',
                    fontSize: '12px',
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}>
                    {idx + 2}
                  </span>
                </div>
                {[1, 2].map((i) => (
                  <div key={i} style={{
                    background: '#252525',
                    borderRadius: '6px',
                    padding: '12px',
                    marginBottom: '8px',
                    border: '1px solid #2a2a2a',
                    fontSize: '13px',
                    color: '#d1d5db'
                  }}>
                    Sample Ticket {i}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        paddingTop: '100px',
        paddingBottom: '100px',
        background: '#0f0f0f',
        maxWidth: '1200px',
        margin: '0 auto',
        paddingLeft: '24px',
        paddingRight: '24px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '16px'
          }}>
            Everything you need to manage projects
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#9ca3af',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Powerful features designed to help teams collaborate and get work done faster.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px'
        }}>
          {[
            {
              title: 'Real-Time Updates',
              description: 'See changes instantly as your team works. No refresh needed, everything syncs automatically across all devices.'
            },
            {
              title: 'Passwordless Login',
              description: 'Sign in with just your email. We send you a secure code, no passwords to remember or reset.'
            },
            {
              title: 'Kanban Board',
              description: 'Drag and drop tickets between columns. Intuitive interface that makes project management feel effortless.'
            },
            {
              title: 'Smart Notifications',
              description: 'Get notified via email when you\'re offline, and see real-time activity feeds when you\'re online.'
            },
            {
              title: 'Team Collaboration',
              description: 'Work together seamlessly. See who created what, track changes, and stay in sync with your entire team.'
            },
            {
              title: 'Project Dashboard',
              description: 'Organize multiple projects in one place. Get an overview of all your work at a glance.'
            }
          ].map((feature, idx) => (
            <div
              key={idx}
              style={{
                background: '#1a1a1a',
                borderRadius: '16px',
                padding: '32px',
                border: '1px solid #2a2a2a',
                transition: 'all 0.3s',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.4)';
                e.currentTarget.style.borderColor = '#3a3a3a';
                e.currentTarget.style.background = '#252525';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                e.currentTarget.style.borderColor = '#2a2a2a';
                e.currentTarget.style.background = '#1a1a1a';
              }}
            >
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '12px'
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: '15px',
                color: '#d1d5db',
                lineHeight: '1.6',
                margin: 0
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        paddingTop: '100px',
        paddingBottom: '100px',
        background: '#0f0f0f',
        maxWidth: '1200px',
        margin: '0 auto',
        paddingLeft: '24px',
        paddingRight: '24px'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '16px'
          }}>
            Ready to get started?
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#9ca3af',
            marginBottom: '40px',
            lineHeight: '1.6',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Join teams already using Pulse to manage their projects more efficiently.
          </p>
          <button
            onClick={handleGetStarted}
            style={{
              display: 'inline-block',
              padding: '18px 40px',
              borderRadius: '12px',
              background: '#252525',
              color: '#ffffff',
              border: 'none',
              fontSize: '18px',
              fontWeight: '600',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.3s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.3)';
              e.currentTarget.style.background = '#2a2a2a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
              e.currentTarget.style.background = '#252525';
            }}
          >
            Start Today →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#0f0f0f',
        borderTop: '1px solid #2a2a2a',
        paddingTop: '60px',
        paddingBottom: '60px',
        paddingLeft: '24px',
        paddingRight: '24px',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <span style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#ffffff'
            }}>
              Pulse
            </span>
          </div>
          <p style={{
            color: '#9ca3af',
            fontSize: '14px',
            margin: 0
          }}>
            © 2025 Pulse. Built with Next.js and NestJS.
          </p>
        </div>
      </footer>
    </div>
  );
}
