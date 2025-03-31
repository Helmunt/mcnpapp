import { API_URL } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  UserFormData, 
  PartialUserFormData, 
  FormSection,
  REQUIRED_FIELDS 
} from '../types/userFormTypes';

// Claves para caché local
const FORM_COMPLETED_KEY = 'user_form_completed';
const FORM_DATA_KEY = 'user_form_data';
const FORM_PROGRESS_KEY = 'user_form_progress';

/// Verificar si el usuario ha completado el formulario requerido1
export const checkFormCompletionStatus = async (userId: number, jwt: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/wp-json/mcnp/v1/check-user-form`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      }
    });
    
    if (!response.ok) {
      console.error(`[userFormService] Error en la respuesta: ${response.status}`);
      return false;
    }
    
    const data = await response.json();
      
    // Almacenar en caché local
    await AsyncStorage.setItem(
      `${FORM_COMPLETED_KEY}_${userId}`, 
      data.formCompleted ? 'true' : 'false'
    );
    
    return data.formCompleted;
  } catch (error) {
    console.error('[userFormService] Error al verificar estado del formulario:', error);
    return false;
  }
};

// Nueva función para forzar actualización
const updateFormStatus = async (userId: number, completed: boolean): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/wp-json/mcnp/v1/update-user-form-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        status: completed ? 'true' : 'false'
      })
    });
    
    const data = await response.json();
    console.log('[userFormService] Estado actualizado:', data);
  } catch (error) {
    console.error('[userFormService] Error al actualizar estado:', error);
  }
};

// Marcar localmente que el formulario ha sido completado
export const markFormAsCompleted = async (userId: number): Promise<void> => {
  try {
    console.log('[userFormService] Marcando formulario como completado para usuario:', userId);
    
    // 1. Marcar como completado en la caché local
    await AsyncStorage.setItem(`${FORM_COMPLETED_KEY}_${userId}`, 'true');
    
    // 2. Intentar actualizar también en el servidor
    try {
      const response = await fetch(`${API_URL}/wp-json/mcnp/v1/update-user-form-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          status: 'true' // Explícitamente enviamos 'true' como string
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error en respuesta del servidor: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[userFormService] Respuesta del servidor al marcar como completado:', data);
      
      if (!data.success) {
        throw new Error('El servidor no reportó éxito al actualizar');
      }
    } catch (serverError) {
      console.error('[userFormService] Error al actualizar en servidor:', serverError);
      // Incluso si falla la actualización en el servidor, mantenemos el estado local
    }
  } catch (error) {
    console.error('[userFormService] Error al marcar formulario como completado:', error);
  }
};

// Limpiar el estado local al cerrar sesión
export const clearFormCompletionStatus = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const formKeys = keys.filter(key => key.startsWith(FORM_COMPLETED_KEY));
    if (formKeys.length > 0) {
      await AsyncStorage.multiRemove(formKeys);
    }
  } catch (error) {
    console.error('[userFormService] Error al limpiar estado de formulario:', error);
  }
};

// NUEVAS FUNCIONES PARA FORMULARIO EXPANDIDO

// Guardar datos parciales del formulario
export const savePartialFormData = async (userId: number, formData: PartialUserFormData): Promise<boolean> => {
  try {
    console.log('[userFormService] Guardando datos parciales para usuario:', userId);
    
    // 1. Guardar en AsyncStorage
    await AsyncStorage.setItem(`${FORM_DATA_KEY}_${userId}`, JSON.stringify(formData));
    
    // 2. Sincronizar con el servidor
    return await syncFormDataWithServer(userId, formData);
  } catch (error) {
    console.error('[userFormService] Error al guardar datos parciales:', error);
    return false;
  }
};

// Obtener datos guardados del formulario
export const getSavedFormData = async (userId: number): Promise<PartialUserFormData | null> => {
  try {
    // Intentar obtener datos del almacenamiento local
    const savedData = await AsyncStorage.getItem(`${FORM_DATA_KEY}_${userId}`);
    
    if (savedData) {
      return JSON.parse(savedData) as PartialUserFormData;
    }
    
    return null;
  } catch (error) {
    console.error('[userFormService] Error al obtener datos guardados:', error);
    return null;
  }
};

// Verificar si todos los campos requeridos están completos
export const validateRequiredFields = (formData: PartialUserFormData): boolean => {
  for (const field of REQUIRED_FIELDS) {
    const value = formData[field as keyof PartialUserFormData];
    
    // Verificación para campos de checkbox que ahora son '1'
    if (field === 'check_personal' || field === 'check_publicacion') {
      if (value !== '1') {
        console.log(`[userFormService] Campo requerido incompleto (checkbox): ${field}`);
        return false;
      }
      continue;
    }
    
    // Para arrays de strings (como conocer_mcnp)
    if (Array.isArray(value)) {
      if (value.length === 0) {
        console.log(`[userFormService] Campo requerido incompleto (array vacío): ${field}`);
        return false;
      }
      continue;
    }
    
    // Verificación normal para strings y otros tipos
    if (!value) {
      console.log(`[userFormService] Campo requerido incompleto: ${field}`);
      return false;
    }
  }
  
  console.log('[userFormService] Todos los campos requeridos están completos');
  return true;
};

