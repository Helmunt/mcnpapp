import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { addNotificationToHistory } from './notificationHistoryService';
import { NotificationHistoryItem } from '../types/notificationTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { markSessionAsInvalid } from './sessionValidityService';

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
      
      // Verificar si es una notificación de cierre de sesión forzado
      const notificationData = notification.request.content.data;
      if (notificationData && notificationData.type === 'force_logout') {
        console.log('Detectada notificación de cierre de sesión forzado en segundo plano');
        
        // Marcar la sesión como inválida
        await markSessionAsInvalid();
        
        // También mantener el indicador anterior por compatibilidad
        await AsyncStorage.setItem('force_logout_requested', 'true');
        
        // Almacenar mensaje para mostrar en pantalla de login
        await AsyncStorage.setItem(
          'force_logout_message', 
          'Tu sesión se ha cerrado porque iniciaste sesión en otro dispositivo.'
        );
      }
      
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
    return await addNotificationToHistory(historyItem);
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