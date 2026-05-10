import React from 'react';

interface ActivityItemProps {
  title: string;
  time: string;
  desc: string;
}

export default function ActivityItem({ title, time, desc }: ActivityItemProps) {
  return (
    <div className="flex gap-4">
      <div className="w-1 h-10 bg-[var(--accent)]/20 rounded-full mt-1 relative">
        <div className="absolute top-0 left-0 w-full h-4 bg-[var(--accent)] rounded-full" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-[var(--text)]">{title}</p>
          <span className="text-[10px] text-[var(--text-muted)] uppercase opacity-50">{time}</span>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
