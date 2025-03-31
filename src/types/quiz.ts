/**
 * Tipos de datos para el sistema de cuestionarios
 */

// Opción de respuesta en un cuestionario
export interface QuizOption {
    id: number;
    texto_opcion: string;
    es_correcta: boolean;
    orden: number;
  }
  
  // Pregunta de un cuestionario
  export interface QuizQuestion {
    id: number;
    quiz_id: number;
    texto_pregunta: string;
    orden: number;
    opciones: QuizOption[];
  }
  
  // Cuestionario completo
  export interface Quiz {
    id: number;
    titulo: string;
    ponente: string;
    fecha_ponencia: string;
    hora_ponencia: string;
    esta_activo: boolean;
    valor_puntos: number;
    fecha_activacion: string;
    fecha_creacion: string;
    fecha_actualizacion: string;
    preguntas?: QuizQuestion[];
  }
  
  // Respuesta del usuario a una pregunta específica
  export interface UserQuestionResponse {
    pregunta_id: number;
    opcion_id: number;
  }
  
  // Respuesta completa del usuario a un cuestionario
  export interface UserQuizResponse {
    quiz_id: number;
    respuestas: UserQuestionResponse[];
  }
  
  // Resultado de una respuesta específica
  export interface QuestionResponseResult {
    pregunta_id: number;
    opcion_id: number;
    es_correcta: boolean;
    texto_pregunta: string;
    texto_opcion_seleccionada: string;
    texto_opcion_correcta?: string;
  }
  
  // Resultado completo de un cuestionario respondido
  export interface QuizResponseResult {
    quiz_id: number;
    titulo: string;
    puntuacion: number;
    puntuacion_maxima: number;
    fecha_respuesta: string;
    resultados_preguntas: QuestionResponseResult[];
    aprobado: boolean;
  }
  
  // Resumen de puntuación del usuario
  export interface UserScoreSummary {
    puntuacion_total: number;
    cuestionarios_completados: number;
    cuestionarios_aprobados: number;
    aprobado: boolean;
  }