/**
 * Sistema centralizado de comunicación entre componentes mediante eventos
 * Implementa el patrón Publish-Subscribe para eliminar referencias circulares
 */

// Tipos de eventos soportados por el sistema
export enum EventType {
    NOTIFICATION_UPDATE = 'NOTIFICATION_UPDATE',
    // Añadir más tipos de eventos según sea necesario en el futuro
  }
  
  // Mapa de listeners por tipo de evento
  const listeners: Record<EventType, Function[]> = {
    [EventType.NOTIFICATION_UPDATE]: [],
    // Inicializar arrays vacíos para futuros tipos de eventos
  };
  
  /**
   * Notifica a todos los oyentes registrados sobre un evento específico
   * @param eventType Tipo de evento a notificar
   * @param data Datos opcionales para enviar con la notificación
   */
  export const publish = (eventType: EventType, data?: any): void => {
    console.log(`[EventBus] Publicando evento "${eventType}" a ${listeners[eventType].length} oyentes`, data);
    
    // Notificar a todos los oyentes registrados para este tipo de evento
    listeners[eventType].forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`[EventBus] Error al notificar oyente para evento "${eventType}":`, error);
      }
    });
  };
  
  /**
   * Registra un nuevo oyente para un tipo de evento específico
   * @param eventType Tipo de evento a escuchar
   * @param callback Función a ejecutar cuando ocurra el evento
   * @returns Función para cancelar la suscripción
   */
  export const subscribe = (eventType: EventType, callback: Function): (() => void) => {
    // Registrar el oyente
    listeners[eventType].push(callback);
    
    console.log(`[EventBus] Nuevo oyente registrado para "${eventType}". Total: ${listeners[eventType].length}`);
    
    // Devolver función para cancelar la suscripción
    return () => {
      const index = listeners[eventType].indexOf(callback);
      if (index !== -1) {
        listeners[eventType].splice(index, 1);
        console.log(`[EventBus] Oyente para "${eventType}" eliminado. Quedan: ${listeners[eventType].length}`);
      }
    };
  };
  
  /**
   * Elimina todos los oyentes para un tipo de evento o para todos los eventos
   * @param eventType Tipo de evento opcional. Si no se proporciona, se limpian todos.
   */
  export const clearListeners = (eventType?: EventType): void => {
    if (eventType) {
      listeners[eventType] = [];
      console.log(`[EventBus] Todos los oyentes para "${eventType}" han sido eliminados`);
    } else {
      Object.keys(listeners).forEach(key => {
        listeners[key as EventType] = [];
      });
      console.log('[EventBus] Todos los oyentes han sido eliminados');
    }
  };