import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Wallet, 
  Settings, 
  LogOut, 
  Bell, 
  Menu, 
  Plus, 
  X,
  Search,
  CheckCircle,
  Clock,
  TrendingUp,
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

export default function SellerDashboard({ onLogout, onSwitchView, isDarkMode, toggleTheme, onAction }: { 
  onLogout: () => void,
  onSwitchView: () => void,
  isDarkMode: boolean,
  toggleTheme: () => void,
  onAction?: (msg: string) => void
}) {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [completingOrderId, setCompletingOrderId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalSales: 0
  });

  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?auto=format&fit=crop&q=80&w=800'
  });

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const options = {
          credentials: 'include' as const,
          headers: { 'Authorization': `Bearer ${token}` }
        };
        const [productsRes, ordersRes] = await Promise.all([
          fetch('/api/sellers/products', options),
          fetch('/api/sellers/orders', options)
        ]);

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData);
          setStats(prev => ({ ...prev, totalProducts: productsData.length }));
        }

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData);
          setStats(prev => ({ 
            ...prev, 
            activeOrders: ordersData.filter((o: any) => o.status !== 'completed').length,
            completedOrders: ordersData.filter((o: any) => o.status === 'completed').length,
            totalSales: ordersData.filter((o: any) => o.status === 'completed').reduce((acc: number, o: any) => acc + (o.price || 0), 0)
          }));
        }
      } catch (error) {
        console.error('Failed to fetch seller data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSellerData();
    }
  }, [token]);

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock || !newProduct.category) {
      onAction?.('Please fill in all required fields.');
      return;
    }

    try {
      const res = await fetch('/api/sellers/products', { 
        credentials: 'include', 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
          },
        body: JSON.stringify(newProduct)
      });
      
      if (res.ok) {
        const product = await res.json();
        setProducts([product, ...products]);
        setStats(prev => ({ ...prev, totalProducts: prev.totalProducts + 1 }));
        setShowAddProductModal(false);
        setNewProduct({
          name: '',
          price: '',
          stock: '',
          category: '',
          description: '',
          image: 'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?auto=format&fit=crop&q=80&w=800'
        });
        onAction?.('Product added successfully!');
      } else {
        onAction?.('Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      onAction?.('Failed to add product');
    }
  };

  const handleOrderStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/sellers/orders/${orderId}/status`, { 
        credentials: 'include',
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        if (newStatus === 'completed' || newStatus === 'shipped') {
          setCompletingOrderId(orderId);
          setTimeout(() => {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            setCompletingOrderId(null);
            onAction?.(`Order ${newStatus === 'shipped' ? 'shipped' : 'marked as completed'}!`);
          }, 1500);
        } else {
          setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
          onAction?.(`Order status updated to ${newStatus}.`);
        }
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      onAction?.('Failed to update order status.');
    }
  };

  const navItems = [
    { id: 'home-redirect', label: t('nav_home', 'Home'), icon: <HomeIcon size={18} />, onClick: onSwitchView },
    { id: 'dashboard', label: t('nav_dashboard', 'Dashboard'), icon: <LayoutDashboard size={18} /> },
    { id: 'inventory', label: t('nav_inventory', 'Inventory'), icon: <Package size={18} /> },
    { id: 'orders', label: t('nav_orders', 'Orders'), icon: <ShoppingCart size={18} /> },
    { id: 'wallet', label: t('nav_wallet', 'Wallet'), icon: <Wallet size={18} /> },
    { id: 'settings', label: t('nav_settings', 'Settings'), icon: <Settings size={18} /> },
  ];

  const renderContent = () => {
    if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" /></div>;

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Products" value={stats.totalProducts} icon={<Package className="text-[var(--accent)]" />} />
              <StatCard title="Active Orders" value={stats.activeOrders} icon={<ShoppingCart className="text-[var(--accent)]" />} />
              <StatCard title="Completed" value={stats.completedOrders} icon={<CheckCircle className="text-[var(--success)]" />} />
              <StatCard title="Total Sales" value={`${Number(stats.totalSales).toFixed(2)} MAD`} icon={<TrendingUp className="text-[var(--accent)]" />} />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => setShowAddProductModal(true)}
                className="p-6 rounded-3xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex flex-col items-center gap-3 hover:bg-[var(--accent)] hover:text-white transition-all group"
              >
                <Plus size={24} className="text-[var(--accent)] group-hover:text-white" />
                <span className="font-bold text-sm">Add Product</span>
              </button>
              <button 
                onClick={() => setActiveTab('inventory')}
                className="p-6 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex flex-col items-center gap-3 hover:bg-blue-500 hover:text-white transition-all group"
              >
                <Package size={24} className="text-blue-500 group-hover:text-white" />
                <span className="font-bold text-sm">Inventory</span>
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center gap-3 hover:bg-emerald-500 hover:text-white transition-all group"
              >
                <ShoppingCart size={24} className="text-emerald-500 group-hover:text-white" />
                <span className="font-bold text-sm">Orders</span>
              </button>
              <button 
                onClick={() => setActiveTab('wallet')}
                className="p-6 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex flex-col items-center gap-3 hover:bg-purple-500 hover:text-white transition-all group"
              >
                <Wallet size={24} className="text-purple-500 group-hover:text-white" />
                <span className="font-bold text-sm">Payouts</span>
              </button>
            </div>

            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6">
              <h3 className="text-xl font-bold mb-6 text-[var(--text)]">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[var(--text-muted)] text-xs uppercase tracking-widest border-b border-[var(--border)]">
                      <th className="px-4 py-4">Order ID</th>
                      <th className="px-4 py-4">Customer</th>
                      <th className="px-4 py-4">Product</th>
                      <th className="px-4 py-4">Amount</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {orders?.map(order => (
                      <tr key={order.id} className="border-b border-[var(--text)]/5 hover:bg-[var(--text)]/5 transition-colors">
                        <td className="px-4 py-4 font-mono text-[var(--text)]">{order.id}</td>
                        <td className="px-4 py-4 text-[var(--text)]">{order.customer}</td>
                        <td className="px-4 py-4 text-[var(--text)]">{order.product}</td>
                        <td className="px-4 py-4 font-bold text-[var(--text)]">{Number(order.amount).toFixed(2)} MAD</td>
                        <td className="px-4 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                            order.status === 'pending' ? 'bg-[var(--warning)]/20 text-[var(--warning)]' : 'bg-[var(--success)]/20 text-[var(--success)]'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <button 
                            onClick={() => onAction?.(`Viewing details for order ${order.id}...`)}
                            className="text-[var(--accent)] hover:underline transition-all active:scale-95"
                          >
                            View Details
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
      case 'inventory':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-[var(--text)]">Product Inventory</h3>
              <button 
                onClick={() => setShowAddProductModal(true)}
                className="bg-[var(--accent)] text-[var(--accent-foreground)] px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--accent)]/20"
              >
                <Plus size={18} />
                Add Product
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.map(product => (
                <div key={product.id} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl overflow-hidden group">
                  <div className="h-48 relative">
                    <img src={product.image || product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4 bg-[var(--card-bg)]/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[var(--text)] border border-[var(--border)]">
                      Stock: {product.stock}
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold text-lg mb-1 text-[var(--text)]">{product.name}</h4>
                    <p className="text-[var(--text-muted)] text-sm mb-4">{product.category}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--accent)] font-bold text-xl">{Number(product.price).toFixed(2)} MAD</span>
                      <button 
                        onClick={() => onAction?.(`Editing product ${product.name}...`)}
                        className="p-2 bg-[var(--text)]/5 rounded-lg hover:bg-[var(--text)]/10 transition-all active:scale-95 text-[var(--text)]"
                      >
                        <Settings size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'orders':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-[var(--text)]">All Product Orders</h3>
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[var(--text-muted)] text-xs uppercase tracking-widest border-b border-[var(--border)]">
                      <th className="px-4 py-4">Order ID</th>
                      <th className="px-4 py-4">Customer</th>
                      <th className="px-4 py-4">Product</th>
                      <th className="px-4 py-4">Amount</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {orders?.map(order => (
                      <tr key={order.id} className="border-b border-[var(--text)]/5 hover:bg-[var(--text)]/5 transition-colors relative group/row">
                        <td className="px-4 py-4 relative">
                          <AnimatePresence>
                            {completingOrderId === order.id && (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-10 bg-[var(--success)] flex items-center justify-center text-white"
                              >
                                <CheckCircle size={20} className="mr-2" />
                                <span className="font-bold">Completed!</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <span className="font-mono text-[var(--text)] truncate max-w-[100px] block">{order.id}</span>
                        </td>
                        <td className="px-4 py-4 text-[var(--text)]">{order.customer || order.client?.name}</td>
                        <td className="px-4 py-4 text-[var(--text)]">{order.product || (order.items?.[0]?.product?.name)}</td>
                        <td className="px-4 py-4 font-bold text-[var(--text)]">{Number(order.amount || order.totalPrice).toFixed(2)} MAD</td>
                        <td className="px-4 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                            order.status === 'pending' ? 'bg-[var(--warning)]/20 text-[var(--warning)]' : 'bg-[var(--success)]/20 text-[var(--success)]'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {order.status === 'pending' && (
                              <button 
                                onClick={() => handleOrderStatusUpdate(order.id, 'shipped')}
                                className="px-3 py-1 bg-[var(--accent)] text-black text-[10px] font-bold rounded-lg hover:opacity-80 transition-all active:scale-95"
                              >
                                Ship Order
                              </button>
                            )}
                            {order.status === 'shipped' && (
                              <button 
                                onClick={() => handleOrderStatusUpdate(order.id, 'completed')}
                                className="px-3 py-1 bg-[var(--success)] text-white text-[10px] font-bold rounded-lg hover:opacity-80 transition-all active:scale-95"
                              >
                                Complete
                              </button>
                            )}
                            <button 
                              onClick={() => onAction?.(`Viewing details for order ${order.id}...`)}
                              className="p-1 px-2 text-[var(--text-muted)] hover:text-[var(--text)] text-[10px] font-bold"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </div>
        );
      case 'wallet':
        return (
          <div className="space-y-6">
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[48px] p-12 flex flex-col items-center justify-center text-center glass relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[var(--accent)]/5 pointer-events-none" />
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--accent)]/10 rounded-full blur-3xl" />
              
              <div className="w-20 h-20 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-muted)] text-white rounded-[24px] flex items-center justify-center mb-6 shadow-2xl shadow-[var(--accent)]/30 transform -rotate-6">
                <Wallet size={40} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-2 opacity-60">Total Balance</p>
              <div className="text-7xl font-black text-[var(--text)] mb-8 tracking-tighter flex items-baseline gap-3">
                {Number(stats.totalSales).toFixed(2)} 
                <span className="text-2xl font-bold text-[var(--accent)] uppercase tracking-widest">MAD</span>
              </div>
              <button 
                onClick={() => {
                  const amount = window.prompt("Enter amount to withdraw (MAD):");
                  if (amount && Number(amount) > 0) {
                    onAction(`Withdrawal request for ${amount} MAD submitted successfully!`);
                  }
                }}
                className="px-10 py-5 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all active:scale-95 shadow-2xl shadow-[var(--accent)]/30 flex items-center gap-3"
              >
                <TrendingUp size={20} />
                Withdraw Earnings
              </button>
            </div>
          </div>
        );
      case 'settings':
        return <AccountSection onAction={(msg) => onAction?.(msg)} />;
      default:
        return <div className="p-12 text-center text-[var(--text-muted)]">Coming soon</div>;
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
              <ShoppingCart size={20} className="text-[var(--accent-foreground)]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[var(--accent)]">Seller<span className="text-[var(--text)]">Hub</span></span>
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
            {user && <NotificationBell userId={user.id} token={token} />}
            <div className="w-10 h-10 rounded-full bg-[var(--text)]/10 border border-[var(--border)] overflow-hidden">
              <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Seller'}&background=FFD700&color=000`} alt="Profile" className="w-full h-full object-cover" />
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
          { id: 'inventory', label: 'Inv', icon: <Package size={18} /> },
          { id: 'orders', label: 'Orders', icon: <ShoppingCart size={18} /> },
          { id: 'wallet', label: 'Wallet', icon: <Wallet size={18} /> },
          { id: 'settings', label: 'Set', icon: <Settings size={18} /> }
        ]}
      />

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddProductModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 w-full max-w-lg relative overflow-hidden"
            >
              <button 
                onClick={() => setShowAddProductModal(false)}
                className="absolute top-6 right-6 p-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              >
                <X size={24} />
              </button>

              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Add New Product</h2>
                <p className="text-[var(--text-muted)]">List a new product in your inventory.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4">Product Name</label>
                  <input 
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="e.g. Professional Tool Kit"
                    className="w-full bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl px-6 py-3 focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4">Price (MAD)</label>
                    <input 
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                      placeholder="e.g. 1200"
                      className="w-full bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl px-6 py-3 focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4">Stock Quantity</label>
                    <input 
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                      placeholder="e.g. 10"
                      className="w-full bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl px-6 py-3 focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4">Category</label>
                  <select 
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl px-6 py-3 focus:outline-none focus:border-[var(--accent)] transition-colors appearance-none"
                  >
                    <option value="">Select a category</option>
                    <option value="Tools">Tools</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Construction">Construction</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4">Description</label>
                  <textarea 
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    placeholder="Product details..."
                    rows={3}
                    className="w-full bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl px-6 py-3 focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowAddProductModal(false)}
                    className="flex-1 px-6 py-4 bg-[var(--text)]/5 text-[var(--text)] rounded-2xl font-bold hover:bg-[var(--text)]/10 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddProduct}
                    className="flex-[2] px-6 py-4 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--accent)]/20"
                  >
                    Create Product
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
