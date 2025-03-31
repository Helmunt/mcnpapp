import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerBackgroundNotificationTask, unregisterBackgroundNotificationTask } from './backgroundNotificationTask';
import { addNotificationToHistory, getUnreadCount, markAllNotificationsAsRead as markAllAsRead, markNotificationAsRead as markAsRead } from './notificationHistoryService';
import { NotificationHistoryItem, NotificationPreferences } from '../types/notificationTypes';
import { notifyNotificationUpdate } from '../components/shared/Header';
import { markSessionAsInvalid } from './sessionValidityService';

// Configuración avanzada para notificaciones en primer plano
// Modificado para mostrar siempre banners y reproducir sonidos en Android cuando la app está en primer plano
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const notificationData = notification.request.content.data;
    
    // Verificar si es una notificación de cierre de sesión forzado
    if (notificationData.type === 'force_logout') {
      // Procesar el cierre de sesión forzado
      await handleForceLogoutNotification(notification);
    }
    
    // Podemos personalizar el comportamiento basado en el tipo de notificación
    const notificationType = notificationData.type || 'default';
    
    // Configuración por defecto
    let shouldShowAlert = true;
    let shouldPlaySound = true;
    let shouldSetBadge = true;
    
    // Personalizar según el tipo de notificación
    switch (notificationType) {
      case 'silent':
        // Notificaciones silenciosas solo actualizan datos sin alerta
        shouldShowAlert = false;
        shouldPlaySound = false;
        shouldSetBadge = false;
        break;
      case 'force_logout':
        // Para notificaciones de cierre de sesión, siempre mostramos alerta
        shouldShowAlert = true;
        shouldPlaySound = true;
        shouldSetBadge = true;
        break;
      case 'important':
        // Notificaciones importantes siempre muestran alerta y sonido
        shouldShowAlert = true;
        shouldPlaySound = true;
        shouldSetBadge = true;
        break;
      case 'default':
      default:
        // Comprobar preferencias del usuario (si las has implementado)
        const userPrefs = await getUserNotificationPreferences();
        shouldShowAlert = userPrefs.showAlerts;
        shouldPlaySound = userPrefs.playSounds;
        shouldSetBadge = userPrefs.setBadges;
        break;
    }
    
    // Para Android, asegurarnos de siempre mostrar la notificación cuando la app está en primer plano
    if (Platform.OS === 'android') {
      shouldShowAlert = true;
      shouldPlaySound = true; // Forzar reproducción de sonido en Android
    }
    
    return {
      shouldShowAlert,
      shouldPlaySound,
      shouldSetBadge,
      priority: Notifications.AndroidNotificationPriority.MAX,
      // Configuración adicional para Android
      androidNotificationVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      android: {
        channelId: 'default',
        vibrationPattern: [0, 250, 250, 250],
        // Hacer que la notificación sea siempre visible
        sticky: false,
        ongoing: false,
        sound: "default", // Asegurar que se usa un sonido para la notificación
      }
    };
  },
});

// Función para manejar notificaciones de cierre de sesión forzado
const handleForceLogoutNotification = async (notification: Notifications.Notification) => {
  try {
    console.log('[NotificationService] Recibida notificación de cierre de sesión forzado');
    
    // Marcar la sesión como inválida usando el nuevo servicio
    await markSessionAsInvalid();
    
    // También mantener el indicador anterior por compatibilidad
    await AsyncStorage.setItem('force_logout_requested', 'true');
    
    // Almacenar mensaje para mostrar en la pantalla de login
    await AsyncStorage.setItem('force_logout_message', 'Tu sesión se ha cerrado porque iniciaste sesión en otro dispositivo.');
    
    // Almacenar esta notificación en el historial
    await saveNotificationToHistory(notification);
    
    // Notificar al sistema que ha habido un cambio en las notificaciones
    if (notifyNotificationUpdate) {
      notifyNotificationUpdate();
    }
    
    return true;
  } catch (error) {
    console.error('[NotificationService] Error al procesar notificación de cierre de sesión:', error);
    return false;
  }
};

// Función para verificar si hay una solicitud de cierre de sesión forzado pendiente
export const checkForPendingForceLogout = async (): Promise<boolean> => {
  try {
    const forceLogoutRequested = await AsyncStorage.getItem('force_logout_requested');
    return forceLogoutRequested === 'true';
  } catch (error) {
    console.error('[NotificationService] Error al verificar cierre de sesión forzado:', error);
    return false;
  }
};

