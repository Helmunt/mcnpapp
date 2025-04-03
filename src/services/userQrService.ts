import { API_URL } from '../constants/api';

/**
 * Obtiene la URL del código QR del usuario desde WordPress
 * @param userId ID del usuario actual
 * @param token Token JWT para autenticación
 * @returns La URL del código QR o null si ocurre un error
 */
export const getUserQrUrl = async (userId: number, token: string): Promise<string | null> => {
  try {
    // Usar el nuevo endpoint específico para QR
    const url = `${API_URL}/wp-json/mcnp/v1/user-qr-code`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('[userQrService] Error al obtener código QR:', response.status);
      return null;
    }

    const data = await response.json();
    
    // Verificar si la respuesta contiene la URL del QR
    if (!data.success || !data.qr_url) {
      console.log('[userQrService] No se encontró URL de QR para el usuario');
      return null;
    }
    
    return data.qr_url;
  } catch (error) {
    console.error('[userQrService] Error al obtener URL de QR:', error);
    return null;
  }
};