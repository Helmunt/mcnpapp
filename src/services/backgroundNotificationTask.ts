import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { addNotificationToHistory } from './notificationHistoryService';
import { NotificationHistoryItem } from '../types/notificationTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { markSessionAsInvalid } from './sessionValidityService';
import { notifyNotificationUpdate } from '../components/shared/Header';

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
      console.log('[BACKGROUND_NOTIFICATION_TASK] Ejecutando tarea con datos:', data);
      
      // Asegurarnos de que estamos recibiendo el objeto de notificación correcto
      const notification = data as Notifications.Notification;
      console.log('[BACKGROUND_NOTIFICATION_TASK] Notificación recibida en segundo plano:', 
        notification.request?.identifier);
      
      // Verificar si es una notificación de cierre de sesión forzado
      const notificationData = notification.request?.content?.data;
      if (notificationData && notificationData.type === 'force_logout') {
        console.log('[BACKGROUND_NOTIFICATION_TASK] Detectada notificación de cierre de sesión forzado');
        
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
      const saved = await saveBackgroundNotificationToHistory(notification);
      console.log('[BACKGROUND_NOTIFICATION_TASK] Notificación guardada en historial:', saved);
      
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (err) {
      console.error('[BACKGROUND_NOTIFICATION_TASK] Error al procesar notificación en segundo plano:', err);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  }
  
  return BackgroundFetch.BackgroundFetchResult.NoData;
});

// Función para guardar notificación en segundo plano en el historial
const saveBackgroundNotificationToHistory = async (notification: Notifications.Notification) => {
  try {
    // Añadir logging detallado para diagnóstico
    console.log('[saveBackgroundNotificationToHistory] Procesando notificación:', notification.request?.identifier);
    
    // Extraer datos de la notificación con manejo de valores nulos/undefined
    const title = notification.request?.content?.title || 'Sin título';
    const body = notification.request?.content?.body || 'Sin contenido';
    const data = notification.request?.content?.data || {};
    const id = notification.request?.identifier || `notification-${Date.now()}`;
    
    console.log('[saveBackgroundNotificationToHistory] Datos extraídos:', { id, title, data });
    
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
    
    console.log('[saveBackgroundNotificationToHistory] Notificación guardada en historial:', success);
    
    // Llamar explícitamente a notifyNotificationUpdate ya que en segundo plano
    // puede que no se esté ejecutando correctamente desde addNotificationToHistory
    if (notifyNotificationUpdate) {
      try {
        notifyNotificationUpdate();
        console.log('[saveBackgroundNotificationToHistory] Notificación de actualización enviada');
      } catch (notifyError) {
        console.error('[saveBackgroundNotificationToHistory] Error al notificar cambios:', notifyError);
      }
    } else {
      console.log('[saveBackgroundNotificationToHistory] notifyNotificationUpdate no está disponible');
    }
    
    return success;
  } catch (error) {
    console.error('[saveBackgroundNotificationToHistory] Error al guardar notificación en historial:', error);
    return false;
  }
};

// Registrar la tarea en segundo plano
export const registerBackgroundNotificationTask = async () => {
  try {
    // Verificar si la tarea ya está registrada
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK);
    
    if (!isRegistered) {
      console.log('[backgroundNotificationTask] Registrando tarea de notificaciones en segundo plano');
      
      await BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
        minimumInterval: 60, // Ejecutar como mínimo cada 60 segundos
        stopOnTerminate: false, // Continuar la tarea incluso si la app se cierra
        startOnBoot: true, // Iniciar la tarea cuando el dispositivo se reinicia
      });
      
      // Registrar también como handler para notificaciones recibidas en segundo plano
      await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
      
      console.log('[backgroundNotificationTask] Tarea de notificaciones en segundo plano registrada correctamente');
    } else {
      console.log('[backgroundNotificationTask] Tarea de notificaciones ya estaba registrada');
    }
    
    return true;
  } catch (error) {
    console.error('[backgroundNotificationTask] Error al registrar tarea de notificaciones en segundo plano:', error);
    return false;
  }
};

// Desregistrar la tarea en segundo plano
export const unregisterBackgroundNotificationTask = async () => {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK);
    
    if (isRegistered) {
      console.log('[backgroundNotificationTask] Desregistrando tarea de notificaciones...');
      
      // Desregistrar de BackgroundFetch
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_NOTIFICATION_TASK);
      
      // Desregistrar también de Notifications
      await Notifications.unregisterTaskAsync(BACKGROUND_NOTIFICATION_TASK);
      
      console.log('[backgroundNotificationTask] Tarea de notificaciones en segundo plano desregistrada');
    } else {
      console.log('[backgroundNotificationTask] No había tarea de notificaciones registrada para desregistrar');
    }
    
    return true;
  } catch (error) {
    console.error('[backgroundNotificationTask] Error al desregistrar tarea de notificaciones en segundo plano:', error);
    return false;
  }
};