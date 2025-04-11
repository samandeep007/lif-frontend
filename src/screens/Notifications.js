import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import theme from '../styles/theme';
import Text from '../components/common/Text';
import api from '../api/api';
import { triggerHaptic } from '../utils/haptics';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
  padding: ${theme.spacing.lg}px;
`;

const NotificationCard = styled.View`
  background-color: ${theme.colors.text.primary}10;
  border-radius: ${theme.borderRadius.medium}px;
  padding: ${theme.spacing.md}px;
  margin-bottom: ${theme.spacing.md}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const NotificationContent = styled.View`
  flex: 1;
`;

const ClearButton = styled(TouchableOpacity)`
  background-color: ${theme.colors.accent.red};
  padding: ${theme.spacing.md}px;
  border-radius: ${theme.borderRadius.medium}px;
  align-items: center;
  margin-bottom: ${theme.spacing.lg}px;
`;

const EmptyMessage = styled(Text)`
  text-align: center;
  color: ${theme.colors.text.secondary};
  margin-top: ${theme.spacing.lg}px;
`;

const ErrorMessage = styled(Text)`
  color: ${theme.colors.accent.red};
  margin-bottom: ${theme.spacing.md}px;
  text-align: center;
`;

const NotificationsScreen = () => {
  const userId = useAuthStore((state) => state.user?._id);
  const [notifications, setNotifications] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isClearing, setIsClearing] = useState(false); // Track clearing state to prevent Socket.IO interference

  useEffect(() => {
    fetchNotifications();

    const socket = io('https://lif-backend-awv3.onrender.com', {
      auth: { token: localStorage.getItem('authToken') || '' },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Connected to socket for notifications');
      socket.emit('join', userId);
    });

    socket.on('new_notification', (notification) => {
      if (!isClearing) { // Only add new notifications if not clearing
        setNotifications(prev => [notification, ...prev]);
        triggerHaptic('notification');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, isClearing]);

  const fetchNotifications = async () => {
    try {
      console.log('Fetching notifications from /notifications');
      const response = await api.get('/notifications');
      console.log('Fetch notifications response:', response.data);
      if (response.data.success) {
        setNotifications(response.data.data);
        setErrorMessage(null);
      } else {
        setErrorMessage('Failed to fetch notifications: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching notifications:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      setErrorMessage('Failed to fetch notifications: ' + (error.response?.data?.message || error.message || 'Network error'));
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      console.log(`Marking notification as read: ${notificationId}`);
      const response = await api.put(`/notifications/${notificationId}/read`);
      console.log('Mark as read response:', response.data);
      if (response.data.success) {
        setNotifications(prev =>
          prev.map(notification =>
            notification._id === notificationId ? { ...notification, readStatus: true } : notification
          )
        );
        triggerHaptic('success');
      } else {
        setErrorMessage('Failed to mark notification as read: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error marking notification as read:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      setErrorMessage('Failed to mark notification as read: ' + (error.response?.data?.message || error.message || 'Network error'));
    }
  };

  const handleClearNotifications = async () => {
    console.log('Clear All Notifications button clicked');
    const confirmClear = () => {
      if (Platform.OS === 'web') {
        return window.confirm('Are you sure you want to clear all notifications?');
      } else {
        return new Promise((resolve) => {
          Alert.alert(
            'Clear Notifications',
            'Are you sure you want to clear all notifications?',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Clear', style: 'destructive', onPress: () => resolve(true) },
            ]
          );
        });
      }
    };

    const confirmed = await confirmClear();
    if (confirmed) {
      console.log('User confirmed clearing notifications');
      setIsClearing(true); // Prevent Socket.IO from adding new notifications during clearing
      try {
        console.log('Making DELETE /notifications request...');
        const response = await api.delete('/notifications');
        console.log('DELETE /notifications response:', response.data);
        if (response.data.success) {
          console.log('Notifications cleared successfully, updating state...');
          setNotifications([]);
          setErrorMessage(null);
          triggerHaptic('success');
        } else {
          console.warn('Backend response indicated failure:', response.data.message);
          setErrorMessage('Failed to clear notifications: ' + (response.data.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error clearing notifications:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers,
          config: error.config,
        });
        setErrorMessage('Failed to clear notifications: ' + (error.response?.data?.message || error.message || 'Network error'));
      } finally {
        setIsClearing(false); // Allow Socket.IO to add new notifications again
      }
    } else {
      console.log('User cancelled clearing notifications');
    }
  };

  const renderNotification = ({ item }) => (
    <NotificationCard>
      <NotificationContent>
        <Text
          variant="body"
          style={{
            color: item.readStatus ? theme.colors.text.secondary : theme.colors.text.primary,
            fontFamily: item.readStatus ? 'Poppins-Regular' : 'Poppins-Bold',
          }}
        >
          {item.content}
        </Text>
        <Text variant="caption" style={{ color: theme.colors.text.secondary }}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </NotificationContent>
      {!item.readStatus && (
        <TouchableOpacity onPress={() => handleMarkAsRead(item._id)}>
          <Ionicons name="checkmark-circle" size={24} color={theme.colors.accent.pink} />
        </TouchableOpacity>
      )}
    </NotificationCard>
  );

  return (
    <Container>
      <Text variant="h1" style={{ color: theme.colors.text.primary, marginBottom: theme.spacing.lg }}>
        Notifications
      </Text>
      {notifications.length > 0 && (
        <ClearButton onPress={handleClearNotifications}>
          <Text style={{ color: theme.colors.text.primary, fontSize: 16 }}>
            Clear All Notifications
          </Text>
        </ClearButton>
      )}
      {errorMessage && (
        <ErrorMessage>{errorMessage}</ErrorMessage>
      )}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<EmptyMessage>No notifications yet.</EmptyMessage>}
      />
    </Container>
  );
};

export default NotificationsScreen;