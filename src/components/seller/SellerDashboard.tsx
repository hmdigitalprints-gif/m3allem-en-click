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
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../layout/NotificationBell';

export default function SellerDashboard({ onLogout, isDarkMode, toggleTheme, onAction }: { 
  onLogout: () => void,
  isDarkMode: boolean,
  toggleTheme: () => void,
  onAction?: (msg: string) => void
}) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    // Mock data for now
    setTimeout(() => {
      setProducts([
        { id: 1, name: "Professional Tool Kit", price: 1200, stock: 15, category: "Tools", image: "https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?auto=format&fit=crop&q=80&w=400" },
        { id: 2, name: "Smart LED Panel", price: 450, stock: 50, category: "Electrical", image: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=400" }
      ]);
      setOrders([
        { id: 'ORD-001', customer: 'Ahmed Alami', product: 'Professional Tool Kit', amount: 1200, status: 'pending', date: '2026-03-09' },
        { id: 'ORD-002', customer: 'Sara Benani', product: 'Smart LED Panel', amount: 450, status: 'completed', date: '2026-03-08' }
      ]);
      setStats({
        totalProducts: 2,
        activeOrders: 1,
        completedOrders: 1,
        totalSales: 1650
      });
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock || !newProduct.category) {
      onAction?.('Please fill in all required fields.');
      return;
    }

    const product = {
      id: products.length + 1,
      ...newProduct,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock)
    };

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
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'inventory', label: 'Inventory', icon: <Package size={18} /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingCart size={18} /> },
    { id: 'wallet', label: 'Wallet', icon: <Wallet size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
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
              <StatCard title="Total Sales" value={`${stats.totalSales} MAD`} icon={<TrendingUp className="text-[var(--accent)]" />} />
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
                        <td className="px-4 py-4 font-bold text-[var(--text)]">{order.amount} MAD</td>
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
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4 bg-[var(--card-bg)]/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[var(--text)] border border-[var(--border)]">
                      Stock: {product.stock}
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold text-lg mb-1 text-[var(--text)]">{product.name}</h4>
                    <p className="text-[var(--text-muted)] text-sm mb-4">{product.category}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--accent)] font-bold text-xl">{product.price} MAD</span>
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
