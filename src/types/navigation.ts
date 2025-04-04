import { CompositeNavigationProp, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { QuizStackParamList } from '../navigation/quiz/QuizNavigator';

// Stack principal
export type RootStackParamList = {
  Login: undefined;
  // ✔ Cambiamos "Main" para que sea un NavigatorScreenParams<MainStackParamList>
  Main: NavigatorScreenParams<MainStackParamList>;
  // Si "Profile" no se utiliza en el RootStack, podemos removerlo.
  // Si de verdad la usas directamente desde aquí, la dejamos:
  Profile: undefined;
  // Añadir la pantalla de notificaciones al stack principal
  Notifications: undefined;
  // Movemos ForgotPassword a este nivel
  ForgotPassword: undefined;
};

// Stack dentro de Main
export type MainStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
  Notifications: undefined;
  ForgotPassword: undefined;
  Quiz: NavigatorScreenParams<QuizStackParamList>;
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
  // Añadir las pantallas de cuestionarios al stack del congreso
  QuizzesList: undefined;
  Quiz: { quizId: number };
  QuizResult: { quizId: number, resultId?: number, result?: any };
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