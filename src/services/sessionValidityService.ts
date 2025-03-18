import AsyncStorage from '@react-native-async-storage/async-storage';

// Claves para almacenamiento
const SESSION_VALID_KEY = 'session_valid';
const LAST_VALIDITY_CHECK_KEY = 'last_validity_check';
const SESSION_START_TIME_KEY = 'session_start_time';

/**
 * Marca la sesión como válida (generalmente al iniciar sesión)
 */
export const markSessionAsValid = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(SESSION_VALID_KEY, 'true');
    // Guardar timestamp del inicio de sesión
    await AsyncStorage.setItem(SESSION_START_TIME_KEY, Date.now().toString());
    // Actualizar última verificación
    await AsyncStorage.setItem(LAST_VALIDITY_CHECK_KEY, Date.now().toString());
    
    console.log('[SessionValidity] Sesión marcada como válida');
  } catch (error) {
    console.error('[SessionValidity] Error al marcar sesión como válida:', error);
  }
};

/**
 * Marca la sesión como inválida (generalmente al recibir notificación de cierre forzado)
 */
export const markSessionAsInvalid = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(SESSION_VALID_KEY, 'false');
    console.log('[SessionValidity] Sesión marcada como inválida');
  } catch (error) {
    console.error('[SessionValidity] Error al marcar sesión como inválida:', error);
  }
};

/**
 * Verifica si la sesión actual es válida
 * @returns {Promise<boolean>} true si la sesión es válida, false si no
 */
export const isSessionValid = async (): Promise<boolean> => {
  try {
    // Obtener estado de validez
    const validity = await AsyncStorage.getItem(SESSION_VALID_KEY);
    
    // Si no hay valor, asumir que es válida (comportamiento seguro)
    if (validity === null) {
      return true;
    }
    
    // Registrar verificación
    await AsyncStorage.setItem(LAST_VALIDITY_CHECK_KEY, Date.now().toString());
    
    return validity === 'true';
  } catch (error) {
    console.error('[SessionValidity] Error al verificar validez de sesión:', error);
    // En caso de error, asumir que es válida para no cerrar sesiones por errores técnicos
    return true;
  }
};

/**
 * Limpia los datos de validez de sesión (generalmente al cerrar sesión)
 */
export const clearSessionValidity = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      SESSION_VALID_KEY,
      LAST_VALIDITY_CHECK_KEY,
      SESSION_START_TIME_KEY
    ]);
    console.log('[SessionValidity] Datos de validez de sesión eliminados');
  } catch (error) {
    console.error('[SessionValidity] Error al limpiar datos de validez:', error);
  }
};

/**
 * Obtiene información de diagnóstico sobre la sesión actual
 */
export const getSessionDiagnostics = async (): Promise<{
  isValid: boolean;
  startTime: string | null;
  lastCheck: string | null;
  elapsedTime: string;
}> => {
  try {
    const validity = await AsyncStorage.getItem(SESSION_VALID_KEY);
    const startTimeStr = await AsyncStorage.getItem(SESSION_START_TIME_KEY);
    const lastCheckStr = await AsyncStorage.getItem(LAST_VALIDITY_CHECK_KEY);
    
    let elapsedTime = 'N/A';
    if (startTimeStr) {
      const startTime = parseInt(startTimeStr);
      const now = Date.now();
      const elapsed = now - startTime;
      // Formatear tiempo transcurrido
      const minutes = Math.floor(elapsed / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (days > 0) {
        elapsedTime = `${days}d ${hours % 24}h ${minutes % 60}m`;
      } else if (hours > 0) {
        elapsedTime = `${hours}h ${minutes % 60}m`;
      } else {
        elapsedTime = `${minutes}m`;
      }
    }
    
    return {
      isValid: validity === 'true',
      startTime: startTimeStr,
      lastCheck: lastCheckStr,
      elapsedTime
    };
  } catch (error) {
    console.error('[SessionValidity] Error al obtener diagnóstico:', error);
    return {
      isValid: true,
      startTime: null,
      lastCheck: null,
      elapsedTime: 'Error'
    };
  }
};