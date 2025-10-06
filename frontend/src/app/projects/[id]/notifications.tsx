"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export function Notifications({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    api.get(`/activities/${projectId}`).then(r => setItems(r.data));
  }, [projectId]);
  return (
    <div>
      <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Activity</h3>
      <ul>
        {items.map((a) => (
          <li key={a.id} style={{ fontSize: 12, color: '#6b7280', padding: 4 }}>{a.message}</li>
        ))}
      </ul>
    </div>
  );
}


