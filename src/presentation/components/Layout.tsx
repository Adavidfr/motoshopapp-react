import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Search, ShoppingCart, User, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      {/* Liquid Glass Global Background Blobs */}
      <div className="liquid-bg-blob bg-primary/20 dark:bg-primary/10 w-[50vw] h-[50vw] top-[-10%] left-[-10%] rounded-full" />
      <div className="liquid-bg-blob bg-amber-500/10 dark:bg-amber-600/10 w-[60vw] h-[60vw] bottom-[-20%] right-[-10%] rounded-full" style={{ animationDelay: '-5s' }} />
      <div className="liquid-bg-blob bg-purple-500/10 dark:bg-indigo-600/10 w-[40vw] h-[40vw] top-[40%] left-[20%] rounded-full" style={{ animationDelay: '-10s' }} />

      <header className="sticky top-0 z-50 w-full glass-panel border-b-0 transition-all duration-500">
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

              <span className="text-lg font-black uppercase tracking-tight text-foreground">
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
                      ? 'text-foreground'
                      : 'text-neutral-500 hover:text-foreground'
                  }`}
                >
                  {/* Active/hover background pill */}
                  <span className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                    item.active
                      ? 'bg-neutral-200/50 dark:bg-white/[0.07]'
                      : 'bg-transparent group-hover/nav:bg-neutral-100 dark:group-hover/nav:bg-white/[0.04]'
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
              className="flex items-center justify-center size-9 rounded-lg text-neutral-500 hover:text-foreground hover:bg-neutral-200/50 dark:hover:bg-white/[0.06] transition-all duration-300 cursor-pointer"
            >
              <Search className="size-[18px]" />
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Cambiar tema"
              className="relative flex items-center justify-center size-9 rounded-lg bg-neutral-100 dark:bg-white/[0.04] hover:bg-neutral-200 dark:hover:bg-white/[0.08] border border-neutral-200 dark:border-white/[0.06] hover:border-neutral-300 dark:hover:border-white/[0.12] transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ y: -20, opacity: 0, rotate: -90 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 20, opacity: 0, rotate: 90 }}
                  transition={{ type: "spring", stiffness: 700, damping: 30 }}
                  className="absolute flex items-center justify-center"
                >
                  {theme === 'dark' ? (
                    <Sun className="size-4 text-amber-400" />
                  ) : (
                    <Moon className="size-4 text-indigo-400" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>

            {/* Separator */}
            <div className="w-[1px] h-5 bg-white/[0.08] mx-1" />

            {isAuthenticated ? (
              <>
                {/* Cart */}
                <Link
                  to="/cart"
                  className="relative flex items-center justify-center size-9 rounded-lg text-neutral-500 hover:text-foreground hover:bg-neutral-200/50 dark:hover:bg-white/[0.06] transition-all duration-300"
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
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-neutral-500 hover:text-foreground hover:bg-neutral-200/50 dark:hover:bg-white/[0.06] transition-all duration-300 group/user"
                >
                  <div className="size-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center group-hover/user:border-primary/50 transition-colors">
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
                  className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 hover:text-foreground transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-neutral-200/50 dark:hover:bg-white/[0.04]"
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

      <footer className="mt-auto relative z-10 overflow-hidden border-t border-neutral-200 dark:border-white/10 glass-panel pt-20 pb-10 transition-all duration-500">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/10 dark:bg-primary/5 rounded-full blur-[150px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[130px] pointer-events-none -z-10" />
        
        {/* Top Glowing Edge */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <div className="container mx-auto max-w-screen-2xl px-6 lg:px-12">
          
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
            
            {/* Brand & Newsletter Column (Spans 5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <Link to="/" className="inline-flex items-center gap-4 group mb-6 relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 scale-150" />
                  <img
                    src="/logo.png"
                    alt="Aura Rider Logo"
                    className="h-12 w-12 rounded-full object-cover border border-neutral-200 dark:border-white/20 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(255,26,26,0.3)]"
                  />
                  <span className="text-2xl font-black uppercase tracking-[0.1em] text-foreground">
                    AURA<span className="text-primary drop-shadow-[0_0_10px_rgba(255,26,26,0.8)]">RIDER</span>
                  </span>
                </Link>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm font-medium leading-relaxed max-w-sm mb-8">
                  La plataforma definitiva para la élite de pilotos. Supera tus límites, conquista el camino y vive la verdadera libertad sobre dos ruedas.
                </p>
              </div>

              {/* Newsletter */}
              <div className="max-w-md w-full relative z-20">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground mb-4 flex items-center gap-2">
                  <span className="w-4 h-[2px] bg-primary"></span> Boletín Exclusivo
                </h4>
                <div className="relative flex items-center group">
                  <input 
                    type="email" 
                    placeholder="Tu correo electrónico..." 
                    className="w-full bg-white/40 dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-2xl py-4 pl-5 pr-32 text-sm text-foreground placeholder-neutral-500 focus:outline-none focus:border-primary/50 focus:bg-white/60 dark:focus:bg-white/10 transition-all duration-300 backdrop-blur-md shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
                  />
                  <button className="absolute right-2 top-2 bottom-2 bg-black dark:bg-white hover:bg-primary dark:hover:bg-primary text-white dark:text-black hover:text-white px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,26,26,0.5)] dark:hover:shadow-[0_0_30px_rgba(255,26,26,0.5)]">
                    Unirse
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Links Columns (Spans 7 cols) */}
            <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
              {([
                {
                  title: 'Catálogo',
                  links: ['Sport', 'Naked', 'Aventura', 'Recreativa', 'Edición Limitada'],
                },
                {
                  title: 'Servicios',
                  links: ['Mantenimiento VIP', 'Servicio Técnico', 'Garantía Extendida', 'Financiamiento', 'Seguros'],
                },
                {
                  title: 'Soporte',
                  links: ['Preguntas Frecuentes', 'Rastreo de Envíos', 'Devoluciones', 'Contacto', 'Términos Legales'],
                },
              ]).map((col, idx) => (
                <div key={idx} className="space-y-6">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(255,26,26,0.8)]"></span>
                    {col.title}
                  </h4>
                  <ul className="space-y-3">
                    {col.links.map((link, i) => (
                      <li key={i}>
                        <Link
                          to="#"
                          className="group relative inline-flex items-center text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-foreground transition-colors duration-300"
                        >
                          <span className="relative overflow-hidden">
                            {link}
                            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-primary -translate-x-[105%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full h-[1px] bg-neutral-200 dark:bg-white/10 mb-8 relative">
            <div className="absolute top-0 left-1/4 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </div>

          {/* Bottom Bar: Copyright, Socials & Payments */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs font-bold text-neutral-500 tracking-wider">
              © 2026 AURA RIDER. TODOS LOS DERECHOS RESERVADOS.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              {['INSTAGRAM', 'FACEBOOK', 'TIKTOK', 'YOUTUBE'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="relative px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-white/10 bg-white/40 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 hover:text-white overflow-hidden group transition-colors duration-300"
                >
                  <span className="absolute inset-0 bg-primary/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative z-10 group-hover:text-foreground dark:group-hover:text-white transition-colors duration-300">{social}</span>
                </a>
              ))}
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-6 opacity-50 hover:opacity-100 transition-opacity duration-500">
              <img src="/visa_logo.png" alt="Visa" className="h-4 w-auto object-contain brightness-0 dark:invert opacity-80 hover:opacity-100 transition-all dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
              <img src="/mastercard_logo.png" alt="Mastercard" className="h-5 w-auto object-contain dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
              <img src="/diners_logo.png" alt="Diners Club" className="h-4 w-auto object-contain brightness-0 dark:invert opacity-80 hover:opacity-100 transition-all dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
              <img src="/discover_logo.png" alt="Discover" className="h-3 w-auto object-contain brightness-0 dark:invert opacity-80 hover:opacity-100 transition-all dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
