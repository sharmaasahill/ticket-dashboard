"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function ProjectsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    api.get('/projects').then(r => setItems(r.data));
  }, []);

  async function create() {
    if (!name) return;
    const { data } = await api.post('/projects', { name });
    setItems([data, ...items]);
    setName("");
  }

  return (
    <div style={{ maxWidth: 760, margin: "24px auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 600 }}>Projects</h1>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <input className="input" placeholder="New project name" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn" onClick={create}>Create</button>
      </div>
      <ul>
        {items.map(p => (
          <li key={p.id} style={{ padding: 8 }}>
            <Link href={`/projects/${p.id}`}>{p.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}


