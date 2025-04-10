import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Alert } from 'react-native';
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

const NotificationsScreen = () => {
  const userId = useAuthStore((state) => state.user?._id);
  const [notifications, setNotifications] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

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
      setNotifications(prev => [notification, ...prev]);
      triggerHaptic('notification');
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      if (response.data.success) {
        setNotifications(response.data.data);
        setErrorMessage(null);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setErrorMessage('Failed to fetch notifications: ' + (error.message || 'Network error'));
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      if (response.data.success) {
        setNotifications(prev =>
          prev.map(notification =>
            notification._id === notificationId ? { ...notification, readStatus: true } : notification
          )
        );
        triggerHaptic('success');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setErrorMessage('Failed to mark notification as read: ' + (error.message || 'Network error'));
    }
  };

  const handleClearNotifications = async () => {
    Alert.alert(
      'Clear Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.delete('/notifications');
              if (response.data.success) {
                setNotifications([]);
                setErrorMessage(null);
                triggerHaptic('success');
              }
            } catch (error) {
              console.error('Error clearing notifications:', error);
              setErrorMessage('Failed to clear notifications: ' + (error.message || 'Network error'));
            }
          },
        },
      ]
    );
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
        <Text style={{ color: theme.colors.accent.red, marginBottom: theme.spacing.md, textAlign: 'center' }}>
          {errorMessage}
        </Text>
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