// Función para limpiar la solicitud de cierre de sesión forzado
export const clearForceLogoutRequest = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('force_logout_requested');
  } catch (error) {
    console.error('[NotificationService] Error al limpiar solicitud de cierre de sesión:', error);
  }
};

// Función para obtener preferencias de notificación del usuario
// Puedes expandir esto para soportar preferencias por tipo de notificación
const getUserNotificationPreferences = async () => {
  try {
    const prefsString = await AsyncStorage.getItem('notificationPreferences');
    if (prefsString) {
      return JSON.parse(prefsString);
    }
  } catch (error) {
    console.error('Error al obtener preferencias de notificación:', error);
  }
  
  // Valores predeterminados si no hay preferencias guardadas
  return {
    showAlerts: true,
    playSounds: true,
    setBadges: true
  };
};

// Función para guardar preferencias de notificación
export const saveNotificationPreferences = async (preferences: {
  showAlerts: boolean;
  playSounds: boolean;
  setBadges: boolean;
}) => {
  try {
    await AsyncStorage.setItem('notificationPreferences', JSON.stringify(preferences));
    return true;
  } catch (error) {
    console.error('Error al guardar preferencias de notificación:', error);
    return false;
  }
};

// Función para procesar una notificación recibida en primer plano
export const processForegroundNotification = async (notification: Notifications.Notification) => {
  try {
    const { data } = notification.request.content;
    console.log('[NotificationService] Procesando notificación en primer plano:', data);
    
    // Verificar si es una notificación de cierre de sesión forzado
    if (data && data.type === 'force_logout') {
      await handleForceLogoutNotification(notification);
    } else {
      // Guardar TODAS las notificaciones en el historial inmediatamente
      await saveNotificationToHistory(notification);
      
      // Notificar cambios para actualizar la UI inmediatamente
      notifyNotificationUpdate();
    }
    
    return true;
  } catch (error) {
    console.error('[NotificationService] Error al procesar notificación en primer plano:', error);
    return false;
  }
};

// Función para guardar una notificación en el historial local
const saveNotificationToHistory = async (notification: Notifications.Notification) => {
  try {
    const { title, body, data } = notification.request.content;
    
    // Crear objeto de historial de notificación
    const historyItem: NotificationHistoryItem = {
      id: notification.request.identifier,
      title: title || 'Sin título',
      body: body || 'Sin contenido',
      data: data || {},
      receivedAt: new Date().toISOString(),
      read: false
    };
    
    // Utilizar el nuevo servicio de historial de notificaciones
    return await addNotificationToHistory(historyItem);
  } catch (error) {
    console.error('Error al guardar notificación en historial:', error);
    return false;
  }
};

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    console.log('Las notificaciones push requieren un dispositivo físico');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Solo solicitar permisos si no están ya concedidos
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // Almacenar el estado de los permisos en AsyncStorage
  await AsyncStorage.setItem('notificationPermissionStatus', finalStatus);

  // Verificar si los permisos fueron concedidos
  if (finalStatus !== 'granted') {
    console.log('No se obtuvieron permisos para las notificaciones push');
    return false;
  }

  return true;
};

// Comprobar si los permisos ya fueron concedidos
export const checkNotificationPermissions = async (): Promise<string> => {
  try {
    const storedStatus = await AsyncStorage.getItem('notificationPermissionStatus');
    
    if (storedStatus) {
      return storedStatus;
    }
    
    // Si no hay estado almacenado, verificar con el sistema
    const { status } = await Notifications.getPermissionsAsync();
    await AsyncStorage.setItem('notificationPermissionStatus', status);
    return status;
  } catch (error) {
    console.error('Error al verificar permisos de notificaciones:', error);
    return 'unknown';
  }
};

// Comprobar si las notificaciones están habilitadas
export const areNotificationsEnabled = async (): Promise<boolean> => {
  const status = await checkNotificationPermissions();
  return status === 'granted';
};

