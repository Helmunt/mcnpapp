// src/services/buddypress.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

const API_URL = 'https://mcnpmexico.org/wp-json/mcnp/v1';

export interface BuddyPressToken {
  token: string;
  userId: number;
  expires: number;
  authUrl: string;
}

/**
 * Clase para gestionar la autenticación con BuddyPress
 */
export class BuddyPressService {
  /**
   * Obtiene un token de autenticación para BuddyPress
   * @param jwtToken Token JWT de la autenticación principal
   */
  static async getAuthToken(jwtToken: string): Promise<BuddyPressToken> {
    try {
      const response = await axios.post(
        `${API_URL}/bp-auth`,
        {},
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.success) {
        const buddyPressToken: BuddyPressToken = {
          token: response.data.token,
          userId: response.data.user_id,
          expires: response.data.expires,
          authUrl: response.data.auth_url,
        };

        // Guardar el token en AsyncStorage
        await this.saveToken(buddyPressToken);

        return buddyPressToken;
      } else {
        throw new Error('Error al obtener token de BuddyPress');
      }
    } catch (error) {
      console.error('Error en getAuthToken:', error);
      throw error;
    }
  }

  /**
   * Guarda el token en AsyncStorage
   */
  static async saveToken(token: BuddyPressToken): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'buddypress_token',
        JSON.stringify(token)
      );
    } catch (error) {
      console.error('Error guardando token BP:', error);
    }
  }

  /**
   * Recupera el token almacenado
   */
  static async getStoredToken(): Promise<BuddyPressToken | null> {
    try {
      const tokenString = await AsyncStorage.getItem('buddypress_token');
      if (!tokenString) return null;
      
      const token: BuddyPressToken = JSON.parse(tokenString);
      
      // Verificar si el token ha expirado
      if (token.expires * 1000 < Date.now()) {
        // Token expirado, eliminar y retornar null
        await AsyncStorage.removeItem('buddypress_token');
        return null;
      }
      
      return token;
    } catch (error) {
      console.error('Error recuperando token BP:', error);
      return null;
    }
  }

  /**
   * Elimina el token almacenado
   */
  static async clearToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('buddypress_token');
    } catch (error) {
      console.error('Error eliminando token BP:', error);
    }
  }

  /**
   * Verifica si hay un token válido almacenado
   */
  static async hasValidToken(): Promise<boolean> {
    const token = await this.getStoredToken();
    return token !== null;
  }
}