// Sincronizar datos del formulario con el servidor
// Función modificada para cambiar el formato de los campos multi-selección
export const syncFormDataWithServer = async (userId: number, formData: PartialUserFormData): Promise<boolean> => {
  try {
    console.log('[userFormService] Sincronizando datos con servidor para usuario:', userId);
    
    // Crear una copia del formData para modificar
    const formDataToSend = { ...formData };
    
    // Convertir arrays a strings separados por "|"
    if (Array.isArray(formDataToSend.especialidades)) {
      formDataToSend.especialidades = formDataToSend.especialidades.join('|') as any;
    }
    
    if (Array.isArray(formDataToSend.conocer_mcnp)) {
      formDataToSend.conocer_mcnp = formDataToSend.conocer_mcnp.join('|') as any;
    }
    
    // Verificar si hay una nueva contraseña para actualizar
    if (formDataToSend.nueva_contrasena && formDataToSend.confirmar_contrasena && 
        formDataToSend.nueva_contrasena === formDataToSend.confirmar_contrasena) {
      // Agregar un campo específico para indicar que se debe actualizar la contraseña
      (formDataToSend as any).update_password = true;
      console.log('[userFormService] Se enviará una nueva contraseña para actualizar');
    } else {
      // Si no hay contraseña nueva o no coinciden, eliminar estos campos para no enviarlos
      delete formDataToSend.nueva_contrasena;
      delete formDataToSend.confirmar_contrasena;
    }
    
    const response = await fetch(`${API_URL}/wp-json/mcnp/v1/update-user-form-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        form_data: formDataToSend
      })
    });
    
    if (!response.ok) {
      console.error('[userFormService] Error en respuesta del servidor:', response.status);
      return false;
    }
    
    const data = await response.json();
    console.log('[userFormService] Respuesta del servidor:', data);
    
    // Si todos los campos requeridos están completos, marcamos el formulario como completado
    if (validateRequiredFields(formData)) {
      await markFormAsCompleted(userId);
    }
    
    return data.success === true;
  } catch (error) {
    console.error('[userFormService] Error al sincronizar con servidor:', error);
    return false;
  }
};

// Guardar progreso del formulario (sección actual, etc.)
export const saveFormProgress = async (userId: number, currentSection: FormSection): Promise<void> => {
  try {
    const progress = {
      currentSection,
      timestamp: new Date().toISOString()
    };
    
    await AsyncStorage.setItem(`${FORM_PROGRESS_KEY}_${userId}`, JSON.stringify(progress));
  } catch (error) {
    console.error('[userFormService] Error al guardar progreso:', error);
  }
};

// Obtener progreso guardado
export const getSavedFormProgress = async (userId: number): Promise<{ currentSection: FormSection } | null> => {
  try {
    const savedProgress = await AsyncStorage.getItem(`${FORM_PROGRESS_KEY}_${userId}`);
    
    if (savedProgress) {
      return JSON.parse(savedProgress);
    }
    
    return null;
  } catch (error) {
    console.error('[userFormService] Error al obtener progreso guardado:', error);
    return null;
  }
};

// Limpiar todos los datos del formulario para un usuario
export const clearAllFormData = async (userId: number): Promise<void> => {
  try {
    const keysToRemove = [
      `${FORM_COMPLETED_KEY}_${userId}`,
      `${FORM_DATA_KEY}_${userId}`,
      `${FORM_PROGRESS_KEY}_${userId}`
    ];
    
    await AsyncStorage.multiRemove(keysToRemove);
  } catch (error) {
    console.error('[userFormService] Error al limpiar datos del formulario:', error);
  }
};
// Método nuevo para forzar actualización
export const forceFormStatusUpdate = async (userId: number, status: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/wp-json/mcnp/v1/force-form-status-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: status
      })
    });
    
    const data = await response.json();
    
    console.log('[userFormService] Forzar actualización:', data);
    
    // Limpiar caché local
    await AsyncStorage.removeItem(`${FORM_COMPLETED_KEY}_${userId}`);
    
    return data.success;
  } catch (error) {
    console.error('[userFormService] Error al forzar actualización:', error);
    return false;
  }
};


// Verificar el conteo de asistentes a la actividad del tanque de tapas
export const checkTanqueTapasAttendees = async (): Promise<{
  count: number;
  limitReached: boolean;
}> => {
  try {
    console.log('[userFormService] Consultando conteo de asistentes a Tanque Tapas');
    
    const response = await fetch(`${API_URL}/wp-json/mcnp/v1/tanque-tapas-count`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      console.error('[userFormService] Error en respuesta del servidor:', response.status);
      return { count: 0, limitReached: false };
    }
    
    const data = await response.json();
    console.log('[userFormService] Conteo de asistentes Tanque Tapas:', data);
    
    // Determinar si se ha alcanzado el límite (150 personas)
    const limitReached = data.count >= 150;
    
    return {
      count: data.count,
      limitReached: limitReached
    };
  } catch (error) {
    console.error('[userFormService] Error al consultar conteo de Tanque Tapas:', error);
    // En caso de error, asumimos que no se ha alcanzado el límite
    return { count: 0, limitReached: false };
  }
};