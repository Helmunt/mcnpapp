import { useState, useEffect, useRef, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform, AppState, AppStateStatus } from 'react-native';
import {
  setupNotificationSystem,
  processForegroundNotification,
  handleBackgroundNotification,
  requestNotificationPermissions,
  areNotificationsEnabled
} from '../services/notificationService';
import { 
  getUnreadCount,
  markNotificationAsRead,
  getNotificationHistory,
  updateAppBadge
} from '../services/notificationHistoryService';
import { NotificationHistoryItem } from '../types/notificationTypes';
import { handleNotificationNavigation } from '../navigation/navigationUtils';
import { subscribeToNotificationUpdates, notifyNotificationUpdate } from '../components/shared/Header';

type SubscriptionType = { remove: () => void };

export const useNotifications = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const appState = useRef(AppState.currentState);
  const notificationListener = useRef<SubscriptionType | null>(null);
  const responseListener = useRef<SubscriptionType | null>(null);

  // Obtener datos de notificaciones de forma optimizada
  const refreshNotificationData = useCallback(async () => {
    try {
      // Obtener contador de no leídas
      const count = await getUnreadCount();
      setUnreadCount(count);
      
      // Actualizar el badge de la app
      await updateAppBadge(count);
      
      // Obtener historial completo
      const history = await getNotificationHistory();
      setNotifications(history);
      
      return { count, history };
    } catch (err: any) {
      setError(`Error al actualizar datos de notificaciones: ${err.message}`);
      console.error('Error al actualizar datos de notificaciones:', err);
      
      return { count: 0, history: [] };
    }
  }, []);
  
// Verificar notificaciones pendientes al iniciar la app
const checkPendingNotifications = async () => {
  try {
    console.log('[useNotifications] Verificando notificaciones pendientes...');
    
    // Obtener todas las notificaciones pendientes
    const presentedNotifications = await Notifications.getPresentedNotificationsAsync();
    
    if (presentedNotifications && presentedNotifications.length > 0) {
      console.log('[useNotifications] Notificaciones pendientes encontradas:', presentedNotifications.length);
      
      // Procesar cada notificación pendiente
      for (const notification of presentedNotifications) {
        await processForegroundNotification(notification);
      }
    }
    
    // También verificar notificaciones recibidas mientras la app estaba cerrada
    const lastNotificationResponse = await Notifications.getLastNotificationResponseAsync();
    if (lastNotificationResponse) {
      console.log('[useNotifications] Última respuesta de notificación encontrada:', 
        lastNotificationResponse.notification.request.identifier);
      
      // Marcar como leída y manejar navegación
      const notificationId = lastNotificationResponse.notification.request.identifier;
      await markNotificationAsRead(notificationId);
      
      // Pequeño retraso para asegurar que los datos estén actualizados
      setTimeout(() => {
        handleNotificationNavigation(lastNotificationResponse.notification.request.content.data);
      }, 500);
    }
    
    // Actualizar datos después de procesar todas las notificaciones
    await refreshNotificationData();
  } catch (error) {
    console.error('[useNotifications] Error al verificar notificaciones pendientes:', error);
  }
};
  // Inicializar el sistema de notificaciones
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        
        // Configurar el sistema de notificaciones
        await setupNotificationSystem();
        
        // Verificar permisos
        const enabled = await areNotificationsEnabled();
        setHasPermission(enabled);
        
        // Verificar notificaciones pendientes
        await checkPendingNotifications();
        
        // Cargar historial y contador
        await refreshNotificationData();
        
        setIsInitialized(true);
      } catch (err: any) {
        setError(`Error al inicializar notificaciones: ${err.message}`);
        console.error('Error al inicializar notificaciones:', err);
      } finally {
        setLoading(false);
      }
    };
    
    initialize();
    
    // Configurar oyentes de notificaciones
    setupNotificationListeners();
    
    // Monitorear cambios en el estado de la aplicación
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Suscribirse a actualizaciones de notificaciones
    const notificationUpdateUnsubscribe = subscribeToNotificationUpdates(refreshNotificationData);
    
    return () => {
      // Limpiar oyentes
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
      subscription.remove();
      notificationUpdateUnsubscribe();
    };
  }, [refreshNotificationData]);
  
// Manejar cambios en el estado de la aplicación (foreground/background)
const handleAppStateChange = async (nextAppState: AppStateStatus) => {
  if (
    appState.current.match(/inactive|background/) &&
    nextAppState === 'active'
  ) {
    console.log('[useNotifications] App volvió al primer plano, verificando notificaciones...');
    
    // Verificar si hay notificaciones pendientes
    await checkPendingNotifications();
    
    // La app ha vuelto al primer plano, actualizar datos
    await refreshNotificationData();
    
    // Asegurarnos de que el badge refleje el contador actual
    const count = await getUnreadCount();
    await updateAppBadge(count);
  }
  
  appState.current = nextAppState;
};
  
  // Configurar los oyentes de notificaciones
  const setupNotificationListeners = () => {
    // Oyente para notificaciones recibidas en primer plano
    notificationListener.current = Notifications.addNotificationReceivedListener(async notification => {
      console.log('[useNotifications] Notificación recibida en primer plano:', notification);
      
      // Procesar notificación
      await processForegroundNotification(notification);
      
      // Actualizar datos inmediatamente
      await refreshNotificationData();
    });
    
    // Oyente para respuestas a notificaciones (cuando el usuario toca una notificación)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(async response => {
      console.log('[useNotifications] Respuesta a notificación recibida:', response);
      
      const notificationId = response.notification.request.identifier;
      
      // Marcar como leída
      await markNotificationAsRead(notificationId);
      
      // Actualizar datos inmediatamente
      await refreshNotificationData();
      
      // Usar un pequeño timeout para asegurar que los datos están actualizados
      // antes de la navegación
      setTimeout(() => {
        handleNotificationNavigation(response.notification.request.content.data);
      }, 300);
    });
  };
  
  // Solicitar permisos de notificaciones
  const requestPermissions = async () => {
    try {
      const granted = await requestNotificationPermissions();
      setHasPermission(granted);
      return granted;
    } catch (err: any) {
      setError(`Error al solicitar permisos: ${err.message}`);
      console.error('Error al solicitar permisos:', err);
      return false;
    }
  };
  
  // Verificar si tenemos permisos
  const checkPermissions = async () => {
    const enabled = await areNotificationsEnabled();
    setHasPermission(enabled);
    return enabled;
  };
  
  return {
    isInitialized,
    hasPermission,
    unreadCount,
    notifications,
    loading,
    error,
    refreshNotificationData,
    requestPermissions,
    checkPermissions,
  };
};

export default useNotifications;