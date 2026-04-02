import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Settings, 
  LogOut, 
  Bell, 
  Menu, 
  Plus, 
  X,
  Search,
  CheckCircle,
  Clock,
  Building2,
  FileText,
  Sun,
  Moon,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../layout/NotificationBell';

export default function CompanyDashboard({ onLogout, isDarkMode, toggleTheme, onAction }: { 
  onLogout: () => void,
  isDarkMode: boolean,
  toggleTheme: () => void,
  onAction?: (msg: string) => void
}) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalEmployees: 0,
    completedProjects: 0,
    totalRevenue: 0
  });

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    client: '',
    budget: '',
    deadline: '',
    description: ''
  });

  useEffect(() => {
    // Mock data for now
    setTimeout(() => {
      setProjects([
        { id: 1, name: "Villa Renovation", client: "Karim Tazi", status: "ongoing", budget: 50000, deadline: "2026-04-15" },
        { id: 2, name: "Office Wiring", client: "TechCorp", status: "pending", budget: 12000, deadline: "2026-03-25" }
      ]);
      setStats({
        activeProjects: 2,
        totalEmployees: 12,
        completedProjects: 45,
        totalRevenue: 250000
      });
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddProject = () => {
    if (!newProject.name || !newProject.client || !newProject.budget || !newProject.deadline) {
      onAction?.('Please fill in all required fields.');
      return;
    }

    const project = {
      id: projects.length + 1,
      ...newProject,
      status: 'pending',
      budget: parseFloat(newProject.budget)
    };

    setProjects([project, ...projects]);
    setStats(prev => ({ ...prev, activeProjects: prev.activeProjects + 1 }));
    setShowAddProjectModal(false);
    setNewProject({
      name: '',
      client: '',
      budget: '',
      deadline: '',
      description: ''
    });
    onAction?.('Project added successfully!');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'projects', label: 'Projects', icon: <Briefcase size={18} /> },
    { id: 'team', label: 'Team', icon: <Users size={18} /> },
    { id: 'invoices', label: 'Invoices', icon: <FileText size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  const renderContent = () => {
    if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" /></div>;

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Active Projects" value={stats.activeProjects} icon={<Briefcase className="text-[var(--accent)]" />} />
              <StatCard title="Team Size" value={stats.totalEmployees} icon={<Users className="text-[var(--accent)]" />} />
              <StatCard title="Completed" value={stats.completedProjects} icon={<CheckCircle className="text-[var(--success)]" />} />
              <StatCard title="Total Revenue" value={`${stats.totalRevenue} MAD`} icon={<Building2 className="text-[var(--accent)]" />} />
            </div>

            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[var(--text)]">Current Projects</h3>
                <button 
                  onClick={() => setShowAddProjectModal(true)}
                  className="bg-[var(--accent)] text-[var(--accent-foreground)] px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--accent)]/20"
                >
                  <Plus size={18} />
                  Add Project
                </button>
              </div>
              <div className="space-y-4">
                {projects?.map(project => (
                  <div key={project.id} className="bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-lg text-[var(--text)]">{project.name}</h4>
                      <p className="text-[var(--text-muted)] text-sm">Client: {project.client}</p>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-bold mb-1">Budget</p>
                        <p className="font-bold text-[var(--accent)]">{project.budget} MAD</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-bold mb-1">Deadline</p>
                        <p className="text-sm text-[var(--text)]">{project.deadline}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          project.status === 'ongoing' ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-[var(--warning)]/20 text-[var(--warning)]'
                        }`}>
                          {project.status}
                        </span>
                        <button 
                          onClick={() => onAction?.(`Viewing details for project ${project.name}...`)}
                          className="text-xs text-[var(--accent)] hover:underline transition-all active:scale-95"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return <div className="p-12 text-center text-[var(--text-muted)]">Coming soon</div>;
    }
  };

  return (
    <div className="flex h-screen bg-[var(--bg)] text-[var(--text)] font-sans overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--card-bg)] border-r border-[var(--border)] transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 flex flex-col`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center">
              <Building2 size={20} className="text-[var(--accent-foreground)]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[var(--accent)]">Enterprise<span className="text-[var(--text)]">Pro</span></span>
          </div>
          <button className="lg:hidden text-[var(--text-muted)] hover:text-[var(--text)]" onClick={() => setIsMobileMenuOpen(false)}>
            <Menu size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {navItems?.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id 
                  ? 'bg-[var(--accent)] text-[var(--accent-foreground)] shadow-lg shadow-[var(--accent)]/20' 
                  : 'text-[var(--text-muted)] hover:bg-[var(--text)]/5 hover:text-[var(--text)]'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-[var(--border)]">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {activeTab !== 'dashboard' && (
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--accent)] hover:text-white transition-all active:scale-95 shadow-lg flex items-center justify-center"
                title="Back to Dashboard"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <button className="lg:hidden text-[var(--text-muted)] hover:text-[var(--text)]" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold capitalize text-[var(--text)]">{activeTab.replace('-', ' ')}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-3 rounded-full glass hover:scale-110 transition-all active:scale-95 shadow-lg flex items-center justify-center"
            >
              {isDarkMode ? <Sun className="text-yellow-400" size={20} /> : <Moon className="text-blue-500" size={20} />}
            </button>
            {user && <NotificationBell userId={user.id} />}
            <div className="w-10 h-10 rounded-full bg-[var(--text)]/10 border border-[var(--border)] overflow-hidden">
              <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Company'}&background=FFD700&color=000`} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Add Project Modal */}
      <AnimatePresence>
        {showAddProjectModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 w-full max-w-lg relative overflow-hidden"
            >
              <button 
                onClick={() => setShowAddProjectModal(false)}
                className="absolute top-6 right-6 p-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              >
                <X size={24} />
              </button>

              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Add New Project</h2>
                <p className="text-[var(--text-muted)]">Create a new project to manage your team and resources.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4">Project Name</label>
                  <input 
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    placeholder="e.g. Villa Renovation"
                    className="w-full bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl px-6 py-3 focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4">Client Name</label>
                  <input 
                    type="text"
                    value={newProject.client}
                    onChange={(e) => setNewProject({...newProject, client: e.target.value})}
                    placeholder="e.g. Karim Tazi"
                    className="w-full bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl px-6 py-3 focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4">Budget (MAD)</label>
                    <input 
                      type="number"
                      value={newProject.budget}
                      onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
                      placeholder="e.g. 50000"
                      className="w-full bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl px-6 py-3 focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4">Deadline</label>
                    <input 
                      type="date"
                      value={newProject.deadline}
                      onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
                      className="w-full bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl px-6 py-3 focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4">Description</label>
                  <textarea 
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    placeholder="Project details..."
                    rows={3}
                    className="w-full bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl px-6 py-3 focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowAddProjectModal(false)}
                    className="flex-1 px-6 py-4 bg-[var(--text)]/5 text-[var(--text)] rounded-2xl font-bold hover:bg-[var(--text)]/10 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddProject}
                    className="flex-[2] px-6 py-4 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--accent)]/20"
                  >
                    Create Project
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-[var(--text)]/5 rounded-2xl">
          {icon}
        </div>
      </div>
      <h3 className="text-[var(--text-muted)] text-sm font-medium mb-1">{title}</h3>
      <div className="text-3xl font-bold text-[var(--text)]">{value}</div>
    </div>
  );
}
