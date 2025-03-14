import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, BackHandler } from 'react-native';
import { useEffect } from 'react';
import { LoginScreen } from './src/screens/Auth/Login';
import { MainNavigator } from './src/navigation/MainNavigator';
import { useFonts } from './src/hooks/useFonts';
import { COLORS } from './src/constants/theme';
import { RootStackParamList } from './src/types/navigation';
import { UserProvider } from './src/context/UserContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { useNotifications } from './src/hooks/useNotifications';
import { updatePushTokenIfNeeded } from './src/services/pushTokenService';

const Stack = createNativeStackNavigator<RootStackParamList>();

function NavigationStack() {
  const { state } = useAuth();
  // Inicializar las notificaciones solo cuando el usuario está autenticado
  const { expoPushToken } = useNotifications();

  useEffect(() => {
    // Enviar el token al servidor cuando esté disponible y el usuario autenticado
    const sendTokenToServer = async () => {
      if (expoPushToken && state.isAuthenticated && state.user?.token) {
        console.log('Enviando token de notificaciones al servidor:', expoPushToken);
        await updatePushTokenIfNeeded(expoPushToken, state.user.token);
      }
    };

    sendTokenToServer();
  }, [expoPushToken, state.isAuthenticated, state.user]);

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
    <NavigationContainer>
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