// src/presentation/components/AdminLayout.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import BrandWordmark from './BrandWordmark';
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
  Cog,
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
      { label: 'Administrar Repuestos', path: '/admin/repuestos', icon: Cog },
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
    <aside className="admin-sidebar flex h-full flex-col bg-[#080808] border-r border-white/[0.06]">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-6 border-b border-white/[0.06]">
        <Link to="/admin" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt=""
            className="h-9 w-9 object-contain"
          />
          <BrandWordmark />
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors lg:hidden"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1 scrollbar-thin">
        {/* Dashboard link */}
        <Link
          to="/admin"
          onClick={onClose}
          className={`flex items-center gap-3 px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.16em] transition-all duration-300 border ${
            location.pathname === '/admin'
              ? 'bg-primary/10 text-primary border-primary/25'
              : 'text-white/45 hover:bg-white/[0.04] hover:text-white border-transparent'
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.16em] transition-all duration-300 border border-transparent ${
                  hasActive && !isOpen
                    ? 'text-primary'
                    : 'text-white/40 hover:text-white/80'
                }`}
              >
                <GroupIcon className="size-4 shrink-0" />
                <span className="flex-1 text-left">{group.label}</span>
                {isOpen ? (
                  <ChevronDown className="size-3.5 text-white/30" />
                ) : (
                  <ChevronRight className="size-3.5 text-white/30" />
                )}
              </button>

              {isOpen && (
                <div className="ml-4 mt-1 space-y-0.5 border-l border-white/[0.08] pl-3">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={`flex items-center gap-2.5 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.12em] transition-all duration-200 border ${
                          active
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'text-white/40 hover:bg-white/[0.04] hover:text-white border-transparent'
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
      <div className="border-t border-white/[0.06] p-4 space-y-3">
        <Link
          to="/"
          className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-white/40 hover:text-white transition-colors"
        >
          <ToggleRight className="size-4" />
          Volver al sitio
        </Link>
        <div className="flex items-center gap-3 px-1">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold text-xs uppercase shrink-0">
            {user?.username?.[0] ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.username ?? 'Admin'}</p>
            <p className="text-[10px] text-white/35 truncate">{user?.email ?? ''}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Cerrar sesión"
            className="text-white/40 hover:text-primary transition-colors"
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
    <div className="flex h-screen overflow-hidden bg-[#080808] text-white">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-60 xl:w-64 shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 animate-in slide-in-from-left duration-300">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <header className="shrink-0 flex items-center gap-4 px-5 py-5 bg-[#080808] border-b border-white/[0.06] lg:px-8">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-white/45 hover:text-white transition-colors"
          >
            <Menu className="size-5" />
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-primary">
              Panel ejecutivo
            </p>
            <h1 className="font-display text-xl font-medium tracking-tight text-white">
              {pageTitle}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Cambiar tema"
            className="flex items-center justify-center size-9 border border-white/10 text-white/45 hover:text-white hover:border-white/25 transition-all duration-300"
          >
            {theme === 'dark' ? <Sun className="size-4 text-amber-500" /> : <Moon className="size-4" />}
          </button>

          <Link
            to="/"
            className="hidden sm:flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-white/40 hover:text-white transition-colors border border-white/10 px-3 py-2 hover:border-white/25"
          >
            ← Sitio web
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-5 lg:p-8 xl:p-10 bg-[#080808]">
          {children}
        </main>
      </div>
    </div>
  );
}
