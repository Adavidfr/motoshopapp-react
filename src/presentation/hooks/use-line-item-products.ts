import { useEffect, useMemo } from 'react';
import type { ItemCarrito } from '../../domain/entities/cart.entity';
import type { Moto } from '../../domain/entities/moto.entity';
import type { Repuesto } from '../../domain/entities/repuesto.entity';
import { useMotoStore } from '../store/moto.store';
import { useRepuestoStore } from '../store/repuesto.store';

function uniqueSortedIds(values: Array<number | null>): number[] {
  return [...new Set(values.filter((id): id is number => id !== null))].sort((a, b) => a - b);
}

export function useLineItemProducts(items: ItemCarrito[]) {
  const motoIds = useMemo(() => uniqueSortedIds(items.map((item) => item.idMoto)), [items]);
  const repuestoIds = useMemo(() => uniqueSortedIds(items.map((item) => item.idRepuesto)), [items]);

  const motoIdsKey = motoIds.join(',');
  const repuestoIdsKey = repuestoIds.join(',');

  const {
    motos,
    ensureMotosByIds,
    loadingMotoIds,
    unavailableMotoIds,
  } = useMotoStore();
  const {
    repuestos,
    ensureRepuestosByIds,
    loadingRepuestoIds,
    unavailableRepuestoIds,
  } = useRepuestoStore();

  useEffect(() => {
    if (motoIds.length > 0) {
      void ensureMotosByIds(motoIds);
    }
  }, [motoIdsKey, ensureMotosByIds, motoIds]);

  useEffect(() => {
    if (repuestoIds.length > 0) {
      void ensureRepuestosByIds(repuestoIds);
    }
  }, [repuestoIdsKey, ensureRepuestosByIds, repuestoIds]);

  const getMoto = (id: number): Moto | null => motos.find((m) => m.idMoto === id) ?? null;
  const getRepuesto = (id: number): Repuesto | null =>
    repuestos.find((r) => r.idRepuesto === id) ?? null;

  const isMotoLoading = (id: number): boolean => loadingMotoIds.includes(id);
  const isRepuestoLoading = (id: number): boolean => loadingRepuestoIds.includes(id);
  const isMotoUnavailable = (id: number): boolean => unavailableMotoIds.includes(id);
  const isRepuestoUnavailable = (id: number): boolean => unavailableRepuestoIds.includes(id);

  return {
    getMoto,
    getRepuesto,
    isMotoLoading,
    isRepuestoLoading,
    isMotoUnavailable,
    isRepuestoUnavailable,
  };
}
