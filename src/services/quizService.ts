import { API_URL } from '../constants/api';
import { Quiz, UserQuizResponse, QuizResponseResult, UserScoreSummary } from '../types/quiz';

/**
 * Servicio para manejar las operaciones relacionadas con cuestionarios
 */

// Obtener todos los cuestionarios disponibles (que no han sido completados por el usuario)
export const getAvailableQuizzes = async (jwtToken: string): Promise<Quiz[]> => {
  try {
    const response = await fetch(`${API_URL}/wp-json/dsc-cuestionarios/v1/quizzes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      }
    });

    if (!response.ok) {
      console.error('[quizService] Error al obtener cuestionarios:', response.status);
      return [];
    }

    const data = await response.json();
    console.log('[quizService] Cuestionarios obtenidos:', data.length);
    return data;
  } catch (error) {
    console.error('[quizService] Error al obtener cuestionarios:', error);
    return [];
  }
};

// Obtener un cuestionario específico con sus preguntas y opciones
export const getQuizById = async (quizId: number, jwtToken: string): Promise<Quiz | null> => {
  try {
    const response = await fetch(`${API_URL}/wp-json/dsc-cuestionarios/v1/quizzes/${quizId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      }
    });

    if (!response.ok) {
      console.error(`[quizService] Error al obtener cuestionario ${quizId}:`, response.status);
      return null;
    }

    const data = await response.json();
    console.log(`[quizService] Cuestionario ${quizId} obtenido:`, data.titulo);
    return data;
  } catch (error) {
    console.error(`[quizService] Error al obtener cuestionario ${quizId}:`, error);
    return null;
  }
};

// Enviar respuestas de un cuestionario
export const submitQuizResponses = async (
  quizResponses: UserQuizResponse, 
  jwtToken: string
): Promise<QuizResponseResult | null> => {
  try {
    const response = await fetch(
      `${API_URL}/wp-json/dsc-cuestionarios/v1/quizzes/${quizResponses.quiz_id}/respuestas`, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify(quizResponses)
      }
    );

    if (!response.ok) {
      console.error('[quizService] Error al enviar respuestas:', response.status);
      return null;
    }

    const data = await response.json();
    console.log('[quizService] Respuestas enviadas con éxito:', data);
    return data;
  } catch (error) {
    console.error('[quizService] Error al enviar respuestas:', error);
    return null;
  }
};

// Obtener todas las respuestas del usuario
export const getUserResponses = async (jwtToken: string): Promise<QuizResponseResult[]> => {
  try {
    const response = await fetch(`${API_URL}/wp-json/dsc-cuestionarios/v1/usuario/respuestas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      }
    });

    if (!response.ok) {
      console.error('[quizService] Error al obtener respuestas del usuario:', response.status);
      return [];
    }

    const data = await response.json();
    console.log('[quizService] Respuestas del usuario obtenidas:', data.length);
    return data;
  } catch (error) {
    console.error('[quizService] Error al obtener respuestas del usuario:', error);
    return [];
  }
};

// Obtener la puntuación acumulada del usuario
export const getUserScore = async (jwtToken: string): Promise<UserScoreSummary | null> => {
  try {
    const response = await fetch(`${API_URL}/wp-json/dsc-cuestionarios/v1/usuario/puntuacion`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      }
    });

    if (!response.ok) {
      console.error('[quizService] Error al obtener puntuación del usuario:', response.status);
      return null;
    }

    const data = await response.json();
    console.log('[quizService] Puntuación del usuario obtenida:', data);
    return data;
  } catch (error) {
    console.error('[quizService] Error al obtener puntuación del usuario:', error);
    return null;
  }
};