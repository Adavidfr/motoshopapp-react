import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, ShoppingCart, User, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuthStore } from '../store/auth.store';
import { useCartStore } from '../store/cart.store';
import { canUseCart } from '../utils/can-use-cart';
import { Button } from './ui/button';
import BrandWordmark from './BrandWordmark';
import { httpClient } from '../../infrastructure/http/axios-client';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const { isAuthenticated, user, logout, initialize } = useAuthStore();
  const { cart, fetchActiveCart } = useCartStore();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const clientCanUseCart = canUseCart(isAuthenticated, user);

  useEffect(() => {
    if (clientCanUseCart) {
      void fetchActiveCart();
    }
  }, [clientCanUseCart, fetchActiveCart]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;
  const isAdminActive = (path: string) => location.pathname.startsWith(path);
  const isRepuestosActive =
    location.pathname === '/repuestos' || location.pathname.startsWith('/repuestos/');

  const handleSubscribeNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || newsletterStatus === 'loading') return;

    setNewsletterStatus('loading');
    try {
      await httpClient.post('/newsletter/subscribe/', { email: newsletterEmail });
      setNewsletterStatus('success');
      setNewsletterEmail('');
    } catch {
      setNewsletterStatus('error');
      setTimeout(() => setNewsletterStatus('idle'), 3000);
    }
  };

  const navItems = [
    { to: '/', label: 'Inicio', active: isActive('/') },
    { to: '/catalog', label: 'Modelos', active: isActive('/catalog') },
    { to: '/repuestos', label: 'Repuestos', active: isRepuestosActive },
    ...(clientCanUseCart ? [{ to: '/orders', label: 'Mis Pedidos', active: isActive('/orders') }] : []),
    ...(isAuthenticated && user?.isStaff
      ? [{ to: '/admin', label: 'Panel Admin', active: isAdminActive('/admin') }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/[0.06]">
        <div className="container mx-auto flex h-[76px] max-w-screen-2xl items-center justify-between px-6 lg:px-12">
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <img
              src="/logo.png"
              alt=""
              className="h-9 w-9 object-contain transition-transform duration-500 group-hover:scale-105"
            />
            <BrandWordmark />
          </Link>

          <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-[11px] font-medium uppercase tracking-[0.22em] transition-colors duration-500 ${
                  item.active ? 'text-white' : 'text-white/45 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {clientCanUseCart && (
                  <Link
                    to="/cart"
                    className="relative flex size-9 items-center justify-center text-white/45 hover:text-white transition-colors"
                  >
                    <ShoppingCart className="size-4" />
                    {cart && cart.numItems > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-white px-1">
                        {cart.numItems}
                      </span>
                    )}
                  </Link>
                )}

                <Link
                  to="/profile"
                  className="hidden md:flex items-center gap-2 px-2 text-white/45 hover:text-white transition-colors"
                >
                  <User className="size-4" />
                  <span className="text-[11px] uppercase tracking-[0.15em]">{user?.username}</span>
                </Link>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleLogout}
                  className="size-9 text-white/45 hover:text-primary"
                >
                  <LogOut className="size-4" />
                </Button>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-[11px] uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link to="/register" className="premium-btn !px-5 !py-2.5">
                  Registrarse
                </Link>
              </div>
            )}

            <button
              type="button"
              className="lg:hidden flex size-9 items-center justify-center text-white/70"
              aria-label="Menú"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-white/[0.06] overflow-hidden"
            >
              <nav className="flex flex-col px-6 py-4 gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`py-3 text-[11px] uppercase tracking-[0.2em] ${
                      item.active ? 'text-white' : 'text-white/50'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <>
                    <Link to="/login" className="py-3 text-[11px] uppercase tracking-[0.2em] text-white/50">
                      Iniciar sesión
                    </Link>
                    <Link to="/register" className="py-3 text-[11px] uppercase tracking-[0.2em] text-primary">
                      Registrarse
                    </Link>
                  </>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-auto border-t border-white/[0.06] bg-[#080808] pt-20 pb-10">
        <div className="container mx-auto max-w-screen-2xl px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 mb-16">
            <div className="lg:col-span-4 space-y-6">
              <Link to="/" className="inline-flex items-center gap-3">
                <img src="/logo.png" alt="" className="h-10 w-10 object-contain" />
                <BrandWordmark size="md" />
              </Link>
              <p className="text-sm text-white/45 font-light leading-relaxed max-w-sm">
                Motocicletas de alta gama y una experiencia digital pensada para quienes exigen
                precisión, carácter y exclusividad.
              </p>
              <div className="flex flex-wrap gap-4 text-[10px] uppercase tracking-[0.2em] text-white/40">
                {['Instagram', 'Facebook', 'YouTube'].map((s) => (
                  <a key={s} href="#" className="hover:text-primary transition-colors">
                    {s}
                  </a>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-8">
              {[
                {
                  title: 'Modelos',
                  links: [
                    { label: 'Catálogo', to: '/catalog' },
                    { label: 'Repuestos', to: '/repuestos' },
                    { label: 'Inicio', to: '/' },
                  ],
                },
                {
                  title: 'Experiencia',
                  links: [
                    { label: 'Mis pedidos', to: '/orders' },
                    { label: 'Perfil', to: '/profile' },
                    { label: 'Carrito', to: '/cart' },
                  ],
                },
                {
                  title: 'Soporte',
                  links: [
                    { label: 'Login', to: '/login' },
                    { label: 'Registro', to: '/register' },
                    { label: 'Admin', to: '/admin' },
                  ],
                },
              ].map((col) => (
                <div key={col.title} className="space-y-4">
                  <h4 className="text-[11px] uppercase tracking-[0.22em] text-white">{col.title}</h4>
                  <ul className="space-y-2.5">
                    {col.links.map((link) => (
                      <li key={link.to}>
                        <Link
                          to={link.to}
                          className="text-sm text-white/45 hover:text-primary transition-colors font-light"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="lg:col-span-3">
              <h4 className="text-[11px] uppercase tracking-[0.22em] text-white mb-4">Suscríbete</h4>
              {newsletterStatus === 'success' ? (
                <p className="text-sm text-emerald-400">Gracias por unirte.</p>
              ) : (
                <form onSubmit={handleSubscribeNewsletter} className="relative border-b border-white/20 pb-2">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Tu correo"
                    className="w-full bg-transparent pr-10 py-2 text-sm text-white placeholder:text-white/30 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={newsletterStatus === 'loading'}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-primary text-lg leading-none disabled:opacity-50"
                    aria-label="Suscribirse"
                  >
                    →
                  </button>
                  {newsletterStatus === 'error' && (
                    <p className="text-xs text-destructive mt-2">No se pudo suscribir. Intenta de nuevo.</p>
                  )}
                </form>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/[0.06] pt-8">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
              © 2026 Aura Rider. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-5 text-[10px] uppercase tracking-[0.18em] text-white/35">
              <span>Términos</span>
              <span>Privacidad</span>
              <span>Cookies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
