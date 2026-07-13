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