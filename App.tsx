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

const Stack = createNativeStackNavigator<RootStackParamList>();

function NavigationStack() {
  const { state } = useAuth();

  useEffect(() => {
    const backAction = () => {
      if (state.isAuthenticated) {
        return true; // Previene la navegación hacia atrás
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [state.isAuthenticated]);

  // Asegurarnos de que el estado de autenticación es consistente
  const initialRoute = state.isAuthenticated && state.user ? 'Main' : 'Login';

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontFamily: 'Questrial',
        },
        gestureEnabled: false, // Deshabilitar gestos de navegación
      }}
    >
      {!state.isAuthenticated ? (
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{
            gestureEnabled: false,
            headerShown: false,
            animation: 'fade'
          }}
        />
      ) : (
        <Stack.Screen 
          name="Main" 
          component={MainNavigator} 
          options={{
            gestureEnabled: false,
            headerShown: false,
            animation: 'fade'
          }}
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