import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import theme from '../styles/theme';
import Text from '../components/common/Text';
import ChatListItem from '../components/ChatListItem';
import MessageBubble from '../components/MessageBubble';
import api from '../api/api';
import useAuthStore from '../store/authStore';
import { initSocket, disconnectSocket } from '../utils/socket';
import { io } from 'socket.io-client';

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
  padding: ${theme.spacing.lg}px;
  border-bottom-width: 1px;
  border-bottom-color: ${theme.colors.text.secondary}20;
  flex-direction: row;
  align-items: center;
  background-color: ${theme.colors.text.primary}10;
`;

const HeaderButtonContainer = styled.View`
  flex-direction: row;
  margin-left: auto;
`;

const InputContainer = styled.View`
  padding: ${theme.spacing.sm}px ${theme.spacing.md}px;
  border-top-width: 1px;
  border-top-color: ${theme.colors.text.secondary}20;
  background-color: ${theme.colors.text.primary}10;
`;

const MessageInputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${theme.colors.text.secondary}20;
  border-radius: ${theme.borderRadius.medium}px;
  padding: ${theme.spacing.sm}px;
  margin-bottom: ${theme.spacing.sm}px;
`;

const MessageInput = styled(TextInput)`
  flex: 1;
  padding: 0 ${theme.spacing.sm}px;
  color: ${theme.colors.text.primary};
  font-family: Poppins-Regular;
  font-size: 16px;
`;

const ImagePreviewContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${theme.spacing.sm}px;
  background-color: ${theme.colors.text.primary}10;
  border-radius: ${theme.borderRadius.medium}px;
  padding: ${theme.spacing.sm}px;
`;

const ImagePreview = styled(Image)`
  width: 60px;
  height: 60px;
  border-radius: ${theme.borderRadius.small}px;
  margin-right: ${theme.spacing.sm}px;
`;

const TypingIndicator = styled.View`
  padding: ${theme.spacing.sm}px ${theme.spacing.md}px;
`;

const ErrorMessage = styled(Text)`
  padding: ${theme.spacing.sm}px;
  color: ${theme.colors.accent.red};
  text-align: center;
