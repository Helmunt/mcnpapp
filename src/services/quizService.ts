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
      try {
        const errorBody = await response.text();
        console.error('[quizService] Cuerpo de la respuesta de error:', errorBody);
      } catch (e) {
        console.error('[quizService] No se pudo leer el cuerpo del error.');
      }
      return null;
    }

    // Intentar obtener el JSON directamente
    const data = await response.json();

    // Loguear lo que se recibe REALMENTE
    console.log('[quizService] Respuesta REAL RECIBIDA de la API (sin transformación):', JSON.stringify(data, null, 2));

    // Validación básica de la estructura recibida (opcional pero recomendada)
    if (!data || typeof data !== 'object' || data.puntuacion === undefined || !Array.isArray(data.resultados_preguntas)) {
       console.error('[quizService] La respuesta recibida NO TIENE la estructura esperada de QuizResponseResult.');
       // Podrías devolver null aquí si quieres ser estricto, o intentar usarla igualmente
       // return null;
    } else {
       // Convertir puntuacion a número por si acaso sigue llegando como string desde PHP/JSON
       data.puntuacion = Number(data.puntuacion);
       if (isNaN(data.puntuacion)) {
           data.puntuacion = 0; // Default a 0 si la conversión falla
       }
       // Asegurar que puntuacion_maxima sea número
       data.puntuacion_maxima = Number(data.puntuacion_maxima);
        if (isNaN(data.puntuacion_maxima) || data.puntuacion_maxima === 0) {
           data.puntuacion_maxima = 100; // Default a 100 si falta o es inválida
       }
       // Asegurar que aprobado sea booleano
       data.aprobado = Boolean(data.aprobado);

       // Asegurar que es_correcta dentro de resultados_preguntas sea booleano
       data.resultados_preguntas = data.resultados_preguntas.map((item: any) => ({
           ...item,
           es_correcta: Boolean(item.es_correcta) // Convertir "1", 1, true a true; "0", 0, false, null a false
       }));
    }


    // Devolver directamente los datos (asumiendo/forzando que tienen la estructura correcta)
    return data as QuizResponseResult;

  } catch (error) {
    // Captura errores de red o si response.json() falla
    console.error('[quizService] Error en CATCH al enviar/procesar respuestas:', error);
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