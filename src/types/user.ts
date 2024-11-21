// Interface principal para el usuario
export interface User {
  id: number;
  name: string;
  firstName: string;
  email: string;
  role: UserRole;
  token: string;
}

// Tipo para los roles permitidos (con mayúsculas iniciales)
export type UserRole = 'Administrador' | 'Suscriptor' | 'Congreso';

// Interface para el estado de autenticación
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Interface para la respuesta de la API de WordPress
export interface WordPressAuthResponse {
  token: string;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
  code?: string;
  message?: string;
}

// Interface para la respuesta del perfil de usuario de WordPress
export interface WordPressUserResponse {
  id: number;
  name: string;
  email: string;
  roles: string[];
  first_name: string;
  last_name: string;
  capabilities: {
    [key: string]: boolean;
  };
}

// Mapeo de roles de WordPress a roles de la aplicación
export const WP_ROLE_MAPPING: { [key: string]: UserRole } = {
  'administrator': 'Administrador',
  'subscriber': 'Suscriptor',
  'congreso': 'Congreso'
};

// Roles permitidos en la aplicación
export const ALLOWED_ROLES: UserRole[] = ['Administrador', 'Suscriptor', 'Congreso'];