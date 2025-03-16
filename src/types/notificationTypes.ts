/**
 * Interfaz para los elementos del historial de notificaciones
 */
export interface NotificationHistoryItem {
    id: string;
    title: string;
    body: string;
    data: any;
    receivedAt: string;
    read: boolean;
    receivedInBackground?: boolean;
  }
  
  /**
   * Interfaz para las preferencias de notificación del usuario
   */
  export interface NotificationPreferences {
    showAlerts: boolean;
    playSounds: boolean;
    setBadges: boolean;
    // Puedes añadir otras preferencias aquí
  }