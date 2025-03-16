import { useState, useEffect, useRef } from 'react';
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
  getNotificationHistory
} from '../services/notificationHistoryService';
import { NotificationHistoryItem } from '../types/notificationTypes';
import { handleNotificationNavigation } from '../navigation/navigationUtils';

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
    
    return () => {
      // Limpiar oyentes
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
      subscription.remove();
    };
  }, []);
  
  // Manejar cambios en el estado de la aplicación (foreground/background)
  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // La app ha vuelto al primer plano, actualizar datos
      await refreshNotificationData();
    }
    
    appState.current = nextAppState;
  };
  
  // Configurar los oyentes de notificaciones
  const setupNotificationListeners = () => {
    // Oyente para notificaciones recibidas en primer plano
    notificationListener.current = Notifications.addNotificationReceivedListener(async notification => {
      console.log('Notificación recibida en primer plano:', notification);
      
      // Procesar notificación
      await processForegroundNotification(notification);
      
      // Actualizar datos
      await refreshNotificationData();
    });
    
    // Oyente para respuestas a notificaciones (cuando el usuario toca una notificación)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(async response => {
      console.log('Respuesta a notificación recibida:', response);
      
      const notificationId = response.notification.request.identifier;
      
      // Marcar como leída
      await markNotificationAsRead(notificationId);
      
      // Procesar la notificación en caso de que haya sido recibida en segundo plano
      await handleBackgroundNotification(response.notification);
      
      // Actualizar datos
      await refreshNotificationData();
      
      // Implementar navegación basada en los datos de la notificación (deep linking)
      const notificationData = response.notification.request.content.data;
      
      // Usar un pequeño timeout para asegurar que los datos están actualizados
      // antes de la navegación
      setTimeout(() => {
        handleNotificationNavigation(notificationData);
      }, 300);
    });
  };
  
  // Actualizar datos de notificaciones (historial y contador)
  const refreshNotificationData = async () => {
    try {
      // Obtener contador de no leídas
      const count = await getUnreadCount();
      setUnreadCount(count);
      
      // Obtener historial completo
      const history = await getNotificationHistory();
      setNotifications(history);
      
      return { count, history };
    } catch (err: any) {
      setError(`Error al actualizar datos de notificaciones: ${err.message}`);
      console.error('Error al actualizar datos de notificaciones:', err);
      
      return { count: 0, history: [] };
    }
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