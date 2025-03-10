import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, FONT_SIZES } from '../../constants/theme';
import { useUser } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../types/navigation';
import { BuddyPressService } from '../../services/buddypress';

// Definimos el tipo de navegación
type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Variable global para almacenar referencia al WebView de BuddyPress activo
let activeBuddyPressWebViewRef: any = null;

// Función para establecer la referencia activa desde cualquier componente
export const setActiveBuddyPressWebViewRef = (ref: any) => {
  activeBuddyPressWebViewRef = ref;
  console.log('[Header] WebView de BuddyPress registrado para navegación segura');
};

const NotificationBadge = ({ count }: { count: number }) => (
  <View style={styles.badgeContainer}>
    <View style={styles.notificationBadge}>
      <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
    </View>
    <View style={styles.badgePulse} />
  </View>
);

export const Header = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { userName } = useUser();
  const { state, logout } = useAuth();
  const notificationCount = 5;

  const navigateSafely = (screenName: keyof RootStackParamList, params?: any) => {
    console.log(`[Header] Navegación segura a ${screenName}`);
    if (activeBuddyPressWebViewRef && activeBuddyPressWebViewRef.navigateSafely) {
      console.log('[Header] Usando WebViewRef global para navegación segura');
      activeBuddyPressWebViewRef.navigateSafely(screenName, params);
    } else {
      console.log('[Header] WebViewRef global no disponible, haciendo limpieza básica');
      BuddyPressService.clearToken()
        .then(() => navigation.navigate(screenName, params))
        .catch((error) => {
          console.error('[Header] Error al limpiar token:', error);
          navigation.navigate(screenName, params);
        });
    }
  };

  const handleLogout = async () => {
    try {
      console.log('[Header] Iniciando cierre de sesión');
      await BuddyPressService.clearToken();
      await logout();
    } catch (error) {
      console.error('[Header] Error durante logout:', error);
      await logout();
    }
  };

  const displayName = state.user?.firstName || userName || 'Usuario';
  const isAdmin = state.user?.role === 'Administrador';
  const isCongreso = state.user?.role === 'Congreso';
  const isSuscriptor = state.user?.role === 'Suscriptor';

  return (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <Image source={require('../../assets/images/Logo.png')} style={styles.logo} resizeMode="contain" />
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Hola {displayName}</Text>
          {isAdmin && <Text style={styles.roleText}>(Administrador)</Text>}
          {isCongreso && <Text style={styles.roleText}>(Congreso)</Text>}
          {isSuscriptor && <Text style={styles.roleText}>(Suscriptor)</Text>}
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => console.log('Notifications')}>
            <Feather name="bell" size={20} color={COLORS.primary} />
            <NotificationBadge count={notificationCount} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.userInfo} onPress={() => navigateSafely('Profile')}>
            <Feather name="user" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Feather name="log-out" size={20} color={COLORS.error} />
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
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  badgeContainer: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  notificationBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
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
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.error,
    opacity: 0.3,
    zIndex: 0,
  },
  userInfo: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  logoutButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    marginHorizontal: 4,
  },
});
