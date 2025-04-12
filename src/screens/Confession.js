import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Add this import
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

const InputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${theme.colors.text.secondary}20;
  border-radius: ${theme.borderRadius.medium}px;
  padding: ${theme.spacing.sm}px;
  margin-bottom: ${theme.spacing.lg}px;
`;

const ConfessionInput = styled(TextInput)`
  flex: 1;
  padding: 0 ${theme.spacing.sm}px;
  color: ${theme.colors.text.primary};
  font-family: Poppins-Regular;
  font-size: 16px;
`;

const SendButton = styled(TouchableOpacity)`
  padding: ${theme.spacing.sm}px;
`;

const ConfessionCard = styled.View`
  background-color: ${theme.colors.text.primary}10;
  border-radius: ${theme.borderRadius.medium}px;
  padding: ${theme.spacing.md}px;
  margin-bottom: ${theme.spacing.md}px;
`;

const EmptyMessage = styled(Text)`
  text-align: center;
  color: ${theme.colors.text.secondary};
  margin-top: ${theme.spacing.lg}px;
`;

const ConfessionScreen = () => {
  const userId = useAuthStore(state => state.user?._id);
  const [confessionText, setConfessionText] = useState('');
  const [receivedConfessions, setReceivedConfessions] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const socket = io('https://lif-backend-awv3.onrender.com', {
      auth: { token: localStorage.getItem('authToken') || '' },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Connected to socket for confessions');
      socket.emit('join', userId);
    });

    socket.on('new_notification', notification => {
      if (notification.type === 'confession_received') {
        fetchRandomConfession();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const handleSendConfession = async () => {
    if (!confessionText.trim()) {
      setErrorMessage('Confession cannot be empty');
      return;
    }

    try {
      const response = await api.post('/confessions', {
        content: confessionText,
      });
      if (response.data.success) {
        setConfessionText('');
        setErrorMessage(null);
        Alert.alert('Success', 'Confession sent anonymously!');
        triggerHaptic('success');
      }
    } catch (error) {
      console.error('Error sending confession:', error);
      setErrorMessage(
        'Failed to send confession: ' + (error.message || 'Network error')
      );
    }
  };

  const fetchRandomConfession = async () => {
    try {
      const response = await api.get('/confessions/random');
      if (response.data.success) {
        setReceivedConfessions(prev => [...prev, response.data.data.content]);
        setErrorMessage(null);
        triggerHaptic('notification');
      }
    } catch (error) {
      console.error('Error fetching random confession:', error);
      setErrorMessage('No confessions available at this time');
    }
  };

  const renderConfession = ({ item }) => (
    <ConfessionCard>
      <Text variant="body" style={{ color: theme.colors.text.primary }}>
        {item}
      </Text>
    </ConfessionCard>
  );

  return (
    <Container>
      <Text
        variant="h1"
        style={{
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.lg,
        }}
      >
        Confessions
      </Text>
      <InputContainer>
        <ConfessionInput
          value={confessionText}
          onChangeText={setConfessionText}
          placeholder="Write an anonymous confession..."
          placeholderTextColor={theme.colors.text.secondary}
          multiline
          maxLength={500}
        />
        <SendButton onPress={handleSendConfession}>
          <Ionicons name="send" size={24} color={theme.colors.accent.pink} />
        </SendButton>
      </InputContainer>
      <TouchableOpacity
        onPress={fetchRandomConfession}
        style={{
          backgroundColor: theme.colors.accent.pink,
          padding: theme.spacing.md,
          borderRadius: theme.borderRadius.medium,
          alignItems: 'center',
          marginBottom: theme.spacing.lg,
        }}
      >
        <Text style={{ color: theme.colors.text.primary, fontSize: 16 }}>
          Receive a Random Confession
        </Text>
      </TouchableOpacity>
      {errorMessage && (
        <Text
          style={{
            color: theme.colors.accent.red,
            marginBottom: theme.spacing.md,
            textAlign: 'center',
          }}
        >
          {errorMessage}
        </Text>
      )}
      <FlatList
        data={receivedConfessions}
        renderItem={renderConfession}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          <EmptyMessage>No confessions received yet.</EmptyMessage>
        }
      />
    </Container>
  );
};

export default ConfessionScreen;
