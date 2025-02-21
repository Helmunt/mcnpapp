import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { globalStyles } from '../../styles/global';
import { Header } from '../../components/shared/Header';
import { COLORS } from '../../constants/theme';

export const ProfileScreen = () => {
  const { state } = useAuth();
  const navigation = useNavigation();
  const user = state.user;

  const handleGoToHome = () => {
    // @ts-ignore - Ignoramos el error de tipo
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  return (
    <View style={globalStyles.container}>
      <Header />
      
      <View style={globalStyles.titleContainer}>
        <Text style={globalStyles.pageTitle}>Perfil</Text>
      </View>
      
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
  );
};