import React, { useRef, useState } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import theme from '../styles/theme';
import Text from './common/Text';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

const Container = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: ${theme.spacing.lg}px;
  border-bottom-width: 1px;
  border-bottom-color: ${theme.colors.text.secondary}20;
  background-color: ${theme.colors.background};
`;

const Avatar = styled(Image)`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  margin-right: ${theme.spacing.lg}px;
  border-width: 2px;
  border-color: ${theme.colors.accent.pink};
  background-color: ${theme.colors.text.secondary}20;
`;

const InfoContainer = styled.View`
  flex: 1;
`;

const NameContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const UnreadBadge = styled.View`
  background-color: ${theme.colors.accent.red};
  border-radius: 12px;
  padding: 4px 8px;
  min-width: 24px;
  align-items: center;
  justify-content: center;
`;

const LastMessage = styled(Text)`
  color: ${theme.colors.text.secondary};
  margin-top: ${theme.spacing.xs}px;
  font-size: 14px;
`;

const DeleteAction = styled.TouchableOpacity`
  background-color: ${theme.colors.accent.red};
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 100%;
`;

const ChatListItem = ({ chat, onPress, onDelete }) => {
  const { otherUser, lastMessage, unreadCount } = chat;
  const [isSwiping, setIsSwiping] = useState(false);
  const swipeableRef = useRef(null);

  // Determine the display text for the last message
  const lastMessageText = lastMessage
    ? lastMessage.isImage
      ? 'Photo'
      : lastMessage.content.length > 40
      ? lastMessage.content.substring(0, 40) + '...'
      : lastMessage.content
    : null;

  // Render the right swipe action (bin icon)
  const renderRightActions = () => (
    <DeleteAction
      onPress={() => {
        console.log('Bin icon pressed for chat with matchId:', chat.matchId);
        onDelete();
      }}
    >
      <Ionicons name="trash-bin" size={24} color={theme.colors.text.primary} />
    </DeleteAction>
  );

  const handleSwipeOpen = () => {
    setIsSwiping(true);
  };

  const handleSwipeClose = () => {
    setIsSwiping(false);
  };

  const handlePress = () => {
    if (!isSwiping) {
      console.log('ChatListItem pressed for chat with matchId:', chat.matchId);
      onPress();
    }
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
      rightThreshold={40}
      onSwipeableWillOpen={handleSwipeOpen}
      onSwipeableClose={handleSwipeClose}
    >
      <Container onPress={handlePress}>
        <Avatar
          source={{ uri: otherUser.photo || 'https://via.placeholder.com/60' }}
          onError={(e) => console.log('Error loading avatar:', e.nativeEvent.error)}
        />
        <InfoContainer>
          <NameContainer>
            <Text variant="h2" style={{ fontSize: 18, color: theme.colors.text.primary }}>
              {otherUser.name}
            </Text>
            {unreadCount > 0 && (
              <UnreadBadge>
                <Text variant="body" style={{ color: theme.colors.text.primary, fontSize: 12 }}>
                  {unreadCount}
                </Text>
              </UnreadBadge>
            )}
          </NameContainer>
          {lastMessage && (
            <LastMessage numberOfLines={1}>
              {lastMessageText}
            </LastMessage>
          )}
        </InfoContainer>
      </Container>
    </Swipeable>
  );
};

export default ChatListItem;