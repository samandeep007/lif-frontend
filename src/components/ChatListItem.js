import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import theme from '../styles/theme';
import Text from './common/Text';

const Container = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  padding: ${theme.spacing.lg}px;
  border-bottom-width: 1px;
  border-bottom-color: ${theme.colors.text.secondary}20;
  background-color: ${theme.colors.text.primary}10;
`;

const Avatar = styled(Image)`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  margin-right: ${theme.spacing.lg}px;
  border-width: 2px;
  border-color: ${theme.colors.accent.pink};
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

const ChatListItem = ({ chat, onPress }) => {
  const { otherUser, lastMessage, unreadCount } = chat;

  // Determine the display text for the last message
  const lastMessageText = lastMessage
    ? lastMessage.isImage
      ? 'Photo'
      : lastMessage.content.length > 40
      ? lastMessage.content.substring(0, 40) + '...'
      : lastMessage.content
    : null;

  return (
    <Container onPress={onPress}>
      <Avatar source={{ uri: otherUser.photo || 'https://via.placeholder.com/60' }} />
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
  );
};

export default ChatListItem;