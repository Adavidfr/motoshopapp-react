import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import type { User } from '../../../../domain/entities/user.entity';
import { UserIcon, Mail, Shield, CheckCircle2, Lock } from 'lucide-react';

const userSchema = z.object({
  username: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
  email: z.string().email('Debe ingresar un correo válido'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  password: z.string().optional(),
  passwordConfirm: z.string().optional(),
  role: z.enum(['admin', 'usuario', 'client']),
  isStaff: z.boolean().optional(),
  isActive: z.boolean().optional(),
}).refine((data) => {
  if (data.password && data.password !== data.passwordConfirm) {
    return false;
  }
  return true;
}, {
  message: 'Las contraseñas no coinciden',
  path: ['passwordConfirm'],
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSubmit: (data: Partial<User> & { password?: string, passwordConfirm?: string }) => Promise<void>;
  isLoading?: boolean;
}

export function UserFormDialog({ open, onOpenChange, user, onSubmit, isLoading }: UserFormDialogProps) {
  const isEditing = !!user;

  const { register, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      role: 'usuario',
      isStaff: false,
      isActive: true,
      password: '',
      passwordConfirm: '',
    },
  });

  useEffect(() => {
    if (user && open) {
      reset({
        username: user.username,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.role as any || 'usuario',
        isStaff: user.isStaff,
        isActive: user.isActive,
        password: '',
        passwordConfirm: '',
      });
    } else if (!user && open) {
      reset({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        role: 'usuario',
        isStaff: false,
        isActive: true,
        password: '',
        passwordConfirm: '',
      });
    }
  }, [user, open, reset]);

  const handleFormSubmit = async (data: UserFormData) => {
    // Si no estamos editando, o si estamos editando y puso contraseña
    const payload: any = { ...data };
    if (isEditing && !payload.password) {
      delete payload.password;
      delete payload.passwordConfirm;
    }
    await onSubmit(payload);
    onOpenChange(false);
  };

  const currentIsStaff = watch('isStaff');
  const currentIsActive = watch('isActive');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            {isEditing ? <Shield className="size-5 text-primary" /> : <UserIcon className="size-5 text-primary" />}
            {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Usuario</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  className="w-full bg-muted/50 border border-border rounded-lg py-2 pl-10 pr-3 text-sm focus:outline-none focus:border-primary/50"
                  placeholder="johndoe"
                  {...register('username')}
                />
              </div>
              {errors.username && <p className="text-xs text-destructive mt-1">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Correo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="email"
                  className="w-full bg-muted/50 border border-border rounded-lg py-2 pl-10 pr-3 text-sm focus:outline-none focus:border-primary/50"
                  placeholder="john@example.com"
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nombre</label>
              <input
                type="text"
                className="w-full bg-muted/50 border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary/50"
                placeholder="John"
                {...register('firstName')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Apellido</label>
              <input
                type="text"
                className="w-full bg-muted/50 border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary/50"
                placeholder="Doe"
                {...register('lastName')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {isEditing ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="password"
                  className="w-full bg-muted/50 border border-border rounded-lg py-2 pl-10 pr-3 text-sm focus:outline-none focus:border-primary/50"
                  placeholder="••••••••"
                  {...register('password')}
                />
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="password"
                  className="w-full bg-muted/50 border border-border rounded-lg py-2 pl-10 pr-3 text-sm focus:outline-none focus:border-primary/50"
                  placeholder="••••••••"
                  {...register('passwordConfirm')}
                />
              </div>
              {errors.passwordConfirm && <p className="text-xs text-destructive mt-1">{errors.passwordConfirm.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rol Base</label>
              <select
                className="w-full bg-muted/50 border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary/50"
                {...register('role')}
              >
                <option value="usuario">Usuario Regular</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="isStaff"
                className="size-4 rounded border-border text-primary focus:ring-primary bg-muted/50"
                checked={currentIsStaff}
                onChange={(e) => setValue('isStaff', e.target.checked)}
              />
              <label htmlFor="isStaff" className="text-sm font-medium text-foreground cursor-pointer select-none">
                Es Staff
              </label>
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="isActive"
                className="size-4 rounded border-border text-primary focus:ring-primary bg-muted/50"
                checked={currentIsActive}
                onChange={(e) => setValue('isActive', e.target.checked)}
              />
              <label htmlFor="isActive" className="text-sm font-medium text-foreground cursor-pointer select-none">
                Activo
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading ? (
                <span className="animate-pulse">Guardando...</span>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
