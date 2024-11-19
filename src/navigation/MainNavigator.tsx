import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, User, Users, Award } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

import { HomeScreen } from '../screens/Home/HomeScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { SocialScreen } from '../screens/Social/SocialScreen';
import { CertificatesScreen } from '../screens/Certificates/CertificatesScreen';

const Tab = createBottomTabNavigator();

export const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.lightGray,
          height: 60,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerTintColor: COLORS.text,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          title: 'Inicio'
        }}
      />
      <Tab.Screen
        name="Social"
        component={SocialScreen}
        options={{
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
          title: 'Muro MCNP'
        }}
      />
      <Tab.Screen
        name="Certificates"
        component={CertificatesScreen}
        options={{
          tabBarIcon: ({ color }) => <Award size={24} color={color} />,
          title: 'Certificados'
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
          title: 'Perfil'
        }}
      />
    </Tab.Navigator>
  );
};