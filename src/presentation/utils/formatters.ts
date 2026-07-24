// src/presentation/utils/formatters.ts

/**
 * Formatea un número como precio en dólares.
 * Ejemplo: 1234.5 → "$1,234.50"
 */
export function formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount)
}

/**
 * Formatea una fecha ISO a formato legible.
 * Ejemplo: "2024-03-15T10:30:00Z" → "Mar 15, 2024"
 */
export function formatDate(iso: string): string {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(iso))
}

/**
 * Fecha y hora legibles para auditoría.
 * Ejemplo: "23 jul 2026, 20:15"
 */
export function formatDateTime(iso: string): string {
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(iso))
}

/** Fecha y hora en líneas separadas (historial / auditoría). */
export function formatDateTimeParts(iso: string): { date: string; time: string } {
    const d = new Date(iso);
    return {
        date: new Intl.DateTimeFormat('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        }).format(d),
        time: new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).format(d),
    };
}