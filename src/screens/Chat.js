import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Spinner from 'react-native-loading-spinner-overlay';
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
  padding: ${theme.spacing.lg}px;
  border-bottom-width: 1px;
  border-bottom-color: ${theme.colors.text.secondary}20;
  flex-direction: row;
  align-items: center;
  background-color: ${theme.colors.text.primary}10;
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

const ChatScreen = ({ navigation }) => {
  const userId = useAuthStore((state) => state.user?._id);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSendingImage, setIsSendingImage] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [typing, setTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const initialLoadRef = useRef(true);
  const socketRef = useRef(null);

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

      // Join chat rooms for all matches
      const matchIds = chats.map(chat => chat.matchId);
      socketRef.current.emit('join_chats', matchIds);

      // Listen for new messages
      socketRef.current.on('new_message', (message) => {
        console.log('Received new message:', message);
        if (message.matchId === selectedChat?.matchId) {
          setMessages(prev => [...prev, message]);
          flatListRef.current?.scrollToEnd({ animated: true });
        }
        // Update chats list with the new last message
        setChats(prev =>
          prev.map(chat =>
            chat.matchId === message.matchId
              ? { ...chat, lastMessage: { content: message.content, createdAt: message.createdAt, isImage: message.isImage } }
              : chat
          )
        );
      });

      // Listen for deleted messages
      socketRef.current.on('message_deleted', ({ messageId }) => {
        console.log('Received message_deleted event:', messageId);
        if (selectedChat) {
          setMessages(prev => prev.filter(msg => msg._id !== messageId));
        }
      });

      // Listen for typing indicators
      socketRef.current.on('typing', ({ userId: typingUserId, isTyping }) => {
        if (typingUserId !== userId && selectedChat?.otherUser.id === typingUserId) {
          setOtherUserTyping(isTyping);
        }
      });

      // Listen for read receipts
      socketRef.current.on('message_read', ({ messageId }) => {
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

  const fetchMessages = async (pageNum) => {
    if (!selectedChat) return;

    try {
      setIsLoadingMore(pageNum > 1);
      const response = await api.get(`/chats/${selectedChat.matchId}/messages`, {
        params: { page: pageNum, limit: 50 },
      });
      if (response.data.success) {
        const newMessages = response.data.data;
        if (newMessages.length < 50) {
          setHasMore(false);
        }
        if (pageNum === 1) {
          setMessages(newMessages);
          initialLoadRef.current = false;
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }, 100);
        } else {
          setMessages(prev => [...newMessages, ...prev]);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    setSelectedImage(null);
    setIsSendingImage(false);
    setErrorMessage(null);
    setPage(1);
    setHasMore(true);
    initialLoadRef.current = true;
    await fetchMessages(1);
  };

  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchMessages(nextPage);
  };

  const handleSendMessage = async () => {
    if (!selectedChat) return;

    if (selectedImage) {
      console.log('Sending image message...');
      setIsSendingImage(true);
      setErrorMessage(null);
      const formData = new FormData();
      try {
        if (Platform.OS === 'web') {
          console.log('Platform: Web, fetching blob...');
          const response = await fetch(selectedImage);
          console.log('Fetch response:', response);
          if (!response.ok) {
            throw new Error('Failed to fetch blob from base64 URI');
          }
          const blob = await response.blob();
          console.log('Blob fetched:', blob);
          formData.append('image', blob, 'chat-image.jpg');
        } else {
          console.log('Platform: Native, using URI...');
          formData.append('image', {
            uri: selectedImage,
            type: 'image/jpeg',
            name: 'chat-image.jpg',
          });
        }
        formData.append('matchId', selectedChat.matchId);

        console.log('Sending formData to /api/chats/image-message...');
        const response = await api.post('/chats/image-message', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        });
        console.log('Image message response:', response.data);
        if (response.data.success) {
          setSelectedImage(null);
        } else {
          setErrorMessage('Failed to send image: ' + (response.data.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error sending image message:', error);
        console.log('Error details:', error.response ? error.response.data : error.message);
        console.log('Error stack:', error.stack);
        setErrorMessage('Failed to send image: ' + (error.message || 'Network error'));
      } finally {
        setIsSendingImage(false);
      }
    } else if (newMessage.trim()) {
      console.log('Sending text message...');
      try {
        const response = await api.post('/chats/message', {
          matchId: selectedChat.matchId,
          content: newMessage,
        });
        console.log('Text message response:', response.data);
        if (response.data.success) {
          setNewMessage('');
        }
      } catch (error) {
        console.error('Error sending text message:', error);
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
      setErrorMessage('Failed to delete message: ' + (error.message || 'Unknown error'));
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
    if (!selectedChat || !socketRef.current) return;

    if (!typing) {
      setTyping(true);
      socketRef.current.emit('typing', { matchId: selectedChat.matchId, isTyping: true });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      socketRef.current.emit('typing', { matchId: selectedChat.matchId, isTyping: false });
    }, 2000);
  };

  const handleReadMessage = (messageId) => {
    if (!socketRef.current) return;
    socketRef.current.emit('read_message', { messageId, matchId: selectedChat.matchId });
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
            ListEmptyComponent={<Text variant="body" style={{ textAlign: 'center', padding: theme.spacing.md, color: theme.colors.text.secondary }}>No chats yet!</Text>}
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
      </Header>
      <ChatContainer>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderMessage}
          ListEmptyComponent={<Text variant="body" style={{ textAlign: 'center', padding: theme.spacing.md, color: theme.colors.text.secondary }}>No messages yet!</Text>}
          onContentSizeChange={() => {
            if (initialLoadRef.current) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
          onEndReachedThreshold={0.1}
          onEndReached={handleLoadMore}
          ListFooterComponent={isLoadingMore ? (
            <View style={{ padding: theme.spacing.md, alignItems: 'center' }}>
              <Text variant="body" style={{ color: theme.colors.text.secondary, fontStyle: 'italic' }}>
                Loading more messages...
              </Text>
            </View>
          ) : null}
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
          <Spinner
            visible={isSendingImage || isLoadingMore}
            textContent={isSendingImage ? 'Sending image...' : 'Loading more messages...'}
            textStyle={{ color: theme.colors.text.primary }}
            overlayColor="rgba(0, 0, 0, 0.5)"
          />
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
              <TouchableOpacity onPress={handleSendMessage} disabled={isSendingImage}>
                <Ionicons name="send" size={24} color={isSendingImage ? theme.colors.text.secondary : theme.colors.accent.pink} />
              </TouchableOpacity>
            )}
          </InputContainer>
        </KeyboardAvoidingView>
      </ChatContainer>
    </Container>
  );
};

export default ChatScreen;