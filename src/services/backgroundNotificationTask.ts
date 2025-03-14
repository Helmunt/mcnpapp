import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Nombre de la tarea en segundo plano
export const BACKGROUND_NOTIFICATION_TASK = 'background-notification-task';

// Definir la tarea en segundo plano
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Error en tarea en segundo plano:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
  
  if (data) {
    try {
      const notification = data as Notifications.Notification;
      console.log('Notificación recibida en segundo plano:', notification);
      
      // Guardar la notificación en el historial
      await saveBackgroundNotificationToHistory(notification);
      
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (err) {
      console.error('Error al procesar notificación en segundo plano:', err);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  }
  
  return BackgroundFetch.BackgroundFetchResult.NoData;
});

// Función para guardar notificación en segundo plano en el historial
const saveBackgroundNotificationToHistory = async (notification: Notifications.Notification) => {
  try {
    const { title, body, data } = notification.request.content;
    
    // Crear objeto de historial de notificación
    const historyItem = {
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
    let history = historyString ? JSON.parse(historyString) : [];
    
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
    
    return true;
  } catch (error) {
    console.error('Error al guardar notificación en historial:', error);
    return false;
  }
};

// Registrar la tarea en segundo plano
export const registerBackgroundNotificationTask = async () => {
  try {
    // Verificar si la tarea ya está registrada
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK);
    
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
        minimumInterval: 60, // Ejecutar como mínimo cada 60 segundos
        stopOnTerminate: false, // Continuar la tarea incluso si la app se cierra
        startOnBoot: true, // Iniciar la tarea cuando el dispositivo se reinicia
      });
      console.log('Tarea de notificaciones en segundo plano registrada');
    }
    
    return true;
  } catch (error) {
    console.error('Error al registrar tarea de notificaciones en segundo plano:', error);
    return false;
  }
};

// Desregistrar la tarea en segundo plano
export const unregisterBackgroundNotificationTask = async () => {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK);
    
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_NOTIFICATION_TASK);
      console.log('Tarea de notificaciones en segundo plano desregistrada');
    }
    
    return true;
  } catch (error) {
    console.error('Error al desregistrar tarea de notificaciones en segundo plano:', error);
    return false;
  }
};