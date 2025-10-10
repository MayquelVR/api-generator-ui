/**
 * Configuración de entorno para PRODUCCIÓN
 * Este archivo se usa cuando ejecutas: ng build --configuration production
 */
export const environment = {
  production: true,
  apiUrl: 'https://api.tu-dominio.com/api', // ← Cambia esto por tu URL de producción
  appName: 'API Generator UI',
  enableDebugLogs: false
};
