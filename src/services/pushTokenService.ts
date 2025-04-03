import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_URL } from '../constants/api';
import * as Application from 'expo-application';

// Clave para almacenar el User ID asociado al último token enviado
const PUSH_TOKEN_USER_ID_KEY = 'pushTokenUserId';

// Interfaz para el payload que enviaremos al servidor
interface RegisterTokenPayload {
  token: string;
  device_type: 'ios' | 'android' | 'web';
  device_name?: string;
  app_version?: string;
  user_id?: number;
  force_logout_previous?: boolean; // Campo para indicar cierre forzado de sesión anterior
}

/**
 * Registra/Actualiza el token de notificaciones push en el servidor de WordPress.
 * Esta función AHORA se encarga de enviar siempre la data al backend.
 * El backend (plugin WP) decidirá si es una inserción o actualización.
 * Incluye lógica para detectar cambio de usuario y solicitar force_logout.
 */
export const registerPushTokenWithServer = async (
  expoPushToken: string,
  jwtToken: string,
  userId: number
): Promise<boolean> => {
  try {
    // --- Obtener datos del dispositivo y la app ---
    const deviceType = Platform.OS === 'ios' ? 'ios' : 'android';
    const deviceName = await AsyncStorage.getItem('deviceName') || Platform.OS;
    // Obtener la versión de la aplicación NATIVA instalada
    const appVersion = Application.nativeApplicationVersion || 'Unknown'; // Usar 'Unknown' si falla

    // --- Lógica de Detección de Cambio de Usuario ---
    let forceLogoutPrevious = false;
    const previousUserIdStr = await AsyncStorage.getItem(PUSH_TOKEN_USER_ID_KEY);
    if (previousUserIdStr) {
      const previousUserId = parseInt(previousUserIdStr, 10);
      if (previousUserId !== userId) {
        // El usuario actual es DIFERENTE al último que registró token en este dispositivo
        forceLogoutPrevious = true;
        console.log(`[PushTokenService] Cambio de usuario detectado: de ${previousUserId} a ${userId}. Solicitando cierre de sesión anterior.`);
      }
    }

    // --- Preparar payload para el backend ---
    const payload: RegisterTokenPayload = {
      token: expoPushToken,
      device_type: deviceType,
      device_name: deviceName,
      app_version: appVersion, // Siempre enviar la versión actual de la app instalada
      user_id: userId,
      force_logout_previous: forceLogoutPrevious // Indica al backend si debe cerrar sesión en otros tokens del *nuevo* usuario
    };

    console.log(`[PushTokenService] Intentando registrar/actualizar token para User ID: ${userId}, App Version: ${appVersion}, Device: ${deviceName}`);
    if (forceLogoutPrevious) {
      console.log(`[PushTokenService] Se indicará al backend forzar cierre de sesiones anteriores del usuario ${userId} si es necesario.`);
    }

    // --- Llamada a la API de WordPress ---
    const response = await axios.post(
      `${API_URL}/wp-json/mcnp/v1/push-token/register`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}` // Requiere autenticación
        }
      }
    );

    // --- Manejo de Respuesta ---
    if (response.status === 200 || response.status === 201) {
      console.log(`[PushTokenService] Token registrado/actualizado exitosamente en el servidor para User ID: ${userId}. Respuesta:`, response.data);

      // Guardar el User ID actual asociado a este dispositivo/token
      await AsyncStorage.setItem(PUSH_TOKEN_USER_ID_KEY, userId.toString());

      // Opcional: Limpiar la marca antigua de "registrado" si existía, ya no la usamos para decidir
      await AsyncStorage.removeItem('pushTokenRegistered');

      return true;
    } else {
      // La API respondió pero no con éxito (ej: 4xx, 5xx)
      console.error(`[PushTokenService] Error al registrar token en el servidor. Status: ${response.status}`, response.data);
      return false;
    }
  } catch (error: any) {
    // Error en la llamada (network, etc.)
    if (axios.isAxiosError(error)) {
      console.error('[PushTokenService] Error de Axios al enviar token al servidor:', error.response?.status, error.response?.data || error.message);
    } else {
      console.error('[PushTokenService] Error inesperado al enviar token al servidor:', error);
    }
    return false;
  }
};

/**
 * Función auxiliar para obtener el User ID asociado al último token registrado localmente.
 */
export const getLastRegisteredUserId = async (): Promise<number | null> => {
  try {
    const userIdStr = await AsyncStorage.getItem(PUSH_TOKEN_USER_ID_KEY);
    return userIdStr ? parseInt(userIdStr, 10) : null;
  } catch (error) {
    console.error('[PushTokenService] Error al obtener el último User ID registrado:', error);
    return null;
  }
};

/**
 * Limpia el User ID guardado localmente (útil al cerrar sesión).
 */
export const clearLastRegisteredUserId = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PUSH_TOKEN_USER_ID_KEY);
    // También limpiar la marca antigua si aún existe
    await AsyncStorage.removeItem('pushTokenRegistered');
    console.log('[PushTokenService] User ID local limpiado.');
  } catch (error) {
    console.error('[PushTokenService] Error al limpiar el User ID local:', error);
  }
};

// Las funciones isPushTokenRegistered, markTokenAsUnregistered y updatePushTokenIfNeeded
// se eliminan o comentan ya que su lógica basada en el flag local 'pushTokenRegistered'
// ya no aplica de la misma manera. La decisión de llamar a registerPushTokenWithServer
// se hará desde fuera de este servicio (ej: al inicio, al loguear).

/*
// --- FUNCIONES OBSOLETAS (basadas en el flag local 'pushTokenRegistered') ---

// export const isPushTokenRegistered = async (userId: number): Promise<boolean> => { ... };
// export const markTokenAsUnregistered = async (): Promise<void> => { ... };
// export const updatePushTokenIfNeeded = async ( ... ): Promise<boolean> => { ... };
*/