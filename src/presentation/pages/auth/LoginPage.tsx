// src/presentation/pages/auth/LoginPage.tsx
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../../application/dtos/auth.dto';
import type { LoginDto } from '../../../application/dtos/auth.dto';
import { useAuthStore } from '../../store/auth.store';
import { User, Lock, ShieldAlert, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginDto) => {
    try {
      await login(data);
      navigate('/');
    } catch {
      // Error manejado en el store
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black font-sans">
      
      {/* 1. CINEMATIC BACKGROUND */}
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <img 
          src="https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=2070&auto=format&fit=crop" 
          alt="Night Rider" 
          className="w-full h-full object-cover opacity-50 contrast-125 saturate-50"
        />
        {/* Dynamic Vignette & Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,26,26,0.1)_0%,transparent_60%)] animate-pulse-glow" />
      </motion.div>

      {/* 2. FLOATING AMBIENT ORBS */}
      <motion.div 
        animate={{ y: [0, -20, 0], x: [0, 10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none z-0" 
      />
      <motion.div 
        animate={{ y: [0, 30, 0], x: [0, -15, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none z-0" 
      />

      {/* 3. CENTER FLOATING GLASS FORM */}
      <motion.div 
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 200, damping: 25, delay: 0.2 }}
        className="relative z-10 w-full max-w-lg p-10 sm:p-14 mx-4 rounded-[2.5rem] bg-black/40 backdrop-blur-[40px] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(255,255,255,0.02)] before:absolute before:inset-0 before:rounded-[2.5rem] before:border before:border-white/5 before:pointer-events-none"
      >
        {/* Glowing Top Edge */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-primary/80 to-transparent" />

        {/* Brand Header */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center justify-center gap-4 mb-10 text-center"
        >
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-primary/40 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
            <img src="/logo.png" alt="Aura Rider Logo" className="relative h-14 w-14 object-contain drop-shadow-[0_0_15px_rgba(255,26,26,0.6)]" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-[0.1em] drop-shadow-md">Bienvenido</h2>
            <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mt-2">Plataforma Premium de Pilotos</p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 text-xs bg-destructive/10 border border-destructive/30 text-destructive rounded-xl flex items-center gap-3 font-bold shadow-[0_0_20px_rgba(255,26,26,0.2)]">
              <ShieldAlert className="size-5 shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Username Field */}
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 pl-2">Usuario</label>
            <div className="relative flex items-center group">
              <User className="absolute left-5 size-5 text-neutral-500 group-focus-within:text-primary transition-colors duration-500" />
              <input
                id="username"
                type="text"
                placeholder="Ingresa tu usuario"
                className="w-full bg-black/40 border border-white/10 text-white rounded-2xl py-4.5 pl-14 pr-5 text-sm font-medium placeholder-neutral-600 focus:outline-none focus:border-primary/50 focus:bg-white/5 focus:shadow-[0_0_30px_rgba(255,26,26,0.15)] transition-all duration-500 backdrop-blur-md"
                {...register('username')}
              />
            </div>
            {errors.username && <p className="text-xs text-primary font-bold pl-2 mt-1.5">{errors.username.message}</p>}
          </motion.div>

          {/* Password Field */}
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 pl-2">Contraseña</label>
            <div className="relative flex items-center group">
              <Lock className="absolute left-5 size-5 text-neutral-500 group-focus-within:text-primary transition-colors duration-500" />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/10 text-white rounded-2xl py-4.5 pl-14 pr-5 text-sm font-medium placeholder-neutral-600 focus:outline-none focus:border-primary/50 focus:bg-white/5 focus:shadow-[0_0_30px_rgba(255,26,26,0.15)] transition-all duration-500 backdrop-blur-md"
                {...register('password')}
              />
            </div>
            {errors.password && <p className="text-xs text-primary font-bold pl-2 mt-1.5">{errors.password.message}</p>}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex items-center justify-between text-xs text-neutral-400 font-bold px-2 pt-2">
            <label className="flex items-center gap-3 cursor-pointer select-none hover:text-white transition-colors group">
              <div className="size-5 rounded border border-white/20 bg-black/50 group-hover:border-primary transition-colors flex items-center justify-center">
                <input type="checkbox" className="sr-only peer" />
                {/* Custom checkmark could go here */}
              </div>
              Recordarme
            </label>
            <Link to="#" className="hover:text-primary transition-colors">¿Olvidaste tu contraseña?</Link>
          </motion.div>

          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            type="submit"
            className="relative w-full mt-8 bg-white hover:bg-primary text-black hover:text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl py-5 transition-all duration-500 overflow-hidden group shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,26,26,0.4)] hover:-translate-y-1"
            disabled={isLoading}
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shiny-slide_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
            
            <div className="relative z-10 flex items-center justify-center gap-3">
              {isLoading ? (
                <>
                  <svg className="size-5 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="28" strokeLinecap="round" /></svg>
                  ACCEDIENDO...
                </>
              ) : (
                <>INICIAR SESIÓN <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </div>
          </motion.button>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="text-center text-xs font-bold text-neutral-500 pt-6 uppercase tracking-widest">
            ¿No tienes cuenta?{' '}
            <Link to="/register" onClick={clearError} className="text-primary hover:text-white transition-colors ml-2 border-b border-primary/30 hover:border-white pb-1">
              Crear Perfil
            </Link>
          </motion.p>
        </form>
      </motion.div>
    </div>
  );
}
