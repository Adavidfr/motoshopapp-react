// src/presentation/components/Layout.tsx
import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, LogOut } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header Premium - Dark charcoal style */}
      <header className="sticky top-0 z-50 w-full bg-[#070708] border-b border-neutral-900 shadow-lg">
        <div className="container mx-auto flex h-20 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
          
          {/* Logo */}
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="Aura Rider Logo" className="h-12 w-12 object-cover rounded-full border border-neutral-700/50" />
              <span className="uppercase font-black text-xl tracking-tighter text-white">AURA<span className="text-primary">RIDER</span></span>
            </Link>
            
            {/* Links de navegación */}
            <nav className="hidden lg:flex items-center space-x-8 text-xs font-bold uppercase tracking-widest text-neutral-300">
              <Link 
                to="/" 
                className={`pb-1 transition-colors hover:text-white border-b-2 ${
                  isActive('/') ? 'border-primary text-white' : 'border-transparent text-neutral-400'
                }`}
              >
                Inicio
              </Link>
              <Link 
                to="/" 
                className={`pb-1 transition-colors hover:text-white border-b-2 ${
                  isActive('/catalog') ? 'border-primary text-white' : 'border-transparent text-neutral-400'
                }`}
              >
                Motos
              </Link>
              <Link 
                to="/repuestos" 
                className={`pb-1 transition-colors hover:text-white border-b-2 ${
                  isActive('/repuestos') ? 'border-primary text-white' : 'border-transparent text-neutral-400'
                }`}
              >
                Repuestos
              </Link>
              {isAuthenticated && (
                <Link 
                  to="/orders" 
                  className={`pb-1 transition-colors hover:text-white border-b-2 ${
                    isActive('/orders') ? 'border-primary text-white' : 'border-transparent text-neutral-400'
                  }`}
                >
                  Mis Pedidos
                </Link>
              )}
              {isAuthenticated && user?.isStaff && (
                <>
                  <Link
                    to="/admin/proveedores"
                    className={`border-b-2 pb-1 transition-colors hover:text-white ${
                      isAdminActive('/admin/proveedores')
                        ? 'border-primary text-white'
                        : 'border-transparent text-neutral-400'
                    }`}
                  >
                    Proveedores
                  </Link>

                  <Link
                    to="/admin/servicios"
                    className={`border-b-2 pb-1 transition-colors hover:text-white ${
                      isAdminActive('/admin/servicios')
                        ? 'border-primary text-white'
                        : 'border-transparent text-neutral-400'
                    }`}
                  >
                    Servicios
                  </Link>

                  <Link
                    to="/admin/compras"
                    className={`border-b-2 pb-1 transition-colors hover:text-white ${
                      isAdminActive('/admin/compras')
                        ? 'border-primary text-white'
                        : 'border-transparent text-neutral-400'
                    }`}
                  >
                    Compras
                  </Link>

                  <Link
                    to="/admin/mantenimientos"
                    className={`border-b-2 pb-1 transition-colors hover:text-white ${
                      isAdminActive('/admin/mantenimientos')
                        ? 'border-primary text-white'
                        : 'border-transparent text-neutral-400'
                    }`}
                  >
                    Mantenimientos
                  </Link>

                  <Link
                    to="/admin/repuestos-mantenimiento"
                    className={`border-b-2 pb-1 transition-colors hover:text-white ${
                      isAdminActive('/admin/repuestos-mantenimiento')
                        ? 'border-primary text-white'
                        : 'border-transparent text-neutral-400'
                    }`}
                  >
                    Repuestos usados
                  </Link>

                  <Link
                    to="/admin/ventas"
                    className={`border-b-2 pb-1 transition-colors hover:text-white ${
                      isAdminActive('/admin/ventas')
                        ? 'border-primary text-white'
                        : 'border-transparent text-neutral-400'
                    }`}
                  >
                    Ventas
                  </Link>

                  <Link
                    to="/admin/financiamientos"
                    className={`border-b-2 pb-1 transition-colors hover:text-white ${
                      isAdminActive('/admin/financiamientos')
                        ? 'border-primary text-white'
                        : 'border-transparent text-neutral-400'
                    }`}
                  >
                    Financiamientos
                  </Link>

                  <Link
                    to="/admin/pagos"
                    className={`border-b-2 pb-1 transition-colors hover:text-white ${
                      isAdminActive('/admin/pagos')
                        ? 'border-primary text-white'
                        : 'border-transparent text-neutral-400'
                    }`}
                  >
                    Pagos
                  </Link>

                  <Link
                    to="/admin/facturas"
                    className={`border-b-2 pb-1 transition-colors hover:text-white ${
                      isAdminActive('/admin/facturas')
                        ? 'border-primary text-white'
                        : 'border-transparent text-neutral-400'
                    }`}
                  >
                    Facturas
                  </Link>

                  <Link
                    to="/admin/garantias"
                    className={`border-b-2 pb-1 transition-colors hover:text-white ${
                      isAdminActive('/admin/garantias')
                        ? 'border-primary text-white'
                        : 'border-transparent text-neutral-400'
                    }`}
                  >
                    Garantías
                  </Link>

                  <Link
                    to="/admin/seguros"
                    className={`border-b-2 pb-1 transition-colors hover:text-white ${
                      isAdminActive('/admin/seguros')
                        ? 'border-primary text-white'
                        : 'border-transparent text-neutral-400'
                    }`}
                  >
                    Seguros
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Iconos de la derecha */}
          <div className="flex items-center gap-5">
            <button className="text-neutral-400 hover:text-white transition-colors p-1">
              <Search className="size-5" />
            </button>

            {isAuthenticated ? (
              <>
                <Link to="/cart" className="relative text-neutral-400 hover:text-white transition-colors p-1">
                  <ShoppingCart className="size-5" />
                  {cart && cart.numItems > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-black text-white">
                      {cart.numItems}
                    </span>
                  )}
                </Link>
                <Link to="/profile" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors p-1 text-xs font-bold uppercase tracking-wider">
                  <User className="size-5 text-primary" />
                  <span className="hidden md:inline">{user?.username}</span>
                </Link>
                <Button variant="ghost" size="icon-sm" onClick={handleLogout} className="text-neutral-400 hover:text-primary transition-all">
                  <LogOut className="size-5" />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-neutral-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                  Iniciar Sesión
                </Link>
                <Link to="/register">
                  <Button variant="default" size="sm" className="bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-none">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
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
