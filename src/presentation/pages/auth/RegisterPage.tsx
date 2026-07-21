// src/presentation/pages/auth/RegisterPage.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../../../application/dtos/auth.dto';
import type { RegisterDto } from '../../../application/dtos/auth.dto';
import { useAuthStore } from '../../store/auth.store';
import { User, Mail, Lock, ShieldCheck, ShieldAlert, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerApi, isLoading, error, clearError } = useAuthStore();
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterDto>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterDto) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword: _confirm, ...payload } = data;
      await registerApi(payload);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch {
      // Error manejado en el store
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black font-sans">
      
      {/* 1. CINEMATIC BACKGROUND (Mirrored from Login) */}
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <img 
          src="https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=2070&auto=format&fit=crop" 
          alt="Night Rider" 
          className="w-full h-full object-cover opacity-50 contrast-125 saturate-50 scale-x-[-1]"
        />
        {/* Dynamic Vignette & Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-transparent to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,26,26,0.1)_0%,transparent_60%)] animate-pulse-glow" />
      </motion.div>

      {/* 2. FLOATING AMBIENT ORBS */}
      <motion.div 
        animate={{ y: [0, -20, 0], x: [0, 10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none z-0" 
      />
      <motion.div 
        animate={{ y: [0, 30, 0], x: [0, -15, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/4 left-1/4 w-[30rem] h-[30rem] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none z-0" 
      />

      {/* 3. CENTER FLOATING GLASS FORM */}
      <motion.div 
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 200, damping: 25, delay: 0.2 }}
        className="relative z-10 w-full max-w-2xl p-10 sm:p-14 mx-4 my-8 rounded-[2.5rem] bg-black/40 backdrop-blur-[40px] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(255,255,255,0.02)] before:absolute before:inset-0 before:rounded-[2.5rem] before:border before:border-white/5 before:pointer-events-none"
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
            <h2 className="text-3xl font-black text-white uppercase tracking-[0.1em] drop-shadow-md">Únete a la Élite</h2>
            <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mt-2">Crea tu Perfil de Piloto</p>
          </div>
        </motion.div>

        {success ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-10 text-center bg-black/30 border border-green-500/20 rounded-3xl space-y-6 backdrop-blur-md">
            <div className="relative size-24 mx-auto">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse-glow" />
              <div className="relative size-24 rounded-full bg-black/50 border border-green-500/40 flex items-center justify-center shadow-[inset_0_0_20px_rgba(34,197,94,0.2)]">
                <ShieldCheck className="size-12 text-green-400" />
              </div>
            </div>
            <div>
              <p className="font-black text-2xl text-white uppercase tracking-wider drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">¡Acelerando!</p>
              <p className="text-neutral-400 text-sm font-bold mt-2 uppercase tracking-widest">Credenciales Aprobadas</p>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-6">
              <div className="h-full bg-gradient-to-r from-green-500 to-green-300 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.8)]" style={{ animation: 'progress-bar 2.5s linear forwards' }} />
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 text-xs bg-destructive/10 border border-destructive/30 text-destructive rounded-xl flex items-center gap-3 font-bold shadow-[0_0_20px_rgba(255,26,26,0.2)]">
                <ShieldAlert className="size-5 shrink-0" />
                {error}
              </motion.div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Username Field */}
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.45 }} className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 pl-2">Usuario</label>
                <div className="relative flex items-center group">
                  <User className="absolute left-5 size-5 text-neutral-500 group-focus-within:text-primary transition-colors duration-500" />
                  <input
                    id="username"
                    type="text"
                    placeholder="Piloto123"
                    className="w-full bg-black/40 border border-white/10 text-white rounded-2xl py-4.5 pl-14 pr-5 text-sm font-medium placeholder-neutral-600 focus:outline-none focus:border-primary/50 focus:bg-white/5 focus:shadow-[0_0_30px_rgba(255,26,26,0.15)] transition-all duration-500"
                    {...register('username')}
                  />
                </div>
                {errors.username && <p className="text-xs text-primary font-bold pl-2 mt-1.5">{errors.username.message}</p>}
              </motion.div>

              {/* Email Field */}
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 pl-2">Correo</label>
                <div className="relative flex items-center group">
                  <Mail className="absolute left-5 size-5 text-neutral-500 group-focus-within:text-primary transition-colors duration-500" />
                  <input
                    id="email"
                    type="email"
                    placeholder="piloto@aura.com"
                    className="w-full bg-black/40 border border-white/10 text-white rounded-2xl py-4.5 pl-14 pr-5 text-sm font-medium placeholder-neutral-600 focus:outline-none focus:border-primary/50 focus:bg-white/5 focus:shadow-[0_0_30px_rgba(255,26,26,0.15)] transition-all duration-500"
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="text-xs text-primary font-bold pl-2 mt-1.5">{errors.email.message}</p>}
              </motion.div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Names */}
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.55 }} className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 pl-2">Nombre</label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="Nombre"
                  className="w-full bg-black/40 border border-white/10 text-white rounded-2xl py-4.5 px-5 text-sm font-medium placeholder-neutral-600 focus:outline-none focus:border-primary/50 focus:bg-white/5 focus:shadow-[0_0_30px_rgba(255,26,26,0.15)] transition-all duration-500"
                  {...register('firstName')}
                />
              </motion.div>
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 pl-2">Apellido</label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Apellido"
                  className="w-full bg-black/40 border border-white/10 text-white rounded-2xl py-4.5 px-5 text-sm font-medium placeholder-neutral-600 focus:outline-none focus:border-primary/50 focus:bg-white/5 focus:shadow-[0_0_30px_rgba(255,26,26,0.15)] transition-all duration-500"
                  {...register('lastName')}
                />
              </motion.div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Passwords */}
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.65 }} className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 pl-2">Contraseña</label>
                <div className="relative flex items-center group">
                  <Lock className="absolute left-5 size-5 text-neutral-500 group-focus-within:text-primary transition-colors duration-500" />
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-white/10 text-white rounded-2xl py-4.5 pl-14 pr-5 text-sm font-medium placeholder-neutral-600 focus:outline-none focus:border-primary/50 focus:bg-white/5 focus:shadow-[0_0_30px_rgba(255,26,26,0.15)] transition-all duration-500"
                    {...register('password')}
                  />
                </div>
                {errors.password && <p className="text-xs text-primary font-bold pl-2 mt-1.5">{errors.password.message}</p>}
              </motion.div>
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 pl-2">Confirmar</label>
                <div className="relative flex items-center group">
                  <Lock className="absolute left-5 size-5 text-neutral-500 group-focus-within:text-primary transition-colors duration-500" />
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-white/10 text-white rounded-2xl py-4.5 pl-14 pr-5 text-sm font-medium placeholder-neutral-600 focus:outline-none focus:border-primary/50 focus:bg-white/5 focus:shadow-[0_0_30px_rgba(255,26,26,0.15)] transition-all duration-500"
                    {...register('confirmPassword')}
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs text-primary font-bold pl-2 mt-1.5">{errors.confirmPassword.message}</p>}
              </motion.div>
            </div>

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
                    CREANDO PERFIL...
                  </>
                ) : (
                  <>COMBUSTIÓN <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" /></>
                )}
              </div>
            </motion.button>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="text-center text-xs font-bold text-neutral-500 pt-6 uppercase tracking-widest">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" onClick={clearError} className="text-primary hover:text-white transition-colors ml-2 border-b border-primary/30 hover:border-white pb-1">
                Iniciar Sesión
              </Link>
            </motion.p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
