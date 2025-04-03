import axios from 'axios';
import { Alert, Linking, Platform } from 'react-native';
import * as Application from 'expo-application';
import { API_URL } from '../constants/api';

// Interfaz para la respuesta de la API de versión
interface AppVersionInfo {
  version: {
    latest: string;
    minimum: string;
    update_type: 'forced' | 'recommended' | 'silent';
  };
  store_urls: {
    ios?: string;
    android?: string;
  };
  message?: string;
}

/**
 * Compara dos versiones semánticas (formato X.Y.Z).
 * Devuelve: -1 (v1<v2), 0 (v1==v2), 1 (v1>v2)
 */
const compareVersions = (v1: string, v2: string): number => {
  const parts1 = (v1 || '0.0.0').split('.').map(Number);
  const parts2 = (v2 || '0.0.0').split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }
  return 0;
};

/**
 * Abre la URL de la tienda de aplicaciones.
 */
const openStore = (urls: AppVersionInfo['store_urls']): void => {
  const storeUrl = Platform.OS === 'ios' ? urls.ios : urls.android;
  if (storeUrl) {
    Linking.canOpenURL(storeUrl).then(supported => {
      if (supported) {
        Linking.openURL(storeUrl);
      } else {
        console.error(`[AppVersionService] No se puede abrir URL: ${storeUrl}`);
        Alert.alert('Error', 'No se pudo abrir la tienda de aplicaciones.');
      }
    }).catch(err => {
        console.error('[AppVersionService] Error al abrir URL:', err);
        Alert.alert('Error', 'Ocurrió un error al abrir la tienda.');
    });
  } else {
    console.warn('[AppVersionService] No URL de tienda para:', Platform.OS);
    Alert.alert('Actualización Requerida', 'Actualiza la app desde tu tienda.');
  }
};

/**
 * Helper para quitar tags HTML simples. Definida una sola vez aquí.
 */
const stripHtml = (html: string = ''): string => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, ''); // Elimina tags como <span...> o </p>
};

/**
 * Verifica la versión de la app contra el backend y maneja la lógica de actualización.
 * Devuelve `true` si la app puede continuar, `false` si una actualización obligatoria la bloquea.
 */
export const checkAppVersionAndUpdate = async (): Promise<boolean> => {
  try {
    console.log('[AppVersionService] Verificando versión de la aplicación...');
    const currentVersion = Application.nativeApplicationVersion || '0.0.0';
    console.log(`[AppVersionService] Versión actual instalada: ${currentVersion}`);

    const response = await axios.get<AppVersionInfo>(`${API_URL}/wp-json/mcnp/v1/app-version`);

    if (response.status !== 200 || !response.data?.version) {
      console.error('[AppVersionService] Respuesta inválida desde API:', response.status);
      return true; // Permitir continuar si falla la API
    }

    const versionInfo = response.data;
    const { latest, minimum, update_type } = versionInfo.version;
    // Limpiar el mensaje del backend UNA SOLA VEZ aquí
    const cleanMessage = stripHtml(versionInfo.message || 'Hay una nueva versión disponible.');
    const storeUrls = versionInfo.store_urls;

    console.log(`[AppVersionService] Backend dice: Mínima=${minimum}, Última=${latest}, Política=${update_type}`);

    // --- Comparación Mínima ---
    if (compareVersions(currentVersion, minimum) < 0) {
      console.log(`[AppVersionService] ¡OBLIGATORIA! Actual=${currentVersion} < Mínima=${minimum}.`);
      Alert.alert(
        'Actualización Requerida',
        // Usar variables correctamente con ${} y el mensaje limpio
        `Tu versión (${currentVersion}) está desactualizada. Actualiza a la versión ${latest} para continuar.\n\n${cleanMessage}`,
        [{ text: 'Actualizar Ahora', onPress: () => openStore(storeUrls) }],
        { cancelable: false }
      );
      return false; // Bloquear
    }

    // --- Comparación Última ---
    if (compareVersions(currentVersion, latest) < 0) {
      console.log(`[AppVersionService] DISPONIBLE. Actual=${currentVersion} < Última=${latest}.`);
      switch (update_type) {
        case 'forced':
          console.log('[AppVersionService] Política: Forzada.');
          Alert.alert(
            'Actualización Necesaria',
            // Usar variables correctamente con ${} y el mensaje limpio
            `Actualiza la aplicación a la versión ${latest} para asegurar el funcionamiento.\n\n${cleanMessage}`,
            [{ text: 'Actualizar Ahora', onPress: () => openStore(storeUrls) }],
            { cancelable: false }
          );
          return false; // Bloquear

        case 'recommended':
          console.log('[AppVersionService] Política: Recomendada.');
          Alert.alert(
            'Actualización Disponible',
            // Usar variables correctamente con ${} y el mensaje limpio
            `Te recomendamos actualizar a la versión ${latest} para obtener mejoras.\n\n${cleanMessage}`,
            [
              { text: 'Actualizar Ahora', onPress: () => openStore(storeUrls) },
              { text: 'Más Tarde', style: 'cancel' },
            ]
          );
          return true; // No bloquear

        case 'silent':
        default:
          console.log('[AppVersionService] Política: Silenciosa. No se notificará.');
          return true; // No bloquear
      }
    }

    // --- Actualizado ---
    console.log(`[AppVersionService] La versión ${currentVersion} está actualizada.`);
    return true; // Continuar

  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error('[AppVersionService] Error Axios:', error.response?.status, error.message);
    } else {
      console.error('[AppVersionService] Error inesperado:', error);
    }
    return true; // Permitir continuar si hay error
  }
};