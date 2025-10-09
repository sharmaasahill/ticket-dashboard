"use client";
import { useEffect, useState, useCallback } from "react";
import { api, setAuthToken } from "@/lib/api";
import { useAuth } from "@/store/useAuth";
import Link from "next/link";
import { redirect } from "next/navigation";
// import { useRouter } from "next/navigation";

export default function ProjectsPage() {
  const { token, logout, email } = useAuth();
  const [items, setItems] = useState<Array<{
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    tickets?: Array<unknown>;
  }>>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingProject, setEditingProject] = useState<{ id: string; name: string; description?: string } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  // const [showBulkActions, setShowBulkActions] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    try {
      const { data } = await api.get('/projects');
      setItems(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
      logout();
    }
  }, [logout]);

  useEffect(() => {
    // Check if we have a token in localStorage as fallback
    const storedToken = localStorage.getItem('auth-storage');
    let parsedToken = null;
    
    try {
      if (storedToken) {
        const parsed = JSON.parse(storedToken);
        parsedToken = parsed.state?.token;
      }
    } catch {
      console.log('No stored auth found');
    }

    if (!token && !parsedToken) {
      setAuthLoading(false);
      redirect("/");
      return;
    }
    
    const authToken = token || parsedToken;
    if (authToken) {
      setAuthToken(authToken);
      loadProjects();
      setAuthLoading(false);
    }
  }, [token, logout, loadProjects]);

  async function createProject() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/projects', { name: name.trim(), description: description.trim() });
      setItems([data, ...items]);
      setName("");
      setDescription("");
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateProject() {
    if (!editingProject || !name.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.patch(`/projects/${editingProject.id}`, { 
        name: name.trim(), 
        description: description.trim() 
      });
      setItems(items.map(p => p.id === editingProject.id ? data : p));
      setEditingProject(null);
      setName("");
      setDescription("");
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update project:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteProject(projectId: string) {
    setLoading(true);
    try {
      await api.delete(`/projects/${projectId}`);
      setItems(items.filter(p => p.id !== projectId));
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setLoading(false);
    }
  }

  function openEditModal(project: { id: string; name: string; description?: string }) {
    setEditingProject(project);
    setName(project.name);
    setDescription(project.description || '');
    setShowEditModal(true);
  }

  function openCreateModal() {
    setName('');
    setDescription('');
    setShowCreateModal(true);
  }

  function toggleProjectSelection(projectId: string) {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  }

  // function selectAllProjects() {
  //   setSelectedProjects(items.map(p => p.id));
  // }

  function clearSelection() {
    setSelectedProjects([]);
  }

  async function bulkDeleteProjects() {
    if (selectedProjects.length === 0) return;
    setLoading(true);
    try {
      await Promise.all(selectedProjects.map(id => api.delete(`/projects/${id}`)));
      setItems(items.filter(p => !selectedProjects.includes(p.id)));
      setSelectedProjects([]);
      // setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to delete projects:', error);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--background)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            border: '3px solid var(--border)', 
            borderTop: '3px solid var(--primary)', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: 'var(--muted)', margin: 0 }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
     <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Sidebar */}
        <div className="sidebar" style={{
          background: '#f7f7f8',
          borderRight: '1px solid #d1d5db',
          width: '280px'
        }}>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: '#10a37f', 
              borderRadius: '8px', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px',
              fontSize: '18px',
              color: 'white',
              fontWeight: '600'
            }}>
              TD
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#202123' }}>
                Ticket Dashboard
              </h1>
            </div>
          </div>
          
          <nav>
            <Link href="/projects" className="sidebar-item active" style={{
              background: '#10a37f',
              color: '#ffffff',
              border: 'none'
            }}>
              Projects
            </Link>
          </nav>
        </div>
        
        <div style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          padding: '24px',
          borderTop: '1px solid #d1d5db'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              background: '#10a37f', 
              borderRadius: '50%', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px',
              fontSize: '14px',
              color: 'white',
              fontWeight: '600'
            }}>
              {email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#202123' }}>
                {email}
              </div>
            </div>
          </div>
          <button 
            onClick={() => logout()}
            style={{ 
              width: '100%', 
              padding: '8px 12px',
              borderRadius: '6px',
              background: 'transparent',
              border: '1px solid #d1d5db',
              color: '#6b7280',
              fontWeight: '500',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
         <div className="header" style={{
           background: '#ffffff',
           borderBottom: '1px solid #d1d5db',
           padding: '24px 0'
         }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: '600', margin: 0, color: '#202123' }}>
                  Projects
                </h1>
                <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                  Manage your project boards and tickets
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {selectedProjects.length > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    background: '#f3f4f6', 
                    padding: '8px 12px', 
                    borderRadius: '6px',
                    border: '1px solid #d1d5db'
                  }}>
                    <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                      {selectedProjects.length} selected
                    </span>
                        <button 
                          onClick={clearSelection}
                          style={{ 
                            padding: '4px 8px', 
                            fontSize: '12px',
                            background: 'transparent',
                            color: '#6b7280',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Clear
                        </button>
                        <button 
                          onClick={bulkDeleteProjects}
                          style={{ 
                            padding: '4px 8px', 
                            fontSize: '12px',
                            borderRadius: '4px',
                            background: '#ef4444',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                  </div>
                )}
                <button 
                  onClick={openCreateModal}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    background: '#10a37f',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  New Project
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
          {items.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 40px',
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                background: '#f3f4f6', 
                borderRadius: '12px', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '24px'
              }}>
                📋
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#202123' }}>
                No projects yet
              </h3>
              <p style={{ color: '#6e6e80', marginBottom: '24px', fontSize: '14px' }}>
                Create your first project to start managing tickets
              </p>
              <button 
                onClick={openCreateModal}
                style={{
                  background: '#10a37f',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                  {items.map(project => (
                    <div key={project.id} style={{ 
                      background: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      padding: '20px',
                      transition: 'border-color 0.2s'
                    }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                      <input 
                        type="checkbox" 
                        checked={selectedProjects.includes(project.id)}
                        onChange={() => toggleProjectSelection(project.id)}
                        style={{ marginTop: '2px' }}
                      />
                      <div style={{ flex: 1 }}>
                            <h3 style={{ 
                              fontSize: '16px', 
                              fontWeight: '600', 
                              margin: '0 0 8px 0', 
                              color: '#202123'
                            }}>
                              {project.name}
                            </h3>
                            {project.description && (
                              <p style={{ 
                                color: '#6b7280', 
                                fontSize: '14px', 
                                margin: '0 0 12px 0', 
                                lineHeight: 1.4
                              }}>
                                {project.description}
                              </p>
                            )}
                      </div>
                    </div>
                    
                    {/* Project Actions */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(project);
                        }}
                        style={{ 
                          padding: '6px 8px', 
                          fontSize: '12px',
                          borderRadius: '4px',
                          background: 'transparent',
                          color: '#6b7280',
                          border: '1px solid #d1d5db',
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteModal(project);
                        }}
                        style={{ 
                          padding: '6px 8px', 
                          fontSize: '12px',
                          borderRadius: '4px',
                          background: 'transparent',
                          color: '#ef4444',
                          border: '1px solid #fecaca',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ 
                        color: '#6b7280', 
                        fontSize: '12px',
                        background: '#f3f4f6',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {project.tickets?.length || 0} tickets
                      </span>
                      <span style={{ 
                        color: '#6b7280', 
                        fontSize: '12px',
                        background: '#f3f4f6',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        1 member
                      </span>
                    </div>
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#9ca3af'
                    }}>
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <Link href={`/projects/${project.id}`} style={{ textDecoration: 'none' }}>
                    <button 
                      style={{ 
                        width: '100%',
                        background: '#10a37f',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      Open Board
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: 'var(--foreground)' }}>
              Create New Project
            </h2>
            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: 'block', 
                fontSize: 14, 
                fontWeight: 500, 
                color: 'var(--foreground)', 
                marginBottom: 8 
              }}>
                Project Name
              </label>
              <input 
                className="input" 
                placeholder="Enter project name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                display: 'block', 
                fontSize: 14, 
                fontWeight: 500, 
                color: 'var(--foreground)', 
                marginBottom: 8 
              }}>
                Description (Optional)
              </label>
              <textarea 
                className="input" 
                placeholder="Enter project description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-ghost" 
                onClick={() => setShowCreateModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="btn" 
                onClick={createProject}
                disabled={loading || !name.trim()}
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: 'var(--foreground)' }}>
              Edit Project
            </h2>
            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: 'block', 
                fontSize: 14, 
                fontWeight: 500, 
                color: 'var(--foreground)', 
                marginBottom: 8 
              }}>
                Project Name
              </label>
              <input 
                className="input" 
                placeholder="Enter project name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                display: 'block', 
                fontSize: 14, 
                fontWeight: 500, 
                color: 'var(--foreground)', 
                marginBottom: 8 
              }}>
                Description (Optional)
              </label>
              <textarea 
                className="input" 
                placeholder="Enter project description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-ghost" 
                onClick={() => setShowEditModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="btn" 
                onClick={updateProject}
                disabled={loading || !name.trim()}
              >
                {loading ? 'Updating...' : 'Update Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Project Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: 'var(--foreground)' }}>
              Delete Project
            </h2>
            <p style={{ color: 'var(--muted)', marginBottom: 24, lineHeight: 1.5 }}>
                  Are you sure you want to delete &ldquo;<strong>{showDeleteModal.name}</strong>&rdquo;? This action cannot be undone and will permanently delete all tickets and data associated with this project.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-ghost" 
                onClick={() => setShowDeleteModal(null)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={() => deleteProject(showDeleteModal.id)}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


