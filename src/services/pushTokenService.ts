import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_URL } from '../constants/api';

// Interfaz para el payload que enviaremos al servidor
interface RegisterTokenPayload {
  token: string;
  device_type: 'ios' | 'android' | 'web';
  device_name?: string;
  user_id?: number;
  force_logout_previous?: boolean; // Nuevo campo para indicar cierre forzado
}

/**
 * Registra el token de notificaciones push en el servidor de WordPress
 */
export const registerPushTokenWithServer = async (
  token: string, 
  jwtToken: string,
  userId: number
): Promise<boolean> => {
  try {
    const deviceType = Platform.OS === 'ios' ? 'ios' : 'android';
    const deviceName = await AsyncStorage.getItem('deviceName') || Platform.OS;
    
    // Almacenar el userId asociado con el token para detectar cambios de usuario
    const currentTokenUserId = await AsyncStorage.getItem('pushTokenUserId');
    
    // Determinar si hay un cambio de usuario
    const isUserChanged = currentTokenUserId && parseInt(currentTokenUserId) !== userId;
    
    const payload: RegisterTokenPayload = {
      token,
      device_type: deviceType,
      device_name: deviceName,
      user_id: userId,
      force_logout_previous: isUserChanged === true
    };
    
    console.log('Enviando token al servidor con usuario:', userId, isUserChanged ? '(cambio de usuario)' : '');
    
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
      console.log('Token registrado exitosamente en el servidor para el usuario:', userId);
      
      // Si hubo cambio de usuario, registrarlo en logs
      if (isUserChanged) {
        console.log(`Cambio de usuario detectado: de ${currentTokenUserId} a ${userId}`);
      }
      
      // Guardar localmente que el token ha sido registrado
      await AsyncStorage.setItem('pushTokenRegistered', 'true');
      
      // Guardar el userId asociado con este token
      await AsyncStorage.setItem('pushTokenUserId', userId.toString());
      
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
export const isPushTokenRegistered = async (userId: number): Promise<boolean> => {
  try {
    const registered = await AsyncStorage.getItem('pushTokenRegistered');
    const registeredUserId = await AsyncStorage.getItem('pushTokenUserId');
    
    // Si el token está registrado pero para un usuario diferente, devolver false
    if (registered === 'true' && registeredUserId) {
      return parseInt(registeredUserId) === userId;
    }
    
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
    await AsyncStorage.removeItem('pushTokenUserId');
  } catch (error) {
    console.error('Error al marcar token como no registrado:', error);
  }
};

/**
 * Actualiza el token en el servidor si es necesario
 */
export const updatePushTokenIfNeeded = async (
  token: string,
  jwtToken: string,
  userId: number,
  forceUpdate = false
): Promise<boolean> => {
  try {
    const isRegistered = await isPushTokenRegistered(userId);
    
    // Forzar el envío al servidor si se solicita explícitamente 
    // o si no está registrado para el usuario actual
    if (!isRegistered || forceUpdate) {
      console.log('Token no registrado o forzando actualización para usuario:', userId);
      return await registerPushTokenWithServer(token, jwtToken, userId);
    }
    
    console.log('Token ya registrado para usuario:', userId);
    return true;
  } catch (error) {
    console.error('Error al actualizar token:', error);
    return false;
  }
};