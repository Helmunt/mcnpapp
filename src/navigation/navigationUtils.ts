import { NavigationContainerRef, StackActions } from '@react-navigation/native';
import { createRef } from 'react';
import { MainStackParamList } from '../types/navigation';

// Crear una referencia global para el navegador
export const navigationRef = createRef<NavigationContainerRef<MainStackParamList>>();

// Función para navegar a cualquier pantalla de la app desde fuera de un componente React
export function navigate(name: keyof MainStackParamList, params?: any) {
  if (navigationRef.current) {
    // Verificar si podemos navegar a la ruta
    if (navigationRef.current.isReady()) {
      navigationRef.current.navigate(name, params);
    } else {
      // Si el navegador no está listo, guardar para navegar cuando lo esté
      console.log('Navegador no listo, guardando navegación para', name);
      // Podríamos implementar una cola de navegación si fuera necesario
    }
  } else {
    console.warn('No se puede navegar, navigationRef no está configurado');
  }
}

// Función para realizar navegación anidada (por ejemplo, a pestañas dentro de pestañas)
export function navigateNested(routes: { screen: string; params?: any }[]) {
  if (!navigationRef.current?.isReady()) {
    console.warn('No se puede navegar, navigationRef no está configurado o no está listo');
    return;
  }

  try {
    let params: any = {};
    // Construir estructura anidada de navegación desde la última a la primera ruta
    for (let i = routes.length - 1; i >= 0; i--) {
      const route = routes[i];
      if (i === routes.length - 1) {
        params = route.params || {};
      } else {
        params = {
          screen: route.screen,
          params: route.params ? { ...route.params, ...params } : params
        };
      }
    }

    // Navegar a la primera ruta con todos los parámetros anidados
    if (routes.length > 0) {
      navigationRef.current.navigate(routes[0].screen as any, params);
    }
  } catch (error) {
    console.error('Error al realizar navegación anidada:', error);
  }
}

// Función para navegar a Home (más conveniente)
export function navigateToHome() {
  navigateNested([
    { screen: 'MainTabs' },
    { screen: 'Home' }
  ]);
}

// Función para navegar a Perfil
export function navigateToProfile() {
  navigate('Profile');
}

// Función para navegar a Notificaciones
export function navigateToNotifications() {
  navigate('Notifications');
}

// Función para navegar a Congreso
export function navigateToCongress(section?: string) {
  navigateNested([
    { screen: 'MainTabs' },
    { screen: 'Congress' },
    { screen: section || 'CongressHome' }
  ]);
}

// Función para navegar a Social
export function navigateToSocial() {
  navigateNested([
    { screen: 'MainTabs' },
    { screen: 'Social' }
  ]);
}

// Función para navegar a Newsletter
export function navigateToNewsletter() {
  navigateNested([
    { screen: 'MainTabs' },
    { screen: 'Newsletter' }
  ]);
}

// Función general para manejar navegación desde notificaciones
export function handleNotificationNavigation(data: any) {
  if (!data) return;

  try {
    console.log('Manejando navegación desde notificación:', data);

    // Extraer datos relevantes de la notificación
    const { screen, section, id, type } = data;

    // Navegar según el tipo o la pantalla especificada
    switch (screen) {
      case 'Congress':
        navigateToCongress(section);
        break;
      case 'Profile':
        navigateToProfile();
        break;
      case 'Notifications':
        navigateToNotifications();
        break;
      case 'Social':
        navigateToSocial();
        break;
      case 'Newsletter':
        navigateToNewsletter();
        break;
      case 'Home':
      default:
        navigateToHome();
        break;
    }
  } catch (error) {
    console.error('Error al manejar navegación de notificación:', error);
    // Por defecto, navegar a Home
    navigateToHome();
  }
}