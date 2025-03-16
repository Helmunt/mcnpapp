import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { COLORS, FONTS, FONT_SIZES } from '../../../constants/theme';
import { NotificationHistoryItem } from '../../../types/notificationTypes';

interface NotificationItemProps {
  notification: NotificationHistoryItem;
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete: (id: string) => void;
  isEditing: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  isEditing,
  isSelected,
  onToggleSelect
}) => {
  const { id, title, body, receivedAt, read, data } = notification;
  
  // Formatear la hora
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Determinar icono según el tipo (valor por defecto si no hay tipo)
  const getTypeIcon = () => {
    const type = data?.type || 'default';
    
    switch (type) {
      case 'important':
        return 'alert-circle';
      case 'event':
        return 'calendar';
      case 'news':
        return 'bell';
      case 'update':
        return 'refresh-cw';
      case 'message':
        return 'message-circle';
      case 'reminder':
        return 'clock';
      default:
        return 'bell';
    }
  };
  
  // Determinar color según el tipo
  const getTypeColor = () => {
    const type = data?.type || 'default';
    
    switch (type) {
      case 'important':
        return COLORS.error;
      case 'event':
        return COLORS.success;
      case 'news':
        return COLORS.primary;
      case 'update':
        return COLORS.secondary;
      case 'message':
        return COLORS.info;
      case 'reminder':
        return COLORS.warning;
      default:
        return COLORS.primary;
    }
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        read ? styles.readContainer : styles.unreadContainer,
        isSelected && styles.selectedContainer
      ]}
      onPress={() => {
        if (isEditing) {
          onToggleSelect(id);
        } else if (!read) {
          onMarkAsRead(id);
        }
      }}
      onLongPress={() => {
        if (!isEditing) {
          onToggleSelect(id);
        }
      }}
    >
      {isEditing ? (
        <View style={styles.checkboxContainer}>
          <Feather 
            name={isSelected ? "check-square" : "square"} 
            size={22} 
            color={COLORS.primary} 
          />
        </View>
      ) : (
        <View style={[styles.iconContainer, { backgroundColor: getTypeColor() }]}>
          <Feather name={getTypeIcon()} size={20} color={COLORS.white} />
        </View>
      )}
      
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text 
            style={[
              styles.title, 
              read ? styles.readText : styles.unreadText
            ]}
            numberOfLines={2}
          >
            {title}
          </Text>
          
          <Text style={styles.time}>{formatTime(receivedAt)}</Text>
        </View>
        
        <Text 
          style={styles.body}
          numberOfLines={2}
        >
          {body}
        </Text>
        
        {!isEditing && (
          <View style={styles.actionsContainer}>
            {!read && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => onMarkAsRead(id)}
              >
                <Feather name="check" size={16} color={COLORS.primary} />
                <Text style={styles.actionText}>Marcar como leído</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => onDelete(id)}
            >
              <Feather name="trash-2" size={16} color={COLORS.error} />
              <Text style={[styles.actionText, styles.deleteText]}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  readContainer: {
    opacity: 0.8,
  },
  unreadContainer: {
    backgroundColor: COLORS.lightGray,
  },
  selectedContainer: {
    backgroundColor: `${COLORS.primary}20`, // Versión transparente del color primario
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: FONT_SIZES.md,
    flex: 1,
    marginRight: 8,
  },
  readText: {
    fontFamily: FONTS.body,
    color: COLORS.text,
  },
  unreadText: {
    fontFamily: FONTS.heading,
    color: COLORS.text,
    fontWeight: '600',
  },
  time: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray,
  },
  body: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    marginBottom: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    padding: 4,
  },
  actionText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    marginLeft: 4,
  },
  deleteButton: {
    marginLeft: 16,
  },
  deleteText: {
    color: COLORS.error,
  },
});

export default NotificationItem;