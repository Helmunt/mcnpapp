import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, BackHandler, Text } from 'react-native'; // Asegurarse que Text está importado
import { useEffect, useRef } from 'react'; // Removido useState, ya no necesitamos lastRegisteredUserId aquí
import { LoginScreen } from './src/screens/Auth/Login';
import { MainNavigator } from './src/navigation/MainNavigator';
import { useFonts } from './src/hooks/useFonts';
import { COLORS } from './src/constants/theme';
import { RootStackParamList } from './src/types/navigation';
import { UserProvider } from './src/context/UserContext'; // Asegúrate que UserProvider sea necesario aquí globalmente
import { AuthProvider, useAuth } from './src/context/AuthContext';
import useNotifications from './src/hooks/useNotifications';
import { getStoredPushToken } from './src/services/notificationService';
// Importamos la función correcta y quitamos las obsoletas
import { registerPushTokenWithServer } from './src/services/pushTokenService';
import { navigationRef, handleNotificationNavigation } from './src/navigation/navigationUtils';
import * as Notifications from 'expo-notifications';
import * as Updates from 'expo-updates';
import ForgotPassword from './src/screens/Auth/ForgotPassword';

const Stack = createNativeStackNavigator<RootStackParamList>();

function NavigationStack() {
  const { state } = useAuth();
  // Inicializar las notificaciones (incluye la verificación de versión)
  const { isInitialized, refreshNotificationData } = useNotifications();
  // Referencia para mantener la última notificación recibida al iniciar la app
  const lastNotificationResponse = useRef<Notifications.NotificationResponse | null>(null);
  // Ya no necesitamos el estado lastRegisteredUserId aquí

  // useEffect para manejar el registro/actualización del token cuando el usuario está autenticado
  useEffect(() => {
    // Función para sincronizar el token con el servidor
    const handleTokenSync = async () => {
      // Solo proceder si el usuario está autenticado, tenemos sus datos y el sistema de notificaciones está listo
      if (state.isAuthenticated && state.user?.token && state.user?.id) {
        try {
          // Obtener el token push almacenado localmente
          const pushToken = await getStoredPushToken();

          if (pushToken) {
            console.log(`[App.tsx] Intentando sincronizar token para User ID: ${state.user.id}`);
            // Llamamos a la función que siempre intenta registrar/actualizar
            // registerPushTokenWithServer ahora maneja internamente la lógica de 'force_logout_previous'
            await registerPushTokenWithServer(pushToken, state.user.token, state.user.id); // <--- ¡CAMBIO CLAVE!
            // Ya no necesitamos 'success' ni actualizar lastRegisteredUserId aquí
          } else {
            console.warn('[App.tsx] No se encontró token push local para enviar al servidor.');
          }
        } catch (error) {
          // El error específico ya se loguea dentro de registerPushTokenWithServer
          console.error('[App.tsx] Error durante la sincronización del token:', error);
        }
      }
    };

    // Solo proceder si el sistema de notificaciones está inicializado
    // y el usuario está autenticado (para tener los datos necesarios)
    if (isInitialized && state.isAuthenticated) {
      handleTokenSync();
    }
    // Dependencias correctas: se ejecuta si cambia la inicialización, el estado de auth, o los datos del usuario.
  }, [isInitialized, state.isAuthenticated, state.user?.id, state.user?.token]);

  // Ya no necesitamos el useEffect para limpiar lastRegisteredUserId al cerrar sesión

  // Refrescar los datos de notificaciones (historial/contador) cuando el usuario inicie sesión
  // y el sistema de notificaciones esté listo.
  useEffect(() => {
    if (state.isAuthenticated && isInitialized) {
      console.log('[App.tsx] Usuario autenticado y notificaciones inicializadas, refrescando datos de notificación.');
      refreshNotificationData();
    }
    // refreshNotificationData es estable por useCallback en useNotifications
  }, [state.isAuthenticated, isInitialized, refreshNotificationData]);

  // Manejar navegación desde notificaciones que iniciaron la app (cold start)
  useEffect(() => {
    // Verificar si hay una notificación pendiente para procesar
    const getInitialNotification = async () => {
      // Solo procesar navegación si el usuario está autenticado y las notificaciones están listas
      if (!isInitialized || !state.isAuthenticated) return;

      try {
        const response = await Notifications.getLastNotificationResponseAsync();

        // Si hay una notificación que inició la app y no la hemos procesado antes
        // Comparamos el objeto de respuesta completo para mayor seguridad
        if (response &&
            response !== lastNotificationResponse.current
           ) {

          console.log('[App.tsx] Procesando notificación que inició la app:', response.notification.request.identifier);
          lastNotificationResponse.current = response; // Guardar la respuesta procesada

          // Dar tiempo para que el navegador esté listo (puede ser necesario ajustar)
          setTimeout(() => {
            if (navigationRef.current?.isReady()) { // Verificar si el navegador está listo
              console.log('[App.tsx] Navegando por notificación inicial...');
              const notificationData = response.notification.request.content.data;
              handleNotificationNavigation(notificationData);
            } else {
              console.warn('[App.tsx] El navegador no estaba listo para la navegación inicial por notificación.');
              // Considerar reintentar o guardar la acción
            }
          }, 1000); // Espera prudencial
        }
      } catch (error) {
        console.error('[App.tsx] Error al obtener notificación inicial:', error);
      }
    };

    getInitialNotification();
  }, [isInitialized, state.isAuthenticated]); // Ejecutar cuando cambien estos estados

  // Manejo del botón "atrás" de Android
  useEffect(() => {
    const backAction = () => {
      // Si está autenticado, prevenimos salir de la app.
      // React Navigation debería manejar el retroceso entre pantallas.
      return !!state.isAuthenticated;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove(); // Limpiar listener
  }, [state.isAuthenticated]);

  // Determinar ruta inicial basada en autenticación
  const initialRoute = state.isAuthenticated && state.user ? 'Main' : 'Login';

  return (
    // Usamos 'key' para forzar re-render si cambia la autenticación, asegurando initialRouteName
    <Stack.Navigator
      key={state.isAuthenticated ? 'auth' : 'no-auth'}
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
      }}
    >
      {!state.isAuthenticated ? (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              gestureEnabled: false,
              animation: 'fade'
            }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPassword}
            options={{
              animation: 'slide_from_right'
            }}
          />
        </>
      ) : (
        <Stack.Screen
          name="Main" // 'Main' debe renderizar MainNavigator (Tabs, etc.)
          component={MainNavigator} // Volvemos a poner MainNavigator aquí
           options={{
              gestureEnabled: false // Evitar gesto de volver desde la pantalla principal
            }}
        />
        /* // --- CÓDIGO TEMPORAL DE PRUEBA - ELIMINAR O COMENTAR ---
        <Stack.Screen
          name="Main"
          // Usamos un componente simple en línea como placeholder
          component={() => (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'lightgray' }}>
              <Text>Prueba - Main Navigator Desactivado</Text>
            </View>
          )}
           options={{
              gestureEnabled: false
            }}
        />
        // --- FIN CÓDIGO TEMPORAL --- */
      )}
    </Stack.Navigator>
  );
}

