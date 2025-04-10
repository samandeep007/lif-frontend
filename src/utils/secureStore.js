import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const getItemAsync = async key => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error('Error getting item from SecureStore:', error.message);
    return null;
  }
};

export const setItemAsync = async (key, value) => {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  }
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error('Error setting item in SecureStore:', error.message);
  }
};

export const deleteItemAsync = async key => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
    return;
  }
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error('Error deleting item from SecureStore:', error.message);
  }
};
