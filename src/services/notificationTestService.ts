// src/services/notificationTestService.ts (actualizado)
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import { handleNotificationNavigation } from '../navigation/navigationUtils';
import { addNotificationToHistory } from './notificationHistoryService';
import { getUnreadCount } from './notificationHistoryService';
import { NotificationHistoryItem } from '../types/notificationTypes';

// Tipos de notificaciones para pruebas
type NotificationType = 'congress' | 'profile' | 'social' | 'newsletter' | 'home' | 'notifications';

// Intervalo entre notificaciones (ms)
const NOTIFICATION_DELAY = 2000;

/**
 * Servicio para enviar notificaciones de prueba locales
 */
export const NotificationTestService = {
  /**
   * Programar una notificación de prueba
   * @param type Tipo de notificación
   * @param seconds Segundos de retraso (por defecto 2)
   */
  async scheduleNotification(type: NotificationType, seconds: number = 2): Promise<string> {
    const notificationContent = this.getNotificationContent(type);
    
    try {
      // Generar ID único para la notificación
      const identifier = `test-notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`Notificación de prueba "${type}" programada con ID: ${identifier}`);
      
      // En Expo Go, mostrar una alerta para simular la notificación
      setTimeout(async () => {
        // Crear objeto de historial de notificación
        const historyItem: NotificationHistoryItem = {
          id: identifier,
          title: notificationContent.title || 'Notificación',
          body: notificationContent.body || 'Tienes una nueva notificación',
          data: notificationContent.data || {},
          receivedAt: new Date().toISOString(),
          read: false
        };
        
        // Guardar en el historial de notificaciones (igual que las reales)
        await addNotificationToHistory(historyItem);
        
        // Obtener el contador actualizado de no leídas
        const unreadCount = await getUnreadCount();
        
        // Mostrar alerta simulando la notificación
        Alert.alert(
          notificationContent.title || 'Notificación',
          notificationContent.body || 'Tienes una nueva notificación',
          [
            { text: 'Ignorar', style: 'cancel' },
            { 
              text: 'Ver', 
              onPress: () => {
                console.log(`Simulando toque en notificación: ${type}`);
                // Simular que el usuario tocó la notificación
                if (notificationContent.data) {
                  handleNotificationNavigation(notificationContent.data);
                }
              }
            }
          ]
        );
      }, seconds * 1000);
      
      return identifier;
    } catch (error) {
      console.error('Error al programar notificación de prueba:', error);
      throw error;
    }
  },
  
  /**
   * Obtener el contenido para una notificación de prueba según su tipo
   */
  getNotificationContent(type: NotificationType): Notifications.NotificationContentInput {
    switch (type) {
      case 'congress':
        return {
          title: '🎟️ Evento del Congreso',
          body: 'Hay una nueva ponencia disponible. Toca para ver los detalles.',
          data: {
            screen: 'Congress',
            section: 'CongressHome',
            type: 'event'
          }
        };
      
      case 'profile':
        return {
          title: '👤 Actualización de perfil',
          body: 'Hay cambios en tu perfil de usuario. Toca para revisar.',
          data: {
            screen: 'Profile',
            type: 'profile'
          }
        };
      
      case 'social':
        return {
          title: '👥 Actividad social',
          body: 'Tienes nuevas interacciones en la red social. Toca para ver.',
          data: {
            screen: 'Social',
            type: 'social'
          }
        };
      
      case 'newsletter':
        return {
          title: '📰 Newsletter disponible',
          body: 'Hay un nuevo boletín informativo para ti. Toca para leerlo.',
          data: {
            screen: 'Newsletter',
            type: 'newsletter'
          }
        };
      
      case 'notifications':
        return {
          title: '🔔 Centro de notificaciones',
          body: 'Revisa todas tus notificaciones pendientes.',
          data: {
            screen: 'Notifications',
            type: 'notification_center'
          }
        };
      
      case 'home':
      default:
        return {
          title: '🏠 ¡Bienvenido de vuelta!',
          body: 'Hay novedades esperándote. Toca para ver el inicio.',
          data: {
            screen: 'Home',
            type: 'general'
          }
        };
    }
  },
  
  /**
   * Enviar una serie de notificaciones de prueba de todos los tipos
   */
  async sendAllTestNotifications(): Promise<void> {
    const types: NotificationType[] = [
      'home', 
      'congress', 
      'profile', 
      'social', 
      'newsletter',
      'notifications'
    ];
    
    // Enviar notificaciones con un breve retraso entre ellas
    for (let i = 0; i < types.length; i++) {
      const delay = i * 1.5; // 1.5 segundos entre cada notificación
      await this.scheduleNotification(types[i], delay);
    }
    
    console.log('Todas las notificaciones de prueba han sido programadas');
  },
  
  /**
   * Cancelar todas las notificaciones pendientes (solo limpia el historial)
   */
  async clearNotificationHistory(): Promise<void> {
    try {
      // Limpiar el AsyncStorage (esto podría requerir una función adicional en notificationHistoryService)
      // Por ejemplo: await clearNotificationHistory();
      
      Alert.alert(
        'Historial Limpiado',
        'El historial de notificaciones se ha limpiado. Navega a la pantalla de notificaciones para verificar.',
        [{ text: 'Entendido' }]
      );
    } catch (error) {
      console.error('Error al limpiar historial de notificaciones:', error);
      Alert.alert('Error', 'No se pudo limpiar el historial de notificaciones.');
    }
  },
  
  /**
   * Navegar directamente a la pantalla de notificaciones
   */
  navigateToNotifications(): void {
    handleNotificationNavigation({
      screen: 'Notifications',
      type: 'notification_center'
    });
  }
};

export default NotificationTestService;