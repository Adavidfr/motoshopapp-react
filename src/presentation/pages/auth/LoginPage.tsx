// src/presentation/pages/auth/LoginPage.tsx
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../../application/dtos/auth.dto';
import type { LoginDto } from '../../../application/dtos/auth.dto';
import { useAuthStore } from '../../store/auth.store';
import { User, Lock, ShieldAlert } from 'lucide-react';

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
    <div className="relative flex min-h-[90vh] items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-[#070708] overflow-hidden">
      {/* Background Grid & Ambient Red Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(255,26,26,0.12)_0%,rgba(7,7,8,0)_70%)] pointer-events-none z-0 blur-xl animate-pulse duration-[8000ms]" />
      
      {/* Split Design Card */}
      <div className="relative w-full max-w-[1050px] min-h-[580px] bg-[#0c0c0e] rounded-[2.5rem] shadow-[0_0_80px_rgba(255,26,26,0.05),0_30px_70px_rgba(0,0,0,0.85)] border border-neutral-900/60 overflow-hidden z-10 grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Side: Form */}
        <div className="p-10 sm:p-14 flex flex-col justify-center">
          {/* Brand header */}
          <div className="flex items-center gap-2 mb-8">
            <img src="/logo.png" alt="Aura Rider Logo" className="h-7 w-7 object-contain" />
            <span className="text-sm font-black tracking-widest text-white uppercase">AURA RIDER</span>
          </div>

          {/* User Avatar Circle */}
          <div className="flex justify-center mb-8">
            <div className="size-16 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(255,26,26,0.1)]">
              <User className="size-8" />
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="p-3.5 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-full flex items-center gap-2 font-semibold justify-center">
                <ShieldAlert className="size-4 shrink-0" />
                {error}
              </div>
            )}
            
            {/* Username Input */}
            <div className="space-y-1">
              <div className="relative flex items-center group">
                <User className="absolute left-5 size-4.5 text-neutral-500 group-focus-within:text-primary transition-colors" />
                <input
                  id="username"
                  type="text"
                  placeholder="Usuario"
                  className="w-full bg-[#141417] border border-neutral-800 text-white rounded-full py-4.5 pl-14 pr-5 text-sm font-semibold placeholder-neutral-500 focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/10 transition-all"
                  {...register('username')}
                  aria-invalid={errors.username ? 'true' : 'false'}
                />
              </div>
              {errors.username && (
                <p className="text-xs text-destructive font-bold pl-5 mt-1">{errors.username.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="relative flex items-center group">
                <Lock className="absolute left-5 size-4.5 text-neutral-500" />
                <input
                  id="password"
                  type="password"
                  placeholder="Contraseña"
                  className="w-full bg-[#141417] border border-neutral-800 text-white rounded-full py-4.5 pl-14 pr-5 text-sm font-semibold placeholder-neutral-500 focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/10 transition-all"
                  {...register('password')}
                  aria-invalid={errors.password ? 'true' : 'false'}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive font-bold pl-5 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between text-xs text-neutral-500 font-semibold px-3 pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none hover:text-neutral-400 transition-colors">
                <input 
                  type="checkbox" 
                  className="rounded bg-neutral-900 border-neutral-800 text-primary focus:ring-0 focus:ring-offset-0 size-4 cursor-pointer"
                />
                Recordarme
              </label>
              <Link to="#" className="hover:text-primary transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full mt-8 bg-[#ff1a1a] hover:bg-[#e60000] text-white font-black uppercase text-xs tracking-widest rounded-full py-4.5 transition-all duration-300 shadow-[0_4px_25px_rgba(255,26,26,0.3)] hover:shadow-[0_6px_30px_rgba(255,26,26,0.5)] disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando...' : 'INGRESAR'}
            </button>
          </form>
        </div>

        {/* Right Side: Spectacular Image Banner with Welcome Text */}
        <div className="relative hidden md:block w-full h-full bg-[url('https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center">
          {/* Glossy gradient overlay overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/40 to-primary/10" />
          
          {/* Welcome Text elements */}
          <div className="absolute inset-0 flex flex-col justify-end p-14 text-left space-y-4 z-20">
            <h2 className="text-5xl sm:text-6xl font-black text-white leading-none uppercase tracking-tighter">
              BIENVENIDO.
            </h2>
            <p className="text-neutral-350 text-sm max-w-sm font-semibold leading-relaxed">
              Siente la verdadera adrenalina y domina el camino con nuestras motos deportivas de alta gama.
            </p>
            <div className="pt-4 text-sm font-semibold text-neutral-400">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" onClick={clearError} className="text-white hover:text-primary underline font-bold transition-all ml-1">
                Registrate ahora
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
