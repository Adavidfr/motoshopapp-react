// src/presentation/components/Layout.tsx
import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Search, ShoppingCart, User } from 'lucide-react';

import { useAuthStore } from '../store/auth.store';
import { useCartStore } from '../store/cart.store';
import { Button } from './ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    isAuthenticated,
    user,
    logout,
    initialize,
  } = useAuthStore();

  const {
    cart,
    fetchActiveCart,
  } = useCartStore();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      void fetchActiveCart();
    }
  }, [isAuthenticated, fetchActiveCart]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) =>
    location.pathname === path;

  const isAdminActive = (path: string) =>
    location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full bg-[#070708] border-b border-neutral-900 shadow-lg">
        <div className="container mx-auto flex h-20 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Aura Rider Logo"
                className="h-12 w-12 rounded-full border border-neutral-700/50 object-cover"
              />

              <span className="text-xl font-black uppercase tracking-tighter text-white">
                AURA
                <span className="text-primary">RIDER</span>
              </span>
            </Link>

            <nav className="hidden items-center space-x-8 text-xs font-bold uppercase tracking-widest text-neutral-300 lg:flex">
              <Link
                to="/"
                className={`border-b-2 pb-1 transition-colors hover:text-white ${
                  isActive('/')
                    ? 'border-primary text-white'
                    : 'border-transparent text-neutral-400'
                }`}
              >
                Inicio
              </Link>

              <Link
                to="/catalog"
                className={`border-b-2 pb-1 transition-colors hover:text-white ${
                  isActive('/catalog')
                    ? 'border-primary text-white'
                    : 'border-transparent text-neutral-400'
                }`}
              >
                Motos
              </Link>

              <Link
                to="/repuestos"
                className={`border-b-2 pb-1 transition-colors hover:text-white ${
                  isActive('/repuestos')
                    ? 'border-primary text-white'
                    : 'border-transparent text-neutral-400'
                }`}
              >
                Repuestos
              </Link>

              {isAuthenticated && (
                <Link
                  to="/orders"
                  className={`border-b-2 pb-1 transition-colors hover:text-white ${
                    isActive('/orders')
                      ? 'border-primary text-white'
                      : 'border-transparent text-neutral-400'
                  }`}
                >
                  Mis pedidos
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
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-5">
            <button
              type="button"
              aria-label="Buscar"
              className="p-1 text-neutral-400 transition-colors hover:text-white"
            >
              <Search className="size-5" />
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  to="/cart"
                  className="relative p-1 text-neutral-400 transition-colors hover:text-white"
                >
                  <ShoppingCart className="size-5" />

                  {cart && cart.numItems > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-black text-white">
                      {cart.numItems}
                    </span>
                  )}
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-1 text-xs font-bold uppercase tracking-wider text-neutral-400 transition-colors hover:text-white"
                >
                  <User className="size-5 text-primary" />
                  <span className="hidden md:inline">
                    {user?.username}
                  </span>
                </Link>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleLogout}
                  className="text-neutral-400 transition-all hover:text-primary"
                >
                  <LogOut className="size-5" />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-xs font-bold uppercase tracking-widest text-neutral-400 transition-colors hover:text-white"
                >
                  Iniciar sesión
                </Link>

                <Link to="/register">
                  <Button
                    variant="default"
                    size="sm"
                    className="rounded-none bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-primary/95"
                  >
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="mt-auto border-t border-neutral-900 bg-[#070708] py-12 text-xs text-neutral-400">
        <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6">
          <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="Aura Rider Logo"
                  className="h-8 w-8 rounded-full object-cover"
                />

                <span className="text-lg font-black uppercase tracking-tighter text-white">
                  AURA
                  <span className="text-primary">RIDER</span>
                </span>
              </Link>

              <p className="leading-relaxed text-neutral-500">
                Libertad sin límites.
                <br />
                El camino es tuyo.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-white">
                Motos
              </h4>

              <ul className="space-y-2 font-semibold text-neutral-500">
                <li><Link to="/" className="hover:text-primary">Sport</Link></li>
                <li><Link to="/" className="hover:text-primary">Naked</Link></li>
                <li><Link to="/" className="hover:text-primary">Aventura</Link></li>
                <li><Link to="/" className="hover:text-primary">Recreativa</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-white">
                Servicios
              </h4>

              <ul className="space-y-2 font-semibold text-neutral-500">
                <li><span className="cursor-pointer hover:text-primary">Mantenimiento</span></li>
                <li><span className="cursor-pointer hover:text-primary">Servicio técnico</span></li>
                <li><span className="cursor-pointer hover:text-primary">Garantía</span></li>
                <li><span className="cursor-pointer hover:text-primary">Financiamiento</span></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-white">
                Ayuda
              </h4>

              <ul className="space-y-2 font-semibold text-neutral-500">
                <li><span className="cursor-pointer hover:text-primary">Preguntas frecuentes</span></li>
                <li><span className="cursor-pointer hover:text-primary">Envíos</span></li>
                <li><span className="cursor-pointer hover:text-primary">Cambios y devoluciones</span></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-neutral-900 pt-6 font-semibold text-neutral-600 md:flex-row">
            <p>© 2026 Aura Rider. Todos los derechos reservados.</p>

            <div className="flex items-center gap-7 opacity-75 transition-opacity duration-300 hover:opacity-100">
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
