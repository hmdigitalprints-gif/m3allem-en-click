import React, { useState, useEffect } from 'react';
import { Plus, UserCog } from 'lucide-react';

interface AdminManagementViewProps {
  isDarkMode: boolean;
  cardClasses: string;
  textMutedClasses: string;
  hoverClasses: string;
  onAction?: (msg: string) => void;
}

export default function AdminManagementView({ 
  isDarkMode, 
  cardClasses, 
  textMutedClasses, 
  hoverClasses, 
  onAction 
}: AdminManagementViewProps) {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users?role=admin', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('m3allem_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setAdmins(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching admins:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Management</h1>
          <p className={`text-sm ${textMutedClasses} mt-1`}>Manage administrative users and their permission levels.</p>
        </div>
        <button 
          onClick={() => onAction?.('Add Admin functionality coming soon!')}
          className="bg-[#FFD700] text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#E6C200] transition-colors active:scale-95"
        >
          <Plus size={16} /> Add Admin
        </button>
      </div>

      <div className={`rounded-2xl overflow-hidden ${cardClasses}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={`text-xs uppercase tracking-wider ${isDarkMode ? 'bg-white/5 text-white/40' : 'bg-gray-50 text-gray-500'}`}>
              <tr>
                <th className="px-6 py-4 font-medium">Admin User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Last Login</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-white/5' : 'divide-gray-100'}`}>
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center">Loading...</td></tr>
              ) : admins.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center">No admins found.</td></tr>
              ) : admins.map((admin) => (
                <tr key={admin.id} className={`transition-colors ${hoverClasses}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {admin.avatar_url ? (
                        <img src={admin.avatar_url} alt={admin.name} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#FFD700] text-black flex items-center justify-center text-[10px] font-bold italic">
                          {admin.name.charAt(0)}
                        </div>
                      )}
                      <span>{admin.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'}`}>
                      {admin.id === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 ${textMutedClasses}`}>N/A</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-500">Active</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onAction?.(`Managing permissions for ${admin.name}...`)}
                      className={`p-1.5 rounded-md ${hoverClasses} active:scale-95`}
                    >
                      <UserCog size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
