import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet,
  RefreshControl,
  Alert,
  Platform,
  Keyboard,
  KeyboardEvent
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Feather from '@expo/vector-icons/Feather';
import { globalStyles } from '../../styles/global';
import { COLORS } from '../../constants/theme';
import { 
  getNotificationHistory, 
  markNotificationAsRead, 
  deleteNotification, 
  markAllNotificationsAsRead as markAllAsRead,
  getNotificationsGroupedByDay
} from '../../services/notificationHistoryService';
import { NotificationHistoryItem } from '../../types/notificationTypes';
import NotificationItem from './components/NotificationItem';
import EmptyNotifications from './components/EmptyNotifications';
import Header from '../../components/shared/Header';
import { RootStackParamList } from '../../types/navigation';

// Definimos el tipo de navegación
type RootStackNavProp = NativeStackNavigationProp<RootStackParamList>;

const NotificationsScreen = () => {
  const navigation = useNavigation<RootStackNavProp>();
  const [notifications, setNotifications] = useState<NotificationHistoryItem[]>([]);
  const [groupedNotifications, setGroupedNotifications] = useState<Record<string, NotificationHistoryItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Escuchar eventos de teclado (especialmente importante para iOS)
  useEffect(() => {
    // Solo necesitamos esto en iOS
    if (Platform.OS !== 'ios') return;

    // Funciones para manejar eventos de teclado
    const keyboardWillShow = (e: KeyboardEvent) => {
      setKeyboardVisible(true);
      setKeyboardHeight(e.endCoordinates.height);
    };

    const keyboardWillHide = () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
    };

    // Suscribirse a eventos de teclado
    const keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', keyboardWillShow);
    const keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', keyboardWillHide);

    // Limpiar suscripciones
    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // Cargar notificaciones
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const notificationData = await getNotificationHistory();
      setNotifications(notificationData);
      
      // También cargar las notificaciones agrupadas por día
      const grouped = await getNotificationsGroupedByDay();
      setGroupedNotifications(grouped);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      // Actualizar estado local
      setNotifications(prevNotifications => 
        prevNotifications.map(item => 
          item.id === id ? { ...item, read: true } : item
        )
      );
      
      // Actualizar también en las agrupadas
      const newGrouped = { ...groupedNotifications };
      Object.keys(newGrouped).forEach(date => {
        newGrouped[date] = newGrouped[date].map(item => 
          item.id === id ? { ...item, read: true } : item
        );
      });
      setGroupedNotifications(newGrouped);
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Eliminar notificación',
      '¿Estás seguro de que deseas eliminar esta notificación?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              await deleteNotification(id);
              // Actualizar estado local
              setNotifications(prevNotifications => 
                prevNotifications.filter(item => item.id !== id)
              );
              
              // Actualizar también en las agrupadas
              const newGrouped = { ...groupedNotifications };
              Object.keys(newGrouped).forEach(date => {
                newGrouped[date] = newGrouped[date].filter(item => item.id !== id);
                // Si no quedan items en esa fecha, eliminar la fecha
                if (newGrouped[date].length === 0) {
                  delete newGrouped[date];
                }
              });
              setGroupedNotifications(newGrouped);
            } catch (error) {
              console.error('Error al eliminar notificación:', error);
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      // Actualizar estado local
      setNotifications(prevNotifications => 
        prevNotifications.map(item => ({ ...item, read: true }))
      );
      
      // Actualizar también en las agrupadas
      const newGrouped = { ...groupedNotifications };
      Object.keys(newGrouped).forEach(date => {
        newGrouped[date] = newGrouped[date].map(item => ({ ...item, read: true }));
      });
      setGroupedNotifications(newGrouped);
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    setSelectedItems([]);
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prevSelected => 
      prevSelected.includes(id)
        ? prevSelected.filter(itemId => itemId !== id)
        : [...prevSelected, id]
    );
  };

  const selectAllItems = () => {
    if (selectedItems.length === notifications.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(notifications.map(item => item.id));
    }
  };

  const deleteSelectedItems = async () => {
    if (selectedItems.length === 0) return;
    
    Alert.alert(
      'Eliminar notificaciones',
      `¿Estás seguro de que deseas eliminar ${selectedItems.length} notificaciones?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              // Aquí debería ir una función para eliminar múltiples notificaciones
              // que implementaremos después
              for (const id of selectedItems) {
                await deleteNotification(id);
              }
              
              // Actualizar estado local
              setNotifications(prevNotifications => 
                prevNotifications.filter(item => !selectedItems.includes(item.id))
              );
              
              // Actualizar también en las agrupadas
              const newGrouped = { ...groupedNotifications };
              Object.keys(newGrouped).forEach(date => {
                newGrouped[date] = newGrouped[date].filter(item => !selectedItems.includes(item.id));
                // Si no quedan items en esa fecha, eliminar la fecha
                if (newGrouped[date].length === 0) {
                  delete newGrouped[date];
                }
              });
              setGroupedNotifications(newGrouped);
              
              setSelectedItems([]);
              setIsEditing(false);
            } catch (error) {
              console.error('Error al eliminar notificaciones seleccionadas:', error);
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const handleGoToHome = () => {
    navigation.navigate('Main', {
      screen: 'MainTabs',
      params: {
        screen: 'Home',
      },
    });
  };

  const renderDateHeader = (date: string) => {
    // Formatear la fecha
    const formattedDate = new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return (
      <View style={styles.dateHeader}>
        <Text style={styles.dateHeaderText}>
          {formattedDate}
        </Text>
      </View>
    );
  };

  const renderListHeader = () => {
    if (notifications.length === 0) return null;
    
    return (
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Notificaciones</Text>
        <View style={styles.listActions}>
          {isEditing ? (
            <>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={selectAllItems}
              >
                <Feather 
                  name={selectedItems.length === notifications.length ? "check-square" : "square"} 
                  size={22} 
                  color={COLORS.primary} 
                />
                <Text style={styles.actionText}>
                  {selectedItems.length === notifications.length ? "Deseleccionar" : "Seleccionar"} todos
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, selectedItems.length === 0 && styles.disabledButton]}
                onPress={deleteSelectedItems}
                disabled={selectedItems.length === 0}
              >
                <Feather name="trash-2" size={22} color={selectedItems.length === 0 ? COLORS.gray : COLORS.error} />
                <Text style={[styles.actionText, selectedItems.length === 0 ? styles.disabledText : { color: COLORS.error }]}>
                  Eliminar ({selectedItems.length})
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleMarkAllAsRead}
              >
                <Feather name="check-circle" size={22} color={COLORS.primary} />
                <Text style={styles.actionText}>Marcar todo como leído</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={toggleEditMode}
              >
                <Feather name="edit" size={22} color={COLORS.primary} />
                <Text style={styles.actionText}>Editar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  // Renderizar secciones por fecha con notificaciones
  const renderSections = () => {
    const dates = Object.keys(groupedNotifications).sort().reverse();
    
    if (dates.length === 0) {
      return <EmptyNotifications />;
    }
    
    return (
      <FlatList
        data={dates}
        keyExtractor={item => item}
        renderItem={({ item: date }) => (
          <View>
            {renderDateHeader(date)}
            {groupedNotifications[date].map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
                isEditing={isEditing}
                isSelected={selectedItems.includes(notification.id)}
                onToggleSelect={toggleSelectItem}
              />
            ))}
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListHeaderComponent={renderListHeader}
        style={styles.list}
      />
    );
  };

  // Calcular la posición del botón de retroceso basada en el estado del teclado
  const backButtonStyle = Platform.OS === 'ios' && keyboardVisible 
    ? {
        ...styles.floatingBackButtonWithKeyboard,
        bottom: keyboardHeight + 20, // Ajustamos para que esté encima del teclado
      }
    : globalStyles.floatingBackButton;

  return (
    <View style={styles.container}>
      <Header />
      
      <View style={styles.contentContainer}>
        <View style={globalStyles.titleContainer}>
          <Text style={globalStyles.pageTitle}>Centro de Notificaciones</Text>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Cargando notificaciones...</Text>
          </View>
        ) : (
          renderSections()
        )}
        
        {isEditing && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={toggleEditMode}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={backButtonStyle}
          onPress={handleGoToHome}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white
  },
  contentContainer: {
    flex: 1,
    position: 'relative'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.gray,
  },
  list: {
    flex: 1,
  },
  listHeader: {
    padding: 16,
    backgroundColor: COLORS.background,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  listActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    marginLeft: 8,
    color: COLORS.primary,
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: COLORS.gray,
  },
  dateHeader: {
    backgroundColor: COLORS.lightGray,
    padding: 12,
    paddingLeft: 16,
  },
  dateHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  cancelButton: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  // Estilo específico para cuando el teclado está visible, conservando la posición izquierda
  floatingBackButtonWithKeyboard: {
    position: 'absolute',
    left: 20, // Mantiene el botón a la izquierda
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  }
});

export default NotificationsScreen;