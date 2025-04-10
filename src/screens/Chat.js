import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';
import Text from '../components/common/Text';
import ChatListItem from '../components/ChatListItem';
import MessageBubble from '../components/MessageBubble';
import api from '../api/api';
import useAuthStore from '../store/authStore';
import { initSocket, disconnectSocket } from '../utils/socket';

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
`;

const ChatListContainer = styled.View`
  flex: 1;
`;

const ChatContainer = styled.View`
  flex: 1;
`;

const Header = styled.View`
  padding: ${theme.spacing.md}px;
  border-bottom-width: 1px;
  border-bottom-color: ${theme.colors.text.secondary};
  flex-direction: row;
  align-items: center;
`;

const InputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${theme.spacing.sm}px;
  border-top-width: 1px;
  border-top-color: ${theme.colors.text.secondary};
`;

const MessageInput = styled(TextInput)`
  flex: 1;
  background-color: ${theme.colors.text.secondary};
  border-radius: ${theme.borderRadius.medium}px;
  padding: ${theme.spacing.sm}px;
  margin-right: ${theme.spacing.sm}px;
  color: ${theme.colors.text.primary};
`;

const TypingIndicator = styled.View`
  padding: ${theme.spacing.sm}px;
`;

const ChatScreen = ({ navigation }) => {
  const userId = useAuthStore((state) => state.user?._id);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await api.get('/chats');
        if (response.data.success) {
          setChats(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };
    fetchChats();
  }, []);

  useEffect(() => {
    let socket;
    const setupSocket = async () => {
      socket = await initSocket();
      if (!socket) return;

      // Join chat rooms for all matches
      const matchIds = chats.map(chat => chat.matchId);
      socket.emit('join_chats', matchIds);

      // Listen for new messages
      socket.on('new_message', (message) => {
        if (message.matchId === selectedChat?.matchId) {
          setMessages(prev => [...prev, message]);
          flatListRef.current?.scrollToEnd({ animated: true });
        }
        // Update chats list with the new last message
        setChats(prev =>
          prev.map(chat =>
            chat.matchId === message.matchId
              ? { ...chat, lastMessage: { content: message.content, createdAt: message.createdAt } }
              : chat
          )
        );
      });

      // Listen for typing indicators
      socket.on('typing', ({ userId: typingUserId, isTyping }) => {
        if (typingUserId !== userId && selectedChat?.otherUser.id === typingUserId) {
          setOtherUserTyping(isTyping);
        }
      });

      // Listen for read receipts
      socket.on('message_read', ({ messageId }) => {
        setMessages(prev =>
          prev.map(msg =>
            msg._id === messageId ? { ...msg, readStatus: true } : msg
          )
        );
      });
    };
    setupSocket();

    return () => {
      disconnectSocket();
    };
  }, [chats, selectedChat, userId]);

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    try {
      const response = await api.get(`/chats/${chat.matchId}/messages`);
      if (response.data.success) {
        setMessages(response.data.data);
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const response = await api.post('/chats/message', {
        matchId: selectedChat.matchId,
        content: newMessage,
      });
      if (response.data.success) {
        setNewMessage('');
        // The new message will be received via Socket.IO
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = () => {
    if (!selectedChat) return;

    const socket = io('https://lif-backend-awv3.onrender.com');
    if (!typing) {
      setTyping(true);
      socket.emit('typing', { matchId: selectedChat.matchId, isTyping: true });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      socket.emit('typing', { matchId: selectedChat.matchId, isTyping: false });
    }, 2000);
  };

  const handleReadMessage = (messageId) => {
    const socket = io('https://lif-backend-awv3.onrender.com');
    socket.emit('read_message', { messageId, matchId: selectedChat.matchId });
  };

  if (!selectedChat) {
    return (
      <Container>
        <ChatListContainer>
          <FlatList
            data={chats}
            keyExtractor={(item) => item.matchId}
            renderItem={({ item }) => (
              <ChatListItem chat={item} onPress={() => handleSelectChat(item)} />
            )}
            ListEmptyComponent={<Text variant="body" style={{ textAlign: 'center', padding: theme.spacing.md }}>No chats yet!</Text>}
          />
        </ChatListContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <TouchableOpacity onPress={() => setSelectedChat(null)}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h2" style={{ marginLeft: theme.spacing.md }}>{selectedChat.otherUser.name}</Text>
      </Header>
      <ChatContainer>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isSent={item.senderId === userId}
              onRead={() => !item.readStatus && item.senderId !== userId && handleReadMessage(item._id)}
            />
          )}
          ListEmptyComponent={<Text variant="body" style={{ textAlign: 'center', padding: theme.spacing.md }}>No messages yet!</Text>}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        {otherUserTyping && (
          <TypingIndicator>
            <Text variant="body" style={{ color: theme.colors.text.secondary }}>
              {selectedChat.otherUser.name} is typing...
            </Text>
          </TypingIndicator>
        )}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
          <InputContainer>
            <MessageInput
              value={newMessage}
              onChangeText={(text) => {
                setNewMessage(text);
                handleTyping();
              }}
              placeholder="Type a message..."
              placeholderTextColor={theme.colors.text.secondary}
              multiline
            />
            <TouchableOpacity onPress={handleSendMessage}>
              <Ionicons name="send" size={24} color={theme.colors.accent.pink} />
            </TouchableOpacity>
          </InputContainer>
        </KeyboardAvoidingView>
      </ChatContainer>
    </Container>
  );
};

export default ChatScreen;