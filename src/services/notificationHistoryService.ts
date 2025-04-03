import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { NotificationHistoryItem } from '../types/notificationTypes';
// Ahora importamos desde eventBus en lugar de Header
import { publish, EventType } from './eventBus';

// Constantes para las claves de AsyncStorage
const NOTIFICATION_HISTORY_KEY = 'notificationHistory';
const UNREAD_COUNT_KEY = 'unreadNotificationsCount';
const HISTORY_SIZE_LIMIT = 100; // Limitamos el historial a 100 notificaciones

/**
 * Obtiene el historial completo de notificaciones
 * @returns Array de notificaciones o un array vacío si no hay historial
 */
export const getNotificationHistory = async (): Promise<NotificationHistoryItem[]> => {
  try {
    const historyString = await AsyncStorage.getItem(NOTIFICATION_HISTORY_KEY);
    if (!historyString) return [];
    
    return JSON.parse(historyString) as NotificationHistoryItem[];
  } catch (error) {
    console.error('Error al obtener historial de notificaciones:', error);
    return [];
  }
};

/**
 * Guarda una nueva notificación en el historial
 * @param notification Notificación a guardar
 * @returns true si se guardó correctamente, false en caso contrario
 */
export const addNotificationToHistory = async (notification: NotificationHistoryItem): Promise<boolean> => {
  try {
    // Obtener historial actual
    const history = await getNotificationHistory();
    
    // Verificar si la notificación ya existe (evitar duplicados)
    const notificationExists = history.some(item => item.id === notification.id);
    if (notificationExists) {
      console.log('Notificación ya existe en el historial:', notification.id);
      return true; // No es un error, simplemente ya existe
    }
    
    // Añadir nueva notificación al inicio del historial
    const updatedHistory = [notification, ...history];
    
    // Limitar el historial al tamaño máximo
    const limitedHistory = updatedHistory.slice(0, HISTORY_SIZE_LIMIT);
    
    // Guardar historial actualizado
    await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(limitedHistory));
    
    // Si la notificación no está marcada como leída, incrementar contador
    if (!notification.read) {
      await incrementUnreadCount();
    }
    
    // Notificar a los componentes sobre el cambio usando EventBus
    publish(EventType.NOTIFICATION_UPDATE);
    
    return true;
  } catch (error) {
    console.error('Error al añadir notificación al historial:', error);
    return false;
  }
};

/**
 * Obtiene una notificación específica por su ID
 * @param notificationId ID de la notificación a buscar
 * @returns La notificación encontrada o null si no existe
 */
export const getNotificationById = async (notificationId: string): Promise<NotificationHistoryItem | null> => {
  try {
    const history = await getNotificationHistory();
    const notification = history.find(item => item.id === notificationId);
    return notification || null;
  } catch (error) {
    console.error('Error al buscar notificación por ID:', error);
    return null;
  }
};

/**
 * Marca una notificación específica como leída
 * @param notificationId ID de la notificación a marcar
 * @returns true si se actualizó correctamente, false en caso contrario
 */
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const history = await getNotificationHistory();
    let wasUnread = false;
    
    const updatedHistory = history.map(item => {
      if (item.id === notificationId && !item.read) {
        wasUnread = true;
        return { ...item, read: true };
      }
      return item;
    });
    
    // Solo guardar si hubo cambios
    if (wasUnread) {
      await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(updatedHistory));
      await decrementUnreadCount();
      
      // Notificar a los componentes sobre el cambio usando EventBus
      publish(EventType.NOTIFICATION_UPDATE);
    }
    
    return true;
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    return false;
  }
};

/**
 * Marca todas las notificaciones como leídas
 * @returns true si se actualizó correctamente, false en caso contrario
 */
export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    const history = await getNotificationHistory();
    
    const updatedHistory = history.map(item => ({
      ...item,
      read: true
    }));
    
    await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(updatedHistory));
    await resetUnreadCount();
    
    // Notificar a los componentes sobre el cambio usando EventBus
    publish(EventType.NOTIFICATION_UPDATE);
    
    return true;
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    return false;
  }
};

/**
 * Elimina una notificación específica del historial
 * @param notificationId ID de la notificación a eliminar
 * @returns true si se eliminó correctamente, false en caso contrario
 */
