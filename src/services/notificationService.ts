import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerBackgroundNotificationTask, unregisterBackgroundNotificationTask } from './backgroundNotificationTask';

export interface NotificationHistoryItem {
  id: string;
  title: string;
  body: string;
  data: any;
  receivedAt: string;
  read: boolean;
  receivedInBackground?: boolean;
}
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
    
    // Guardar la notificación en el historial
    await saveNotificationToHistory(notification);
    
    // Puedes implementar lógica adicional aquí, como:
    // - Actualizar un contador de notificaciones no leídas
    // - Desencadenar una acción específica basada en el tipo de notificación
    // - Actualizar datos en la aplicación basados en la notificación
    
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
    
    // Obtener historial existente
    const historyString = await AsyncStorage.getItem('notificationHistory');
    let history: NotificationHistoryItem[] = historyString ? JSON.parse(historyString) : [];
    
    // Añadir nueva notificación al inicio del historial
    history = [historyItem, ...history];
    
    // Limitar el historial a un número razonable (por ejemplo, 50 notificaciones)
    if (history.length > 50) {
      history = history.slice(0, 50);
    }
    
    // Guardar historial actualizado
    await AsyncStorage.setItem('notificationHistory', JSON.stringify(history));
    
    return true;
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
    
    // Guardar la notificación en el historial (si no se ha hecho ya por la tarea en segundo plano)
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
    
    // Obtener historial existente
    const historyString = await AsyncStorage.getItem('notificationHistory');
    let history: NotificationHistoryItem[] = historyString ? JSON.parse(historyString) : [];
    
    // Verificar si la notificación ya está en el historial
    const notificationExists = history.some(item => item.id === historyItem.id);
    
    if (!notificationExists) {
      // Añadir nueva notificación al inicio del historial
      history = [historyItem, ...history];
      
      // Limitar el historial a un número razonable (por ejemplo, 50 notificaciones)
      if (history.length > 50) {
        history = history.slice(0, 50);
      }
      
      // Guardar historial actualizado
      await AsyncStorage.setItem('notificationHistory', JSON.stringify(history));
      
      // Incrementar contador de notificaciones no leídas
      const unreadCountStr = await AsyncStorage.getItem('unreadNotificationsCount');
      const unreadCount = unreadCountStr ? parseInt(unreadCountStr) : 0;
      await AsyncStorage.setItem('unreadNotificationsCount', (unreadCount + 1).toString());
    }
    
    return true;
  } catch (error) {
    console.error('Error al manejar notificación en segundo plano:', error);
    return false;
  }
};

// Función para obtener el número de notificaciones no leídas
export const getUnreadNotificationsCount = async (): Promise<number> => {
  try {
    const countStr = await AsyncStorage.getItem('unreadNotificationsCount');
    return countStr ? parseInt(countStr) : 0;
  } catch (error) {
    console.error('Error al obtener contador de notificaciones no leídas:', error);
    return 0;
  }
};

// Función para marcar todas las notificaciones como leídas
export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    // Establecer contador a cero
    await AsyncStorage.setItem('unreadNotificationsCount', '0');
    
    // Actualizar el estado de lectura en el historial
    const historyString = await AsyncStorage.getItem('notificationHistory');
    
    if (historyString) {
      const history = JSON.parse(historyString) as NotificationHistoryItem[];
      const updatedHistory = history.map((item: NotificationHistoryItem) => ({
        ...item,
        read: true
      }));
      
      await AsyncStorage.setItem('notificationHistory', JSON.stringify(updatedHistory));
    }
    
    return true;
  } catch (error) {
    console.error('Error al marcar notificaciones como leídas:', error);
    return false;
  }
};

// Función para marcar una notificación específica como leída
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const historyString = await AsyncStorage.getItem('notificationHistory');
    
    if (!historyString) {
      return false;
    }
    
    const history = JSON.parse(historyString) as NotificationHistoryItem[];
    let unreadCount = 0;
    
    const updatedHistory = history.map((item: NotificationHistoryItem) => {
      // Si el ítem ya está marcado como leído, no afecta el contador
      if (!item.read) {
        unreadCount++;
      }
      
      // Si es la notificación que queremos marcar como leída
      if (item.id === notificationId && !item.read) {
        unreadCount--; // Reducir contador solo si estaba no leída
        return { ...item, read: true };
      }
      
      return item;
    });
    
    // Actualizar historial
    await AsyncStorage.setItem('notificationHistory', JSON.stringify(updatedHistory));
    
    // Actualizar contador (asegurándonos de que no sea negativo)
    unreadCount = Math.max(0, unreadCount);
    await AsyncStorage.setItem('unreadNotificationsCount', unreadCount.toString());
    
    return true;
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    return false;
  }
};