import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform } from 'react-native';
import OnboardingScreen from '../screens/Onboarding';

const Stack = createStackNavigator();

const OnboardingStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        animationEnabled: Platform.OS !== 'web', // Disable animations on web
      }}
    >
      <Stack.Screen name="Welcome" component={OnboardingScreen} />
      <Stack.Screen name="SignUp" component={OnboardingScreen} />
      <Stack.Screen name="EmailVerification" component={OnboardingScreen} />
      <Stack.Screen name="ProfileSetup" component={OnboardingScreen} />
      <Stack.Screen name="FinalWelcome" component={OnboardingScreen} />
    </Stack.Navigator>
  );
};

export default OnboardingStack;