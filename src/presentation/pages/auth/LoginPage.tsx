// src/presentation/pages/auth/LoginPage.tsx
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../../application/dtos/auth.dto';
import type { LoginDto } from '../../../application/dtos/auth.dto';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { User, Lock, ArrowRight, ShieldAlert } from 'lucide-react';

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
    <div className="flex min-h-[75vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="w-full max-w-md glass-card shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-primary/10">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="mx-auto bg-primary/10 text-primary w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner border border-primary/20">
            🏍️
          </div>
          <CardTitle className="text-3xl font-black tracking-tight text-white mt-2">
            BIENVENIDO DE VUELTA
          </CardTitle>
          <CardDescription className="text-neutral-400 text-sm font-medium">
            Ingresa a tu cuenta para gestionar tus motocicletas
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
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
              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  placeholder="juan_perez"
                  className="bg-neutral-900/40 border-neutral-800 focus:border-primary/50 rounded-xl py-5"
                  {...register('username')}
                  aria-invalid={errors.username ? 'true' : 'false'}
                />
              </div>
              {errors.username && (
                <p className="text-xs text-destructive font-semibold">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold text-neutral-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Lock className="size-3.5 text-primary" />
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-neutral-900/40 border-neutral-800 focus:border-primary/50 rounded-xl py-5"
                  {...register('password')}
                  aria-invalid={errors.password ? 'true' : 'false'}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive font-semibold">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full mt-6 btn-primary-gradient font-bold rounded-xl py-6 flex items-center justify-center gap-2 text-sm shadow-lg" disabled={isLoading}>
              {isLoading ? 'Iniciando Sesión...' : 'Ingresar'}
              <ArrowRight className="size-4.5" />
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-xs text-neutral-400 border-t border-border/20 pt-4 mt-2">
          <div>
            ¿Aún no tienes cuenta?{' '}
            <Link to="/register" onClick={clearError} className="text-primary hover:underline font-bold transition-all">
              Crea una cuenta aquí
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
