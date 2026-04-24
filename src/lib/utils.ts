import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateLocal(dateString: string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!dateString) return '---';
  
  try {
    const datePart = dateString.split('T')[0];
    const date = new Date(`${datePart}T00:00:00`);
    if (isNaN(date.getTime())) return 'Fecha Inválida';
    return date.toLocaleDateString('es-AR', options);
  } catch (error) {
    return 'Fecha Inválida';
  }
}
