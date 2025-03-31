import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { Quiz, QuizQuestion, UserQuestionResponse, QuizResponseResult } from '../../types/quiz';
import { getQuizById, submitQuizResponses } from '../../services/quizService';
import { useAuth } from '../../context/AuthContext';
import Feather from '@expo/vector-icons/Feather';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CongressStackParamList } from '../../types/navigation';

type QuizScreenRouteProp = RouteProp<CongressStackParamList, 'Quiz'>;
type QuizScreenNavigationProp = NativeStackNavigationProp<CongressStackParamList>;

const QuizScreen = () => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [error, setError] = useState<string | null>(null);
  
  const { state } = useAuth();
  const route = useRoute<QuizScreenRouteProp>();
  const navigation = useNavigation<QuizScreenNavigationProp>();
  
  const { quizId } = route.params;

  // Cargar el cuestionario
  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (state.user?.token) {
          const quizData = await getQuizById(quizId, state.user.token);
          if (quizData) {
            setQuiz(quizData);
          } else {
            setError('No se pudo cargar el cuestionario');
          }
        }
      } catch (err) {
        console.error('Error al cargar cuestionario:', err);
        setError('Error al cargar el cuestionario. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId, state.user?.token]);

  // Obtener la pregunta actual
  const currentQuestion = quiz?.preguntas?.[currentQuestionIndex] || null;
  
  // Calcular el progreso
  const progress = quiz?.preguntas ? 
    ((currentQuestionIndex + 1) / quiz.preguntas.length) * 100 : 0;

  // Manejar la selección de una opción
  const handleOptionSelect = (questionId: number, optionId: number) => {
    setSelectedOptions({
      ...selectedOptions,
      [questionId]: optionId
    });
  };

  // Verificar si se puede avanzar a la siguiente pregunta
  const canGoNext = currentQuestion && selectedOptions[currentQuestion.id] !== undefined;
  
  // Manejar la navegación a la siguiente pregunta
  const handleNextQuestion = () => {
    if (!quiz?.preguntas) return;
    
    if (currentQuestionIndex < quiz.preguntas.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Mostrar confirmación antes de enviar respuestas
      Alert.alert(
        'Finalizar cuestionario',
        '¿Estás seguro de que deseas enviar tus respuestas?',
        [
          {
            text: 'Cancelar',
            style: 'cancel'
          },
          {
            text: 'Enviar',
            onPress: handleSubmitResponses
          }
        ]
      );
    }
  };

  // Manejar la navegación a la pregunta anterior
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Enviar respuestas al servidor
  const handleSubmitResponses = async () => {
    if (!quiz || !quiz.preguntas || !state.user?.token) return;
    
    setSubmitting(true);
    
    try {
      // Preparar las respuestas para enviar
      const responses: UserQuestionResponse[] = quiz.preguntas.map(question => ({
        pregunta_id: question.id,
        opcion_id: selectedOptions[question.id] || 0
      }));
      
      // Validar que todas las preguntas tienen respuesta
      const unansweredQuestion = responses.find(r => r.opcion_id === 0);
      if (unansweredQuestion) {
        const questionIndex = quiz.preguntas.findIndex(q => q.id === unansweredQuestion.pregunta_id);
        setCurrentQuestionIndex(questionIndex);
        setSubmitting(false);
        Alert.alert('Preguntas sin responder', 'Por favor, responde todas las preguntas.');
        return;
      }
      
      // Enviar respuestas al servidor
      const result = await submitQuizResponses(
        { quiz_id: quiz.id, respuestas: responses },
        state.user.token
      );
      
      setSubmitting(false);
      
      if (result) {
        // Navegar a la pantalla de resultados
        navigation.navigate('QuizResult', { 
          quizId: quiz.id,
          result: result
        });
      } else {
        Alert.alert(
          'Error',
          'Hubo un problema al enviar tus respuestas. Por favor, inténtalo de nuevo.'
        );
      }
    } catch (err) {
      console.error('Error al enviar respuestas:', err);
      setSubmitting(false);
      Alert.alert(
        'Error',
        'Hubo un problema al enviar tus respuestas. Por favor, inténtalo de nuevo.'
      );
    }
  };

  // Renderizar una opción de respuesta
  const renderOption = (question: QuizQuestion, optionIndex: number) => {
    const option = question.opciones[optionIndex];
    const isSelected = selectedOptions[question.id] === option.id;
    
    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.optionItem,
          isSelected && styles.optionItemSelected
        ]}
        onPress={() => handleOptionSelect(question.id, option.id)}
      >
        <View style={[
          styles.optionCircle,
          isSelected && styles.optionCircleSelected
        ]}>
          {isSelected && (
            <Feather name="check" size={16} color={COLORS.white} />
          )}
        </View>
        <Text style={[
          styles.optionText,
          isSelected && styles.optionTextSelected
        ]}>
          {option.texto_opcion}
        </Text>
      </TouchableOpacity>
    );
  };

  // Renderizar la pantalla de carga
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando cuestionario...</Text>
        </View>
      </View>
    );
  }

  // Renderizar la pantalla de error
  if (error || !quiz || !currentQuestion) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error || 'No se pudo cargar el cuestionario'}</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.errorButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Barra de progreso */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        
        {/* Información del quiz */}
        <View style={styles.quizInfoContainer}>
          <Text style={styles.quizTitle}>{quiz.titulo}</Text>
            <Text style={styles.questionCounter}>
                Pregunta {currentQuestionIndex + 1} de {quiz?.preguntas?.length || 0}
            </Text>
        </View>
        
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Pregunta actual */}
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{currentQuestion.texto_pregunta}</Text>
          </View>
          
          {/* Opciones de respuesta */}
          <View style={styles.optionsContainer}>
            {currentQuestion.opciones.map((_, index) => 
              renderOption(currentQuestion, index)
            )}
          </View>
        </ScrollView>
        
        {/* Botones de navegación */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[
              styles.navigationButton,
              styles.prevButton,
              currentQuestionIndex === 0 && styles.disabledButton
            ]}
            onPress={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0 || submitting}
          >
            <Feather 
              name="chevron-left" 
              size={24} 
              color={currentQuestionIndex === 0 ? COLORS.lightGray : COLORS.primary} 
            />
            <Text 
              style={[
                styles.navigationButtonText,
                currentQuestionIndex === 0 && styles.disabledButtonText
              ]}
            >
              Anterior
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.navigationButton,
              styles.nextButton,
              !canGoNext && styles.disabledButton
            ]}
            onPress={handleNextQuestion}
            disabled={!canGoNext || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <Text style={styles.navigationButtonText}>
                  {currentQuestionIndex < ((quiz?.preguntas?.length || 0) - 1) ? 'Siguiente' : 'Finalizar'}
                </Text>
                <Feather 
                  name="chevron-right" 
                  size={24} 
                  color={COLORS.white} 
                />
              </>
            )}
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
  progressContainer: {
    height: 6,
    backgroundColor: COLORS.lightGray,
    width: '100%',
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.primary,
  },
  quizInfoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  questionCounter: {
    fontSize: 14,
    color: COLORS.text,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  questionContainer: {
    padding: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.text,
    lineHeight: 26,
  },
  optionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  optionItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10', // 10% opacity
  },
  optionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionCircleSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  optionTextSelected: {
    fontWeight: '500',
    color: COLORS.primary,
  },
  navigationContainer: {
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
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  prevButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
  },
  navigationButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.primary,
    marginHorizontal: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: COLORS.lightGray,
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
});

export default QuizScreen;