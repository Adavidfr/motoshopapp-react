// src/presentation/components/Layout.tsx
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useCartStore } from '../store/cart.store';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import { Button } from './ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header Premium Glassmorphic */}
      <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
        <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center space-x-2 font-black text-2xl tracking-tighter text-primary group">
              <span className="bg-linear-to-br from-primary to-accent text-primary-foreground p-2 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                🏍️
              </span>
              <span className="bg-linear-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                MOTO<span className="text-primary">SHOP</span>
              </span>
            </Link>
            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
              <Link to="/" className="transition-colors hover:text-primary text-foreground/70">
                Catálogo
              </Link>
              {isAuthenticated && (
                <Link to="/orders" className="transition-colors hover:text-primary text-foreground/70">
                  Mis Pedidos
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="relative p-2.5 text-foreground/70 hover:text-primary transition-colors hover:bg-neutral-800/40 rounded-xl">
                  <ShoppingCart className="size-5" />
                  {cart && cart.numItems > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-black text-primary-foreground animate-pulse shadow-[0_0_10px_rgba(255,107,0,0.5)]">
                      {cart.numItems}
                    </span>
                  )}
                </Link>
                <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 text-foreground/70 hover:text-primary transition-colors hover:bg-neutral-800/40 rounded-xl text-sm font-semibold">
                  <User className="size-5 text-primary" />
                  <span className="hidden sm:inline">{user?.username}</span>
                </Link>
                <Button variant="ghost" size="icon-sm" onClick={handleLogout} className="text-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all">
                  <LogOut className="size-5" />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-semibold rounded-xl text-foreground/80">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="default" size="sm" className="btn-primary-gradient font-bold rounded-xl">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-screen-2xl p-4 md:p-8 animate-in fade-in duration-500">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/20 bg-card/20 py-8">
        <div className="container mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4 text-xs text-muted-foreground">
          <p>© 2026 MotoShop Inc. Diseñado para alta velocidad y máximo rendimiento.</p>
          <div className="flex gap-4">
            <span className="text-primary font-semibold">Arquitectura Hexagonal</span>
            <span>•</span>
            <span className="text-primary font-semibold">React + TypeScript</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
