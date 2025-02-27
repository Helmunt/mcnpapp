import { UserRole } from '../types/user';

// Definimos las diferentes secciones de la aplicación para las que necesitamos controlar permisos
export enum AppSection {
  HOME = 'home',
  CONGRESS = 'congress',
  SOCIAL = 'social',
  NEWSLETTER = 'newsletter',
  PROFILE = 'profile',
  CERTIFICATES = 'certificates',
  QUIZ = 'quiz',
}

// Mapa que define qué roles tienen acceso a cada sección
export const SECTION_ACCESS_MAP: Record<AppSection, UserRole[]> = {
  [AppSection.HOME]: ['Administrador', 'Suscriptor', 'Congreso'],
  [AppSection.CONGRESS]: ['Administrador', 'Congreso'],
  [AppSection.SOCIAL]: ['Administrador', 'Suscriptor', 'Congreso'],
  [AppSection.NEWSLETTER]: ['Administrador', 'Suscriptor', 'Congreso'],
  [AppSection.PROFILE]: ['Administrador', 'Suscriptor', 'Congreso'],
  [AppSection.CERTIFICATES]: ['Administrador', 'Congreso'],
  [AppSection.QUIZ]: ['Administrador', 'Congreso'],
};

// Función principal para verificar si un rol tiene acceso a una sección
export const hasAccessToSection = (role: UserRole | null | undefined, section: AppSection): boolean => {
  if (!role) return false;
  return SECTION_ACCESS_MAP[section].includes(role);
};

// Mensajes personalizados por sección para mostrar cuando se deniega el acceso
export const ACCESS_DENIED_MESSAGES: Record<AppSection, string> = {
  [AppSection.HOME]: 'No tienes permisos para acceder a esta sección.',
  [AppSection.CONGRESS]: 'Necesitas una suscripción al Congreso para acceder a este contenido.',
  [AppSection.SOCIAL]: 'No tienes acceso a la sección Social.',
  [AppSection.NEWSLETTER]: 'No tienes acceso a la sección Newsletter.',
  [AppSection.PROFILE]: 'No tienes acceso a tu perfil.',
  [AppSection.CERTIFICATES]: 'Necesitas una suscripción al Congreso para acceder a tus certificados.',
  [AppSection.QUIZ]: 'Necesitas una suscripción al Congreso para acceder a los cuestionarios.',
};

// Obtener mensaje de acceso denegado para una sección específica
export const getAccessDeniedMessage = (section: AppSection): string => {
  return ACCESS_DENIED_MESSAGES[section];
};