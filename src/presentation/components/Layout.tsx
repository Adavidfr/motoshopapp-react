// src/presentation/components/Layout.tsx
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, LogOut, Menu, X, LayoutGrid, Settings, ShieldCheck, Box, Wrench, Shield, CreditCard, Receipt, FileText, History, RefreshCcw, Bell } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { useCartStore } from '../store/cart.store';
import { Button } from './ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout, initialize } = useAuthStore();
  const { cart, fetchActiveCart } = useCartStore();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchActiveCart();
    }
  }, [isAuthenticated, fetchActiveCart]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;
  const isAdminActive = (pathPrefix: string) => location.pathname.startsWith(pathPrefix);

  const SidebarLink = ({ to, label, icon: Icon, checkAdmin = false }: { to: string, label: string, icon?: any, checkAdmin?: boolean }) => {
    const active = checkAdmin ? isAdminActive(to) : isActive(to);
    return (
      <Link
        to={to}
        onClick={() => setIsSidebarOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-bold tracking-wide ${
          active 
            ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
            : 'text-neutral-400 hover:bg-neutral-900 hover:text-white border border-transparent'
        }`}
      >
        {Icon && <Icon className={`size-4 ${active ? 'text-primary' : 'text-neutral-500'}`} />}
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      
      {/* Sidebar Drawer */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <aside 
        className={`fixed inset-y-0 left-0 z-[70] w-72 bg-[#070708] border-r border-neutral-900 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-neutral-900 h-20 shrink-0">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Aura Rider" className="h-8 w-8 object-cover rounded-full border border-neutral-700/50" />
            <span className="uppercase font-black text-lg tracking-tighter text-white">Módulos</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 -mr-2 text-neutral-400 hover:text-white transition-colors bg-neutral-900/50 hover:bg-neutral-800 rounded-full">
            <X className="size-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5 custom-scrollbar">
          
          <div className="px-3 pb-2 pt-1 text-[10px] font-black uppercase text-neutral-500 tracking-widest">Tienda</div>
          <SidebarLink to="/catalog" label="Motos" icon={LayoutGrid} />
          <SidebarLink to="/repuestos" label="Repuestos" icon={Settings} />
          
          {isAuthenticated && (
            <SidebarLink to="/orders" label="Mis Pedidos" icon={ShoppingCart} />
          )}

          {isAuthenticated && user?.isStaff && (
            <>
              <div className="px-3 pb-2 pt-6 text-[10px] font-black uppercase text-neutral-500 tracking-widest">Administración</div>
              <SidebarLink to="/admin/proveedores" label="Proveedores" icon={ShieldCheck} checkAdmin />
              <SidebarLink to="/admin/servicios" label="Servicios" icon={Wrench} checkAdmin />
              <SidebarLink to="/admin/compras" label="Compras" icon={ShoppingCart} checkAdmin />
              <SidebarLink to="/admin/mantenimientos" label="Mantenimientos" icon={Wrench} checkAdmin />
              <SidebarLink to="/admin/repuestos-mantenimiento" label="Repuestos Usados" icon={Settings} checkAdmin />
              <SidebarLink to="/admin/ventas" label="Ventas" icon={Box} checkAdmin />
              <SidebarLink to="/admin/financiamientos" label="Financiamientos" icon={CreditCard} checkAdmin />
              <SidebarLink to="/admin/pagos" label="Pagos" icon={CreditCard} checkAdmin />
              <SidebarLink to="/admin/facturas" label="Facturas" icon={Receipt} checkAdmin />
              <SidebarLink to="/admin/garantias" label="Garantías" icon={Shield} checkAdmin />
              <SidebarLink to="/admin/seguros" label="Seguros" icon={ShieldCheck} checkAdmin />
              <SidebarLink to="/admin/documentos-venta" label="Documentos" icon={FileText} checkAdmin />
              <SidebarLink to="/admin/historial-ventas" label="Historial Ventas" icon={History} checkAdmin />
              <SidebarLink to="/admin/devoluciones" label="Devoluciones" icon={RefreshCcw} checkAdmin />
              <SidebarLink to="/admin/notificaciones" label="Notificaciones" icon={Bell} checkAdmin />
            </>
          )}
        </div>
      </aside>

      {/* Header Premium */}
      <header className="sticky top-0 z-50 w-full bg-[#070708] border-b border-neutral-900 shadow-lg">
        <div className="container mx-auto flex h-20 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
          
          {/* Logo y Menú Lateral */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 -ml-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-xl transition-all"
            >
              <Menu className="size-6" />
            </button>

            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="Aura Rider Logo" className="h-10 w-10 sm:h-12 sm:w-12 object-cover rounded-full border border-neutral-700/50" />
              <span className="uppercase font-black text-lg sm:text-xl tracking-tighter text-white">AURA<span className="text-primary">RIDER</span></span>
            </Link>
            
            {/* Solo Inicio arriba (Desktop) */}
            <nav className="hidden lg:flex items-center space-x-8 text-xs font-bold uppercase tracking-widest text-neutral-300 ml-4">
              <Link 
                to="/" 
                className={`pb-1 transition-colors hover:text-white border-b-2 ${
                  isActive('/') ? 'border-primary text-white' : 'border-transparent text-neutral-400'
                }`}
              >
                Inicio
              </Link>
            </nav>
          </div>

          {/* Iconos de la derecha */}
          <div className="flex items-center gap-3 sm:gap-5">
            <button className="text-neutral-400 hover:text-white transition-colors p-2">
              <Search className="size-5" />
            </button>

            {isAuthenticated ? (
              <>
                <Link to="/cart" className="relative text-neutral-400 hover:text-white transition-colors p-2">
                  <ShoppingCart className="size-5" />
                  {cart && cart.numItems > 0 && (
                    <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-black text-white">
                      {cart.numItems}
                    </span>
                  )}
                </Link>
                <Link to="/profile" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors p-2 text-xs font-bold uppercase tracking-wider">
                  <User className="size-5 text-primary" />
                  <span className="hidden md:inline">{user?.username}</span>
                </Link>
                <Button variant="ghost" size="icon-sm" onClick={handleLogout} className="text-neutral-400 hover:text-primary transition-all">
                  <LogOut className="size-5" />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link to="/login" className="text-neutral-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest hidden sm:block">
                  Iniciar Sesión
                </Link>
                <Link to="/register">
                  <Button variant="default" size="sm" className="bg-primary hover:bg-primary/95 text-white font-bold text-[10px] sm:text-xs uppercase tracking-widest px-4 sm:px-5 py-2.5 rounded-none">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#070708] border-t border-neutral-900 py-12 text-neutral-400 text-xs mt-auto">
        <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-3">
                <img src="/logo.png" alt="Aura Rider Logo" className="h-8 w-8 object-cover rounded-full" />
                <span className="uppercase font-black text-lg tracking-tighter text-white">AURA<span className="text-primary">RIDER</span></span>
              </Link>
              <p className="text-neutral-500 leading-relaxed">
                Libertad sin límites.<br />El camino es tuyo.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-white font-bold uppercase tracking-widest text-[10px]">Motos</h4>
              <ul className="space-y-2 text-neutral-500 font-semibold">
                <li><Link to="/" className="hover:text-primary">Sport</Link></li>
                <li><Link to="/" className="hover:text-primary">Naked</Link></li>
                <li><Link to="/" className="hover:text-primary">Aventura</Link></li>
                <li><Link to="/" className="hover:text-primary">Recreativa</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-white font-bold uppercase tracking-widest text-[10px]">Servicios</h4>
              <ul className="space-y-2 text-neutral-500 font-semibold">
                <li><span className="hover:text-primary cursor-pointer">Mantenimiento</span></li>
                <li><span className="hover:text-primary cursor-pointer">Servicio Técnico</span></li>
                <li><span className="hover:text-primary cursor-pointer">Garantía</span></li>
                <li><span className="hover:text-primary cursor-pointer">Financiamiento</span></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-white font-bold uppercase tracking-widest text-[10px]">Ayuda</h4>
              <ul className="space-y-2 text-neutral-500 font-semibold">
                <li><span className="hover:text-primary cursor-pointer">Preguntas Frecuentes</span></li>
                <li><span className="hover:text-primary cursor-pointer">Envíos</span></li>
                <li><span className="hover:text-primary cursor-pointer">Cambios y Devoluciones</span></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-900 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-neutral-600 font-semibold">
            <p>© 2026 Aura Rider. Todos los derechos reservados.</p>
            <div className="flex items-center gap-7 opacity-75 hover:opacity-100 transition-opacity duration-300">
              <img src="/visa_logo.png" alt="Visa" className="h-5 w-auto object-contain brightness-0 invert" />
              <img src="/mastercard_logo.png" alt="Mastercard" className="h-6 w-auto object-contain" />
              <img src="/diners_logo.png" alt="Diners Club" className="h-5 w-auto object-contain brightness-0 invert" />
              <img src="/discover_logo.png" alt="Discover" className="h-4 w-auto object-contain brightness-0 invert" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
