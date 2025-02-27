import { CompositeNavigationProp, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';


// Stack principal
export type RootStackParamList = {
  Login: undefined;
  // ✔ Cambiamos "Main" para que sea un NavigatorScreenParams<MainStackParamList>
  Main: NavigatorScreenParams<MainStackParamList>;
  // Si "Profile" no se utiliza en el RootStack, podemos removerlo.
  // Si de verdad la usas directamente desde aquí, la dejamos:
  Profile: undefined;
};

// Stack dentro de Main
export type MainStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// Stack del Congreso
export type CongressStackParamList = {
  CongressHome: undefined;
  CongressAgenda: undefined;
  CongressSpeakers: undefined;
  CongressMap: undefined;
  CongressQR: undefined;
  CongressQuiz: undefined;
  CongressCertificates: undefined;
};

// Stack para Social
export type SocialStackParamList = {
  SocialMain: undefined;
};

// Stack para Newsletter
export type NewsletterStackParamList = {
  NewsletterMain: undefined;
};

// Stack para Profile
export type ProfileStackParamList = {
  ProfileMain: undefined;
};

// Tabs principales
export type MainTabParamList = {
  Home: undefined;
  Social: NavigatorScreenParams<SocialStackParamList>;
  Newsletter: NavigatorScreenParams<NewsletterStackParamList>;
  Congress: NavigatorScreenParams<CongressStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// Tipos de navegación compuestos
export type MainNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<MainStackParamList>
>;

export type CongressNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<CongressStackParamList>,
  MainNavigationProp
>;