export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  try {
    const history = await getNotificationHistory();
    const notificationToDelete = history.find(item => item.id === notificationId);
    
    if (!notificationToDelete) {
      return false; // No existe la notificación
    }
    
    const updatedHistory = history.filter(item => item.id !== notificationId);
    await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(updatedHistory));
    
    // Si la notificación no estaba leída, decrementar contador
    if (!notificationToDelete.read) {
      await decrementUnreadCount();
      
      // Notificar a los componentes sobre el cambio usando EventBus
      publish(EventType.NOTIFICATION_UPDATE);
    }
    
    return true;
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    return false;
  }
};

/**
 * Elimina múltiples notificaciones del historial
 * @param notificationIds Array de IDs de notificaciones a eliminar
 * @returns true si se eliminaron correctamente, false en caso contrario
 */
export const deleteMultipleNotifications = async (notificationIds: string[]): Promise<boolean> => {
  try {
    const history = await getNotificationHistory();
    let unreadDeleted = 0;
    
    // Contar cuántas notificaciones sin leer se eliminarán
    notificationIds.forEach(id => {
      const notification = history.find(item => item.id === id);
      if (notification && !notification.read) {
        unreadDeleted++;
      }
    });
    
    // Filtrar las notificaciones que no están en la lista de eliminación
    const updatedHistory = history.filter(item => !notificationIds.includes(item.id));
    await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(updatedHistory));
    
    // Ajustar contador de no leídas si es necesario
    if (unreadDeleted > 0) {
      await decrementUnreadCountBy(unreadDeleted);
      
      // Notificar a los componentes sobre el cambio usando EventBus
      publish(EventType.NOTIFICATION_UPDATE);
    }
    
    return true;
  } catch (error) {
    console.error('Error al eliminar múltiples notificaciones:', error);
    return false;
  }
};

/**
 * Elimina todas las notificaciones del historial
 * @returns true si se eliminaron correctamente, false en caso contrario
 */
export const clearNotificationHistory = async (): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify([]));
    await resetUnreadCount();
    
    // Notificar a los componentes sobre el cambio usando EventBus
    publish(EventType.NOTIFICATION_UPDATE);
    
    return true;
  } catch (error) {
    console.error('Error al limpiar historial de notificaciones:', error);
    return false;
  }
};

// ... (resto de funciones no mostradas para brevedad) ...

/**
 * Exporta el historial de notificaciones a un formato JSON
 * @returns String JSON con el historial o null si hay error
 */
export const exportNotificationHistory = async (): Promise<string | null> => {
  try {
    const history = await getNotificationHistory();
    return JSON.stringify({ 
      history, 
      exportDate: new Date().toISOString(),
      version: '1.0'
    });
  } catch (error) {
    console.error('Error al exportar historial de notificaciones:', error);
    return null;
  }
};

/**
 * Importa un historial de notificaciones desde un JSON
 * @param jsonData String JSON con el historial
 * @returns true si se importó correctamente, false en caso contrario
 */
export const importNotificationHistory = async (jsonData: string): Promise<boolean> => {
  try {
    const data = JSON.parse(jsonData);
    
    if (!data.history || !Array.isArray(data.history)) {
      throw new Error('Formato de datos inválido');
    }
    
    // Validar estructura básica de las notificaciones
    const validNotifications = data.history.filter((item: any) => {
      return item.id && item.title && item.receivedAt;
    });
    
    // Guardar historial
    await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(validNotifications));
    
    // Actualizar contador de no leídas
    const unreadCount = validNotifications.filter((item: any) => !item.read).length;
    await AsyncStorage.setItem(UNREAD_COUNT_KEY, unreadCount.toString());
    
    // Actualizar el badge también
    await updateAppBadge(unreadCount);
    
    // Notificar a los componentes sobre el cambio usando EventBus
    publish(EventType.NOTIFICATION_UPDATE);
    
    return true;
  } catch (error) {
    console.error('Error al importar historial de notificaciones:', error);
    return false;
  }
};

/**
 * Actualiza el badge de la aplicación con el contador actual
 * @param count Contador opcional. Si no se proporciona, se obtiene del almacenamiento.
 */
export const updateAppBadge = async (count?: number): Promise<void> => {
  try {
    // Si no se proporciona un conteo, obtenerlo del almacenamiento
    if (count === undefined) {
      count = await getUnreadCount();
    }
    
    // Actualizar el badge de la aplicación
    await Notifications.setBadgeCountAsync(count);
    console.log('[notificationHistoryService] Badge actualizado a:', count);
  } catch (error) {
    console.error('[notificationHistoryService] Error al actualizar badge:', error);
  }
};

// ---- Funciones auxiliares para el contador de notificaciones no leídas ----

/**
 * Obtiene el número actual de notificaciones no leídas
 */
