// src/presentation/pages/auth/RegisterPage.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../../../application/dtos/auth.dto';
import type { RegisterDto } from '../../../application/dtos/auth.dto';
import { useAuthStore } from '../../store/auth.store';
import { User, Mail, Lock, ShieldCheck, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import Particles from '../../components/react-bits/Particles';
import GradientText from '../../components/react-bits/GradientText';

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

  // Input field base styles
  const inputBase = "w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl py-3.5 text-sm font-medium placeholder-neutral-600 focus:outline-none focus:border-primary/50 focus:bg-white/[0.06] focus:shadow-[0_0_20px_rgba(255,26,26,0.08)] transition-all duration-300";

  return (
    <div className="relative flex min-h-[92vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#050506] overflow-hidden">

      {/* Particles Background */}
      <Particles quantity={40} color="255, 26, 26" speed={0.2} connectDistance={90} size={1} />

      {/* Ambient Glow */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/[0.06] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-primary/[0.04] rounded-full blur-[120px] pointer-events-none" />

      {/* Split Card */}
      <div className="relative w-full max-w-[1100px] min-h-[650px] bg-[#0a0a0c]/90 backdrop-blur-xl rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/[0.06] overflow-hidden z-10 grid grid-cols-1 md:grid-cols-2">

        {/* Left: Video/Image Panel */}
        <div className="relative hidden md:flex flex-col overflow-hidden">
          {/* Background Video */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=800"
          >
            <source src="https://cdn.coverr.co/videos/coverr-motorcycle-rider-on-the-road-8356/1080p.mp4" type="video/mp4" />
          </video>

          {/* Overlay gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-black/50 to-black/20 z-10" />
          <div className="absolute inset-0 bg-gradient-to-l from-[#0a0a0c]/80 to-transparent z-10" />

          {/* Content */}
          <div className="relative z-20 flex flex-col justify-between h-full p-12">
            {/* Top */}
            <div>
              <GradientText
                className="font-bold text-[10px] uppercase tracking-[0.2em]"
                colors={['#ff1a1a', '#ff6b35', '#ffaa00', '#ff6b35', '#ff1a1a']}
                animationSpeed={3}
              >
                Comienza tu aventura
              </GradientText>
            </div>

            {/* Bottom */}
            <div className="space-y-5">
              <h2 className="text-5xl font-black text-white leading-[0.9] uppercase tracking-tighter">
                ÚNETE AL
                <br />
                <span className="text-primary">EQUIPO.</span>
              </h2>
              <p className="text-neutral-400 text-sm max-w-xs font-medium leading-relaxed">
                Crea tu cuenta de piloto para acceder a los mejores modelos y gestionar tus reservas con total facilidad.
              </p>

              {/* Features */}
              <div className="space-y-3 pt-2">
                {['Acceso exclusivo a modelos', 'Ofertas personalizadas', 'Historial de pedidos'].map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-3.5 text-primary" />
                    <span className="text-neutral-500 text-xs font-semibold">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-3">
                <div className="h-[1px] w-12 bg-primary/40" />
                <span className="text-neutral-500 text-xs font-semibold">
                  ¿Ya tienes cuenta?{' '}
                  <Link to="/login" onClick={clearError} className="text-white hover:text-primary font-bold transition-colors">
                    Inicia sesión
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center relative">
          {/* Decorative corner accent */}
          <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-primary/20 rounded-tr-3xl pointer-events-none" />

          {/* Brand */}
          <div className="flex items-center gap-2.5 mb-8">
            <img src="/logo.png" alt="Aura Rider Logo" className="h-8 w-8 object-contain" />
            <span className="text-sm font-black tracking-widest text-white uppercase">AURA RIDER</span>
          </div>

          {/* Title */}
          <div className="mb-6 space-y-1.5">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Crear Cuenta</h2>
            <p className="text-neutral-500 text-sm font-medium">Regístrate para acceder a todo el catálogo</p>
          </div>

          {success ? (
            <div className="p-8 text-center bg-green-500/[0.06] border border-green-500/20 rounded-2xl space-y-4">
              <div className="size-16 mx-auto rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <ShieldCheck className="size-8 text-green-400 animate-bounce" />
              </div>
              <div>
                <p className="font-black text-lg text-white uppercase">¡Registro Exitoso!</p>
                <p className="text-neutral-400 text-xs font-medium mt-1">Redirigiendo al inicio de sesión...</p>
              </div>
              {/* Progress bar */}
              <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden mt-3">
                <div className="h-full bg-green-500 rounded-full" style={{ animation: 'progress-bar 2.5s linear forwards' }} />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center gap-2 font-semibold">
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
                    placeholder="Elige tu nombre de usuario"
                    className={`${inputBase} pl-12 pr-5`}
                    {...register('username')}
                    aria-invalid={errors.username ? 'true' : 'false'}
                  />
                </div>
                {errors.username && (
                  <p className="text-xs text-destructive font-bold pl-1">{errors.username.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 pl-1">Correo</label>
                <div className="relative flex items-center group">
                  <Mail className="absolute left-4 size-4 text-neutral-600 group-focus-within:text-primary transition-colors duration-300" />
                  <input
                    id="email"
                    type="email"
                    placeholder="tu@correo.com"
                    className={`${inputBase} pl-12 pr-5`}
                    {...register('email')}
                    aria-invalid={errors.email ? 'true' : 'false'}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive font-bold pl-1">{errors.email.message}</p>
                )}
              </div>

              {/* Name Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 pl-1">Nombre</label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="Nombre"
                    className={`${inputBase} px-4`}
                    {...register('firstName')}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 pl-1">Apellido</label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Apellido"
                    className={`${inputBase} px-4`}
                    {...register('lastName')}
                  />
                </div>
              </div>

              {/* Passwords Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 pl-1">Contraseña</label>
                  <div className="relative flex items-center group">
                    <Lock className="absolute left-4 size-4 text-neutral-600 group-focus-within:text-primary transition-colors duration-300" />
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className={`${inputBase} pl-12 pr-4`}
                      {...register('password')}
                      aria-invalid={errors.password ? 'true' : 'false'}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive font-bold pl-1">{errors.password.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 pl-1">Confirmar</label>
                  <div className="relative flex items-center group">
                    <Lock className="absolute left-4 size-4 text-neutral-600 group-focus-within:text-primary transition-colors duration-300" />
                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className={`${inputBase} pl-12 pr-4`}
                      {...register('confirmPassword')}
                      aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive font-bold pl-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full mt-4 bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs tracking-widest rounded-xl py-4 transition-all duration-300 shadow-[0_4px_30px_rgba(255,26,26,0.25)] hover:shadow-[0_6px_40px_rgba(255,26,26,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="size-4 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="28" strokeLinecap="round" /></svg>
                    Creando cuenta...
                  </span>
                ) : (
                  <>REGISTRARSE <ArrowRight className="size-4" /></>
                )}
              </button>

              {/* Mobile login link */}
              <p className="text-center text-sm font-semibold text-neutral-500 md:hidden pt-2">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" onClick={clearError} className="text-primary hover:text-white font-bold transition-colors">
                  Inicia sesión
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
