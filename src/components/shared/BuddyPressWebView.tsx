// src/components/shared/BuddyPressWebView.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Text,
  TouchableOpacity,
} from 'react-native';
import WebView from 'react-native-webview';
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

const BuddyPressWebView: React.FC<BuddyPressWebViewProps> = ({
  initialUrl,
  defaultSection = 'activity',
  hideElements = true,
  onNavigationStateChange,
  style,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { state } = useAuth();

  // CSS para ocultar elementos no deseados de WordPress/BuddyPress
  const cssRules = `
    header, 
    .site-header-wrapper,
    #masthead,
    footer,
    .footer-widgets,
    .site-footer,
    #colophon,
    div[data-elementor-type="footer"],
    .elementor-location-footer,
    .elementor-element-ed3f724,
    video, 
    .elementor-video,
    .elementor-background-video-container {
      display: none !important;
      height: 0 !important;
      max-height: 0 !important;
      min-height: 0 !important;
      visibility: hidden !important;
      opacity: 0 !important;
    }
    
    /* Ajustar el cuerpo de la página */
    body {
      padding-top: 0 !important;
      margin-top: 0 !important;
    }
    
    /* Mostrar contenido principal */
    .site-content,
    #content,
    .content-area,
    .elementor-location-single,
    #buddypress {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      padding-top: 0 !important;
      margin-top: 0 !important;
    }
  `;

  // Script para inyectar en Android
  const androidScript = `
    (function() {
      const style = document.createElement('style');
      style.type = 'text/css';
      style.appendChild(document.createTextNode(\`${hideElements ? cssRules : ''}\`));
      document.head.appendChild(style);
      
      // Deshabilitar videos
      const videos = document.querySelectorAll('video');
      videos.forEach(video => {
        if(video.pause) video.pause();
        if(video.remove) video.remove();
      });
      
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
          const token = await BuddyPressService.getStoredToken();
          setAuthUrl(token?.authUrl || null);
          return;
        }

        // Obtener nuevo token
        const bpToken = await BuddyPressService.getAuthToken(state.user.token);
        setAuthUrl(bpToken.authUrl);
      } catch (error) {
        console.error('Error obteniendo URL de autenticación:', error);
        setHasError(true);
        setErrorMessage('Error al conectar con la red social. Intente nuevamente.');
      }
    };

    getAuthUrl();
  }, [state.isAuthenticated, state.user?.token]);

  // Determinar URL inicial
  const getInitialUrl = () => {
    if (initialUrl) return initialUrl;
    if (authUrl) return authUrl;
    return 'https://mcnpmexico.org';
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
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
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
        onLoadStart={() => setIsLoading(true)}
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
};

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