import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_URL } from '../constants/api'; // Asegúrate de tener definida esta constante

// Interfaz para el payload que enviaremos al servidor
interface RegisterTokenPayload {
  token: string;
  device_type: 'ios' | 'android' | 'web';
  device_name?: string;
  user_id?: number;
}

/**
 * Registra el token de notificaciones push en el servidor de WordPress
 */
export const registerPushTokenWithServer = async (
  token: string, 
  jwtToken: string
): Promise<boolean> => {
  try {
    const deviceType = Platform.OS === 'ios' ? 'ios' : 'android';
    const deviceName = await AsyncStorage.getItem('deviceName') || undefined;
    
    // Intentar obtener el ID de usuario del storage si está disponible
    const authData = await AsyncStorage.getItem('auth');
    let userId: number | undefined = undefined;
    
    if (authData) {
      const parsed = JSON.parse(authData);
      userId = parsed.user?.id;
    }
    
    const payload: RegisterTokenPayload = {
      token,
      device_type: deviceType,
      device_name: deviceName,
      user_id: userId
    };
    
    // Llamar a la API de WordPress para registrar el token
    const response = await axios.post(
      `${API_URL}/wp-json/mcnp/v1/push-token/register`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        }
      }
    );
    
    if (response.status === 200 || response.status === 201) {
      console.log('Token registrado exitosamente en el servidor');
      
      // Guardar localmente que el token ha sido registrado
      await AsyncStorage.setItem('pushTokenRegistered', 'true');
      return true;
    } else {
      console.error('Error al registrar token:', response.data);
      return false;
    }
  } catch (error) {
    console.error('Error al enviar token al servidor:', error);
    return false;
  }
};

/**
 * Verifica si el token ya ha sido registrado en el servidor
 */
export const isPushTokenRegistered = async (): Promise<boolean> => {
  try {
    const registered = await AsyncStorage.getItem('pushTokenRegistered');
    return registered === 'true';
  } catch (error) {
    console.error('Error al verificar registro de token:', error);
    return false;
  }
};

/**
 * Marca el token como no registrado para forzar un nuevo registro
 */
export const markTokenAsUnregistered = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('pushTokenRegistered');
  } catch (error) {
    console.error('Error al marcar token como no registrado:', error);
  }
};

/**
 * Actualiza el token en el servidor si es necesario
 */
export const updatePushTokenIfNeeded = async (
  token: string,
  jwtToken: string
): Promise<boolean> => {
  try {
    const isRegistered = await isPushTokenRegistered();
    
    if (!isRegistered) {
      return await registerPushTokenWithServer(token, jwtToken);
    }
    
    return true;
  } catch (error) {
    console.error('Error al actualizar token:', error);
    return false;
  }
};