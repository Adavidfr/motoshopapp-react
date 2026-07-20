import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Search, ShoppingCart, User, Sun, Moon } from 'lucide-react';

import { useAuthStore } from '../store/auth.store';
import { useCartStore } from '../store/cart.store';
import { Button } from './ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-500">
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#070708]/85 border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.4)] transition-all duration-500">
        {/* Top accent line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        <div className="container mx-auto flex h-[72px] max-w-screen-2xl items-center justify-between px-4 sm:px-6">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <img
                  src="/logo.png"
                  alt="Aura Rider Logo"
                  className="h-10 w-10 rounded-full border border-white/10 object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                />
                {/* Logo glow ring */}
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 scale-150" />
              </div>

              <span className="text-lg font-black uppercase tracking-tight text-white">
                AURA
                <span className="text-primary transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,26,26,0.6)]">RIDER</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              {[
                { to: '/', label: 'Inicio', active: isActive('/') },
                { to: '/catalog', label: 'Motos', active: isActive('/catalog') },
                ...(isAuthenticated ? [{ to: '/orders', label: 'Mis Pedidos', active: isActive('/orders') }] : []),
                ...(isAuthenticated && user?.isStaff ? [{ to: '/admin', label: 'Panel Admin', active: isAdminActive('/admin') }] : []),
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors duration-300 rounded-lg group/nav ${
                    item.active
                      ? 'text-white'
                      : 'text-neutral-500 hover:text-neutral-200'
                  }`}
                >
                  {/* Active/hover background pill */}
                  <span className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                    item.active
                      ? 'bg-white/[0.07]'
                      : 'bg-transparent group-hover/nav:bg-white/[0.04]'
                  }`} />
                  {/* Active indicator dot */}
                  {item.active && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-[0_0_6px_rgba(255,26,26,0.8)]" />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              type="button"
              aria-label="Buscar"
              className="flex items-center justify-center size-9 rounded-lg text-neutral-500 hover:text-white hover:bg-white/[0.06] transition-all duration-300 cursor-pointer"
            >
              <Search className="size-[18px]" />
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Cambiar tema"
              className="flex items-center justify-center size-9 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] text-neutral-400 hover:text-white transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95"
            >
              {theme === 'dark' ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-indigo-400" />}
            </button>

            {/* Separator */}
            <div className="w-[1px] h-5 bg-white/[0.08] mx-1" />

            {isAuthenticated ? (
              <>
                {/* Cart */}
                <Link
                  to="/cart"
                  className="relative flex items-center justify-center size-9 rounded-lg text-neutral-500 hover:text-white hover:bg-white/[0.06] transition-all duration-300"
                >
                  <ShoppingCart className="size-[18px]" />
                  {cart && cart.numItems > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary text-[8px] font-black text-white px-1 shadow-[0_0_8px_rgba(255,26,26,0.5)] animate-pulse">
                      {cart.numItems}
                    </span>
                  )}
                </Link>

                {/* User Profile */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-all duration-300 group/user"
                >
                  <div className="size-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center group-hover/user:border-primary/60 transition-colors">
                    <User className="size-3.5 text-primary" />
                  </div>
                  <span className="hidden md:inline text-[11px] font-bold uppercase tracking-wider">
                    {user?.username}
                  </span>
                </Link>

                {/* Logout */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleLogout}
                  className="size-9 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                >
                  <LogOut className="size-4" />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-white/[0.04]"
                >
                  Iniciar sesión
                </Link>

                <Link to="/register">
                  <Button
                    variant="default"
                    size="sm"
                    className="rounded-lg bg-primary hover:bg-primary/90 px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-white shadow-[0_0_15px_rgba(255,26,26,0.25)] hover:shadow-[0_0_25px_rgba(255,26,26,0.4)] transition-all duration-300 cursor-pointer"
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

      <footer className="mt-auto bg-[#060607] text-xs text-neutral-400 relative">
        {/* Top accent gradient */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 py-14">
          <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-4">
            {/* Brand Column */}
            <div className="space-y-5">
              <Link to="/" className="flex items-center gap-3 group">
                <img
                  src="/logo.png"
                  alt="Aura Rider Logo"
                  className="h-9 w-9 rounded-full object-cover border border-white/10 transition-transform duration-300 group-hover:scale-110"
                />
                <span className="text-lg font-black uppercase tracking-tight text-white">
                  AURA
                  <span className="text-primary group-hover:drop-shadow-[0_0_6px_rgba(255,26,26,0.5)] transition-all duration-300">RIDER</span>
                </span>
              </Link>
              <p className="leading-relaxed text-neutral-600 font-medium">
                Libertad sin límites.
                <br />
                El camino es tuyo.
              </p>
              {/* Social icons placeholder */}
              <div className="flex items-center gap-3 pt-1">
                {['Instagram', 'Facebook', 'TikTok'].map((social) => (
                  <span
                    key={social}
                    className="size-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-neutral-600 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300 cursor-pointer text-[10px] font-bold"
                  >
                    {social[0]}
                  </span>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            {([
              {
                title: 'Motos',
                links: [
                  { label: 'Sport', to: '/' },
                  { label: 'Naked', to: '/' },
                  { label: 'Aventura', to: '/' },
                  { label: 'Recreativa', to: '/' },
                ],
              },
              {
                title: 'Servicios',
                links: [
                  { label: 'Mantenimiento' },
                  { label: 'Servicio técnico' },
                  { label: 'Garantía' },
                  { label: 'Financiamiento' },
                ],
              },
              {
                title: 'Ayuda',
                links: [
                  { label: 'Preguntas frecuentes' },
                  { label: 'Envíos' },
                  { label: 'Cambios y devoluciones' },
                ],
              },
            ] as { title: string; links: { label: string; to?: string }[] }[]).map((col) => (
              <div key={col.title} className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400">
                  {col.title}
                </h4>
                <ul className="space-y-2.5 font-semibold">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.to ? (
                        <Link
                          to={link.to}
                          className="text-neutral-600 hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <span className="text-neutral-600 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 cursor-pointer">
                          {link.label}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-6 font-semibold text-neutral-700 md:flex-row">
            <p>© 2026 Aura Rider. Todos los derechos reservados.</p>

            <div className="flex items-center gap-7 opacity-60 transition-opacity duration-300 hover:opacity-100">
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
