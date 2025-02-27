import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { Bell, User, LogOut } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, FONT_SIZES } from '../../constants/theme';
import { useUser } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../types/navigation';  // <-- Importamos el RootStackParamList

// Definimos el tipo de navegación, para que TypeScript sepa las rutas
type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const NotificationBadge = ({ count }: { count: number }) => (
  <View style={styles.badgeContainer}>
    <View style={styles.notificationBadge}>
      <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
    </View>
    <View style={styles.badgePulse} />
  </View>
);

export const Header = () => {
  // Usamos useNavigation con el tipo correcto
  const navigation = useNavigation<RootStackNavigationProp>();

  const { userName } = useUser();
  const { state, logout } = useAuth();
  const notificationCount = 5;

  const handleLogout = async () => {
    try {
      await logout();
      // No necesitamos navegar manualmente, el NavigationStack se encargará
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Usamos el nombre del estado de auth primero, luego el del contexto de usuario
  const displayName = state.user?.firstName || userName || 'Usuario';
  
  // Verificamos el rol usando las constantes correctas
  const isAdmin = state.user?.role === 'Administrador';
  const isCongreso = state.user?.role === 'Congreso';
  const isSuscriptor = state.user?.role === 'Suscriptor';

  return (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <Image 
          source={require('../../assets/images/Logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>
            Hola {displayName}
          </Text>
          {isAdmin && (
            <Text style={styles.roleText}>(Administrador)</Text>
          )}
          {isCongreso && (
            <Text style={styles.roleText}>(Congreso)</Text>
          )}
          {isSuscriptor && (
           <Text style={styles.roleText}>(Suscriptor)</Text>
         )}
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerIcon}
            onPress={() => console.log('Notifications')}
          >
            <Bell size={24} color={COLORS.primary} strokeWidth={1.5} />
            <NotificationBadge count={notificationCount} />
          </TouchableOpacity>

          {/* Botón que navega a la pestaña "Profile" */}
          <TouchableOpacity 
            style={styles.userInfo}
            onPress={() => {
              // Actualiza para navegar directamente a la ruta Profile
              navigation.navigate('Profile');
            }}
          >
            <User size={24} color={COLORS.primary} strokeWidth={1.5} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <LogOut size={24} color={COLORS.error} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.white,
    ...Platform.select({
      android: {
        elevation: 8,
      },
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
    }),
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderBottomColor: COLORS.lightGray,
    borderBottomWidth: 1,
    marginTop: Platform.OS === 'ios' ? 0 : 20,
    height: Platform.OS === 'android' ? 85 : 'auto',
  },
  logo: {
    height: 40,
    width: 100,
  },
  greetingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  greeting: {
    fontFamily: FONTS.heading,
    fontSize: Platform.OS === 'android' ? FONT_SIZES.sm : FONT_SIZES.md,
    color: COLORS.text,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  roleText: {
    fontSize: Platform.OS === 'android' ? 12 : FONT_SIZES.sm,
    color: COLORS.primary,
    fontStyle: 'italic',
    marginTop: Platform.OS === 'android' ? 2 : 4,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    position: 'relative',
    padding: 8,
  },
  badgeContainer: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  notificationBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.error,
    borderWidth: 1.5,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: FONTS.body,
  },
  badgePulse: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.error,
    opacity: 0.3,
    zIndex: 0,
  },
  userInfo: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
  },
});
