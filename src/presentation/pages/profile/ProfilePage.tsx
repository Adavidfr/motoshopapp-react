// src/presentation/pages/profile/ProfilePage.tsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProfileStore } from '../../store/profile.store';
import { updateProfileSchema } from '../../../application/dtos/profile.dto';
import type { UpdateProfileDto } from '../../../application/dtos/profile.dto';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { CheckCircle, AlertCircle, Save, Calendar, Phone, CreditCard, MapPin } from 'lucide-react';

export default function ProfilePage() {
  const { profile, fetchProfile, updateProfile, isLoading, error } = useProfileStore();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateProfileDto>({
    resolver: zodResolver(updateProfileSchema),
  });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      reset({
        cedula: profile.cedula,
        telefono: profile.telefono,
        direccion: profile.direccion,
        fechaNacimiento: profile.fechaNacimiento || '',
        fotoPerfil: profile.fotoPerfil || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: UpdateProfileDto) => {
    setSuccessMsg(null);
    try {
      await updateProfile(data);
      setSuccessMsg('¡Perfil actualizado con éxito!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      // Error manejado en el store
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground text-sm">
          Edita tu información personal y datos de facturación/envío
        </p>
      </div>

      <Card className="border-border/40 shadow-md">
        <CardHeader className="border-b border-border/40 pb-6">
          <div className="flex items-center gap-4">
            <span className="text-4xl bg-primary/10 text-primary p-4 rounded-3xl font-bold flex items-center justify-center size-16">
              {profile?.username?.substring(0, 2).toUpperCase() || 'US'}
            </span>
            <div>
              <CardTitle className="text-xl font-bold">{profile?.username}</CardTitle>
              <CardDescription>{profile?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {successMsg && (
              <div className="p-3 text-sm bg-green-500/10 border border-green-500/25 text-green-500 rounded-lg flex items-center gap-2 font-medium">
                <CheckCircle className="size-4" />
                {successMsg}
              </div>
            )}

            {error && (
              <div className="p-3 text-sm bg-destructive/10 border border-destructive/25 text-destructive rounded-lg flex items-center gap-2 font-medium">
                <AlertCircle className="size-4" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cedula */}
              <div className="space-y-2">
                <Label htmlFor="cedula" className="flex items-center gap-1.5 text-xs font-semibold">
                  <CreditCard className="size-3.5 text-muted-foreground" />
                  Cédula / RUC
                </Label>
                <Input
                  id="cedula"
                  placeholder="1722883394"
                  {...register('cedula')}
                  aria-invalid={errors.cedula ? 'true' : 'false'}
                />
                {errors.cedula && (
                  <p className="text-xs text-destructive">{errors.cedula.message}</p>
                )}
              </div>

              {/* Telefono */}
              <div className="space-y-2">
                <Label htmlFor="telefono" className="flex items-center gap-1.5 text-xs font-semibold">
                  <Phone className="size-3.5 text-muted-foreground" />
                  Teléfono de Contacto
                </Label>
                <Input
                  id="telefono"
                  placeholder="0992384732"
                  {...register('telefono')}
                  aria-invalid={errors.telefono ? 'true' : 'false'}
                />
                {errors.telefono && (
                  <p className="text-xs text-destructive">{errors.telefono.message}</p>
                )}
              </div>
            </div>

            {/* Fecha Nacimiento */}
            <div className="space-y-2">
              <Label htmlFor="fechaNacimiento" className="flex items-center gap-1.5 text-xs font-semibold">
                <Calendar className="size-3.5 text-muted-foreground" />
                Fecha de Nacimiento
              </Label>
              <Input
                id="fechaNacimiento"
                type="date"
                {...register('fechaNacimiento')}
                aria-invalid={errors.fechaNacimiento ? 'true' : 'false'}
              />
              {errors.fechaNacimiento && (
                <p className="text-xs text-destructive">{errors.fechaNacimiento.message}</p>
              )}
            </div>

            {/* Direccion */}
            <div className="space-y-2">
              <Label htmlFor="direccion" className="flex items-center gap-1.5 text-xs font-semibold">
                <MapPin className="size-3.5 text-muted-foreground" />
                Dirección Completa de Facturación / Envío
              </Label>
              <Input
                id="direccion"
                placeholder="Av. 10 de Agosto N34 y Av. Eloy Alfaro, Quito"
                {...register('direccion')}
                aria-invalid={errors.direccion ? 'true' : 'false'}
              />
              {errors.direccion && (
                <p className="text-xs text-destructive">{errors.direccion.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full gap-2 mt-4" disabled={isLoading}>
              <Save className="size-4" />
              {isLoading ? 'Guardando Cambios...' : 'Guardar Cambios'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
