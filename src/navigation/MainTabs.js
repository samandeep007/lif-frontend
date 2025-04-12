import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';
import SwipeScreen from '../screens/Swipe';
import ChatScreen from '../screens/Chat';
import ProfileScreen from '../screens/Profile';
import ConfessionScreen from '../screens/Confession';
import NotificationsScreen from '../screens/Notifications';
import { triggerHaptic } from '../utils/haptics';

const Stack = createStackNavigator();

// Stack navigator for the Profile tab
const ProfileStackNavigator = ({ navigation }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileMain"
        options={{ headerShown: false }}
      >
        {(props) => <ProfileScreen {...props} navigation={navigation} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

const MainTabs = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Swipe');

  const handleTabPress = (tabName) => {
    triggerHaptic('light');
    setActiveTab(tabName);
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'Swipe':
        return <SwipeScreen navigation={navigation} />;
      case 'Chat':
        return <ChatScreen navigation={navigation} />;
      case 'Profile':
        return <ProfileStackNavigator navigation={navigation} />;
      case 'Confession':
        return <ConfessionScreen navigation={navigation} />;
      case 'Notifications':
        return <NotificationsScreen navigation={navigation} />;
      default:
        return <SwipeScreen navigation={navigation} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        {renderScreen()}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => handleTabPress('Profile')}
          >
            <Ionicons
              name={activeTab === 'Profile' ? 'person' : 'person-outline'}
              size={30}
              color={
                activeTab === 'Profile'
                  ? theme.colors.accent.pink
                  : theme.colors.text.primary
              }
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => handleTabPress('Swipe')}
          >
            <Ionicons
              name={activeTab === 'Swipe' ? 'flash' : 'flash-outline'}
              size={30}
              color={
                activeTab === 'Swipe'
                  ? theme.colors.accent.pink
                  : theme.colors.text.primary
              }
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => handleTabPress('Chat')}
          >
            <Ionicons
              name={activeTab === 'Chat' ? 'chatbubble' : 'chatbubble-outline'}
              size={30}
              color={
                activeTab === 'Chat'
                  ? theme.colors.accent.pink
                  : theme.colors.text.primary
              }
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => handleTabPress('Confession')}
          >
            <Ionicons
              name={activeTab === 'Confession' ? 'book' : 'book-outline'}
              size={30}
              color={
                activeTab === 'Confession'
                  ? theme.colors.accent.pink
                  : theme.colors.text.primary
              }
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => handleTabPress('Notifications')}
          >
            <Ionicons
              name={
                activeTab === 'Notifications'
                  ? 'notifications'
                  : 'notifications-outline'
              }
              size={30}
              color={
                activeTab === 'Notifications'
                  ? theme.colors.accent.pink
                  : theme.colors.text.primary
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.text.secondary + '33', // Subtle border
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'web' ? 10 : 0, // Extra padding for web
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
});

export default MainTabs;