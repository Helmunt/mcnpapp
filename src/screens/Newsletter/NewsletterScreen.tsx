import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import WebView from 'react-native-webview';
import { COLORS } from '../../constants/theme';
import { globalStyles } from '../../styles/global';

export const NewsletterScreen = () => {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [webViewKey, setWebViewKey] = useState(1); // Para forzar recarga si es necesario

  // Timeout para detectar carga lenta
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      timer = setTimeout(() => {
        if (isLoading && webViewRef.current) {
          setWebViewKey(prev => prev + 1); // Esto fuerza una recarga
        }
      }, 8000); // 8 segundos timeout
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading]);

  // CSS rules con los selectores específicos de Newsletter
  const cssRules = `
    header,
    .elementor-element-167c473,
    .elementor-element-7b21b5a,
    .elementor-element-b920cf3,
    .elementor-element-ff53689,
    .elementor-social-icons-wrapper,
    div[data-id="9dd49e9"],
    footer#colophon,
    .site-footer,
    .elementor-113,
    [data-elementor-type="footer"],
    div.site-header-wrapper,
    header#masthead,
    div.elementor-location-header,
    .site-header,
    div.elementor-element-ed3f724,
    .elementor-background-video-container,
    div[data-id="ed3f724"],
    div[data-element_type="container"][data-settings*="background_video_link"],
    video[src*="MCNP-movimiento-neuronal.mp4"],
    [data-settings*="MCNP-movimiento-neuronal.mp4"],
    .elementor-element-background-video-container {
      display: none !important;
      height: 0 !important;
      min-height: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }
    
    /* Evitar reproducción de cualquier video en la página */
    video {
      display: none !important;
      height: 0 !important;
      width: 0 !important;
      position: absolute !important;
      opacity: 0 !important;
      z-index: -9999 !important;
    }
    
    body {
      padding-top: 0 !important;
      margin-top: 0 !important;
    }
  `;

  // Script para Android con manejo adicional de videos
  const injectedScript = `
    (function() {
      const style = document.createElement('style');
      style.type = 'text/css';
      style.appendChild(document.createTextNode(\`${cssRules}\`));
      document.head.appendChild(style);
      
      // Función para desactivar videos
      function disableVideos() {
        // Desactivar todos los videos
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
          if(video) {
            video.pause();
            video.controls = false;
            video.autoplay = false;
            video.style.display = 'none';
            video.style.height = '0';
            video.style.width = '0';
            video.style.opacity = '0';
            video.muted = true;
            video.src = '';
            video.removeAttribute('src');
            
            // Eliminar sources
            const sources = video.querySelectorAll('source');
            sources.forEach(source => {
              source.removeAttribute('src');
              source.parentNode.removeChild(source);
            });
          }
        });
        
        // Ocultar contenedores de video
        const videoContainers = document.querySelectorAll('.elementor-background-video-container, [data-element_type="container"][data-settings*="background_video_link"]');
        videoContainers.forEach(container => {
          container.style.display = 'none';
          container.style.height = '0';
          container.style.opacity = '0';
          container.style.visibility = 'hidden';
        });
      }
      
      // Ejecutar inmediatamente
      disableVideos();
      
      // Ejecutar cuando el DOM esté listo
      document.addEventListener('DOMContentLoaded', disableVideos);
      
      // Verificar periódicamente para manejar cargas dinámicas
      setInterval(disableVideos, 1000);
    })();
    true;
  `;

  // Script para iOS con control adicional para videos
  const userScript = `
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = \`${cssRules}\`;
    document.documentElement.appendChild(style);
    
    // Función para desactivar todos los videos en la página
    function disableVideos() {
      // Buscar y desactivar cualquier video en la página
      var videos = document.querySelectorAll('video');
      videos.forEach(function(video) {
        video.pause();
        video.controls = false;
        video.autoplay = false;
        video.style.display = 'none';
        video.style.height = '0';
        video.style.width = '0';
        video.style.opacity = '0';
        video.muted = true;
        video.src = '';
        
        // Eliminar el atributo src para evitar la carga
        video.removeAttribute('src');
        
        // Eliminar todas las fuentes del video
        var sources = video.querySelectorAll('source');
        sources.forEach(function(source) {
          source.removeAttribute('src');
          source.remove();
        });
      });
      
      // Desactivar elementos específicos con videos de fondo
      var videoContainers = document.querySelectorAll('.elementor-background-video-container, [data-element_type="container"][data-settings*="background_video_link"]');
      videoContainers.forEach(function(container) {
        container.style.display = 'none';
        container.style.height = '0';
        container.style.opacity = '0';
        container.style.visibility = 'hidden';
      });
    }
    
    // Ejecutar al cargar
    disableVideos();
    
    // También ejecutar después de que el DOM esté completamente cargado
    document.addEventListener('DOMContentLoaded', disableVideos);
    
    // Y en caso de carga dinámica, verificar periódicamente
    setInterval(disableVideos, 1000);
  `;

  return (
    <View style={styles.container}>          
      <WebView
        key={webViewKey}
        ref={webViewRef}
        source={{ 
          uri: 'https://mcnpmexico.org/newsletter-mcnp/',
          headers: Platform.OS === 'android' ? {
            'Cache-Control': 'max-age=3600',
            'Pragma': 'no-cache'
          } : {
            'Cache-Control': 'no-cache'
          }
        }}
        style={[styles.webview, isLoading && styles.hiddenWebview]}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={true}
        cacheEnabled={Platform.OS === 'android'}
        androidLayerType={Platform.OS === 'android' ? 'hardware' : undefined}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}
        onError={() => {
          // Recargar en caso de error
          if (Platform.OS === 'android') {
            setTimeout(() => setWebViewKey(prev => prev + 1), 500);
          }
        }}
        injectedJavaScript={Platform.OS === 'android' ? injectedScript : undefined}
        userAgent={Platform.OS === 'ios' ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1' : undefined}
        injectedJavaScriptBeforeContentLoaded={Platform.OS === 'ios' ? userScript : undefined}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
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
});