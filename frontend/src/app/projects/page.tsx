"use client";
import { useEffect, useState } from "react";
import { api, setAuthToken } from "@/lib/api";
import { useAuth } from "@/store/useAuth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function ProjectsPage() {
  const { token, logout } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!token) {
      redirect("/");
      return;
    }
    setAuthToken(token);
    api.get('/projects').then(r => setItems(r.data)).catch(() => logout());
  }, [token, logout]);

  // Initialize auth token on mount
  useEffect(() => {
    if (token) {
      setAuthToken(token);
    }
  }, []);

  async function create() {
    if (!name) return;
    try {
      const { data } = await api.post('/projects', { name });
      setItems([data, ...items]);
      setName("");
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="header">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#1e293b' }}>
                Projects
              </h1>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 14 }}>
                Manage your project boards and tickets
              </p>
            </div>
            <button 
              className="btn btn-secondary" 
              onClick={() => logout()}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container" style={{ paddingTop: 32, paddingBottom: 32 }}>
        {/* Create Project Form */}
        <div className="card" style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#1e293b' }}>
            Create New Project
          </h2>
          <div style={{ display: 'flex', gap: 12 }}>
            <input 
              className="input" 
              placeholder="Enter project name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && create()}
            />
            <button className="btn btn-success" onClick={create}>
              Create Project
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        {items.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: '#1e293b' }}>
              No projects yet
            </h3>
            <p style={{ color: '#64748b', marginBottom: 24 }}>
              Create your first project to start managing tickets
            </p>
          </div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {items.map(project => (
              <div key={project.id} className="card" style={{ cursor: 'pointer' }}>
                <Link href={`/projects/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: '#1e293b' }}>
                      {project.name}
                    </h3>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {project.tickets?.length || 0} tickets
                    </div>
                  </div>
                  {project.description && (
                    <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 16px 0' }}>
                      {project.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>
                      Created {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    <div style={{ fontSize: 12, color: '#3b82f6' }}>
                      View Board →
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


