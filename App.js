import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import * as Font from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import OnboardingStack from './src/navigation/OnboardingStack';
import MainTabs from './src/navigation/MainTabs';
import theme from './src/styles/theme';
import useAuthStore from './src/store/authStore';
import api from './src/api/api';
import { getItemAsync, setItemAsync, deleteItemAsync } from './src/utils/secureStore';

// Enable screens for React Navigation
import { enableScreens } from 'react-native-screens';
enableScreens();

const App = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);

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
        // Clear token on app load to start fresh (for testing)
        console.log('Clearing token for testing...');
        await deleteItemAsync('authToken');
        const token = await getItemAsync('authToken');
        if (token) {
          const response = await api.get('/users/me');
          if (response.data.success) {
            setUser(response.data.data);
            setToken(token);
            setIsAuthenticated(true);
          } else {
            await deleteItemAsync('authToken');
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error.message);
        await deleteItemAsync('authToken');
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, [setUser, setToken, setIsAuthenticated]);

  if (!fontsLoaded) {
    return null; // Wait for fonts to load
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor={theme.colors.background} />
        {isAuthenticated ? <MainTabs /> : <OnboardingStack />}
        <Toast ref={(ref) => Toast.setRef(ref)} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;