// Componente intermedio para asegurar que las fuentes estén cargadas
function AppContent() {
  const fontsLoaded = useFonts();

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // NavigationContainer debe envolver la navegación una vez las fuentes estén listas
  return (
    <NavigationContainer ref={navigationRef}>
      <NavigationStack />
    </NavigationContainer>
  );
}

// Componente principal que configura los proveedores y las actualizaciones OTA
export default function App() {
  // Verificar actualizaciones OTA (Over-the-Air) de Expo Updates
  useEffect(() => {
    async function checkForUpdates() {
      try {
        console.log('[Updates] Modo de desarrollo:', __DEV__);

        // Solo verificar en modo de producción
        if (!__DEV__) {
          console.log('[Updates] Verificando actualizaciones...');
          const update = await Updates.checkForUpdateAsync();

          console.log('[Updates] Resultado de checkForUpdateAsync:', JSON.stringify(update));

          if (update.isAvailable) {
            console.log('[Updates] Nueva actualización disponible, descargando...');
            const fetchResult = await Updates.fetchUpdateAsync();

            console.log('[Updates] Resultado de fetchUpdateAsync:', JSON.stringify(fetchResult));

            // Comprobar si la descarga fue exitosa antes de reiniciar
            if (fetchResult.isNew) { // O simplemente verificar si no hubo error
                console.log('[Updates] Actualización descargada, reiniciando...');
                await Updates.reloadAsync();
            } else {
                console.log('[Updates] La descarga de la actualización no resultó en una nueva versión (fetchResult.isNew=false)');
            }
          } else {
            console.log('[Updates] No hay actualizaciones disponibles');
          }
        } else {
          console.log('[Updates] Omitiendo verificación de actualizaciones en modo desarrollo');
        }
      } catch (error: any) {
        // Captura errores específicos si es posible, o log genérico
         console.error(`[Updates] Error durante la verificación de actualizaciones OTA: ${error?.message || error}`);
         // Puedes agregar más detalles aquí si el objeto de error los tiene
         console.error('[Updates] Error detallado:', error);
      }
    }

    checkForUpdates();
  }, []); // Ejecutar solo una vez al montar el componente App

  // Envolver la app con los proveedores necesarios
  return (
    <AuthProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </AuthProvider>
  );
}