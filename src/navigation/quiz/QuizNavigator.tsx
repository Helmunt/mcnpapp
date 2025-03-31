import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import QuizzesListScreen from '../../screens/Quiz/QuizzesListScreen';
import QuizScreen from '../../screens/Quiz/QuizScreen';
import QuizResultScreen from '../../screens/Quiz/QuizResultScreen';

export type QuizStackParamList = {
  QuizzesList: undefined;
  Quiz: { quizId: number };
  QuizResult: { quizId: number, resultId?: number, result?: any };
};

const Stack = createNativeStackNavigator<QuizStackParamList>();

const QuizNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="QuizzesList"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="QuizzesList" component={QuizzesListScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="QuizResult" component={QuizResultScreen} />
    </Stack.Navigator>
  );
};

export default QuizNavigator;