"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Activity {
  id: string;
  message: string;
  type: string;
  createdAt: string;
  actorId: string;
}

export function Notifications({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<Activity[]>([]);
  
  useEffect(() => {
    api.get(`/activities/${projectId}`).then(r => setItems(r.data));
  }, [projectId]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create': return '➕';
      case 'update': return '✏️';
      case 'move': return '🔄';
      default: return '📝';
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: '#1e293b' }}>
          🔔 Recent Activity
        </h3>
        <span style={{ 
          marginLeft: 8, 
          fontSize: 12, 
          background: '#f1f5f9', 
          color: '#64748b', 
          padding: '2px 8px', 
          borderRadius: 12 
        }}>
          {items.length}
        </span>
      </div>
      
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📭</div>
          <p style={{ margin: 0, fontSize: 14 }}>No activity yet</p>
        </div>
      ) : (
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {items.map((activity) => (
            <div 
              key={activity.id} 
              style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                padding: '12px 0', 
                borderBottom: '1px solid #f1f5f9',
                fontSize: 14
              }}
            >
              <div style={{ 
                fontSize: 16, 
                marginRight: 12, 
                marginTop: 2,
                minWidth: 20
              }}>
                {getActivityIcon(activity.type)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 4px 0', color: '#1e293b' }}>
                  {activity.message}
                </p>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  fontSize: 12,
                  color: '#94a3b8'
                }}>
                  <span>by {activity.actorId}</span>
                  <span>{new Date(activity.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


