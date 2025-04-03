import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Image, Text } from 'react-native';
import { COLORS } from '../../../constants/theme';
import { useAuth } from '../../../context/AuthContext';
import { getUserQrUrl } from '../../../services/userQrService';

export const QRScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { state } = useAuth();

  useEffect(() => {
    const loadQrCode = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!state.user || !state.user.id || !state.user.token) {
          setError('No se pudo obtener información del usuario');
          setIsLoading(false);
          return;
        }

        const url = await getUserQrUrl(state.user.id, state.user.token);
        
        if (!url) {
          setError('No se encontró el código QR para tu usuario');
          setIsLoading(false);
          return;
        }

        setQrUrl(url);
        setIsLoading(false);
      } catch (err) {
        console.error('Error al cargar código QR:', err);
        setError('Error al cargar el código QR');
        setIsLoading(false);
      }
    };

    loadQrCode();
  }, [state.user]);

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>
        ¡Bienvenidos al Congreso de Neuropsicofarmacología 2025! Utiliza el código QR que aparece en pantalla para registrarte al llegar. ¡Es rápido y fácil!
      </Text>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : qrUrl ? (
        <View style={styles.qrContainer}>
          <Image
            source={{ uri: qrUrl }}
            style={styles.qrImage}
            resizeMode="contain"
            onError={() => setError('No se pudo cargar la imagen del código QR')}
          />
        </View>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se encontró código QR</Text>
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
  welcomeText: {
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
    marginTop: 30,
    color: COLORS.text,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
  },
  qrContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 20,
  },
  qrImage: {
    width: '90%',
    height: '90%',
  },
});