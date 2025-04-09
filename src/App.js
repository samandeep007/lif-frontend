import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import * as Font from 'expo-font';
import OnboardingStack from './src/navigation/OnboardingStack';
import MainTabs from './src/navigation/MainTabs';

const App = () => {
  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'Poppins-Regular': require('./node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Poppins-Regular.ttf'),
        'Poppins-Bold': require('./node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Poppins-Bold.ttf'),
        'Poppins-SemiBold': require('./node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Poppins-SemiBold.ttf'),
      });
    };
    loadFonts();
  }, []);

  // We'll add logic to determine if the user is authenticated in a later chunk
  const isAuthenticated = false;

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor={theme.colors.background} />
      {isAuthenticated ? <MainTabs /> : <OnboardingStack />}
    </NavigationContainer>
  );
};

export default App;