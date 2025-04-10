import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';
import ProfileScreen from '../screens/Profile';
import SwipeScreen from '../screens/Swipe';
import ChatScreen from '../screens/Chat';
import CallScreen from '../screens/Call';
import ConfessionScreen from '../screens/Confession';
import NotificationsScreen from '../screens/Notifications';

const Tab = createBottomTabNavigator();
const ChatStack = createStackNavigator();

const ChatStackNavigator = () => {
  return (
    <ChatStack.Navigator>
      <ChatStack.Screen
        name="ChatList"
        component={ChatScreen}
        options={{ headerShown: false }}
      />
      <ChatStack.Screen
        name="Call"
        component={CallScreen}
        options={{ headerShown: false }}
      />
    </ChatStack.Navigator>
  );
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Swipe') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Confession') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.accent.pink,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarStyle: {
          backgroundColor: theme.colors.text.primary + '10',
          borderTopColor: theme.colors.text.secondary + '20',
        },
      })}
    >
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Swipe"
        component={SwipeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatStackNavigator}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Confession"
        component={ConfessionScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;