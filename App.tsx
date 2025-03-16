import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, BackHandler } from 'react-native';
import { useEffect, useRef } from 'react';
import { LoginScreen } from './src/screens/Auth/Login';
import { MainNavigator } from './src/navigation/MainNavigator';
import { useFonts } from './src/hooks/useFonts';
import { COLORS } from './src/constants/theme';
import { RootStackParamList } from './src/types/navigation';
import { UserProvider } from './src/context/UserContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import useNotifications from './src/hooks/useNotifications';
import { getStoredPushToken } from './src/services/notificationService';
import { updatePushTokenIfNeeded } from './src/services/pushTokenService';
import { navigationRef, handleNotificationNavigation } from './src/navigation/navigationUtils';
import * as Notifications from 'expo-notifications';

const Stack = createNativeStackNavigator<RootStackParamList>();

function NavigationStack() {
  const { state } = useAuth();
  // Inicializar las notificaciones solo cuando el usuario está autenticado
  const { isInitialized, refreshNotificationData } = useNotifications();
  // Referencia para mantener la última notificación recibida
  const lastNotificationResponse = useRef<Notifications.NotificationResponse | null>(null);

  useEffect(() => {
    // Enviar el token al servidor cuando el usuario esté autenticado
    const sendTokenToServer = async () => {
      if (state.isAuthenticated && state.user?.token) {
        // Obtener el token almacenado
        const pushToken = await getStoredPushToken();
        
        if (pushToken) {
          console.log('Enviando token de notificaciones al servidor:', pushToken);
          await updatePushTokenIfNeeded(pushToken, state.user.token);
        }
      }
    };

    if (isInitialized) {
      sendTokenToServer();
    }
  }, [isInitialized, state.isAuthenticated, state.user]);

  // Refrescar los datos de notificaciones cuando el usuario inicie sesión
  useEffect(() => {
    if (state.isAuthenticated && isInitialized) {
      refreshNotificationData();
    }
  }, [state.isAuthenticated, isInitialized]);

  // Manejar navegación desde notificaciones que iniciaron la app (cold start)
  useEffect(() => {
    // Verificar si hay una notificación pendiente para procesar
    const getInitialNotification = async () => {
      // Solo procesar navegación si el usuario está autenticado
      if (!state.isAuthenticated) return;

      try {
        const response = await Notifications.getLastNotificationResponseAsync();
        
        // Si hay una notificación que inició la app y no la hemos procesado antes
        if (response && 
            response.notification.request.identifier !== lastNotificationResponse.current?.notification.request.identifier) {
          
          console.log('Notificación que inició la app:', response);
          lastNotificationResponse.current = response;
          
          // Dar tiempo para que el navegador se inicialice completamente
          setTimeout(() => {
            // Navegar basado en los datos de la notificación
            const notificationData = response.notification.request.content.data;
            handleNotificationNavigation(notificationData);
          }, 1000);
        }
      } catch (error) {
        console.error('Error al obtener notificación inicial:', error);
      }
    };

    if (isInitialized && state.isAuthenticated) {
      getInitialNotification();
    }
  }, [isInitialized, state.isAuthenticated]);

  useEffect(() => {
    const backAction = () => {
      if (state.isAuthenticated) {
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [state.isAuthenticated]);

  const initialRoute = state.isAuthenticated && state.user ? 'Main' : 'Login';

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false, // ✅ Ocultamos el header en la navegación principal
      }}
    >
      {!state.isAuthenticated ? (
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{
            gestureEnabled: false,
            animation: 'fade'
          }}
        />
      ) : (
        <Stack.Screen 
          name="Main" 
          component={MainNavigator} 
        />
      )}
    </Stack.Navigator>
  );
}

function AppContent() {
  const fontsLoaded = useFonts();

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <NavigationStack />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </AuthProvider>
  );
}