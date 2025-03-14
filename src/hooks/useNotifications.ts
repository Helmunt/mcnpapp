// src/hooks/useNotifications.ts

import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { AppState, Platform } from 'react-native';
import { 
  registerForPushNotifications, 
  getStoredPushToken,
  processForegroundNotification,
  handleBackgroundNotification,
  setupNotificationSystem,
  getUnreadNotificationsCount
} from '../services/notificationService';

// Definimos un tipo para la suscripción ya que hay problemas con la importación
type NotificationSubscription = { remove: () => void };

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const notificationListener = useRef<NotificationSubscription | undefined>();
  const responseListener = useRef<NotificationSubscription | undefined>();
  const appState = useRef(AppState.currentState);
  
  useEffect(() => {
    // Configurar sistema completo de notificaciones
    setupNotificationSystem().then(success => {
      if (success) {
        console.log('Sistema de notificaciones configurado correctamente');
      }
    });
  
    // Cargar el token existente o registrar uno nuevo
    const loadPushToken = async () => {
      let token = await getStoredPushToken();
      
      if (!token) {
        token = await registerForPushNotifications();
      }
      
      if (token) {
        setExpoPushToken(token);
        console.log('Token de notificaciones cargado:', token);
      }
    };

    loadPushToken();
    
    // Cargar contador de notificaciones no leídas
    const loadUnreadCount = async () => {
      const count = await getUnreadNotificationsCount();
      setUnreadCount(count);
    };
    
    loadUnreadCount();
    
    // Monitorear cambios en el estado de la aplicación (primer plano/segundo plano)
    const appStateSubscription = AppState.addEventListener('change', nextAppState => {
      // Si la app vuelve a primer plano, actualizar contador de no leídas
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        loadUnreadCount();
      }
      
      appState.current = nextAppState;
    });

    // Configurar oyentes para las notificaciones en primer plano
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificación recibida en primer plano:', notification);
      setNotification(notification);
      
      // Procesar la notificación recibida en primer plano
      processForegroundNotification(notification).then(success => {
        if (success) {
          console.log('Notificación procesada correctamente');
          // Actualizar contador de no leídas
          loadUnreadCount();
        }
      });
    });

    // Configurar oyentes para respuestas a notificaciones (cuando el usuario toca una notificación)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Respuesta de notificación recibida:', response);
      
      // Si la notificación fue recibida en segundo plano, procesarla
      if (response.notification.request.trigger.type === 'push') {
        handleBackgroundNotification(response.notification);
      }
      
      // Actualizar contador de no leídas
      loadUnreadCount();
      
      // Lo del deep linking lo implementaremos en el paso 9
    });

    // Limpiar oyentes al desmontar
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
      appStateSubscription.remove();
    };
  }, []);

  return {
    expoPushToken,
    notification,
    unreadCount
  };
};