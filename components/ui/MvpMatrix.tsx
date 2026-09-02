import React from 'react';

type Feature = {
  name: string;
  priority: string;
  progress: number; // 0-100
  estimateDays: number;
};

const features: Feature[] = [
  { name: 'Research Project & Node Framework', priority: 'High', progress: 100, estimateDays: 3 },
  { name: 'Journal Import (DOI/PDF) + Parsing', priority: 'High', progress: 80, estimateDays: 5 },
  { name: 'PDF Reader + Inline Translation', priority: 'High', progress: 60, estimateDays: 4 },
  { name: 'AI Tier 1 (Relevance Check)', priority: 'High', progress: 40, estimateDays: 3 },
  { name: 'AI Tier 2 (Deep Extraction)', priority: 'High', progress: 20, estimateDays: 5 },
  { name: 'Evidence Highlight & Save', priority: 'High', progress: 20, estimateDays: 2 },
  { name: 'Approval Workflow', priority: 'High', progress: 0, estimateDays: 2 },
  { name: 'Automatic Cross‑check', priority: 'High', progress: 0, estimateDays: 4 },
  { name: 'Research Gap Detection', priority: 'Medium', progress: 0, estimateDays: 3 },
  { name: 'Visual Evidence Graph', priority: 'Medium', progress: 0, estimateDays: 5 },
  { name: 'Prompt Library', priority: 'Medium', progress: 0, estimateDays: 2 },
  { name: 'Proposal Outline Generator', priority: 'High', progress: 0, estimateDays: 4 },
  { name: 'Writing Workspace', priority: 'High', progress: 0, estimateDays: 7 },
  { name: 'Export DOCX', priority: 'Medium', progress: 0, estimateDays: 2 },
  { name: 'Import DOCX', priority: 'Low', progress: 0, estimateDays: 3 },
  { name: 'Automatic Discovery', priority: 'High', progress: 0, estimateDays: 7 },
  { name: 'Word Add‑in', priority: 'Medium', progress: 0, estimateDays: 14 },
  { name: 'Semantic Search (pgvector)', priority: 'Medium', progress: 0, estimateDays: 5 },
];

export const MvpMatrix: React.FC = () => {
  return (
    <div style={{ marginTop: 32 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
        MVP Prioritization Matrix
      </h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
            <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'left' }}>Fitur</th>
            <th style={{ padding: '12px 14px', fontWeight: 600 }}>Prioritas</th>
            <th style={{ padding: '12px 14px', fontWeight: 600 }}>Progress</th>
            <th style={{ padding: '12px 14px', fontWeight: 600 }}>Estimasi (Hari)</th>
          </tr>
        </thead>
        <tbody>
          {features.map((f) => (
            <tr key={f.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '10px 18px' }}>{f.name}</td>
              <td style={{ padding: '10px 14px', textAlign: 'center' }}>{f.priority}</td>
              <td style={{ padding: '10px 14px' }}>
                <progress value={f.progress} max={100} style={{ width: '100%' }} />
              </td>
              <td style={{ padding: '10px 14px', textAlign: 'center' }}>{f.estimateDays}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