// Función para obtener el token de notificaciones push de Expo
export const registerForPushNotifications = async (): Promise<string | null> => {
  try {
    // Verificar si es un dispositivo físico
    if (!Device.isDevice) {
      console.log('Las notificaciones push requieren un dispositivo físico');
      return null;
    }

    // Solicitar permisos si aún no se han concedido
    const permissionGranted = await requestNotificationPermissions();
    if (!permissionGranted) {
      console.log('No se obtuvieron permisos para las notificaciones push');
      return null;
    }

    // Obtener el token push de Expo
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    
    if (!projectId) {
      console.error('No se encontró el projectId en Constants.expoConfig.extra.eas');
      return null;
    }
    
    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId: projectId
    });

    // Guardar el token en el almacenamiento local
    await AsyncStorage.setItem('expoPushToken', token);

    // Configuración adicional para Android
    if (Platform.OS === 'android') {
      // Crear un canal de notificación con la máxima prioridad para Android
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true, // Ignorar el modo No molestar si es posible
        sound: "default", // Habilitar sonido en el canal de notificaciones
        enableVibrate: true, // Habilitar vibración
        showBadge: true, // Mostrar contador en el icono de la app
      });
    }

    console.log('Token de notificaciones obtenido:', token);
    return token;
  } catch (error) {
    console.error('Error al registrar las notificaciones push:', error);
    return null;
  }
};

// Función para recuperar el token almacenado (útil cuando la app ya tiene un token)
export const getStoredPushToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('expoPushToken');
    return token;
  } catch (error) {
    console.error('Error al recuperar el token de push:', error);
    return null;
  }
};

// Función para configurar todo el sistema de notificaciones (primer plano y segundo plano)
export const setupNotificationSystem = async (): Promise<boolean> => {
  try {
    // Verificar y solicitar permisos si es necesario
    const permissionGranted = await requestNotificationPermissions();
    if (!permissionGranted) {
      console.log('No se pudieron obtener permisos para notificaciones');
      return false;
    }
    
    // Registrar tareas en segundo plano
    await registerBackgroundNotificationTask();
    
    // Obtener y registrar el token de notificaciones si es necesario
    await registerForPushNotifications();
    
    return true;
  } catch (error) {
    console.error('Error al configurar sistema de notificaciones:', error);
    return false;
  }
};

// Función para manejar notificaciones recibidas en segundo plano
export const handleBackgroundNotification = async (notification: Notifications.Notification): Promise<boolean> => {
  try {
    console.log('[NotificationService] Procesando notificación recibida en segundo plano:', notification.request?.identifier);
    
    const title = notification.request?.content?.title || 'Sin título';
    const body = notification.request?.content?.body || 'Sin contenido';
    const data = notification.request?.content?.data || {};
    const id = notification.request?.identifier || `notification-${Date.now()}`;
    
    // Verificar si es una notificación de cierre de sesión forzado
    if (data && data.type === 'force_logout') {
      console.log('[NotificationService] Procesando notificación de cierre de sesión forzado');
      // Marcar la sesión como inválida
      await markSessionAsInvalid();
      
      // También mantener el indicador anterior por compatibilidad
      await AsyncStorage.setItem('force_logout_requested', 'true');
      
      // Almacenar mensaje para mostrar en la pantalla de login
      await AsyncStorage.setItem('force_logout_message', 'Tu sesión se ha cerrado porque iniciaste sesión en otro dispositivo.');
    }
    
    // Crear objeto de historial de notificación
    const historyItem: NotificationHistoryItem = {
      id: id,
      title: title,
      body: body,
      data: data,
      receivedAt: new Date().toISOString(),
      read: false,
      receivedInBackground: true
    };
    
    // Usar el nuevo servicio de historial para añadir la notificación
    const success = await addNotificationToHistory(historyItem);
    
    // Asegurarnos de notificar explícitamente a los componentes
    if (notifyNotificationUpdate) {
      try {
        notifyNotificationUpdate();
        console.log('[NotificationService] Notificación de actualización enviada');
      } catch (error) {
        console.error('[NotificationService] Error al notificar cambios:', error);
      }
    }
    
    return success;
  } catch (error) {
    console.error('[NotificationService] Error al manejar notificación en segundo plano:', error);
    return false;
  }
};

// Función para obtener el número de notificaciones no leídas
// Delegada al nuevo servicio
export const getUnreadNotificationsCount = async (): Promise<number> => {
  return await getUnreadCount();
};

// Función para marcar todas las notificaciones como leídas
// Delegada al nuevo servicio
export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  return await markAllAsRead();
};

// Función para marcar una notificación específica como leída
// Delegada al nuevo servicio
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  return await markAsRead(notificationId);
};