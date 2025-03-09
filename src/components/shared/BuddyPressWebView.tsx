import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Text,
  TouchableOpacity,
} from 'react-native';
import WebView from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { BuddyPressService } from '../../services/buddypress';
import { COLORS } from '../../constants/theme';

interface BuddyPressWebViewProps {
  initialUrl?: string;
  defaultSection?: 'activity' | 'profile' | 'members';
  hideElements?: boolean;
  onNavigationStateChange?: (event: any) => void;
  style?: any;
}

export interface BuddyPressWebViewRef {
  reload: () => void;
  navigateSafely: (screenName: string, params?: any) => void;
}

const BuddyPressWebView = forwardRef<BuddyPressWebViewRef, BuddyPressWebViewProps>(({
  initialUrl,
  defaultSection = 'activity',
  hideElements = true,
  onNavigationStateChange,
  style,
}, ref) => {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const { state } = useAuth();
  const navigation = useNavigation();

  // Script para recargar la página
  const reloadScript = `
    (function() {
      window.location.reload(true);
      return true;
    })();
  `;

  // Exponer métodos a través de la referencia
  useImperativeHandle(ref, () => ({
    reload: () => {
      if (webViewRef.current) {
        webViewRef.current.reload();
      }
    },
    navigateSafely: (screenName: string, params?: any) => {
      // Evitar navegaciones duplicadas
      if (isNavigating) {
        console.log('[BuddyPressWebView] Navegación ya en progreso, ignorando solicitud');
        return;
      }
      
      setIsNavigating(true);
      
      // Función de navegación simplificada
      const navigateToScreen = () => {
        // @ts-ignore
        navigation.navigate(screenName, params);
        setTimeout(() => setIsNavigating(false), 300);
      };
      
      // Si no hay WebView o no hay usuario autenticado, navegar directamente
      if (!webViewRef.current || !state.isAuthenticated || !state.user) {
        navigateToScreen();
        return;
      }
      
      // Limpiar token y recargar antes de navegar
      BuddyPressService.clearToken().then(() => {
        try {
          webViewRef.current?.injectJavaScript(reloadScript);
          setTimeout(navigateToScreen, 300);
        } catch (error) {
          console.error('[BuddyPressWebView] Error al recargar:', error);
          navigateToScreen();
        }
      });
    }
  }));

  // CSS para ocultar elementos no deseados de WordPress/BuddyPress
  const cssRules = `
    div.site-header-wrapper,
    .site-header-wrapper {
      display: none !important;
      height: 0 !important;
      min-height: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
      visibility: hidden !important;
      opacity: 0 !important;
    }
  `;

  // Script para inyectar en Android
  const androidScript = `
    (function() {
      const style = document.createElement('style');
      style.type = 'text/css';
      style.appendChild(document.createTextNode(\`${hideElements ? cssRules : ''}\`));
      document.head.appendChild(style);      
      true;
    })();
  `;

  // Script para inyectar en iOS
  const iosPreloadScript = `
    document.addEventListener('DOMContentLoaded', function() {
      var style = document.createElement('style');
      style.textContent = \`${hideElements ? cssRules : ''}\`;
      document.head.appendChild(style);
      
      // Deshabilitar videos
      var videos = document.querySelectorAll('video');
      videos.forEach(function(video) {
        if(video.pause) video.pause();
        if(video.remove) video.remove();
      });
    });
    true;
  `;

  // Obtener URL de autenticación de BuddyPress
  useEffect(() => {
    const getAuthUrl = async () => {
      try {
        if (!state.isAuthenticated || !state.user?.token) {
          setHasError(true);
          setErrorMessage('Debes iniciar sesión para acceder a esta sección');
          return;
        }

        // Comprobar si ya tenemos un token válido
        const hasToken = await BuddyPressService.hasValidToken();
        
        if (hasToken) {
          // Obtenemos el token almacenado
          const token = await BuddyPressService.getStoredToken();
          
          // Verificar que el token pertenezca al usuario actual
          // Si el userId del token no coincide con el id del usuario actual, invalidar el token
          if (token && token.userId !== state.user.id) {
            console.log('[BuddyPressWebView] Token pertenece a otro usuario, limpiando...');
            await BuddyPressService.clearToken();
            // Continuar para obtener un nuevo token para el usuario actual
          } else if (token?.authUrl) {
            // El token es válido y pertenece al usuario actual
            console.log('[BuddyPressWebView] Token válido encontrado para el usuario actual');
            
            // Modificar la URL para usar la sección correcta
            const url = new URL(token.authUrl);
            url.searchParams.set('redirect', defaultSection);
            setAuthUrl(url.toString());
            return;
          }
        }

        // Si llegamos aquí, necesitamos un nuevo token
        console.log(`[BuddyPressWebView] Solicitando nuevo token para usuario ID: ${state.user.id}, sección: ${defaultSection}`);
        
        // Obtener nuevo token especificando la sección a la que queremos redirigir
        const bpToken = await BuddyPressService.getAuthToken(state.user.token, defaultSection);
        
        // Verificar que el nuevo token tenga el ID de usuario correcto
        if (bpToken.userId !== state.user.id) {
          console.warn('[BuddyPressWebView] ¡Advertencia! ID de usuario en el token no coincide con usuario actual');
        }
        
        setAuthUrl(bpToken.authUrl);
      } catch (error) {
        console.error('Error obteniendo URL de autenticación:', error);
        setHasError(true);
        setErrorMessage('Error al conectar con la red social. Intente nuevamente.');
      }
    };

    getAuthUrl();
  }, [state.isAuthenticated, state.user?.id, state.user?.token, defaultSection]);

  // Determinar URL inicial
  const getInitialUrl = () => {
    if (initialUrl) return initialUrl;
    if (authUrl) return authUrl;
    return `https://mcnpmexico.org/members/${defaultSection}`;
  };

  // Manejar errores de carga
  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    setHasError(true);
    setErrorMessage('Error al cargar el contenido. Intente nuevamente.');
    setIsLoading(false);
  };

  // Recargar WebView
  const handleReload = () => {
    setHasError(false);
    setErrorMessage('');
    
    // Forzar la obtención de un nuevo token
    BuddyPressService.clearToken().then(() => {
      if (webViewRef.current) {
        webViewRef.current.reload();
      }
    });
  };

  // Si hay error, mostrar pantalla de error
  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <TouchableOpacity style={styles.reloadButton} onPress={handleReload}>
          <Text style={styles.reloadButtonText}>Intentar nuevamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Si aún estamos obteniendo la URL de autenticación
  if (!authUrl && !initialUrl) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Conectando con la red social...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ 
          uri: getInitialUrl(),
          headers: { 'Cache-Control': 'no-cache' }
        }}
        style={[styles.webview, isLoading && styles.hiddenWebview]}
        onLoadStart={() => setIsLoading(false)}
        onLoadEnd={() => setIsLoading(false)}
        onError={handleError}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        cacheEnabled={true}
        mediaPlaybackRequiresUserAction={true}
        injectedJavaScript={Platform.OS === 'android' ? androidScript : undefined}
        injectedJavaScriptBeforeContentLoaded={Platform.OS === 'ios' ? iosPreloadScript : undefined}
        onNavigationStateChange={onNavigationStateChange}
        androidLayerType={Platform.OS === 'android' ? "hardware" : undefined}
        userAgent={Platform.OS === 'ios' 
          ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
          : undefined
        }
      />
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando contenido...</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  webview: {
    flex: 1,
    opacity: 1,
  },
  hiddenWebview: {
    opacity: 0,
  },
  loadingContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  reloadButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  reloadButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BuddyPressWebView;