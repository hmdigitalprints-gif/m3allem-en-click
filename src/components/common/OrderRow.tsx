import React from 'react';

interface OrderRowProps {
  id: string;
  client: string;
  artisan: string;
  service: string;
  status: string;
  amount: string;
}

export default function OrderRow({ id, client, artisan, service, status, amount }: OrderRowProps) {
  const statusColors: any = {
    'Completed': 'bg-emerald-500/10 text-emerald-500',
    'Ongoing': 'bg-blue-500/10 text-blue-500',
    'Pending': 'bg-amber-500/10 text-amber-500',
    'Cancelled': 'bg-rose-500/10 text-rose-500'
  };

  return (
    <tr className="hover:bg-[var(--accent)]/5 transition-colors group">
      <td className="px-6 py-4 text-sm font-mono text-[var(--text-muted)] opacity-50">{id}</td>
      <td className="px-6 py-4 text-sm font-medium text-[var(--text)]">{client}</td>
      <td className="px-6 py-4 text-sm font-medium text-[var(--text)]">{artisan}</td>
      <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{service}</td>
      <td className="px-6 py-4">
        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${statusColors[status]}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 text-sm font-bold text-right text-[var(--accent)]">{amount}</td>
    </tr>
  );
}
