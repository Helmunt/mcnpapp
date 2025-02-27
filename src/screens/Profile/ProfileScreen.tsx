import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { globalStyles } from '../../styles/global';
import { COLORS } from '../../constants/theme';
import { RootStackParamList } from '../../types/navigation';
import { Header } from '../../components/shared/Header';

// Definimos el tipo de navegación
type RootStackNavProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen = () => {
  const { state } = useAuth();
  const navigation = useNavigation<RootStackNavProp>();
  const user = state.user;

  const handleGoToHome = () => {
    // Navegar al stack principal "Main" -> "MainTabs" -> "Home"
    navigation.navigate('Main', {
      screen: 'MainTabs',
      params: {
        screen: 'Home',
      },
    });
  };
  
  return (
    <View style={{ flex: 1 }}>
      {/* Incluimos el Header principal */}
      <Header />
      
      {/* El contenido del perfil */}
      <View style={globalStyles.container}>        
        <ScrollView style={globalStyles.screenContainer}>
          <View style={globalStyles.card}>
            <View style={globalStyles.infoItem}>
              <Text style={globalStyles.label}>Nombre</Text>
              <Text style={globalStyles.value}>{user?.name || '-'}</Text>
            </View>

            <View style={globalStyles.infoItem}>
              <Text style={globalStyles.label}>Correo</Text>
              <Text style={globalStyles.value}>{user?.email || '-'}</Text>
            </View>

            <View style={globalStyles.infoItem}>
              <Text style={globalStyles.label}>Rol</Text>
              <Text style={globalStyles.value}>{user?.role || '-'}</Text>
            </View>
          </View>
        </ScrollView>
        {/* Botón flotante que navega al Home */}
        <TouchableOpacity 
          style={globalStyles.floatingBackButton}
          onPress={handleGoToHome}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};