`;

const ChatScreen = () => {
  const userId = useAuthStore((state) => state.user?._id);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [typing, setTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);
  const navigation = useNavigation();

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
    const setupSocket = async () => {
      socketRef.current = await initSocket();
      if (!socketRef.current) return;

      const matchIds = chats.map(chat => chat.matchId);
      socketRef.current.emit('join_chats', matchIds);

      socketRef.current.on('new_message', (message) => {
        if (message.matchId === selectedChat?.matchId) {
          setMessages(prev => [...prev, message]);
          flatListRef.current?.scrollToEnd({ animated: true });
        }
        setChats(prev =>
          prev.map(chat =>
            chat.matchId === message.matchId
              ? { ...chat, lastMessage: { content: message.content, createdAt: message.createdAt, isImage: message.isImage } }
              : chat
          )
        );
      });

      socketRef.current.on('message_deleted', ({ messageId }) => {
        console.log('Received message_deleted event:', messageId);
        if (selectedChat) {
          setMessages(prev => prev.filter(msg => msg._id !== messageId));
        }
      });

      socketRef.current.on('typing', ({ userId: typingUserId, isTyping }) => {
        if (typingUserId !== userId && selectedChat?.otherUser.id === typingUserId) {
          setOtherUserTyping(isTyping);
        }
      });

      socketRef.current.on('message_read', ({ messageId }) => {
        setMessages(prev =>
          prev.map(msg =>
            msg._id === messageId ? { ...msg, readStatus: true } : msg
          )
        );
      });

      // Handle incoming call notifications
      socketRef.current.on('call_initiated', ({ callId, type, initiatorId }) => {
        if (selectedChat && selectedChat.matchId === callId) {
          navigation.navigate('Call', {
            userId,
            matchId: callId,
            callType: type,
            otherUserName: selectedChat.otherUser.name,
            isIncoming: true,
            senderId: initiatorId
          });
        }
      });

      // Handle call acceptance
      socketRef.current.on('call_accepted', ({ callId, matchId: incomingMatchId, callType: incomingCallType, receiverId }) => {
        if (incomingMatchId === selectedChat?.matchId && userId === receiverId) {
          navigation.navigate('Call', {
            userId,
            matchId: incomingMatchId,
            callType: incomingCallType,
            otherUserName: selectedChat.otherUser.name,
            isIncoming: false
          });
        }
      });

      // Handle call rejection
      socketRef.current.on('call_rejected', ({ matchId: incomingMatchId, receiverId }) => {
        if (incomingMatchId === selectedChat?.matchId) {
          setErrorMessage('Call rejected by the other user');
        }
      });

      // Handle call end
      socketRef.current.on('call_ended', ({ callId }) => {
        if (selectedChat && selectedChat.matchId === callId) {
          navigation.goBack();
        }
      });
    };
    setupSocket();

    return () => {
      disconnectSocket();
    };
  }, [chats, selectedChat, userId, navigation]);

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    setSelectedImage(null);
    try {
      const response = await api.get(`/chats/${chat.matchId}/messages`);
      if (response.data.success) {
        setMessages(response.data.data);
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setErrorMessage('Failed to load messages: ' + (error.message || 'Network error'));
    }
  };

  const handleSendMessage = async () => {
    if (!selectedChat) return;

    if (selectedImage) {
      const formData = new FormData();
      if (Platform.OS === 'web') {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        formData.append('image', blob, 'chat-image.jpg');
      } else {
        formData.append('image', {
          uri: selectedImage,
          type: 'image/jpeg',
          name: 'chat-image.jpg',
        });
      }
      formData.append('matchId', selectedChat.matchId);

      try {
        const response = await api.post('/chats/image-message', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        if (response.data.success) {
          setSelectedImage(null);
        }
      } catch (error) {
        console.error('Error sending image message:', error);
        setErrorMessage('Failed to send image: ' + (error.message || 'Network error'));
      }
    } else if (newMessage.trim()) {
      try {
        const response = await api.post('/chats/message', {
          matchId: selectedChat.matchId,
          content: newMessage,
        });
        if (response.data.success) {
          setNewMessage('');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        setErrorMessage('Failed to send message: ' + (error.message || 'Network error'));
      }
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await api.delete(`/chats/message/${messageId}`);
      console.log('Delete message response:', response.data);
      if (response.data.success) {
        // The message_deleted event will handle UI update via Socket.IO
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      setErrorMessage('Failed to delete message: ' + (error.message || 'Network error'));
    }
  };

  const handleSelectImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      console.log('Image selected:', result.assets[0].uri);
      setSelectedImage(result.assets[0].uri);
      setErrorMessage(null);
    }
  };

  const handleCancelImage = () => {
    console.log('Canceling image selection...');
    setSelectedImage(null);
    setErrorMessage(null);
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

  const initiateCall = async (callType) => {
    try {
      const response = await api.post('/calls/initiate', {
        matchId: selectedChat.matchId,
        type: callType
      });
      if (response.data.success) {
        console.log(`${callType} call initiated with callId:`, response.data.data.callId);
        navigation.navigate('Call', {
          userId,
          matchId: selectedChat.matchId,
          callType,
          otherUserName: selectedChat.otherUser.name,
          isIncoming: false
        });
      }
    } catch (error) {
      console.error(`Error initiating ${callType} call:`, error);
      setErrorMessage(`Failed to initiate ${callType} call: ` + (error.message || 'Network error'));
    }
  };

  const renderMessage = ({ item, index }) => {
    const isSent = item.senderId === userId;
    const currentDate = new Date(item.createdAt).toLocaleDateString();
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const previousDate = previousMessage ? new Date(previousMessage.createdAt).toLocaleDateString() : null;
    const showDateSeparator = previousDate !== currentDate;

    return (
      <MessageBubble
        message={item}
        isSent={isSent}
        showDateSeparator={showDateSeparator}
        date={currentDate}
        onDelete={handleDeleteMessage}
      />
    );
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
        <Text variant="h2" style={{ marginLeft: theme.spacing.md, color: theme.colors.text.primary, fontSize: 20 }}>
          {selectedChat.otherUser.name}
        </Text>
        <HeaderButtonContainer>
          <TouchableOpacity onPress={() => initiateCall('video')} style={{ marginRight: theme.spacing.md }}>
            <Ionicons name="videocam" size={24} color={theme.colors.accent.pink} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => initiateCall('audio')}>
            <Ionicons name="call" size={24} color={theme.colors.accent.pink} />
          </TouchableOpacity>
        </HeaderButtonContainer>
      </Header>
      <ChatContainer>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderMessage}
          ListEmptyComponent={<Text variant="body" style={{ textAlign: 'center', padding: theme.spacing.md, color: theme.colors.text.secondary }}>No messages yet!</Text>}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        {otherUserTyping && (
          <TypingIndicator>
            <Text variant="body" style={{ color: theme.colors.text.secondary, fontStyle: 'italic' }}>
              {selectedChat.otherUser.name} is typing...
            </Text>
          </TypingIndicator>
        )}
        {errorMessage && (
          <ErrorMessage>{errorMessage}</ErrorMessage>
        )}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
          <InputContainer>
            {selectedImage ? (
              <ImagePreviewContainer>
                <ImagePreview source={{ uri: selectedImage }} />
                <TouchableOpacity onPress={handleCancelImage}>
                  <Ionicons name="close-circle" size={24} color={theme.colors.accent.red} />
                </TouchableOpacity>
              </ImagePreviewContainer>
            ) : (
              <MessageInputContainer>
                <TouchableOpacity onPress={handleSelectImage} style={{ marginRight: theme.spacing.sm }}>
                  <Ionicons name="image" size={24} color={theme.colors.accent.pink} />
                </TouchableOpacity>
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
              </MessageInputContainer>
            )}
            {selectedImage && (
              <TouchableOpacity onPress={handleSendMessage}>
                <Ionicons name="send" size={24} color={theme.colors.accent.pink} />
              </TouchableOpacity>
            )}
          </InputContainer>
        </KeyboardAvoidingView>
      </ChatContainer>
    </Container>
  );
};

export default ChatScreen;