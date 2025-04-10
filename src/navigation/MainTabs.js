import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';
import SwipeScreen from '../screens/Swipe';
import ChatScreen from '../screens/Chat';
import ProfileScreen from '../screens/Profile';
import { triggerHaptic } from '../utils/haptics';

const MainTabs = () => {
  const [activeTab, setActiveTab] = useState('Swipe');

  const handleTabPress = tabName => {
    triggerHaptic('light');
    setActiveTab(tabName);
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'Swipe':
        return <SwipeScreen />;
      case 'Chat':
        return <ChatScreen />;
      case 'Profile':
        return <ProfileScreen />;
      default:
        return <SwipeScreen />;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
      <View style={styles.tabBar}>
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderTopWidth: 0,
    paddingBottom: 5,
    paddingTop: 5,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
});

export default MainTabs;
