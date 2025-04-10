import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import * as Font from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import OnboardingStack from './src/navigation/OnboardingStack';
import MainTabs from './src/navigation/MainTabs';
import theme from './src/styles/theme';
import useAuthStore from './src/store/authStore';
import api from './src/api/api';

// Enable screens for React Navigation
import { enableScreens } from 'react-native-screens';
enableScreens();

const App = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);

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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
          const response = await api.get('/users/me');
          if (response.data.success) {
            setUser(response.data.data);
            setToken(token);
            setIsAuthenticated(true);
          } else {
            await SecureStore.deleteItemAsync('authToken');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        await SecureStore.deleteItemAsync('authToken');
      }
    };
    checkAuth();
  }, [setUser, setToken]);

  if (!fontsLoaded) {
    return null; // Wait for fonts to load
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor={theme.colors.background} />
        {isAuthenticated ? <MainTabs /> : <OnboardingStack />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;