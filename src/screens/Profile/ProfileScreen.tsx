import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
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
    navigation.navigate('Main', {
      screen: 'MainTabs',
      params: {
        screen: 'Home',
      },
    });
  };

  return (
    <View style={styles.container}>
      <Header />
      
      <View style={globalStyles.container}>
        <View style={styles.profileContainer}>
          <Text style={styles.title}>Perfil de Usuario</Text>
          
          <View style={styles.userInfoContainer}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>{user?.name || 'No disponible'}</Text>
            
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user?.email || 'No disponible'}</Text>
            
            <Text style={styles.label}>Rol:</Text>
            <Text style={styles.value}>{user?.role || 'No disponible'}</Text>
          </View>
          
          <Text style={styles.note}>
            Estamos trabajando en una nueva experiencia de perfil para ti.
            Pronto tendrás acceso a más funciones y personalización.
          </Text>
        </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white
  },
  profileContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 30
  },
  userInfoContainer: {
    width: '100%',
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 20,
    marginBottom: 30
  },
  label: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: 'bold',
    marginTop: 10
  },
  value: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 15
  },
  note: {
    textAlign: 'center',
    color: COLORS.text,
    fontSize: 14,
    paddingHorizontal: 20
  }
});