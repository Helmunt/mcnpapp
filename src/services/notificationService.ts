import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerBackgroundNotificationTask, unregisterBackgroundNotificationTask } from './backgroundNotificationTask';
import { addNotificationToHistory, getUnreadCount, markAllNotificationsAsRead as markAllAsRead, markNotificationAsRead as markAsRead } from './notificationHistoryService';
import { NotificationHistoryItem, NotificationPreferences } from '../types/notificationTypes';

// Configuración avanzada para notificaciones en primer plano
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const notificationData = notification.request.content.data;
    
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
    
    return {
      shouldShowAlert,
      shouldPlaySound,
      shouldSetBadge,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    };
  },
});

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
    console.log('Procesando notificación en primer plano:', data);
    
    // Crear objeto de historial y delegarlo al servicio especializado
    await saveNotificationToHistory(notification);
    
    return true;
  } catch (error) {
    console.error('Error al procesar notificación en primer plano:', error);
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
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
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
    console.log('Procesando notificación recibida en segundo plano:', notification);
    
    const { title, body, data } = notification.request.content;
    
    // Crear objeto de historial de notificación
    const historyItem: NotificationHistoryItem = {
      id: notification.request.identifier,
      title: title || 'Sin título',
      body: body || 'Sin contenido',
      data: data || {},
      receivedAt: new Date().toISOString(),
      read: false,
      receivedInBackground: true
    };
    
    // Usar el nuevo servicio de historial para añadir la notificación
    // addNotificationToHistory ya maneja la verificación de duplicados
    await addNotificationToHistory(historyItem);
    
    return true;
  } catch (error) {
    console.error('Error al manejar notificación en segundo plano:', error);
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