import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, User, Users, Award } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES } from '../constants/theme';
import { Header } from '../components/shared/Header';
import { useUser } from '../context/UserContext';

import { HomeScreen } from '../screens/Home/HomeScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { SocialScreen } from '../screens/Social/SocialScreen';
import { CertificatesScreen } from '../screens/Certificates/CertificatesScreen';

const Tab = createBottomTabNavigator();

export const MainNavigator = () => {
 const { userName } = useUser();
 return (
   <>
     <Header />
     <Tab.Navigator
       screenOptions={{
         tabBarStyle: {
           backgroundColor: COLORS.white,
           borderTopColor: COLORS.lightGray,
           height: Platform.OS === 'ios' ? 90 : 60,
           paddingBottom: Platform.OS === 'ios' ? 30 : 10,
           paddingTop: 10,
           ...Platform.select({
             android: {
               elevation: 8,
             },
             ios: {
               shadowColor: COLORS.black,
               shadowOffset: {
                 width: 0,
                 height: -2,
               },
               shadowOpacity: 0.15,
               shadowRadius: 4,
             },
           }),
         },
         tabBarActiveTintColor: COLORS.primary,
         tabBarInactiveTintColor: COLORS.gray,
         tabBarLabelStyle: {
           fontFamily: FONTS.body,
           fontSize: FONT_SIZES.xs,
           marginTop: 5,
         },
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
           tabBarIcon: ({ color }) => <Home size={24} color={color} strokeWidth={1.5} />,
           title: 'Inicio'
         }}
       />
       <Tab.Screen
         name="Social"
         component={SocialScreen}
         options={{
           tabBarIcon: ({ color }) => <Users size={24} color={color} strokeWidth={1.5} />,
           title: 'Muro MCNP'
         }}
       />
       <Tab.Screen
         name="Certificates"
         component={CertificatesScreen}
         options={{
           tabBarIcon: ({ color }) => <Award size={24} color={color} strokeWidth={1.5} />,
           title: 'Certificados'
         }}
       />
       <Tab.Screen
         name="Profile"
         component={ProfileScreen}
         options={{
           tabBarIcon: ({ color }) => <User size={24} color={color} strokeWidth={1.5} />,
           title: 'Perfil'
         }}
       />
     </Tab.Navigator>
   </>
 );
};