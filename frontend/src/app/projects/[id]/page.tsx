"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useParams } from "next/navigation";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id as string;
  const [project, setProject] = useState<any | null>(null);
  const [title, setTitle] = useState("");

  useEffect(() => {
    api.get(`/projects/${projectId}`).then(r => setProject(r.data));
    const socket = getSocket();
    socket.emit('join', { projectId });
    socket.on('ticket:updated', (payload) => {
      if (!project) return;
      if (payload.type === 'created') {
        setProject({ ...project, tickets: [payload.ticket, ...(project.tickets ?? [])] });
      } else if (payload.type === 'updated') {
        setProject({
          ...project,
          tickets: (project.tickets ?? []).map((t: any) => t.id === payload.ticket.id ? payload.ticket : t),
        });
      }
    });
    return () => {
      socket.off('ticket:updated');
    };
  }, [projectId, project]);

  async function createTicket() {
    if (!title) return;
    await api.post('/tickets', { projectId, title });
    setTitle("");
  }

  if (!project) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 960, margin: '24px auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 600 }}>{project.name}</h1>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <input className="input" placeholder="Ticket title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button className="btn" onClick={createTicket}>Add Ticket</button>
      </div>
      <ul>
        {(project.tickets ?? []).map((t: any) => (
          <li key={t.id} style={{ padding: 8, borderBottom: '1px solid #eee' }}>{t.title}</li>
        ))}
      </ul>
    </div>
  );
}


