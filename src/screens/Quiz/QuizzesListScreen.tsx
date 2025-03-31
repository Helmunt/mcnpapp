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
import { Quiz } from '../../types/quiz';
import { getAvailableQuizzes } from '../../services/quizService';
import { useAuth } from '../../context/AuthContext';
import Feather from '@expo/vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CongressStackParamList } from '../../types/navigation';
import CompletedQuizzesScreen from './CompletedQuizzesScreen';

const QuizzesListScreen = () => {
  const [activeTab, setActiveTab] = useState<'available' | 'completed'>('available');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { state } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<CongressStackParamList>>();

  // Función para cargar los cuestionarios disponibles
  const loadQuizzes = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    
    try {
      if (state.user?.token) {
        const availableQuizzes = await getAvailableQuizzes(state.user.token);
        setQuizzes(availableQuizzes);
      }
    } catch (error) {
      console.error('Error al cargar cuestionarios:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar cuestionarios al montar el componente
  useEffect(() => {
    loadQuizzes();
  }, [state.user?.token]);

  // Manejar la acción de refrescar
  const handleRefresh = () => {
    setRefreshing(true);
    loadQuizzes(false);
  };

  // Manejar selección de un cuestionario
  const handleQuizSelection = (quizId: number) => {
    navigation.navigate('Quiz', { quizId });
  };

  // Función para formatear una fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit',
        year: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };

  // Renderizar un item de cuestionario
  const renderQuizItem = ({ item }: { item: Quiz }) => (
    <TouchableOpacity 
      style={styles.quizItem}
      onPress={() => handleQuizSelection(item.id)}
    >
      <View style={styles.quizHeader}>
        <Text style={styles.quizTitle}>{item.titulo}</Text>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>{item.valor_puntos} pts</Text>
        </View>
      </View>
      
      <View style={styles.quizDetails}>
        <View style={styles.detailRow}>
          <Feather name="user" size={16} color={COLORS.primary} />
          <Text style={styles.detailText}>{item.ponente}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Feather name="calendar" size={16} color={COLORS.primary} />
          <Text style={styles.detailText}>{formatDate(item.fecha_ponencia)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Feather name="clock" size={16} color={COLORS.primary} />
          <Text style={styles.detailText}>{item.hora_ponencia}</Text>
        </View>
      </View>
      
      <View style={styles.quizFooter}>
        <Text style={styles.startText}>Responder cuestionario</Text>
        <Feather name="chevron-right" size={20} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );

  // Renderizar cuando no hay cuestionarios disponibles
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Feather name="clipboard" size={48} color={COLORS.lightGray} />
      <Text style={styles.emptyText}>No hay cuestionarios disponibles</Text>
      <Text style={styles.emptySubtext}>
        Regresa más tarde para ver nuevos cuestionarios
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          
          <Text style={styles.screenSubtitle}>
            Responde a los cuestionarios para sumar puntos
          </Text>
        </View>

        {/* Tabs de navegación */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'available' && styles.activeTabButton
            ]} 
            onPress={() => setActiveTab('available')}
          >
            <Text style={[
              styles.tabButtonText,
              activeTab === 'available' && styles.activeTabButtonText
            ]}>
              Disponibles
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'completed' && styles.activeTabButton
            ]} 
            onPress={() => setActiveTab('completed')}
          >
            <Text style={[
              styles.tabButtonText,
              activeTab === 'completed' && styles.activeTabButtonText
            ]}>
              Completados
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenido según la pestaña activa */}
        {activeTab === 'available' ? (
          // Cuestionarios disponibles
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Cargando cuestionarios...</Text>
            </View>
          ) : (
            <FlatList
              data={quizzes}
              renderItem={renderQuizItem}
              keyExtractor={(item) => item.id.toString()}
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
          )
        ) : (
          // Cuestionarios completados
          <CompletedQuizzesScreen />
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
    paddingBottom: 8,
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
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 16,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  activeTabButtonText: {
    color: COLORS.primary,
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
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
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
  startText: {
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

export default QuizzesListScreen;