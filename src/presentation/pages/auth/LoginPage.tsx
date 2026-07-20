// src/presentation/pages/auth/LoginPage.tsx
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../../application/dtos/auth.dto';
import type { LoginDto } from '../../../application/dtos/auth.dto';
import { useAuthStore } from '../../store/auth.store';
import { User, Lock, ShieldAlert, ArrowRight } from 'lucide-react';
import Particles from '../../components/react-bits/Particles';
import GradientText from '../../components/react-bits/GradientText';

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
    <div className="relative flex min-h-[92vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#050506] overflow-hidden">

      {/* Particles Background */}
      <Particles quantity={40} color="255, 26, 26" speed={0.2} connectDistance={90} size={1} />

      {/* Ambient Glow */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-primary/[0.06] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-primary/[0.04] rounded-full blur-[120px] pointer-events-none" />

      {/* Split Card */}
      <div className="relative w-full max-w-[1100px] min-h-[620px] bg-[#0a0a0c]/90 backdrop-blur-xl rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/[0.06] overflow-hidden z-10 grid grid-cols-1 md:grid-cols-2">

        {/* Left: Form */}
        <div className="p-10 sm:p-14 flex flex-col justify-center relative">
          {/* Decorative corner accent */}
          <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-primary/20 rounded-tl-3xl pointer-events-none" />

          {/* Brand */}
          <div className="flex items-center gap-2.5 mb-10">
            <img src="/logo.png" alt="Aura Rider Logo" className="h-8 w-8 object-contain" />
            <span className="text-sm font-black tracking-widest text-white uppercase">AURA RIDER</span>
          </div>

          {/* Welcome text */}
          <div className="mb-8 space-y-2">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">Bienvenido</h2>
            <p className="text-neutral-500 text-sm font-medium">Inicia sesión para acceder a tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="p-3.5 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center gap-2 font-semibold">
                <ShieldAlert className="size-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 pl-1">Usuario</label>
              <div className="relative flex items-center group">
                <User className="absolute left-4 size-4 text-neutral-600 group-focus-within:text-primary transition-colors duration-300" />
                <input
                  id="username"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl py-4 pl-12 pr-5 text-sm font-medium placeholder-neutral-600 focus:outline-none focus:border-primary/50 focus:bg-white/[0.06] focus:shadow-[0_0_20px_rgba(255,26,26,0.08)] transition-all duration-300"
                  {...register('username')}
                  aria-invalid={errors.username ? 'true' : 'false'}
                />
              </div>
              {errors.username && (
                <p className="text-xs text-destructive font-bold pl-1 mt-1">{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 pl-1">Contraseña</label>
              <div className="relative flex items-center group">
                <Lock className="absolute left-4 size-4 text-neutral-600 group-focus-within:text-primary transition-colors duration-300" />
                <input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl py-4 pl-12 pr-5 text-sm font-medium placeholder-neutral-600 focus:outline-none focus:border-primary/50 focus:bg-white/[0.06] focus:shadow-[0_0_20px_rgba(255,26,26,0.08)] transition-all duration-300"
                  {...register('password')}
                  aria-invalid={errors.password ? 'true' : 'false'}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive font-bold pl-1 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between text-xs text-neutral-500 font-semibold px-1 pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none hover:text-neutral-300 transition-colors group">
                <div className="size-4 rounded border border-white/[0.12] bg-white/[0.04] group-hover:border-primary/40 transition-colors flex items-center justify-center">
                  <input type="checkbox" className="sr-only peer" />
                </div>
                Recordarme
              </label>
              <Link to="#" className="hover:text-primary transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full mt-6 bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs tracking-widest rounded-xl py-4.5 transition-all duration-300 shadow-[0_4px_30px_rgba(255,26,26,0.25)] hover:shadow-[0_6px_40px_rgba(255,26,26,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="size-4 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="28" strokeLinecap="round" /></svg>
                  Iniciando...
                </span>
              ) : (
                <>INGRESAR <ArrowRight className="size-4" /></>
              )}
            </button>

            {/* Mobile register link */}
            <p className="text-center text-sm font-semibold text-neutral-500 md:hidden pt-2">
              ¿No tienes cuenta?{' '}
              <Link to="/register" onClick={clearError} className="text-primary hover:text-white font-bold transition-colors">
                Regístrate
              </Link>
            </p>
          </form>
        </div>

        {/* Right: Video/Image Panel */}
        <div className="relative hidden md:flex flex-col overflow-hidden">
          {/* Background Video */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=800"
          >
            <source src="https://cdn.coverr.co/videos/coverr-motorcyclist-riding-a-red-sports-bike/1080p.mp4" type="video/mp4" />
          </video>

          {/* Overlay gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-black/50 to-black/20 z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0c]/80 to-transparent z-10" />

          {/* Content */}
          <div className="relative z-20 flex flex-col justify-between h-full p-12">
            {/* Top decorative */}
            <div className="flex justify-end">
              <GradientText
                className="font-bold text-[10px] uppercase tracking-[0.2em]"
                colors={['#ff1a1a', '#ff6b35', '#ffaa00', '#ff6b35', '#ff1a1a']}
                animationSpeed={3}
              >
                Siente la adrenalina
              </GradientText>
            </div>

            {/* Bottom text */}
            <div className="space-y-5">
              <h2 className="text-5xl font-black text-white leading-[0.9] uppercase tracking-tighter">
                EL CAMINO
                <br />
                <span className="text-primary">ES TUYO.</span>
              </h2>
              <p className="text-neutral-400 text-sm max-w-xs font-medium leading-relaxed">
                Siente la verdadera adrenalina y domina el camino con nuestras motos deportivas de alta gama.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="h-[1px] w-12 bg-primary/40" />
                <span className="text-neutral-500 text-xs font-semibold">
                  ¿No tienes una cuenta?{' '}
                  <Link to="/register" onClick={clearError} className="text-white hover:text-primary font-bold transition-colors">
                    Regístrate ahora
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
