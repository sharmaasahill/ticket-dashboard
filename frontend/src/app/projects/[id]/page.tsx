"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useParams } from "next/navigation";
import { useUi } from "@/store/useUi";
import { Notifications } from "./notifications";

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

  const { superOn, toggleSuper } = useUi();

  return (
    <div style={{ maxWidth: 960, margin: '24px auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 600 }}>{project.name}</h1>
      <div style={{ margin: '8px 0' }}>
        <button className="btn" onClick={() => {
          if (!superOn) {
            const pwd = prompt('Enter super-user password');
            toggleSuper(pwd ?? undefined);
          } else toggleSuper();
        }}>{superOn ? 'Super: ON' : 'Super: OFF'}</button>
      </div>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <input className="input" placeholder="Ticket title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button className="btn" onClick={createTicket}>Add Ticket</button>
      </div>
      <ul>
        {(project.tickets ?? []).map((t: any) => (
          <li key={t.id} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{t.title}</span>
              {superOn ? <span style={{ color: '#6b7280' }}>by {t.authorId ?? '—'}</span> : null}
            </div>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 16 }}>
        <Notifications projectId={projectId} />
      </div>
    </div>
  );
}


