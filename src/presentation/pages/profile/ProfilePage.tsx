// src/presentation/pages/profile/ProfilePage.tsx
// Vista de perfil de usuario para gestionar la información de ClientePerfil
// Siguiendo los principios de la Arquitectura Hexagonal y vinculando los datos al backend.
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProfileStore } from '../../store/profile.store';
import { updateProfileSchema } from '../../../application/dtos/profile.dto';
import type { UpdateProfileDto } from '../../../application/dtos/profile.dto';
import { Skeleton } from '../../components/ui/skeleton';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  CheckCircle2, AlertCircle, Save, Calendar, Phone, CreditCard, MapPin, User, Mail, Shield
} from 'lucide-react';

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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-2xl space-y-6 px-4">
          <Skeleton className="h-10 w-56 bg-white/[0.06]" />
          <Skeleton className="h-80 w-full rounded-2xl bg-white/[0.06]" />
        </div>
      </div>
    );
  }

  const initials = profile?.username?.substring(0, 2).toUpperCase() || 'AR';

  return (
    <div className="min-h-[80vh] bg-background text-foreground py-10 px-4 sm:px-6 transition-colors duration-300">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Page Header */}
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <User className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">Mi Perfil</h1>
            <p className="text-neutral-500 text-sm font-medium">Información personal y datos de facturación</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-card/60 border border-border/50 rounded-3xl overflow-hidden backdrop-blur-sm">

          {/* Avatar Hero Row */}
          <div className="relative px-8 py-8 border-b border-border/40">
            {/* Background accent */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.04] to-transparent pointer-events-none" />

            <div className="relative flex items-center gap-5">
              {/* Avatar */}
              <div className="relative">
                <div className="size-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-2xl font-black text-primary">{initials}</span>
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
                  <div className="size-2 rounded-full bg-green-300 animate-pulse" />
                </div>
              </div>

              {/* Info */}
              <div className="space-y-1.5">
                <h2 className="text-xl font-black text-foreground">{profile?.username}</h2>
                <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-500">
                  <Mail className="size-3.5" />
                  {profile?.email}
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="size-3.5 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Cuenta Activa</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Alerts */}
              {successMsg && (
                <div className="flex items-center gap-3 p-4 text-sm bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl font-medium">
                  <CheckCircle2 className="size-5 shrink-0" />
                  {successMsg}
                </div>
              )}
              {error && (
                <div className="flex items-center gap-3 p-4 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl font-medium">
                  <AlertCircle className="size-5 shrink-0" />
                  {error}
                </div>
              )}

              {/* Section Title */}
              <div className="flex items-center gap-3">
                <div className="h-[1px] flex-1 bg-border/40" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600">Datos Personales</span>
                <div className="h-[1px] flex-1 bg-border/40" />
              </div>

              {/* Cedula + Telefono */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cedula" className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    <CreditCard className="size-3.5" />
                    Cédula / RUC
                  </Label>
                  <Input
                    id="cedula"
                    placeholder="1722883394"
                    className="bg-white/[0.04] border-white/[0.08] focus:border-primary/40 focus:bg-white/[0.06] rounded-xl h-11 text-sm font-medium placeholder:text-neutral-600 transition-all duration-300"
                    {...register('cedula')}
                    aria-invalid={errors.cedula ? 'true' : 'false'}
                  />
                  {errors.cedula && (
                    <p className="text-xs text-destructive font-bold">{errors.cedula.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono" className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    <Phone className="size-3.5" />
                    Teléfono
                  </Label>
                  <Input
                    id="telefono"
                    placeholder="0992384732"
                    className="bg-white/[0.04] border-white/[0.08] focus:border-primary/40 focus:bg-white/[0.06] rounded-xl h-11 text-sm font-medium placeholder:text-neutral-600 transition-all duration-300"
                    {...register('telefono')}
                    aria-invalid={errors.telefono ? 'true' : 'false'}
                  />
                  {errors.telefono && (
                    <p className="text-xs text-destructive font-bold">{errors.telefono.message}</p>
                  )}
                </div>
              </div>

              {/* Fecha Nacimiento */}
              <div className="space-y-2">
                <Label htmlFor="fechaNacimiento" className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  <Calendar className="size-3.5" />
                  Fecha de Nacimiento
                </Label>
                <Input
                  id="fechaNacimiento"
                  type="date"
                  className="bg-white/[0.04] border-white/[0.08] focus:border-primary/40 focus:bg-white/[0.06] rounded-xl h-11 text-sm font-medium placeholder:text-neutral-600 transition-all duration-300"
                  {...register('fechaNacimiento')}
                  aria-invalid={errors.fechaNacimiento ? 'true' : 'false'}
                />
                {errors.fechaNacimiento && (
                  <p className="text-xs text-destructive font-bold">{errors.fechaNacimiento.message}</p>
                )}
              </div>

              {/* Direccion */}
              <div className="space-y-2">
                <Label htmlFor="direccion" className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  <MapPin className="size-3.5" />
                  Dirección de Facturación / Envío
                </Label>
                <Input
                  id="direccion"
                  placeholder="Av. 10 de Agosto N34 y Av. Eloy Alfaro, Quito"
                  className="bg-white/[0.04] border-white/[0.08] focus:border-primary/40 focus:bg-white/[0.06] rounded-xl h-11 text-sm font-medium placeholder:text-neutral-600 transition-all duration-300"
                  {...register('direccion')}
                  aria-invalid={errors.direccion ? 'true' : 'false'}
                />
                {errors.direccion && (
                  <p className="text-xs text-destructive font-bold">{errors.direccion.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs tracking-widest py-4 rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(255,26,26,0.2)] hover:shadow-[0_6px_30px_rgba(255,26,26,0.35)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
              >
                {isLoading ? (
                  <>
                    <svg className="size-4 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="28" strokeLinecap="round" /></svg>
                    Guardando Cambios...
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    Guardar Cambios
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
