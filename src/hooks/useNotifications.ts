import { useState, useEffect, useRef, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform, AppState, AppStateStatus } from 'react-native';
import {
  setupNotificationSystem,
  processForegroundNotification,
  requestNotificationPermissions,
  areNotificationsEnabled,
  handleBackgroundNotification // Ahora importamos directamente esta función
} from '../services/notificationService';
import {
  getUnreadCount,
  markNotificationAsRead,
  getNotificationHistory,
  getNotificationById,
  updateAppBadge,
  addNotificationToHistory // Importamos esta función para usarla directamente
} from '../services/notificationHistoryService';
import { NotificationHistoryItem } from '../types/notificationTypes';
import { handleNotificationNavigation } from '../navigation/navigationUtils';
// Importamos desde EventBus en lugar de Header
import { subscribe, EventType, publish } from '../services/eventBus';
import { checkAppVersionAndUpdate } from '../services/appVersionService';

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

 // Función mejorada para procesar una notificación y asegurar que se guarde
 const processAndSaveNotification = async (
  notification: Notifications.Notification,
  wasInteracted: boolean = false
): Promise<boolean> => {
  try {
    const rawId = notification.request?.identifier;
    const notificationDataId = notification.request?.content?.data?.notificationId;

    const id = notificationDataId
      ? `notification-${notificationDataId}`
      : rawId || `notification-${Date.now()}`;
    const title = notification?.request?.content?.title || 'Sin título';
    const body = notification?.request?.content?.body || 'Sin contenido';
    const data = notification?.request?.content?.data || {};

    console.log(`[useNotifications] Procesando notificación ${id} (interacción: ${wasInteracted})`);

    // Verificar si ya existe en historial
    const alreadySaved = await getNotificationById(id);

    if (alreadySaved !== null) {
      if (wasInteracted && !alreadySaved.read) {
        await markNotificationAsRead(id);
        console.log(`[useNotifications] Notificación ${id} marcada como leída por interacción`);
        publish(EventType.NOTIFICATION_UPDATE);
      } else {
        console.log(`[useNotifications] Notificación ${id} ya estaba en historial, se omite`);
      }
      return true;
    }

    // Crear nuevo ítem
    const historyItem: NotificationHistoryItem = {
      id,
      title,
      body,
      data,
      receivedAt: new Date().toISOString(),
      read: wasInteracted,
      receivedInBackground: !wasInteracted,
    };

    const saved = await addNotificationToHistory(historyItem);
    if (saved) {
      console.log(`[useNotifications] Notificación ${id} añadida al historial`);
      publish(EventType.NOTIFICATION_UPDATE);

      if (wasInteracted && data) {
        setTimeout(() => {
          handleNotificationNavigation(data);
        }, 300);
      }
    } else {
      console.warn(`[useNotifications] Falló guardar notificación ${id}`);
    }

    return true;
  } catch (error) {
    console.error('[useNotifications] Error al procesar y guardar notificación:', error);
    return false;
  }
};

  // Verificar notificaciones pendientes al iniciar la app
  const checkPendingNotifications = async () => {
    try {
      console.log('[useNotifications] Verificando notificaciones pendientes...');

      // Obtener todas las notificaciones pendientes presentadas
      const presentedNotifications = await Notifications.getPresentedNotificationsAsync();

      if (presentedNotifications && presentedNotifications.length > 0) {
        console.log('[useNotifications] Notificaciones pendientes encontradas:', presentedNotifications.length);

        // Procesar cada notificación pendiente usando nuestra función mejorada
        for (const notification of presentedNotifications) {
          await processAndSaveNotification(notification);
        }
        
        // Actualizar UI después de procesar todas las notificaciones
        publish(EventType.NOTIFICATION_UPDATE);
      }

      // Verificar si la app se abrió por toque en una notificación (cuando estaba cerrada/background)
      const lastNotificationResponse = await Notifications.getLastNotificationResponseAsync();
      if (lastNotificationResponse) {
        console.log('[useNotifications] App abierta por respuesta a notificación:',
          lastNotificationResponse.notification.request.identifier);

        // Procesar con nuestra función mejorada, indicando que hubo interacción
        await processAndSaveNotification(lastNotificationResponse.notification, true);
      }

      // Actualizar datos después de procesar todas las notificaciones pendientes/respuestas
      await refreshNotificationData();
    } catch (error) {
      console.error('[useNotifications] Error al verificar notificaciones pendientes:', error);
    }
  };

  // Inicializar el sistema de notificaciones y verificación de versión
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);

        // --- Verificación de Versión (AÑADIDA) ---
        // Se ejecuta temprano. Si devuelve false, bloquea la app con alerta.
        const canContinue = await checkAppVersionAndUpdate();
        if (!canContinue) {
            console.log('[useNotifications] Actualización obligatoria detuvo la inicialización.');
            // La alerta dentro de checkAppVersionAndUpdate maneja el bloqueo visual.
        }
        // --- Fin Verificación de Versión ---


        // Configurar el sistema de notificaciones (permisos, etc.)
        await setupNotificationSystem();

        // Verificar permisos de notificación
        const enabled = await areNotificationsEnabled();
        setHasPermission(enabled);

        // Verificar notificaciones push pendientes de Expo
        await checkPendingNotifications();

        // Cargar historial y contador inicial de notificaciones (si no fue bloqueado por versión)
        await refreshNotificationData();

        setIsInitialized(true);
      } catch (err: any) {
        setError(`Error al inicializar sistema: ${err.message}`);
        console.error('Error al inicializar sistema:', err);
      } finally {
        setLoading(false);
      }
    };

    initialize();

    // Configurar oyentes de notificaciones push
    setupNotificationListeners();

    // Monitorear cambios en el estado de la aplicación
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // Suscribirse a actualizaciones de notificaciones desde EventBus
    const notificationUpdateUnsubscribe = subscribe(EventType.NOTIFICATION_UPDATE, refreshNotificationData);

    return () => {
      // Limpiar oyentes y suscripciones
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
      appStateSubscription.remove();
      notificationUpdateUnsubscribe(); // Función de limpieza devuelta por subscribe
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshNotificationData]); // refreshNotificationData está envuelto en useCallback

  // Manejar cambios en el estado de la aplicación (foreground/background)
  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('[useNotifications] App volvió al primer plano.');

      // --- Verificación de Versión al volver a primer plano (AÑADIDA) ---
      await checkAppVersionAndUpdate();
      // --- Fin Verificación de Versión ---

      // Verificar si hay notificaciones push pendientes de Expo que llegaron mientras estaba en background
      await checkPendingNotifications();

      // Actualizar datos de notificaciones (historial, contador)
      await refreshNotificationData();

      // Asegurarnos de que el badge refleje el contador actual (puede haber cambiado)
      const count = await getUnreadCount();
      await updateAppBadge(count);
    }

    appState.current = nextAppState;
  };

  // Configurar los oyentes de notificaciones push
  const setupNotificationListeners = () => {
    // Oyente para notificaciones recibidas mientras la app está en primer plano
    notificationListener.current = Notifications.addNotificationReceivedListener(async notification => {
      console.log('[useNotifications] Notificación recibida en primer plano:', notification.request.identifier);

      // Procesar notificación usando nuestra función mejorada
      await processAndSaveNotification(notification);

      // Actualizar datos inmediatamente (contador, historial)
      await refreshNotificationData();
    });

    // Oyente para respuestas a notificaciones (cuando el usuario toca una notificación)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(async response => {
      console.log('[useNotifications] Respuesta a notificación recibida:', response.actionIdentifier);
      
      // Procesar notificación con nuestra función mejorada, indicando que hubo interacción
      await processAndSaveNotification(response.notification, true);

      // Actualizar datos inmediatamente
      await refreshNotificationData();
    });
  };

  // Solicitar permisos de notificaciones (si es necesario llamarlo desde UI)
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

  // Verificar si tenemos permisos (si es necesario llamarlo desde UI)
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
    refreshNotificationData, // Para refrescar manualmente si es necesario
    requestPermissions,      // Para pedir permisos desde la UI
    checkPermissions,        // Para comprobar permisos desde la UI
  };
};

export default useNotifications;