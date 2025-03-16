// src/components/shared/NotificationTester.tsx
import React from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import NotificationTestService from '../../services/notificationTestService';
import { COLORS, FONTS, FONT_SIZES } from '../../constants/theme';

const NotificationTester = () => {
  const sendTestNotification = async (type: 'home' | 'congress' | 'profile' | 'social' | 'newsletter' | 'notifications') => {
    try {
      await NotificationTestService.scheduleNotification(type, 1);
    } catch (error) {
      console.error('Error al enviar notificación de prueba:', error);
    }
  };

  const sendAllNotifications = async () => {
    try {
      await NotificationTestService.sendAllTestNotifications();
    } catch (error) {
      console.error('Error al enviar todas las notificaciones:', error);
    }
  };

  const clearNotificationHistory = async () => {
    try {
      await NotificationTestService.clearNotificationHistory();
    } catch (error) {
      console.error('Error al limpiar historial de notificaciones:', error);
    }
  };

  const navigateToNotifications = () => {
    NotificationTestService.navigateToNotifications();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prueba de Notificaciones</Text>
      <View style={styles.buttonRow}>
        <Button 
          title="Home" 
          onPress={() => sendTestNotification('home')} 
          color={COLORS.primary}
        />
        <Button 
          title="Congreso" 
          onPress={() => sendTestNotification('congress')} 
          color={COLORS.primary}
        />
        <Button 
          title="Perfil" 
          onPress={() => sendTestNotification('profile')} 
          color={COLORS.primary}
        />
      </View>
      <View style={styles.buttonRow}>
        <Button 
          title="Social" 
          onPress={() => sendTestNotification('social')} 
          color={COLORS.primary}
        />
        <Button 
          title="Newsletter" 
          onPress={() => sendTestNotification('newsletter')} 
          color={COLORS.primary}
        />
        <Button 
          title="Avisos" 
          onPress={() => sendTestNotification('notifications')} 
          color={COLORS.primary}
        />
      </View>
      <View style={styles.fullButton}>
        <Button 
          title="Enviar Todas" 
          onPress={sendAllNotifications} 
          color={COLORS.primary}
        />
      </View>
      <View style={styles.fullButton}>
        <Button 
          title="Ver Notificaciones" 
          onPress={navigateToNotifications} 
          color={COLORS.secondary || '#4A90E2'}
        />
      </View>
      <View style={styles.fullButton}>
        <Button 
          title="Limpiar Historial" 
          onPress={clearNotificationHistory} 
          color="#ff3b30"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginVertical: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.heading,
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: 'center'
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  fullButton: {
    marginTop: 10,
    marginBottom: 5,
  }
});

export default NotificationTester;