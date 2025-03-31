import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { QuizResponseResult } from '../../types/quiz';
import { getUserResponses } from '../../services/quizService';
import { useAuth } from '../../context/AuthContext';
import Feather from '@expo/vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CongressStackParamList } from '../../types/navigation';

const CompletedQuizzesScreen = () => {
  const [completedQuizzes, setCompletedQuizzes] = useState<QuizResponseResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { state } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<CongressStackParamList>>();

  // Función para cargar los cuestionarios completados
  const loadCompletedQuizzes = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    
    try {
      if (state.user?.token) {
        const responses = await getUserResponses(state.user.token);
        setCompletedQuizzes(responses);
      }
    } catch (error) {
      console.error('Error al cargar cuestionarios completados:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar cuestionarios completados al montar el componente
  useEffect(() => {
    loadCompletedQuizzes();
  }, [state.user?.token]);

  // Manejar la acción de refrescar
  const handleRefresh = () => {
    setRefreshing(true);
    loadCompletedQuizzes(false);
  };

  // Manejar la selección de un cuestionario completado
  const handleQuizSelection = (quizResult: QuizResponseResult) => {
    navigation.navigate('QuizResult', { 
      quizId: quizResult.quiz_id,
      result: quizResult
    });
  };

  // Función para formatear una fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Renderizar un item de cuestionario completado
  const renderCompletedQuizItem = ({ item }: { item: QuizResponseResult }) => (
    <TouchableOpacity 
      style={styles.quizItem}
      onPress={() => handleQuizSelection(item)}
    >
      <View style={styles.quizHeader}>
        <Text style={styles.quizTitle}>{item.titulo}</Text>
        <View style={[
          styles.pointsBadge,
          item.aprobado ? styles.approvedBadge : styles.notApprovedBadge
        ]}>
          <Text style={styles.pointsText}>
            {item.aprobado ? 'Aprobado' : 'No aprobado'}
          </Text>
        </View>
      </View>
      
      <View style={styles.quizDetails}>
        <View style={styles.detailRow}>
          <Feather name="award" size={16} color={COLORS.primary} />
          <Text style={styles.detailText}>
            {item.puntuacion} / {item.puntuacion_maxima} puntos
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Feather name="calendar" size={16} color={COLORS.primary} />
          <Text style={styles.detailText}>
            {formatDate(item.fecha_respuesta)}
          </Text>
        </View>
      </View>
      
      <View style={styles.quizFooter}>
        <Text style={styles.detailLink}>Ver resultados detallados</Text>
        <Feather name="chevron-right" size={20} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );

  // Renderizar cuando no hay cuestionarios completados
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Feather name="clipboard" size={48} color={COLORS.lightGray} />
      <Text style={styles.emptyText}>No has completado ningún cuestionario</Text>
      <Text style={styles.emptySubtext}>
        Los cuestionarios que completes aparecerán aquí
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.screenTitle}>Historial de cuestionarios</Text>
          <Text style={styles.screenSubtitle}>
            Cuestionarios que has completado
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Cargando historial...</Text>
          </View>
        ) : (
          <FlatList
            data={completedQuizzes}
            renderItem={renderCompletedQuizItem}
            keyExtractor={(item) => `${item.quiz_id}-${item.fecha_respuesta}`}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
          />
        )}
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
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  quizItem: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  pointsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  approvedBadge: {
    backgroundColor: COLORS.success || '#4CAF50',
  },
  notApprovedBadge: {
    backgroundColor: COLORS.error || '#F44336',
  },
  pointsText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  quizDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
  },
  quizFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  detailLink: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: '80%',
  },
});

export default CompletedQuizzesScreen;