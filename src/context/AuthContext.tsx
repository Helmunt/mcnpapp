import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User, 
  AuthState, 
  UserRole, 
  WP_ROLE_MAPPING, 
  ALLOWED_ROLES 
} from '../types/user';
import { BuddyPressService } from '../services/buddypress';

type AuthAction =
  | { type: 'RESTORE_AUTH'; payload: { user: User } }
  | { type: 'LOGIN_REQUEST' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' };

interface AuthContextType {
  state: AuthState;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isRoleAuthorized: (allowedRoles: UserRole[]) => boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'RESTORE_AUTH':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    case 'LOGIN_REQUEST':
      return {
        ...state,
        isLoading: true,
        error: null,
        isAuthenticated: false,
        user: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: action.payload
      };
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Función auxiliar para convertir roles de WordPress a roles de la aplicación
  const mapWordPressRole = (wpRole: string): UserRole | null => {
    return WP_ROLE_MAPPING[wpRole] || null;
  };

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedAuth = await AsyncStorage.getItem('auth');
        if (storedAuth) {
          const authData = JSON.parse(storedAuth);
          if (authData.user) {
            dispatch({ type: 'RESTORE_AUTH', payload: authData });
          }
        }
      } catch (error) {
        console.error('Error loading stored auth:', error);
        await AsyncStorage.removeItem('auth');
      }
    };

    loadStoredAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      dispatch({ type: 'LOGIN_REQUEST' });

      const authResponse = await fetch('https://mcnpmexico.org/wp-json/jwt-auth/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const authData = await authResponse.json();

      // Manejar errores de autenticación
      if (!authResponse.ok || authData.code) {
        let errorMessage = 'Error de autenticación';
        
        if (authData.code === 'invalid_username' || 
            authData.code === '[jwt_auth] invalid_username' ||
            authData.code === '[jwt_auth] invalid_email') {
          errorMessage = 'Usuario no válido, contacte con el administrador';
        } 
        else if (authData.code === 'incorrect_password' || 
                 authData.code === '[jwt_auth] incorrect_password') {
          errorMessage = 'Contraseña incorrecta';
        }
        
        dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
        throw new Error(errorMessage);
      }

      if (!authData.token) {
        dispatch({ type: 'LOGIN_FAILURE', payload: 'Error en la autenticación' });
        throw new Error('Token no encontrado');
      }

      // Obtener información del usuario
      const userResponse = await fetch('https://mcnpmexico.org/wp-json/wp/v2/users/me?context=edit', {
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!userResponse.ok) {
        dispatch({ type: 'LOGIN_FAILURE', payload: 'Error al obtener información del usuario' });
        throw new Error('Error al obtener información del usuario');
      }

      const userData = await userResponse.json();

      console.log('=== DEBUG COMPLETO ===');
      console.log('Roles desde WordPress:', userData.roles);
      console.log('Rol principal de WordPress:', userData.roles?.[0]);

      const wpRole = userData.roles?.[0];
      const userRole = mapWordPressRole(wpRole);

      console.log('Rol después de mapeo:', userRole);
      console.log('==================');

      if (!userRole || !ALLOWED_ROLES.includes(userRole)) {
        const errorMessage = 'No tienes permisos para acceder a esta aplicación';
        dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
        throw new Error(errorMessage);
      }

      const user: User = {
        id: userData.id,
        name: userData.name || authData.user_display_name || '',
        firstName: (userData.first_name || userData.name || authData.user_display_name || '').split(' ')[0],
        email: userData.email || authData.user_email || '',
        role: userRole,
        token: authData.token
      };

      await AsyncStorage.setItem('auth', JSON.stringify({ user }));
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });

    } catch (error) {
      if (error instanceof Error && 
          !error.message.includes('Usuario no válido') && 
          !error.message.includes('Contraseña incorrecta') &&
          !error.message.includes('No tienes permisos')) {
        dispatch({ 
          type: 'LOGIN_FAILURE', 
          payload: 'Error en la autenticación. Por favor, intente nuevamente.'
        });
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('[AuthContext] Iniciando proceso de cierre de sesión');
      
      // Limpiar token de BuddyPress para evitar problemas de persistencia entre usuarios
      await BuddyPressService.clearToken();
      console.log('[AuthContext] Token de BuddyPress eliminado');
      
      // Intentar eliminar cualquier otra clave de AsyncStorage relacionada con BuddyPress
      try {
        await AsyncStorage.removeItem('buddypress_token');
        await AsyncStorage.removeItem('bp_auth_token');
      } catch (bpError) {
        console.error('[AuthContext] Error al eliminar tokens adicionales de BuddyPress:', bpError);
      }
      
      // Borrar auth de AsyncStorage
      await AsyncStorage.removeItem('auth');
      
      // Actualizar estado
      dispatch({ type: 'LOGOUT' });
      
      console.log('[AuthContext] Cierre de sesión completado');
    } catch (error) {
      console.error('[AuthContext] Error durante logout:', error);
      
      // Incluso si hay error, intentamos el cierre de sesión básico
      try {
        // Limpieza de emergencia de todos los tokens posibles
        await Promise.all([
          AsyncStorage.removeItem('auth'),
          AsyncStorage.removeItem('buddypress_token'),
          AsyncStorage.removeItem('bp_auth_token')
        ]);
        
        dispatch({ type: 'LOGOUT' });
      } catch (innerError) {
        console.error('[AuthContext] Error crítico durante logout:', innerError);
      }
    }
  };

  const isRoleAuthorized = (allowedRoles: UserRole[]): boolean => {
    if (!state.user?.role) return false;
    return allowedRoles.includes(state.user.role);
  };

  return (
    <AuthContext.Provider value={{ state, login, logout, isRoleAuthorized }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};