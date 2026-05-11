import React from 'react';

export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1 text-left">{children}</h3>
);

export const InfoGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-2 gap-6 mb-4">{children}</div>
);
