"use client";
import { useEffect, useState } from "react";
import { api, setAuthToken } from "@/lib/api";
import { useAuth } from "@/store/useAuth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";

export default function ProjectsPage() {
  const { token, logout, email } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingProject, setEditingProject] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    if (!token) {
      redirect("/");
      return;
    }
    setAuthToken(token);
    loadProjects();
  }, [token, logout]);

  // Initialize auth token on mount
  useEffect(() => {
    if (token) {
      setAuthToken(token);
    }
  }, []);

  async function loadProjects() {
    try {
      const { data } = await api.get('/projects');
      setItems(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
      logout();
    }
  }

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

  function openEditModal(project: any) {
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

  function selectAllProjects() {
    setSelectedProjects(items.map(p => p.id));
  }

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
      setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to delete projects:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {/* Sidebar */}
      <div className="sidebar">
        <div style={{ padding: '24px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
            <div style={{ 
              width: 40, 
              height: 40, 
              background: 'var(--primary)', 
              borderRadius: '10px', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
              fontSize: '18px',
              color: 'white',
              fontWeight: 'bold'
            }}>
              TD
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--foreground)' }}>
                Ticket Dashboard
              </h1>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
                Project Management
              </p>
            </div>
          </div>
          
          <nav>
            <a href="/projects" className="sidebar-item active">
              <span style={{ marginRight: 12, fontSize: '16px' }}>■</span>
              Projects
            </a>
          </nav>
        </div>
        
        <div style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          padding: '20px',
          borderTop: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ 
              width: 32, 
              height: 32, 
              background: 'var(--accent)', 
              borderRadius: '50%', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
              fontSize: '14px'
            }}>
              {email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--foreground)' }}>
                {email}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                Online
              </div>
            </div>
          </div>
          <button 
            className="btn btn-ghost" 
            onClick={() => logout()}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: 'var(--foreground)' }}>
                  Projects
                </h1>
                <p style={{ margin: '4px 0 0 0', color: 'var(--muted)', fontSize: 16 }}>
                  Manage your project boards and tickets
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {selectedProjects.length > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    background: 'var(--card-hover)', 
                    padding: '8px 12px', 
                    borderRadius: '8px',
                    border: '1px solid var(--border)'
                  }}>
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                      {selectedProjects.length} selected
                    </span>
                    <button 
                      className="btn btn-ghost" 
                      onClick={clearSelection}
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                    >
                      Clear
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={bulkDeleteProjects}
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                    >
                      Delete All
                    </button>
                  </div>
                )}
              <button 
                className="btn" 
                onClick={openCreateModal}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                New Project
              </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container" style={{ paddingTop: 32, paddingBottom: 32 }}>
          {items.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 64 }}>
              <div style={{ 
                width: 80, 
                height: 80, 
                background: 'var(--card-hover)', 
                borderRadius: '20px', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '32px',
                color: 'var(--text-muted)',
                fontWeight: 'bold'
              }}>
                TD
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12, color: 'var(--foreground)' }}>
                No projects yet
              </h3>
              <p style={{ color: 'var(--muted)', marginBottom: 32, fontSize: 16 }}>
                Create your first project to start managing tickets and collaborating with your team
              </p>
              <button className="btn" onClick={openCreateModal}>
                Create Your First Project
              </button>
            </div>
          ) : (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
              {items.map(project => (
                <div key={project.id} className="card card-interactive" style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 }}>
                      <input 
                        type="checkbox" 
                        checked={selectedProjects.includes(project.id)}
                        onChange={() => toggleProjectSelection(project.id)}
                        style={{ marginTop: 4 }}
                      />
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 8px 0', color: 'var(--foreground)' }}>
                          {project.name}
                        </h3>
                        {project.description && (
                          <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 16px 0', lineHeight: 1.5 }}>
                            {project.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Project Actions */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        className="btn btn-ghost" 
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(project);
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-danger" 
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteModal(project);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', color: 'var(--muted)', fontSize: 14 }}>
                        {project.tickets?.length || 0} tickets
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', color: 'var(--muted)', fontSize: 14 }}>
                        1 member
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <Link href={`/projects/${project.id}`} style={{ textDecoration: 'none' }}>
                    <button className="btn btn-secondary" style={{ width: '100%' }}>
                      Open Project Board
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
              Are you sure you want to delete "<strong>{showDeleteModal.name}</strong>"? This action cannot be undone and will permanently delete all tickets and data associated with this project.
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


