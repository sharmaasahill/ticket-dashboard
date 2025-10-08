"use client";
import { useEffect, useState } from "react";
import { api, setAuthToken } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useParams, useRouter } from "next/navigation";
import { useUi } from "@/store/useUi";
import { useAuth } from "@/store/useAuth";
import { Notifications } from "./notifications";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Project {
  id: string;
  name: string;
  tickets?: Ticket[];
}

interface Ticket {
  id: string;
  title: string;
  authorId?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  description?: string;
}

// Draggable Ticket Component
function DraggableTicket({ 
  ticket, 
  superOn, 
  onEdit, 
  onDelete 
}: { 
  ticket: Ticket; 
  superOn: boolean;
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, cursor: 'grab' }}
      {...attributes}
      {...listeners}
      className="ticket-card"
    >
      <div style={{ marginBottom: 8 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
          {ticket.title}
        </h4>
        {ticket.description && (
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 8px 0', lineHeight: 1.4 }}>
            {ticket.description}
          </p>
        )}
      </div>
      
      {superOn && (
        <div style={{ 
          fontSize: 11, 
          color: 'var(--text-muted)', 
          borderTop: '1px solid var(--border)', 
          paddingTop: 8,
          marginTop: 8
        }}>
          Created by: {ticket.authorId ?? 'System'}
        </div>
      )}
    </div>
  );
}

