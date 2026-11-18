import { ValueTransformer } from 'typeorm';

/**
 * PostgreSQL devuelve las columnas decimal como string para no perder precisión.
 * Este transformer las convierte a number al leerlas de la base de datos.
 * Uso: @Column({ type: 'decimal', precision: 10, scale: 2, transformer: decimalTransformer })
 */
export const decimalTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | null) => (value == null ? null : Number(value)),
};
