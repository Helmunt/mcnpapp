import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Feather from '@expo/vector-icons/Feather';
import { COLORS } from '../../constants/theme';
import { QuizResponseResult } from '../../types/quiz';
import { useAuth } from '../../context/AuthContext';
import { CongressStackParamList } from '../../types/navigation';

type QuizResultScreenRouteProp = RouteProp<CongressStackParamList, 'QuizResult'>;
type QuizResultNavigationProp = NativeStackNavigationProp<CongressStackParamList>;

const QuizResultScreen = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuizResponseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const route = useRoute<QuizResultScreenRouteProp>();
  const navigation = useNavigation<QuizResultNavigationProp>();
  const { state } = useAuth();
  
  // Si el resultado viene directamente en los parámetros, úsalo
  useEffect(() => {
    if (route.params.result) {
      setResult(route.params.result);
    } else if (route.params.resultId) {
      // Si solo viene el ID, deberíamos implementar la carga del resultado por ID
      // Esta es una funcionalidad que se podría añadir en el futuro
      setError('No se pudo cargar el resultado');
    } else {
      setError('No se proporcionó información del resultado');
    }
  }, [route.params]);

  // Calcular el porcentaje de puntuación
  const calculatePercentage = (): number => {
    if (!result) return 0;
    
    return Math.round((result.puntuacion / result.puntuacion_maxima) * 100);
  };
  
  // Determinar el color basado en la puntuación
  const getScoreColor = (): string => {
    const percentage = calculatePercentage();
    
    if (percentage >= 80) return COLORS.success || '#4CAF50';
    if (percentage >= 60) return COLORS.warning || '#FF9800';
    return COLORS.error || '#F44336';
  };

  // Retornar un mensaje basado en la puntuación
  const getScoreMessage = (): string => {
    const percentage = calculatePercentage();
    
    if (percentage >= 80) return '¡Excelente trabajo!';
    if (percentage >= 60) return '¡Buen trabajo!';
    return 'Sigue intentando';
  };

  // Renderizar la pantalla de carga
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando resultados...</Text>
        </View>
      </View>
    );
  }

  // Renderizar la pantalla de error
  if (error || !result) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={COLORS.error || '#F44336'} />
          <Text style={styles.errorText}>{error || 'No se pudieron cargar los resultados'}</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => navigation.navigate('QuizzesList')}
          >
            <Text style={styles.errorButtonText}>Volver a cuestionarios</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Encabezado de resultados */}
        <View style={styles.resultHeaderContainer}>
          <Text style={styles.quizTitle}>{result.titulo}</Text>
          <Text style={styles.completedText}>Cuestionario completado</Text>
        </View>
        
        {/* Resumen de puntuación (Modificado para layout horizontal) */}
        <View style={styles.scoreContainer}>
          {/* Círculo de Puntuación (Izquierda) */}
          <View style={[styles.scoreCircle, { borderColor: getScoreColor() }]}>
            <Text style={[styles.scorePercentage, { color: getScoreColor() }]}>
              {calculatePercentage()}%
            </Text>
            <Text style={styles.scorePoints}>
              {result.puntuacion} / {result.puntuacion_maxima} pts
            </Text>
          </View>

          {/* Textos y Badge (Derecha) */}
          <View style={styles.scoreTextContainer}>
            <Text style={[styles.scoreMessage, { color: getScoreColor() }]}>
              {getScoreMessage()}
            </Text>
            {result.aprobado ? (
              <View style={styles.approvedBadge}>
                <Feather name="check-circle" size={16} color="#fff" />
                <Text style={styles.approvedText}>Aprobado</Text>
              </View>
            ) : (
              <View style={styles.notApprovedBadge}>
                <Feather name="x-circle" size={16} color="#fff" />
                <Text style={styles.approvedText}>No aprobado</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Detalle de respuestas */}
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.detailTitle}>Detalle de respuestas</Text>

          {/* ---- INICIO CÓDIGO MODIFICADO HHH02Abr2025---- */}
          {/* Verificamos que result y result.resultados_preguntas (y que sea un array) existan antes de mapear */}
          {result && Array.isArray(result.resultados_preguntas) && result.resultados_preguntas.length > 0 ? (
            result.resultados_preguntas.map((item, index) => (
              <View
                key={item.pregunta_id || `q-${index}`} // Fallback por si acaso
                style={[
                  styles.answerItem,
                  item.es_correcta ? styles.correctAnswer : styles.incorrectAnswer
                ]}
              >
                <View style={styles.answerHeader}>
                  <Text style={styles.questionNumber}>Pregunta {index + 1}</Text>
                  {item.es_correcta ? (
                    <View style={styles.statusBadge}>
                      <Feather name="check" size={14} color="#fff" />
                      <Text style={styles.statusText}>Correcta</Text>
                    </View>
                  ) : (
                    <View style={[styles.statusBadge, styles.incorrectBadge]}>
                      <Feather name="x" size={14} color="#fff" />
                      <Text style={styles.statusText}>Incorrecta</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.questionText}>{item.texto_pregunta || 'Texto de pregunta no disponible'}</Text>

                <View style={styles.selectedAnswer}>
                  <Text style={styles.answerLabel}>Tu respuesta:</Text>
                  <Text style={styles.answerText}>{item.texto_opcion_seleccionada || 'No respondida'}</Text>
                </View>

                {!item.es_correcta && item.texto_opcion_correcta && (
                  <View style={styles.correctAnswerSection}>
                    <Text style={styles.answerLabel}>Respuesta correcta:</Text>
                    <Text style={styles.correctAnswerText}>{item.texto_opcion_correcta}</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            // Contenido a mostrar si no hay detalles
            <View style={styles.noDetailsContainer}>
              <Text style={styles.noDetailsText}>No hay detalles de respuestas disponibles para este cuestionario.</Text>
            </View>
          )}
          {/* ---- FIN CÓDIGO MODIFICADO ---- */}

        </ScrollView>
        
        {/* Botones de acción */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('QuizzesList')}
          >
            <Feather name="list" size={20} color={COLORS.primary} />
            <Text style={styles.secondaryButtonText}>Ver cuestionarios</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => navigation.navigate('CongressHome')}
          >
            <Text style={styles.primaryButtonText}>Volver al inicio</Text>
            <Feather name="home" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  resultHeaderContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  completedText: {
    fontSize: 14,
    color: COLORS.text,
  },
  scoreContainer: {
    flexDirection: 'row',        // Mantiene la fila
    alignItems: 'center',        // Centra verticalmente
    justifyContent: 'center',    // Centra horizontalmente el contenido DENTRO del contenedor
    paddingVertical: 20,         // Añadido un poco más de padding vertical
    paddingHorizontal: 16,
    backgroundColor: COLORS.background || '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  scoreCircle: {
    width: 100,                  // Ligeramente más grande que antes (90x90 propuesto)
    height: 100,
    borderRadius: 50,            // Mitad del width/height
    borderWidth: 4,              // Borde un poco más grueso
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginRight: 24,             // Aumentado margen para separar del texto
    // Quitado marginBottom
  },
  scorePercentage: {
    fontSize: 26, // <-- Reducido tamaño de fuente
    fontWeight: 'bold',
  },
  scorePoints: {
    fontSize: 12, // <-- Reducido tamaño de fuente
    color: COLORS.text,
    marginTop: 2, // <-- Ajustado margen
  },
  scoreTextContainer: {
    // flex: 1,                  // Quitamos flex: 1 para que no empuje el círculo
    alignItems: 'center',      // Centramos el texto y badge DENTRO de este contenedor
    // Quitado marginLeft, el espacio lo da marginRight del círculo
  },
  scoreMessage: {
    fontSize: 18,
    fontWeight: '600',           // Un poco más de énfasis que antes
    marginBottom: 10,            // Aumentado margen inferior
    textAlign: 'center',       // Centrar texto
  },
  approvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success || '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    // Quitado alignSelf: 'flex-start', se centrará por scoreTextContainer
  },
  notApprovedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error || '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    // Quitado alignSelf: 'flex-start'
  },
  approvedText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 6,
    fontSize: 14, // Ligeramente más grande
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  detailTitle: { // Ajustar margen superior si es necesario
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 16,
    marginTop: 10, // Añadir un pequeño margen superior
  },
  answerItem: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    borderLeftWidth: 4,
  },
  correctAnswer: {
    borderLeftColor: COLORS.success || '#4CAF50',
  },
  incorrectAnswer: {
    borderLeftColor: COLORS.error || '#F44336',
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success || '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  incorrectBadge: {
    backgroundColor: COLORS.error || '#F44336',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  questionText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
    lineHeight: 22,
  },
  selectedAnswer: {
    marginBottom: 8,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  answerText: {
    fontSize: 14,
    color: COLORS.text,
  },
  correctAnswerSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  correctAnswerText: {
    fontSize: 14,
    color: COLORS.success || '#4CAF50',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.white,
    marginRight: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  errorButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.white,
  },
  noDetailsContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  noDetailsText: {
    fontSize: 16, // O FONT_SIZES.md si lo tienes importado
    color: COLORS.gray, // O un color gris que uses
    textAlign: 'center',
  },
});

export default QuizResultScreen;