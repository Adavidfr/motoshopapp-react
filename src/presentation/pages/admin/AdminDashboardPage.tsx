// src/presentation/pages/admin/AdminDashboardPage.tsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bike, Tag, Bookmark, Archive,
  ShoppingCart, Receipt, CreditCard, FileText, BarChart2, Undo2,
  Settings, Wrench, Package, ShieldCheck,
  Truck, ClipboardList,
  Bell, Users, TrendingUp, DollarSign, AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: string;
}

function StatCard({ title, value, icon: Icon, color, trend }: StatCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-neutral-900/30 backdrop-blur-md p-5 flex items-center gap-4 ${color}`}>
      <div className="shrink-0 size-12 flex items-center justify-center rounded-xl bg-current/10 border border-current/20">
        <Icon className="size-5 text-current" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{title}</p>
        <p className="text-2xl font-black text-white mt-0.5">{value}</p>
        {trend && <p className="text-[10px] text-neutral-500 mt-0.5">{trend}</p>}
      </div>
      {/* Decorative glow */}
      <div className="absolute -right-4 -top-4 size-20 rounded-full bg-current opacity-5 blur-xl" />
    </div>
  );
}

// ─── Module Card ─────────────────────────────────────────────────────────────
interface ModuleCardProps {
  title: string;
  description: string;
  path: string;
  icon: React.ElementType;
  accent: string;
  badge?: string;
}

function ModuleCard({ title, description, path, icon: Icon, accent, badge }: ModuleCardProps) {
  return (
    <Link
      to={path}
      className="group relative flex flex-col gap-3 rounded-2xl border border-neutral-800/60 bg-neutral-900/20 p-5 hover:border-neutral-700 hover:bg-neutral-900/50 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between">
        <div className={`flex size-10 items-center justify-center rounded-xl border ${accent} transition-all duration-200 group-hover:scale-110`}>
          <Icon className="size-5" />
        </div>
        {badge && (
          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-black text-white uppercase tracking-wide group-hover:text-primary transition-colors">
          {title}
        </p>
        <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-neutral-600 group-hover:text-neutral-400 transition-colors">
        Gestionar
        <span className="translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
      </div>
    </Link>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ title, icon: Icon }: { title: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
        <Icon className="size-3.5 text-primary" />
      </div>
      <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-400">
        {title}
      </h2>
      <div className="flex-1 h-px bg-neutral-800/60" />
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const { user } = useAuthStore();

  useEffect(() => {
    document.title = 'Dashboard — Admin · Aura Rider';
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Hero greeting */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-1">
            {greeting}, {user?.username ?? 'Administrador'}
          </p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">
            Panel de Control
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Gestiona todos los módulos del sistema desde aquí.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
          <AlertCircle className="size-3.5 text-neutral-700" />
          {new Date().toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Módulos activos" value="18" icon={Settings} color="text-primary" trend="Sistema completo" />
        <StatCard title="Ventas" value="—" icon={TrendingUp} color="text-green-400" trend="Ver módulo" />
        <StatCard title="Pagos" value="—" icon={DollarSign} color="text-blue-400" trend="Ver módulo" />
        <StatCard title="Notificaciones" value="—" icon={Bell} color="text-yellow-400" trend="Ver módulo" />
      </div>

      {/* Catalogo */}
      <section>
        <SectionHeader title="Catálogo de productos" icon={Bike} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ModuleCard
            title="Motos"
            description="Gestiona el catálogo de motocicletas disponibles"
            path="/admin/motos"
            icon={Bike}
            accent="bg-red-500/10 border-red-500/20 text-red-400"
          />
          <ModuleCard
            title="Marcas"
            description="Administra las marcas de motos del catálogo"
            path="/admin/brands"
            icon={Tag}
            accent="bg-orange-500/10 border-orange-500/20 text-orange-400"
          />
          <ModuleCard
            title="Categorías"
            description="Organiza las categorías de productos"
            path="/admin/categories"
            icon={Bookmark}
            accent="bg-amber-500/10 border-amber-500/20 text-amber-400"
          />
          <ModuleCard
            title="Inventario"
            description="Controla el stock y movimientos de inventario"
            path="/admin/inventory"
            icon={Archive}
            accent="bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
          />
        </div>
      </section>

      {/* Ventas */}
      <section>
        <SectionHeader title="Módulo de ventas" icon={ShoppingCart} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <ModuleCard
            title="Ventas"
            description="Registro y seguimiento de ventas"
            path="/admin/ventas"
            icon={ShoppingCart}
            accent="bg-green-500/10 border-green-500/20 text-green-400"
          />
          <ModuleCard
            title="Facturas"
            description="Gestión de facturas emitidas"
            path="/admin/facturas"
            icon={Receipt}
            accent="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          />
          <ModuleCard
            title="Pagos"
            description="Control de pagos y métodos"
            path="/admin/pagos"
            icon={CreditCard}
            accent="bg-teal-500/10 border-teal-500/20 text-teal-400"
          />
          <ModuleCard
            title="Documentos"
            description="Documentos asociados a ventas"
            path="/admin/documentos-venta"
            icon={FileText}
            accent="bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
          />
          <ModuleCard
            title="Financiamientos"
            description="Planes de financiamiento de motos"
            path="/admin/financiamientos"
            icon={BarChart2}
            accent="bg-sky-500/10 border-sky-500/20 text-sky-400"
          />
          <ModuleCard
            title="Devoluciones"
            description="Solicitudes y reembolsos de ventas"
            path="/admin/devoluciones"
            icon={Undo2}
            accent="bg-blue-500/10 border-blue-500/20 text-blue-400"
          />
        </div>
      </section>

      {/* Servicio */}
      <section>
        <SectionHeader title="Servicio técnico" icon={Wrench} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <ModuleCard
            title="Servicios"
            description="Catálogo de servicios de taller"
            path="/admin/servicios"
            icon={Settings}
            accent="bg-violet-500/10 border-violet-500/20 text-violet-400"
          />
          <ModuleCard
            title="Mantenimientos"
            description="Órdenes y seguimiento de mantenimientos"
            path="/admin/mantenimientos"
            icon={Wrench}
            accent="bg-purple-500/10 border-purple-500/20 text-purple-400"
          />
          <ModuleCard
            title="Repuestos"
            description="Repuestos usados en mantenimientos"
            path="/admin/repuestos-mantenimiento"
            icon={Package}
            accent="bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400"
          />
          <ModuleCard
            title="Garantías"
            description="Garantías de motos vendidas"
            path="/admin/garantias"
            icon={ShieldCheck}
            accent="bg-pink-500/10 border-pink-500/20 text-pink-400"
          />
          <ModuleCard
            title="Seguros"
            description="Pólizas de seguro asociadas"
            path="/admin/seguros"
            icon={ShieldCheck}
            accent="bg-rose-500/10 border-rose-500/20 text-rose-400"
          />
        </div>
      </section>

      {/* Compras */}
      <section>
        <SectionHeader title="Compras y proveedores" icon={Truck} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
          <ModuleCard
            title="Proveedores"
            description="Directorio de proveedores y contactos"
            path="/admin/proveedores"
            icon={Truck}
            accent="bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
          />
          <ModuleCard
            title="Compras"
            description="Órdenes de compra a proveedores"
            path="/admin/compras"
            icon={ClipboardList}
            accent="bg-slate-500/10 border-slate-500/20 text-slate-400"
          />
        </div>
      </section>

      {/* Reportes y usuarios */}
      <section>
        <SectionHeader title="Reportes y sistema" icon={BarChart2} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ModuleCard
            title="Historial Ventas"
            description="Estados e historial de ventas"
            path="/admin/historial-ventas"
            icon={ClipboardList}
            accent="bg-neutral-500/10 border-neutral-500/30 text-neutral-400"
          />
          <ModuleCard
            title="Notificaciones"
            description="Alertas y mensajes del sistema"
            path="/admin/notificaciones"
            icon={Bell}
            accent="bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
            badge="Nuevo"
          />
          <ModuleCard
            title="Usuarios"
            description="Gestión de cuentas y roles"
            path="/admin/users"
            icon={Users}
            accent="bg-neutral-500/10 border-neutral-500/30 text-neutral-400"
          />
          <ModuleCard
            title="Órdenes"
            description="Pedidos de clientes en el sistema"
            path="/admin/orders"
            icon={Package}
            accent="bg-neutral-500/10 border-neutral-500/30 text-neutral-400"
          />
        </div>
      </section>
    </div>
  );
}