// Droppable Column Component
function DroppableColumn({ 
  id, 
  title, 
  icon, 
  tickets, 
  superOn, 
  className,
  onEdit,
  onDelete
}: { 
  id: string; 
  title: string; 
  icon: string; 
  tickets: Ticket[]; 
  superOn: boolean; 
  className: string;
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef}
      className={`kanban-column ${className}`}
      style={{
        backgroundColor: isOver ? 'var(--card-hover)' : undefined,
        borderColor: isOver ? 'var(--primary)' : undefined,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: 'var(--text-secondary)' }}>
          {title}
        </h3>
        <span className={`status-badge status-${className}`}>
          {tickets.length}
        </span>
      </div>
      <SortableContext items={tickets.map(t => t.id)} strategy={verticalListSortingStrategy}>
        {tickets.map((ticket) => (
          <DraggableTicket 
            key={ticket.id} 
            ticket={ticket} 
            superOn={superOn} 
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </SortableContext>
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token, logout } = useAuth();
  const { superOn, toggleSuper } = useUi();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<Ticket | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (!token) {
      router.push("/");
      return;
    }
    setAuthToken(token);
    
    api.get(`/projects/${projectId}`).then(r => setProject(r.data)).catch(() => logout());
    
    const socket = getSocket();
    socket.emit('join', { projectId });
    socket.on('ticket:updated', (payload: { type: string; ticket: Ticket }) => {
      setProject((prev: Project | null) => {
        if (!prev) return prev;
        if (payload.type === 'created') {
          return { ...prev, tickets: [payload.ticket, ...(prev.tickets ?? [])] };
        } else if (payload.type === 'updated') {
          return {
            ...prev,
            tickets: (prev.tickets ?? []).map((t: Ticket) => t.id === payload.ticket.id ? payload.ticket : t),
          };
        }
        return prev;
      });
    });
    return () => {
      socket.off('ticket:updated');
    };
  }, [projectId, token, logout, router]);

  // Initialize auth token on mount
  useEffect(() => {
    if (token) {
      setAuthToken(token);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            if (!showEditModal && !showDeleteModal) {
              setTitle('');
              setDescription('');
              setEditingTicket(null);
              setShowEditModal(true);
            }
            break;
          case 'k':
            e.preventDefault();
            (document.querySelector('input[placeholder="Search tickets..."]') as HTMLInputElement)?.focus();
            break;
          case 'Escape':
            if (showEditModal) setShowEditModal(false);
            if (showDeleteModal) setShowDeleteModal(null);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showEditModal, showDeleteModal]);

  async function createTicket() {
    if (!title) return;
    try {
      await api.post('/tickets', { projectId, title, description });
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
  }

  async function updateTicket() {
    if (!editingTicket || !title) return;
    try {
      await api.patch(`/tickets/${editingTicket.id}`, { title, description });
      setEditingTicket(null);
      setTitle("");
      setDescription("");
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update ticket:', error);
    }
  }

  async function deleteTicket(ticketId: string) {
    try {
      await api.delete(`/tickets/${ticketId}`);
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Failed to delete ticket:', error);
    }
  }

  function openEditModal(ticket: Ticket) {
    setEditingTicket(ticket);
    setTitle(ticket.title);
    setDescription(ticket.description || '');
    setShowEditModal(true);
  }

  function openDeleteModal(ticket: Ticket) {
    setShowDeleteModal(ticket);
  }

  function filteredTickets(tickets: Ticket[], status: string) {
    return tickets.filter(ticket => {
      const matchesStatus = ticket.status === status;
      const matchesSearch = !searchQuery || 
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ticket.description && ticket.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !project) return;

    const ticketId = active.id as string;
    const newStatus = over.id as 'TODO' | 'IN_PROGRESS' | 'DONE';
    
    const ticket = project.tickets?.find(t => t.id === ticketId);
    if (!ticket || ticket.status === newStatus) return;

    try {
      await api.patch(`/tickets/${ticketId}`, { status: newStatus });
      // The realtime update will handle the UI update
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    }
  }

  if (!project) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div>
      {/* Header */}
      <div className="header">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#1e293b' }}>
                {project.name}
              </h1>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 14 }}>
                Project Board • {(project.tickets ?? []).length} tickets
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button 
                className={`btn ${superOn ? 'btn-success' : 'btn-secondary'}`}
                onClick={() => {
                  if (!superOn) {
                    const pwd = prompt('Enter super-user password');
                    toggleSuper(pwd ?? undefined);
                  } else toggleSuper();
                }}
              >
                {superOn ? '👁️ Super: ON' : '👁️ Super: OFF'}
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => router.push('/projects')}
              >
                ← Back to Projects
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container" style={{ paddingTop: 32, paddingBottom: 32 }}>
        {/* Search and Add Ticket Form */}
        <div className="card" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
              Add New Ticket
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input 
                className="input" 
                placeholder="Search tickets..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '250px' }}
              />
              <div style={{ 
                fontSize: '12px', 
                color: 'var(--text-muted)', 
                background: 'var(--card-hover)', 
                padding: '4px 8px', 
                borderRadius: '6px',
                border: '1px solid var(--border)'
              }}>
                Ctrl+K to search
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input 
              className="input" 
              placeholder="Enter ticket title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createTicket()}
            />
            <textarea 
              className="input" 
              placeholder="Enter ticket description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ resize: 'vertical', minHeight: '80px' }}
            />
            <button className="btn btn-success" onClick={createTicket}>
              Add Ticket
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-3">
            <DroppableColumn
              id="TODO"
              title="To Do"
              icon=""
              tickets={filteredTickets(project.tickets ?? [], 'TODO')}
              superOn={superOn}
              className="todo"
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
            <DroppableColumn
              id="IN_PROGRESS"
              title="In Progress"
              icon=""
              tickets={filteredTickets(project.tickets ?? [], 'IN_PROGRESS')}
              superOn={superOn}
              className="in-progress"
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
            <DroppableColumn
              id="DONE"
              title="Done"
              icon=""
              tickets={filteredTickets(project.tickets ?? [], 'DONE')}
              superOn={superOn}
              className="done"
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="ticket-card" style={{ transform: 'rotate(5deg)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                <div style={{ marginBottom: 8 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 4px 0', color: '#1e293b' }}>
                    {(project.tickets ?? []).find(t => t.id === activeId)?.title}
                  </h4>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Activity Feed */}
        <div style={{ marginTop: 32 }}>
          <Notifications projectId={projectId} />
        </div>
      </div>

      {/* Edit Ticket Modal */}
      {showEditModal && editingTicket && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: 'var(--text-primary)' }}>
              Edit Ticket
            </h2>
            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: 'block', 
                fontSize: 14, 
                fontWeight: 500, 
                color: 'var(--text-primary)', 
                marginBottom: 8 
              }}>
                Ticket Title
              </label>
              <input 
                className="input" 
                placeholder="Enter ticket title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                display: 'block', 
                fontSize: 14, 
                fontWeight: 500, 
                color: 'var(--text-primary)', 
                marginBottom: 8 
              }}>
                Description (Optional)
              </label>
              <textarea 
                className="input" 
                placeholder="Enter ticket description"
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
              >
                Cancel
              </button>
              <button 
                className="btn" 
                onClick={updateTicket}
                disabled={!title.trim()}
              >
                Update Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Ticket Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
              Delete Ticket
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.5 }}>
                  Are you sure you want to delete &ldquo;<strong>{showDeleteModal.title}</strong>&rdquo;? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-ghost" 
                onClick={() => setShowDeleteModal(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={() => deleteTicket(showDeleteModal.id)}
              >
                Delete Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