export const getUnreadCount = async (): Promise<number> => {
  try {
    const countStr = await AsyncStorage.getItem(UNREAD_COUNT_KEY);
    return countStr ? parseInt(countStr) : 0;
  } catch (error) {
    console.error('Error al obtener contador de no leídas:', error);
    return 0;
  }
};

/**
 * Incrementa el contador de notificaciones no leídas en 1
 */
const incrementUnreadCount = async (): Promise<void> => {
  try {
    const current = await getUnreadCount();
    const newCount = current + 1;
    await AsyncStorage.setItem(UNREAD_COUNT_KEY, newCount.toString());
    // Actualizar también el badge
    await updateAppBadge(newCount);
  } catch (error) {
    console.error('Error al incrementar contador de no leídas:', error);
  }
};

/**
 * Decrementa el contador de notificaciones no leídas en 1
 */
const decrementUnreadCount = async (): Promise<void> => {
  try {
    const current = await getUnreadCount();
    const newValue = Math.max(0, current - 1); // Asegurar que no sea negativo
    await AsyncStorage.setItem(UNREAD_COUNT_KEY, newValue.toString());
    // Actualizar también el badge
    await updateAppBadge(newValue);
  } catch (error) {
    console.error('Error al decrementar contador de no leídas:', error);
  }
};

/**
 * Decrementa el contador de notificaciones no leídas en la cantidad especificada
 */
const decrementUnreadCountBy = async (count: number): Promise<void> => {
  try {
    const current = await getUnreadCount();
    const newValue = Math.max(0, current - count); // Asegurar que no sea negativo
    await AsyncStorage.setItem(UNREAD_COUNT_KEY, newValue.toString());
    // Actualizar también el badge
    await updateAppBadge(newValue);
  } catch (error) {
    console.error('Error al decrementar contador de no leídas:', error);
  }
};

/**
 * Establece el contador de notificaciones no leídas a 0
 */
const resetUnreadCount = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(UNREAD_COUNT_KEY, '0');
    // Resetear también el badge
    await updateAppBadge(0);
  } catch (error) {
    console.error('Error al resetear contador de no leídas:', error);
  }
};

/**
 * Actualiza el contador de notificaciones no leídas basado en el historial actual
 * Útil para sincronizar el contador si hay inconsistencias
 */
export const syncUnreadCount = async (): Promise<number> => {
  try {
    const history = await getNotificationHistory();
    const unreadCount = history.filter(item => !item.read).length;
    await AsyncStorage.setItem(UNREAD_COUNT_KEY, unreadCount.toString());
    
    // Actualizar también el badge
    await updateAppBadge(unreadCount);
    
    // Notificar a los componentes sobre el cambio usando EventBus
    publish(EventType.NOTIFICATION_UPDATE);
    
    return unreadCount;
  } catch (error) {
    console.error('Error al sincronizar contador de no leídas:', error);
    return 0;
  }
};

/**
 * Comprime el historial eliminando campos innecesarios para ahorrar espacio
 * (opcional, usar solo si el historial se vuelve demasiado grande)
 */
export const compressNotificationHistory = async (): Promise<boolean> => {
  try {
    const history = await getNotificationHistory();
    
    // Versión comprimida con solo los campos esenciales
    const compressedHistory = history.map(item => ({
      id: item.id,
      title: item.title,
      body: item.body,
      // Incluir solo datos esenciales
      data: item.data ? {
        type: item.data.type,
        // Otros campos esenciales que quieras conservar
        link: item.data.link
      } : {},
      receivedAt: item.receivedAt,
      read: item.read
    }));
    
    await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(compressedHistory));
    return true;
  } catch (error) {
    console.error('Error al comprimir historial de notificaciones:', error);
    return false;
  }
};


/**
 * Agrupa las notificaciones por día
 * @returns Un objeto donde las claves son fechas y los valores son arrays de notificaciones
 */
export const getNotificationsGroupedByDay = async (): Promise<{ [key: string]: NotificationHistoryItem[] }> => {
  try {
    const history = await getNotificationHistory();
    
    // Agrupar por día
    const groupedNotifications = history.reduce((acc, notification) => {
      // Convertir la fecha de recepción a formato de día (YYYY-MM-DD)
      const date = new Date(notification.receivedAt).toISOString().split('T')[0];
      
      if (!acc[date]) {
        acc[date] = [];
      }
      
      acc[date].push(notification);
      
      return acc;
    }, {} as { [key: string]: NotificationHistoryItem[] });
    
    return groupedNotifications;
  } catch (error) {
    console.error('Error al agrupar notificaciones por día:', error);
    return {};
  }
};