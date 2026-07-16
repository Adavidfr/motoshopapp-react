// src/presentation/pages/auth/RegisterPage.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../../../application/dtos/auth.dto';
import type { RegisterDto } from '../../../application/dtos/auth.dto';
import { useAuthStore } from '../../store/auth.store';
import { User, Mail, Lock, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerApi, isLoading, error, clearError } = useAuthStore();
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterDto>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterDto) => {
    try {
      await registerApi(data);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
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
          <div className="flex items-center gap-2 mb-6">
            <img src="/logo.png" alt="Aura Rider Logo" className="h-7 w-7 object-contain" />
            <span className="text-sm font-black tracking-widest text-white uppercase">AURA RIDER</span>
          </div>

          <h3 className="text-2xl font-black text-white tracking-tight mb-4 uppercase">
            Crear Cuenta
          </h3>

          {success ? (
            <div className="p-6 text-center text-sm bg-green-500/10 border border-green-500/20 text-green-400 rounded-[2rem] space-y-3 font-semibold">
              <ShieldCheck className="size-8 mx-auto text-green-400 animate-bounce" />
              <div>
                <p className="font-bold text-base text-white">¡Registro Exitoso!</p>
                <p className="text-neutral-400 text-xs mt-1 font-medium">Redirigiendo al inicio de sesión...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    className="w-full bg-[#141417] border border-neutral-800 text-white rounded-full py-3.5 pl-14 pr-5 text-sm font-semibold placeholder-neutral-500 focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/10 transition-all"
                    {...register('username')}
                    aria-invalid={errors.username ? 'true' : 'false'}
                  />
                </div>
                {errors.username && (
                  <p className="text-xs text-destructive font-bold pl-5 mt-1">{errors.username.message}</p>
                )}
              </div>

              {/* Email Input */}
              <div className="space-y-1">
                <div className="relative flex items-center group">
                  <Mail className="absolute left-5 size-4.5 text-neutral-500" />
                  <input
                    id="email"
                    type="email"
                    placeholder="Correo Electrónico"
                    className="w-full bg-[#141417] border border-neutral-800 text-white rounded-full py-3.5 pl-14 pr-5 text-sm font-semibold placeholder-neutral-500 focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/10 transition-all"
                    {...register('email')}
                    aria-invalid={errors.email ? 'true' : 'false'}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive font-bold pl-5 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* First Name & Last Name Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="Nombre"
                    className="w-full bg-[#141417] border border-neutral-800 text-white rounded-full py-3.5 px-5 text-sm font-semibold placeholder-neutral-500 focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/10 transition-all"
                    {...register('firstName')}
                  />
                </div>
                <div>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Apellido"
                    className="w-full bg-[#141417] border border-neutral-800 text-white rounded-full py-3.5 px-5 text-sm font-semibold placeholder-neutral-500 focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/10 transition-all"
                    {...register('lastName')}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <div className="relative flex items-center group">
                  <Lock className="absolute left-5 size-4.5 text-neutral-500" />
                  <input
                    id="password"
                    type="password"
                    placeholder="Contraseña"
                    className="w-full bg-[#141417] border border-neutral-800 text-white rounded-full py-3.5 pl-14 pr-5 text-sm font-semibold placeholder-neutral-500 focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/10 transition-all"
                    {...register('password')}
                    aria-invalid={errors.password ? 'true' : 'false'}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive font-bold pl-5 mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full mt-6 bg-[#ff1a1a] hover:bg-[#e60000] text-white font-black uppercase text-xs tracking-widest rounded-full py-4.5 transition-all duration-300 shadow-[0_4px_20px_rgba(255,26,26,0.25)] hover:shadow-[0_6px_25px_rgba(255,26,26,0.4)] disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Creando...' : 'REGISTRARSE'}
              </button>
            </form>
          )}
        </div>

        {/* Right Side: Spectacular Image Banner with Welcome Text */}
        <div className="relative hidden md:block w-full h-full bg-[url('https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center">
          {/* Glossy gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/40 to-primary/10" />
          
          {/* Welcome Text elements */}
          <div className="absolute inset-0 flex flex-col justify-end p-14 text-left space-y-4 z-20">
            <h2 className="text-5xl sm:text-6xl font-black text-white leading-none uppercase tracking-tighter">
              ÚNETE AL EQUIPO.
            </h2>
            <p className="text-neutral-350 text-sm max-w-sm font-semibold leading-relaxed">
              Crea tu cuenta de piloto para ver los mejores modelos y gestionar tus reservas con total facilidad.
            </p>
            <div className="pt-4 text-sm font-semibold text-neutral-400">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" onClick={clearError} className="text-white hover:text-primary underline font-bold transition-all ml-1">
                Inicia sesión aquí
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
