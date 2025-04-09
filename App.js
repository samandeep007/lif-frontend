import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import * as Font from 'expo-font';
import OnboardingStack from './src/navigation/OnboardingStack';
import MainTabs from './src/navigation/MainTabs';
import theme from './src/styles/theme';

const App = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'Poppins-Regular': require('./src/assets/fonts/Poppins-Regular.ttf'),
        'Poppins-Bold': require('./src/assets/fonts/Poppins-Bold.ttf'),
        'Poppins-SemiBold': require('./src/assets/fonts/Poppins-SemiBold.ttf'),
      });
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null; // Wait for fonts to load
  }

  const isAuthenticated = false;

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor={theme.colors.background} />
      {isAuthenticated ? <MainTabs /> : <OnboardingStack />}
    </NavigationContainer>
  );
};

export default App;