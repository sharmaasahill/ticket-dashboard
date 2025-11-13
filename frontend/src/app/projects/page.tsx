"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { api, setAuthToken } from "@/lib/api";
import { useAuth } from "@/store/useAuth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";

type Project = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  tickets?: Array<{ id: string; status: string }>;
};

type SortOption = 'name' | 'date' | 'tickets' | 'recent';
type ViewMode = 'grid' | 'list';

export default function ProjectsPage() {
  const { token, logout, email } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingProject, setEditingProject] = useState<{ id: string; name: string; description?: string } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [authLoading, setAuthLoading] = useState(true);
  
  // New features state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

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
    } catch (error) {
      console.error('Failed to delete projects:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = items;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query)
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'tickets':
          return (b.tickets?.length || 0) - (a.tickets?.length || 0);
        case 'recent':
          return new Date((b.updatedAt || b.createdAt)).getTime() - new Date((a.updatedAt || a.createdAt)).getTime();
        default:
          return 0;
      }
    });

    return sorted;
  }, [items, searchQuery, sortBy]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTickets = items.reduce((sum, p) => sum + (p.tickets?.length || 0), 0);
    const activeProjects = items.length;
    const recentProjects = items.filter(p => {
      const daysSinceUpdate = (Date.now() - new Date(p.updatedAt || p.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate <= 7;
    }).length;

    return {
      totalProjects: activeProjects,
      totalTickets,
      recentProjects,
      avgTicketsPerProject: activeProjects > 0 ? Math.round(totalTickets / activeProjects) : 0
    };
  }, [items]);

  if (authLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#0f0f0f'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            border: '3px solid #2a2a2a', 
            borderTop: '3px solid #ffffff', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#9ca3af', margin: 0 }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#ffffff' }}>
      {/* Sidebar */}
      <div className="sidebar" style={{
        background: '#141414',
        borderRight: '1px solid #2a2a2a',
        width: '280px',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto'
      }}>
        <div style={{ padding: '24px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#ffffff' }}>
              Pulse
            </h1>
            <Link 
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                borderRadius: '6px',
                background: 'transparent',
                border: '1px solid #2a2a2a',
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: '500',
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
              <span>←</span>
              Back
            </Link>
          </div>
          
          <nav>
            <Link href="/projects" className="sidebar-item active" style={{
              background: '#ffffff',
              color: '#0f0f0f',
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
          borderTop: '1px solid #2a2a2a',
          background: '#141414'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              background: '#ffffff', 
              borderRadius: '50%', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px',
              fontSize: '14px',
              color: '#0f0f0f',
              fontWeight: '600'
            }}>
              {email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff' }}>
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
              border: '1px solid #2a2a2a',
              color: '#9ca3af',
              fontWeight: '500',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1a1a1a';
              e.currentTarget.style.borderColor = '#3a3a3a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = '#2a2a2a';
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content" style={{ marginLeft: '280px' }}>
        {/* Header */}
        <div className="header" style={{
          background: '#1a1a1a',
          borderBottom: '1px solid #2a2a2a',
          padding: '24px 0',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '600', margin: 0, color: '#ffffff', letterSpacing: '-0.02em' }}>
                  Projects
                </h1>
                <p style={{ margin: '6px 0 0 0', color: '#9ca3af', fontSize: '14px', fontWeight: '400' }}>
                  Manage your project boards and tickets
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {selectedProjects.length > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    background: '#252525', 
                    padding: '8px 16px', 
                    borderRadius: '8px',
                    border: '1px solid #2a2a2a'
                  }}>
                    <span style={{ fontSize: '14px', color: '#ffffff', fontWeight: '500' }}>
                      {selectedProjects.length} selected
                    </span>
                    <button 
                      onClick={clearSelection}
                      style={{ 
                        padding: '4px 8px', 
                        fontSize: '12px',
                        background: 'transparent',
                        color: '#9ca3af',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#1a1a1a';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#9ca3af';
                      }}
                    >
                      Clear
                    </button>
                    <button 
                      onClick={bulkDeleteProjects}
                      style={{ 
                        padding: '6px 12px', 
                        fontSize: '12px',
                        borderRadius: '6px',
                        background: '#ef4444',
                        border: 'none',
                        color: '#ffffff',
                        cursor: 'pointer',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#dc2626';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ef4444';
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
                    gap: '8px',
                    background: '#ffffff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#0f0f0f',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e5e5e5';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
                  }}
                >
                  <span style={{ fontSize: '18px' }}>+</span>
                  New Project
                </button>
              </div>
            </div>

            {/* Statistics Dashboard */}
            {items.length > 0 && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '16px',
                marginTop: '24px'
              }}>
                <div style={{
                  background: '#252525',
                  border: '1px solid #2a2a2a',
                  borderRadius: '12px',
                  padding: '20px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3a3a3a';
                  e.currentTarget.style.background = '#2a2a2a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2a2a2a';
                  e.currentTarget.style.background = '#252525';
                }}
                >
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', fontWeight: '500' }}>
                    Total Projects
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#ffffff' }}>
                    {stats.totalProjects}
                  </div>
                </div>
                <div style={{
                  background: '#252525',
                  border: '1px solid #2a2a2a',
                  borderRadius: '12px',
                  padding: '20px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3a3a3a';
                  e.currentTarget.style.background = '#2a2a2a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2a2a2a';
                  e.currentTarget.style.background = '#252525';
                }}
                >
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', fontWeight: '500' }}>
                    Total Tickets
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#ffffff' }}>
                    {stats.totalTickets}
                  </div>
                </div>
                <div style={{
                  background: '#252525',
                  border: '1px solid #2a2a2a',
                  borderRadius: '12px',
                  padding: '20px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3a3a3a';
                  e.currentTarget.style.background = '#2a2a2a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2a2a2a';
                  e.currentTarget.style.background = '#252525';
                }}
                >
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', fontWeight: '500' }}>
                    Recent Activity
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#ffffff' }}>
                    {stats.recentProjects}
                  </div>
                </div>
                <div style={{
                  background: '#252525',
                  border: '1px solid #2a2a2a',
                  borderRadius: '12px',
                  padding: '20px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3a3a3a';
                  e.currentTarget.style.background = '#2a2a2a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2a2a2a';
                  e.currentTarget.style.background = '#252525';
                }}
                >
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', fontWeight: '500' }}>
                    Avg. Tickets
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#ffffff' }}>
                    {stats.avgTicketsPerProject}
                  </div>
                </div>
              </div>
            )}

            {/* Search and Filters */}
            {items.length > 0 && (
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                alignItems: 'center',
                marginTop: '24px',
                flexWrap: 'wrap'
              }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 16px 10px 40px',
                      borderRadius: '8px',
                      border: '1px solid #2a2a2a',
                      background: '#0f0f0f',
                      color: '#ffffff',
                      fontSize: '14px',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#3a3a3a';
                      e.currentTarget.style.background = '#141414';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#2a2a2a';
                      e.currentTarget.style.background = '#0f0f0f';
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                    fontSize: '16px'
                  }}>
                    ⌕
                  </span>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid #2a2a2a',
                    background: '#0f0f0f',
                    color: '#ffffff',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3a3a3a';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#2a2a2a';
                  }}
                >
                  <option value="recent">Recently Updated</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="date">Date Created</option>
                  <option value="tickets">Most Tickets</option>
                </select>
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  background: '#1a1a1a',
                  padding: '4px',
                  borderRadius: '8px',
                  border: '1px solid #2a2a2a'
                }}>
                  <button
                    onClick={() => setViewMode('grid')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: viewMode === 'grid' ? '#ffffff' : 'transparent',
                      color: viewMode === 'grid' ? '#0f0f0f' : '#9ca3af',
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontWeight: viewMode === 'grid' ? '600' : '400',
                      transition: 'all 0.2s'
                    }}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: viewMode === 'list' ? '#ffffff' : 'transparent',
                      color: viewMode === 'list' ? '#0f0f0f' : '#9ca3af',
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontWeight: viewMode === 'list' ? '600' : '400',
                      transition: 'all 0.2s'
                    }}
                  >
                    List
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>
          {items.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '80px 40px',
              background: '#1a1a1a',
              borderRadius: '16px',
              border: '1px solid #2a2a2a',
              marginTop: '32px'
            }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                background: '#252525', 
                borderRadius: '16px', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '24px',
                border: '1px solid #2a2a2a',
                color: '#9ca3af',
                fontWeight: '600',
                letterSpacing: '0.05em'
              }}>
                [ ]
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px', color: '#ffffff' }}>
                No projects yet
              </h3>
              <p style={{ color: '#9ca3af', marginBottom: '32px', fontSize: '16px', maxWidth: '400px', margin: '0 auto 32px' }}>
                Create your first project to start managing tickets and collaborating with your team
              </p>
              <button 
                onClick={openCreateModal}
                style={{
                  background: '#ffffff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#0f0f0f',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e5e5e5';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
                }}
              >
                Create Your First Project
              </button>
            </div>
          ) : filteredAndSortedProjects.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 40px',
              background: '#1a1a1a',
              borderRadius: '16px',
              border: '1px solid #2a2a2a',
              marginTop: '32px'
            }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: '#252525', 
                borderRadius: '12px', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                border: '1px solid #2a2a2a'
              }}>
                <span style={{ fontSize: '24px', color: '#9ca3af' }}>⌕</span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#ffffff' }}>
                No projects found
              </h3>
              <p style={{ color: '#9ca3af', marginBottom: '24px', fontSize: '14px' }}>
                Try adjusting your search or filter criteria
              </p>
              <button 
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'transparent',
                  border: '1px solid #2a2a2a',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3a3a3a';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2a2a2a';
                  e.currentTarget.style.color = '#9ca3af';
                }}
              >
                Clear Search
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid" style={{ 
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
              gap: '20px',
              marginTop: '32px'
            }}>
              {filteredAndSortedProjects.map(project => {
                const ticketCount = project.tickets?.length || 0;
                const progressPercentage = ticketCount > 0 ? Math.min((ticketCount / 10) * 100, 100) : 0;
                
                return (
                <div key={project.id} 
                  className="project-card"
                  style={{ 
                    background: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: '16px',
                    padding: '24px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#ffffff';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #252525 0%, #1f1f1f 100%)';
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)';
                    const actions = e.currentTarget.querySelector('.card-actions') as HTMLElement;
                    if (actions) actions.style.opacity = '1';
                    const overlay = e.currentTarget.querySelector('.gradient-overlay') as HTMLElement;
                    if (overlay) overlay.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#2a2a2a';
                    e.currentTarget.style.background = '#1a1a1a';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                    const actions = e.currentTarget.querySelector('.card-actions') as HTMLElement;
                    if (actions) actions.style.opacity = '0';
                    const overlay = e.currentTarget.querySelector('.gradient-overlay') as HTMLElement;
                    if (overlay) overlay.style.opacity = '0';
                  }}
                >
                  {/* Animated gradient overlay on hover */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #ffffff 0%, #9ca3af 50%, #ffffff 100%)',
                    backgroundSize: '200% 100%',
                    opacity: 0,
                    transition: 'opacity 0.3s',
                    pointerEvents: 'none'
                  }}
                  className="gradient-overlay"
                  />
                  
                  {/* Progress indicator */}
                  {ticketCount > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: '#2a2a2a',
                      borderRadius: '16px 16px 0 0'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${progressPercentage}%`,
                        background: 'linear-gradient(90deg, #ffffff 0%, #9ca3af 100%)',
                        borderRadius: '16px 0 0 0',
                        transition: 'width 0.5s ease-out',
                        boxShadow: '0 0 8px rgba(255, 255, 255, 0.3)'
                      }} />
                    </div>
                  )}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start', 
                    marginBottom: '20px',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                      <input 
                        type="checkbox" 
                        checked={selectedProjects.includes(project.id)}
                        onChange={() => toggleProjectSelection(project.id)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ 
                          marginTop: '2px',
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          accentColor: '#ffffff',
                          flexShrink: 0
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <h3 style={{ 
                            fontSize: '18px', 
                            fontWeight: '600', 
                            margin: 0, 
                            color: '#ffffff',
                            lineHeight: 1.3,
                            letterSpacing: '-0.01em'
                          }}>
                            {project.name}
                          </h3>
                          <div style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: ticketCount > 0 ? '#10b981' : '#6b7280',
                            boxShadow: ticketCount > 0 ? '0 0 6px rgba(16, 185, 129, 0.5)' : 'none',
                            transition: 'all 0.3s',
                            flexShrink: 0
                          }} />
                        </div>
                        {project.description && (
                          <p style={{ 
                            color: '#9ca3af', 
                            fontSize: '14px', 
                            margin: 0, 
                            lineHeight: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {project.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Project Actions */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '6px',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      flexShrink: 0
                    }}
                    className="card-actions"
                    >
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(project);
                        }}
                        style={{ 
                          padding: '6px 10px', 
                          fontSize: '12px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: '#ffffff',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontWeight: '500',
                          backdropFilter: 'blur(10px)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                          e.currentTarget.style.transform = 'scale(1)';
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
                          padding: '6px 10px', 
                          fontSize: '12px',
                          borderRadius: '6px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontWeight: '500',
                          backdropFilter: 'blur(10px)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '20px',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ 
                        color: '#ffffff',
                        fontSize: '12px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        padding: '5px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        fontWeight: '500',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.2s'
                      }}
                      className="stat-badge"
                      >
                        {project.tickets?.length || 0} tickets
                      </span>
                      <span style={{ 
                        color: '#ffffff',
                        fontSize: '12px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        padding: '5px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        fontWeight: '500',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.2s'
                      }}
                      className="stat-badge"
                      >
                        1 member
                      </span>
                    </div>
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#9ca3af',
                      fontWeight: '400',
                      whiteSpace: 'nowrap'
                    }}>
                      {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      router.push(`/projects/${project.id}`);
                    }}
                    style={{ 
                      width: '100%',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
                      border: 'none',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#0f0f0f',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                      position: 'relative',
                      overflow: 'hidden',
                      zIndex: 10
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
                    }}
                  >
                    <span style={{ display: 'inline-block', transition: 'transform 0.3s' }} className="button-arrow">
                      Open Board →
                    </span>
                  </button>
                </div>
                );
              })}
            </div>
          ) : (
            <div style={{ marginTop: '32px' }}>
              {filteredAndSortedProjects.map(project => (
                <div key={project.id} style={{ 
                  background: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '12px',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3a3a3a';
                  e.currentTarget.style.background = '#252525';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2a2a2a';
                  e.currentTarget.style.background = '#1a1a1a';
                }}
                >
                  <input 
                    type="checkbox" 
                    checked={selectedProjects.includes(project.id)}
                    onChange={() => toggleProjectSelection(project.id)}
                    style={{ 
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#ffffff'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h3 style={{ 
                        fontSize: '16px', 
                        fontWeight: '600', 
                        margin: 0, 
                        color: '#ffffff'
                      }}>
                        {project.name}
                      </h3>
                      <span style={{ 
                        color: '#9ca3af',
                        fontSize: '12px',
                        background: '#252525',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid #2a2a2a'
                      }}>
                        {project.tickets?.length || 0} tickets
                      </span>
                    </div>
                    {project.description && (
                      <p style={{ 
                        color: '#9ca3af', 
                        fontSize: '14px', 
                        margin: '0 0 8px 0', 
                        lineHeight: 1.4
                      }}>
                        {project.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#9ca3af' }}>
                      <span>Created {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(project);
                      }}
                      style={{ 
                        padding: '6px 12px', 
                        fontSize: '12px',
                        borderRadius: '6px',
                        background: 'transparent',
                        color: '#9ca3af',
                        border: '1px solid #2a2a2a',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#252525';
                        e.currentTarget.style.borderColor = '#3a3a3a';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = '#2a2a2a';
                        e.currentTarget.style.color = '#9ca3af';
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
                        padding: '6px 12px', 
                        fontSize: '12px',
                        borderRadius: '6px',
                        background: 'transparent',
                        color: '#ef4444',
                        border: '1px solid #7f1d1d',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#7f1d1d';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#ef4444';
                      }}
                    >
                      Delete
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        router.push(`/projects/${project.id}`);
                      }}
                      style={{ 
                        padding: '8px 16px',
                        background: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#0f0f0f',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#e5e5e5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ffffff';
                      }}
                    >
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowCreateModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div 
            className="modal" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
          >
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#ffffff' }}>
              Create New Project
            </h2>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#ffffff', 
                marginBottom: '8px' 
              }}>
                Project Name
              </label>
              <input 
                className="input" 
                placeholder="Enter project name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #2a2a2a',
                  background: '#0f0f0f',
                  color: '#ffffff',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3a3a3a';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#2a2a2a';
                }}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#ffffff', 
                marginBottom: '8px' 
              }}>
                Description (Optional)
              </label>
              <textarea 
                className="input" 
                placeholder="Enter project description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{ 
                  resize: 'vertical', 
                  minHeight: '80px',
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #2a2a2a',
                  background: '#0f0f0f',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3a3a3a';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#2a2a2a';
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-ghost" 
                onClick={() => setShowCreateModal(false)}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #2a2a2a',
                  background: 'transparent',
                  color: '#9ca3af',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
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
                Cancel
              </button>
              <button 
                className="btn" 
                onClick={createProject}
                disabled={loading || !name.trim()}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: loading || !name.trim() ? '#2a2a2a' : '#ffffff',
                  color: loading || !name.trim() ? '#6b7280' : '#0f0f0f',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading || !name.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!loading && name.trim()) {
                    e.currentTarget.style.background = '#e5e5e5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && name.trim()) {
                    e.currentTarget.style.background = '#ffffff';
                  }
                }}
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowEditModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div 
            className="modal" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
          >
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#ffffff' }}>
              Edit Project
            </h2>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#ffffff', 
                marginBottom: '8px' 
              }}>
                Project Name
              </label>
              <input 
                className="input" 
                placeholder="Enter project name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #2a2a2a',
                  background: '#0f0f0f',
                  color: '#ffffff',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3a3a3a';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#2a2a2a';
                }}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#ffffff', 
                marginBottom: '8px' 
              }}>
                Description (Optional)
              </label>
              <textarea 
                className="input" 
                placeholder="Enter project description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{ 
                  resize: 'vertical', 
                  minHeight: '80px',
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #2a2a2a',
                  background: '#0f0f0f',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3a3a3a';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#2a2a2a';
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-ghost" 
                onClick={() => setShowEditModal(false)}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #2a2a2a',
                  background: 'transparent',
                  color: '#9ca3af',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
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
                Cancel
              </button>
              <button 
                className="btn" 
                onClick={updateProject}
                disabled={loading || !name.trim()}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: loading || !name.trim() ? '#2a2a2a' : '#ffffff',
                  color: loading || !name.trim() ? '#6b7280' : '#0f0f0f',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading || !name.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!loading && name.trim()) {
                    e.currentTarget.style.background = '#e5e5e5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && name.trim()) {
                    e.currentTarget.style.background = '#ffffff';
                  }
                }}
              >
                {loading ? 'Updating...' : 'Update Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Project Modal */}
      {showDeleteModal && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowDeleteModal(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div 
            className="modal" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
          >
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#ffffff' }}>
              Delete Project
            </h2>
            <p style={{ color: '#9ca3af', marginBottom: '24px', lineHeight: 1.6, fontSize: '14px' }}>
              Are you sure you want to delete &ldquo;<strong style={{ color: '#ffffff' }}>{showDeleteModal.name}</strong>&rdquo;? This action cannot be undone and will permanently delete all tickets and data associated with this project.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-ghost" 
                onClick={() => setShowDeleteModal(null)}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #2a2a2a',
                  background: 'transparent',
                  color: '#9ca3af',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
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
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={() => deleteProject(showDeleteModal.id)}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: loading ? '#2a2a2a' : '#ef4444',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = '#dc2626';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = '#ef4444';
                  }
                }}
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
