import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { globalStyles } from '../../styles/global';
import { Header } from '../../components/shared/Header';
import { MainNavigator } from '../../navigation/MainNavigator';

export const ProfileScreen = () => {
  const { state } = useAuth();
  const user = state.user;

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <ScrollView style={[globalStyles.screenContainer, { flex: 1 }]}>
        <Text style={globalStyles.title}>Perfil del Usuario</Text>
        
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
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <MainNavigator hideHeader={true} />
      </View>
    </View>
  );
};