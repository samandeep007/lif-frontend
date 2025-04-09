import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingScreen from '../screens/Onboarding';

const Stack = createStackNavigator();

const OnboardingStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Welcome" component={OnboardingScreen} />
      <Stack.Screen name="SignUp" component={OnboardingScreen} />
    </Stack.Navigator>
  );
};

export default OnboardingStack;