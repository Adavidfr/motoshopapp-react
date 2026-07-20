// src/presentation/components/AdminLayout.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import {
  LayoutDashboard,
  Bike,
  Tag,
  Bookmark,
  Users,
  Package,
  Wrench,
  ShoppingCart,
  ClipboardList,
  Truck,
  Settings,
  BarChart2,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
  FileText,
  Receipt,
  ShieldCheck,
  Undo2,
  Bell,
  CreditCard,
  ToggleRight,
  Archive,
  Sun,
  Moon,
} from 'lucide-react';

// ─── Navigation structure ───────────────────────────────────────────────────
interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Catálogo',
    icon: Bike,
    items: [
      { label: 'Motos', path: '/admin/motos', icon: Bike },
      { label: 'Marcas', path: '/admin/brands', icon: Tag },
      { label: 'Categorías', path: '/admin/categories', icon: Bookmark },
      { label: 'Inventario', path: '/admin/inventory', icon: Archive },
    ],
  },
  {
    label: 'Ventas',
    icon: ShoppingCart,
    items: [
      { label: 'Ventas', path: '/admin/ventas', icon: ShoppingCart },
      { label: 'Facturas', path: '/admin/facturas', icon: Receipt },
      { label: 'Pagos', path: '/admin/pagos', icon: CreditCard },
      { label: 'Documentos', path: '/admin/documentos-venta', icon: FileText },
      { label: 'Financiamientos', path: '/admin/financiamientos', icon: BarChart2 },
      { label: 'Devoluciones', path: '/admin/devoluciones', icon: Undo2 },
    ],
  },
  {
    label: 'Servicio Técnico',
    icon: Wrench,
    items: [
      { label: 'Servicios', path: '/admin/servicios', icon: Settings },
      { label: 'Mantenimientos', path: '/admin/mantenimientos', icon: Wrench },
      { label: 'Repuestos usados', path: '/admin/repuestos-mantenimiento', icon: Package },
      { label: 'Garantías', path: '/admin/garantias', icon: ShieldCheck },
      { label: 'Seguros', path: '/admin/seguros', icon: ShieldCheck },
    ],
  },
  {
    label: 'Compras',
    icon: Truck,
    items: [
      { label: 'Proveedores', path: '/admin/proveedores', icon: Truck },
      { label: 'Compras', path: '/admin/compras', icon: ClipboardList },
    ],
  },
  {
    label: 'Reportes',
    icon: BarChart2,
    items: [
      { label: 'Historial Ventas', path: '/admin/historial-ventas', icon: ClipboardList },
      { label: 'Notificaciones', path: '/admin/notificaciones', icon: Bell },
    ],
  },
  {
    label: 'Usuarios',
    icon: Users,
    items: [
      { label: 'Usuarios', path: '/admin/users', icon: Users },
      { label: 'Órdenes', path: '/admin/orders', icon: Package },
    ],
  },
];

// ─── Sidebar ────────────────────────────────────────────────────────────────
interface SidebarProps {
  onClose?: () => void;
}

function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    // Auto-open the group that contains the current path
    const initial: Record<string, boolean> = {};
    NAV_GROUPS.forEach((g) => {
      if (g.items.some((i) => location.pathname.startsWith(i.path))) {
        initial[g.label] = true;
      }
    });
    return initial;
  });

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path: string) =>
    location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside className="admin-sidebar flex h-full flex-col bg-[#080809] border-r border-neutral-900">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-neutral-900">
        <Link to="/admin" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Aura Rider Logo"
            className="h-9 w-9 rounded-full border border-neutral-700/50 object-cover"
          />
          <span className="text-sm font-black uppercase tracking-tighter text-white">
            AURA<span className="text-primary">RIDER</span>
          </span>
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-500 hover:text-white transition-colors lg:hidden"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
        {/* Dashboard link */}
        <Link
          to="/admin"
          onClick={onClose}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
            location.pathname === '/admin'
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'text-neutral-400 hover:bg-neutral-900 hover:text-white border border-transparent'
          }`}
        >
          <LayoutDashboard className="size-4 shrink-0" />
          Dashboard
        </Link>

        {/* Groups */}
        {NAV_GROUPS.map((group) => {
          const isOpen = openGroups[group.label] ?? false;
          const GroupIcon = group.icon;
          const hasActive = group.items.some((i) => isActive(i.path));

          return (
            <div key={group.label}>
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  hasActive && !isOpen
                    ? 'text-primary border border-transparent'
                    : 'text-neutral-500 hover:text-neutral-200 border border-transparent'
                }`}
              >
                <GroupIcon className="size-4 shrink-0" />
                <span className="flex-1 text-left">{group.label}</span>
                {isOpen ? (
                  <ChevronDown className="size-3.5 text-neutral-600" />
                ) : (
                  <ChevronRight className="size-3.5 text-neutral-600" />
                )}
              </button>

              {isOpen && (
                <div className="ml-4 mt-1 space-y-0.5 border-l border-neutral-800 pl-3">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all duration-150 ${
                          active
                            ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_12px_rgba(239,68,68,0.08)]'
                            : 'text-neutral-500 hover:bg-neutral-900/60 hover:text-white border border-transparent'
                        }`}
                      >
                        <ItemIcon className="size-3.5 shrink-0" />
                        {item.label}
                        {active && (
                          <span className="ml-auto size-1.5 rounded-full bg-primary" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-neutral-900 p-4 space-y-3">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs text-neutral-500 hover:text-white transition-colors font-semibold"
        >
          <ToggleRight className="size-4" />
          Volver al sitio
        </Link>
        <div className="flex items-center gap-3 px-1">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-xs uppercase shrink-0">
            {user?.username?.[0] ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.username ?? 'Admin'}</p>
            <p className="text-[10px] text-neutral-500 truncate">{user?.email ?? ''}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Cerrar sesión"
            className="text-neutral-500 hover:text-red-400 transition-colors"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─── AdminLayout ─────────────────────────────────────────────────────────────
interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return 'dark'; // Default premium dark theme
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  // Get page title from current path
  const currentItem = NAV_GROUPS.flatMap((g) => g.items).find(
    (i) => location.pathname === i.path || location.pathname.startsWith(i.path + '/')
  );
  const pageTitle = location.pathname === '/admin' ? 'Dashboard' : (currentItem?.label ?? 'Admin');

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-500">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-60 xl:w-64 shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 animate-in slide-in-from-left duration-300">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <header className="shrink-0 flex items-center gap-4 px-5 py-4 bg-card border-b border-border transition-colors duration-300 lg:px-7">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-neutral-400 hover:text-card-foreground transition-colors"
          >
            <Menu className="size-5" />
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Panel Administrativo
            </p>
            <h1 className="text-base font-black uppercase tracking-tight text-card-foreground">
              {pageTitle}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Cambiar tema"
            className="flex items-center justify-center size-9 rounded-full bg-neutral-100/10 hover:bg-neutral-100/20 dark:bg-neutral-900/50 dark:hover:bg-neutral-900 border border-neutral-700/30 dark:border-neutral-800 text-neutral-400 hover:text-white hover:scale-105 hover:rotate-12 transition-all duration-300 cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="size-4 text-amber-500" /> : <Moon className="size-4 text-indigo-400" />}
          </button>

          <Link
            to="/"
            className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors border border-neutral-800 rounded-full px-3 py-1.5 hover:border-neutral-700"
          >
            ← Sitio web
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-7 xl:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
