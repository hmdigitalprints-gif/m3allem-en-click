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
  ArrowLeft,
  Home as HomeIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../layout/NotificationBell';
import NavButton from '../common/NavButton';
import MobileNav from '../common/MobileNav';
import { LanguageSwitcher } from '../layout/LanguageSwitcher';

import AccountSection from '../profile/AccountSection';

export default function CompanyDashboard({ onLogout, onSwitchView, isDarkMode, toggleTheme, onAction }: { 
  onLogout: () => void,
  onSwitchView: () => void,
  isDarkMode: boolean,
  toggleTheme: () => void,
  onAction?: (msg: string) => void
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [completingProjectId, setCompletingProjectId] = useState<string | null>(null);
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
    const fetchCompanyData = async () => {
      try {
        const options = {
          credentials: 'include' as const
        };
        const [projectsRes] = await Promise.all([
          fetch('/api/companies/projects', options)
        ]);

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          // Map backend GroupRequest to project
          const formattedProjects = projectsData.map((p: any) => {
            // Extract client, budget, deadline from description if possible, or fallback
            // since we joined them in backend
            return {
              id: p.id,
              name: p.title,
              client: p.description?.split('\n')[0]?.replace('Client: ', '') || 'Unknown',
              budget: parseFloat(p.description?.split('\n')[1]?.replace('Budget: ', '') || '0'),
              deadline: p.description?.split('\n')[2]?.replace('Deadline: ', '') || '',
              status: p.status === 'completed' ? 'completed' : (p.status === 'recruiting' ? 'pending' : 'ongoing'),
              description: p.description
            };
          });
          setProjects(formattedProjects);
          
          setStats({
            activeProjects: formattedProjects.filter((p: any) => p.status !== 'completed').length,
            totalEmployees: 5, // mock
            completedProjects: formattedProjects.filter((p: any) => p.status === 'completed').length,
            totalRevenue: formattedProjects.filter((p: any) => p.status === 'completed').reduce((acc: number, p: any) => acc + (p.budget || 0), 0)
          });
        }
      } catch (error) {
        console.error('Failed to fetch company data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCompanyData();
    }
  }, [user]);

  const handleAddProject = async () => {
    if (!newProject.name || !newProject.client || !newProject.budget || !newProject.deadline) {
      onAction?.('Please fill in all required fields.');
      return;
    }

    try {
      const res = await fetch('/api/companies/projects', { 
        credentials: 'include', 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          },
        body: JSON.stringify(newProject)
      });

      if (res.ok) {
        const p = await res.json();
        const project = {
          id: p.id,
          name: p.title,
          client: newProject.client,
          status: 'pending',
          budget: parseFloat(newProject.budget),
          deadline: newProject.deadline
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
      } else {
        onAction?.('Failed to add project.');
      }
    } catch (error) {
      console.error('Failed to add project:', error);
      onAction?.('Failed to add project.');
    }
  };

  const handleProjectStatusUpdate = async (projectId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/companies/projects/${projectId}/status`, { 
        credentials: 'include', 
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        if (newStatus === 'completed') {
          setCompletingProjectId(projectId);
          setTimeout(() => {
            setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: newStatus } : p));
            setCompletingProjectId(null);
            onAction?.('Project marked as completed! Excellent work.');
          }, 1500);
        } else {
          setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: newStatus } : p));
          onAction?.(`Project status updated to ${newStatus}.`);
        }
      }
    } catch (error) {
      console.error('Failed to update project status:', error);
      onAction?.('Failed to update project status.');
    }
  };

  const navItems = [
    { id: 'home-redirect', label: t('nav_home', 'Home'), icon: <HomeIcon size={18} />, onClick: onSwitchView },
    { id: 'dashboard', label: t('nav_dashboard', 'Dashboard'), icon: <LayoutDashboard size={18} /> },
    { id: 'projects', label: t('nav_projects', 'Projects'), icon: <Briefcase size={18} /> },
    { id: 'team', label: t('nav_team', 'Team'), icon: <Users size={18} /> },
    // { id: 'invoices', label: t('nav_invoices', 'Invoices'), icon: <FileText size={18} /> },
    { id: 'settings', label: t('nav_settings', 'Settings'), icon: <Settings size={18} /> },
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
              <StatCard title="Total Revenue" value={`${(Number(stats.totalRevenue) || 0).toFixed(2)} MAD`} icon={<Building2 className="text-[var(--accent)]" />} />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => setShowAddProjectModal(true)}
                className="p-6 rounded-3xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex flex-col items-center gap-3 hover:bg-[var(--accent)] hover:text-white transition-all group"
              >
                <Plus size={24} className="text-[var(--accent)] group-hover:text-white" />
                <span className="font-bold text-sm">New Project</span>
              </button>
              <button 
                onClick={() => setActiveTab('team')}
                className="p-6 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex flex-col items-center gap-3 hover:bg-blue-500 hover:text-white transition-all group"
              >
                <Users size={24} className="text-blue-500 group-hover:text-white" />
                <span className="font-bold text-sm">Manage Team</span>
              </button>
              {/* <button 
                onClick={() => setActiveTab('invoices')}
                className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center gap-3 hover:bg-emerald-500 hover:text-white transition-all group"
              >
                <FileText size={24} className="text-emerald-500 group-hover:text-white" />
                <span className="font-bold text-sm">Invoices</span>
              </button> */}
              <button 
                onClick={() => setActiveTab('settings')}
                className="p-6 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex flex-col items-center gap-3 hover:bg-purple-500 hover:text-white transition-all group"
              >
                <Settings size={24} className="text-purple-500 group-hover:text-white" />
                <span className="font-bold text-sm">Settings</span>
              </button>
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
                  <div key={project.id} className="bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
                    <AnimatePresence>
                      {completingProjectId === project.id && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-10 bg-[var(--success)] flex items-center justify-center text-white"
                        >
                          <CheckCircle size={24} className="mr-2" />
                          <span className="font-bold text-lg">Project Completed!</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div>
                      <h4 className="font-bold text-lg text-[var(--text)]">{project.name}</h4>
                      <p className="text-[var(--text-muted)] text-sm">Client: {project.client}</p>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-bold mb-1">Budget</p>
                        <p className="font-bold text-[var(--accent)]">{(Number(project.budget) || 0).toFixed(2)} MAD</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-bold mb-1">Deadline</p>
                        <p className="text-sm text-[var(--text)]">{project.deadline}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          project.status === 'ongoing' ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 
                          project.status === 'completed' ? 'bg-[var(--success)]/20 text-[var(--success)]' :
                          'bg-[var(--warning)]/20 text-[var(--warning)]'
                        }`}>
                          {project.status}
                        </span>
                        <div className="flex items-center gap-2">
                          {project.status !== 'completed' && (
                            <button 
                              onClick={() => handleProjectStatusUpdate(project.id, 'completed')}
                              className="text-[10px] font-bold text-[var(--success)] hover:underline transition-all active:scale-95"
                            >
                              Mark Done
                            </button>
                          )}
                          <button 
                            onClick={() => onAction?.(`Viewing details for project ${project.name}...`)}
                            className="text-xs text-[var(--accent)] hover:underline transition-all active:scale-95"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-[var(--text)]">All Projects</h3>
              <button 
                onClick={() => setShowAddProjectModal(true)}
                className="bg-[var(--accent)] text-[var(--accent-foreground)] px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--accent)]/20"
              >
                <Plus size={18} /> New Project
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map(project => (
                <div key={project.id} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-8 glass group hover:shadow-2xl transition-all">
                   <div className="flex justify-between items-start mb-6">
                     <div>
                       <h4 className="text-xl font-bold mb-1">{project.name}</h4>
                       <span className="px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-bold uppercase rounded-lg">
                         {project.status}
                       </span>
                     </div>
                     <div className="text-right">
                       <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest mb-1">Budget</p>
                       <p className="text-2xl font-black text-[var(--accent)]">{(Number(project.budget) || 0).toFixed(0)} <span className="text-xs">MAD</span></p>
                     </div>
                   </div>
                   <p className="text-sm text-[var(--text-muted)] mb-8 line-clamp-2">{project.description}</p>
                   <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
                     <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-bold">
                       <Clock size={14} /> Deadline: {project.deadline}
                     </div>
                     <button className="text-[var(--accent)] font-bold text-sm hover:underline">Details</button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'team':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center text-center">
              <h3 className="text-xl font-bold">Team Management</h3>
              <button 
                onClick={() => {
                  onAction?.('Opening candidate pool...');
                  // In a real app we'd navigate to a candidate search page
                }} 
                className="bg-[var(--accent)] text-[var(--accent-foreground)] px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95"
              >
                <Plus size={18} /> Hire Member
              </button>
            </div>
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-12 text-center">
               <div className="w-20 h-20 bg-[var(--text)]/5 rounded-full flex items-center justify-center text-[var(--text-muted)] mx-auto mb-6">
                 <Users size={40} />
               </div>
               <h4 className="text-xl font-bold mb-2">Build Your Team</h4>
               <p className="text-[var(--text-muted)] max-w-md mx-auto mb-8">You can add professionals and specialists to your company projects once they are approved.</p>
               <button className="px-8 py-3 bg-[var(--text)] text-[var(--bg)] rounded-xl font-bold text-sm">Browse Pros</button>
            </div>
          </div>
        );
      case 'invoices':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-[var(--text)]">Financial Overview</h3>
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl overflow-hidden">
               <div className="p-12 text-center opacity-60">
                 <FileText size={48} className="mx-auto mb-6 text-[var(--text-muted)]" />
                 <h4 className="text-lg font-bold mb-2">No Invoices Yet</h4>
                 <p className="text-sm">Invoices will be generated automatically as projects progress.</p>
               </div>
            </div>
          </div>
        );
      case 'settings':
        return <AccountSection onAction={(msg) => onAction?.(msg)} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full bg-[var(--bg)] text-[var(--text)] font-sans overflow-hidden">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

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
              onClick={() => { 
                if (item.onClick) {
                  item.onClick();
                } else {
                  setActiveTab(item.id); 
                }
                setIsMobileMenuOpen(false); 
              }}
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
      <div className="flex-1 flex flex-col overflow-hidden relative max-w-[100vw]">
        <header className="h-16 lg:h-20 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-2 lg:gap-4">
            <button className="lg:hidden text-[var(--text)] p-2 rounded-xl hover:bg-[var(--text)]/5" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            {activeTab !== 'dashboard' && (
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="p-1.5 lg:p-2.5 rounded-xl lg:rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--accent)] hover:text-white transition-all active:scale-95 shadow-md flex items-center justify-center"
                title="Back to Dashboard"
              >
                <ArrowLeft size={20} className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-lg lg:text-xl font-bold capitalize text-[var(--text)] hidden sm:block">{t('nav_' + activeTab.replace('-', '_'), activeTab.replace('-', ' '))}</h1>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <LanguageSwitcher />
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

      {/* Mobile Bottom Navigation */}
      <MobileNav 
        activeTab={activeTab}
        onTabChange={(id) => {
          if (id === 'home-redirect') {
            onSwitchView();
          } else {
            setActiveTab(id);
          }
        }}
        navItems={[
          { id: 'home-redirect', label: 'Home', icon: <HomeIcon size={18} /> },
          { id: 'dashboard', label: 'Dash', icon: <LayoutDashboard size={18} /> },
          { id: 'projects', label: 'Works', icon: <Briefcase size={18} /> },
          { id: 'team', label: 'Team', icon: <Users size={18} /> },
          // { id: 'invoices', label: 'Docs', icon: <FileText size={18} /> },
          { id: 'settings', label: 'Set', icon: <Settings size={18} /> }
        ]}
      />

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
