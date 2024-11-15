import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Details: undefined;
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;