// src/presentation/pages/auth/RegisterPage.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../../../application/dtos/auth.dto';
import type { RegisterDto } from '../../../application/dtos/auth.dto';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { User, Mail, Lock, ArrowRight, ShieldCheck, ShieldAlert } from 'lucide-react';

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
    <div className="flex min-h-[75vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="w-full max-w-md glass-card shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-primary/10">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="mx-auto bg-primary/10 text-primary w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner border border-primary/20">
            🏁
          </div>
          <CardTitle className="text-3xl font-black tracking-tight text-white mt-2">
            REGISTRARSE
          </CardTitle>
          <CardDescription className="text-neutral-400 text-sm font-medium">
            Completa tus datos para crear una nueva cuenta de cliente
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          {success ? (
            <div className="p-5 text-center text-sm bg-green-500/10 border border-green-500/25 text-green-400 rounded-xl space-y-3 font-semibold">
              <ShieldCheck className="size-8 mx-auto text-green-400 animate-bounce" />
              <div>
                <p className="font-bold text-base text-white">¡Registro Exitoso!</p>
                <p className="text-neutral-300 text-xs font-medium mt-1">Redirigiendo al inicio de sesión...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-3.5 text-xs bg-destructive/10 border border-destructive/25 text-destructive rounded-xl flex items-center gap-2 font-semibold">
                  <ShieldAlert className="size-4 shrink-0" />
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs font-bold text-neutral-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <User className="size-3.5 text-primary" />
                  Usuario
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="juan_perez"
                  className="bg-neutral-900/40 border-neutral-800 focus:border-primary/50 rounded-xl py-5"
                  {...register('username')}
                  aria-invalid={errors.username ? 'true' : 'false'}
                />
                {errors.username && (
                  <p className="text-xs text-destructive font-semibold">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold text-neutral-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Mail className="size-3.5 text-primary" />
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="juan@ejemplo.com"
                  className="bg-neutral-900/40 border-neutral-800 focus:border-primary/50 rounded-xl py-5"
                  {...register('email')}
                  aria-invalid={errors.email ? 'true' : 'false'}
                />
                {errors.email && (
                  <p className="text-xs text-destructive font-semibold">{errors.email.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    Nombre
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Juan"
                    className="bg-neutral-900/40 border-neutral-800 focus:border-primary/50 rounded-xl py-5"
                    {...register('firstName')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    Apellido
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Pérez"
                    className="bg-neutral-900/40 border-neutral-800 focus:border-primary/50 rounded-xl py-5"
                    {...register('lastName')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-bold text-neutral-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Lock className="size-3.5 text-primary" />
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-neutral-900/40 border-neutral-800 focus:border-primary/50 rounded-xl py-5"
                  {...register('password')}
                  aria-invalid={errors.password ? 'true' : 'false'}
                />
                {errors.password && (
                  <p className="text-xs text-destructive font-semibold">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full mt-6 btn-primary-gradient font-bold rounded-xl py-6 flex items-center justify-center gap-2 text-sm shadow-lg" disabled={isLoading}>
                {isLoading ? 'Creando cuenta...' : 'Registrar Cuenta'}
                <ArrowRight className="size-4.5" />
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-xs text-neutral-400 border-t border-border/20 pt-4 mt-2">
          <div>
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" onClick={clearError} className="text-primary hover:underline font-bold transition-all">
              Inicia sesión aquí
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
