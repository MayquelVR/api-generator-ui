import { v7 as uuidv7, validate, version } from 'uuid';

/**
 * Generador de UUID v7 (Time-ordered UUID)
 * Utiliza la librería uuid v13.0.0
 * UUID v7 combina timestamp con aleatoriedad para mantener orden cronológico
 */
export function generateUuidV7(): string {
  return uuidv7();
}

/**
 * Valida si un string es un UUID válido (cualquier versión)
 */
export function isValidUuid(uuid: string): boolean {
  return validate(uuid);
}

/**
 * Valida si un string es específicamente un UUID v7
 */
export function isValidUuidV7(uuid: string): boolean {
  return validate(uuid) && version(uuid) === 7;
}
