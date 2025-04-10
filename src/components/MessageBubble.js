import React, { useState } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import theme from '../styles/theme';
import Text from './common/Text';
import ImageModal from './ImageModal';
import Toast from 'react-native-toast-message';

const Container = styled(TouchableOpacity)`
  max-width: 75%;
  margin: ${theme.spacing.sm}px ${theme.spacing.md}px;
  padding: ${props => (props.isImage ? '0px' : theme.spacing.sm + 'px')};
  border-radius: ${theme.borderRadius.medium}px;
  background-color: ${props => (props.isSent ? theme.colors.accent.pink : theme.colors.text.secondary + '30')};
  align-self: ${props => (props.isSent ? 'flex-end' : 'flex-start')};
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 2px;
  elevation: 2;
`;

const MessageImage = styled(Image)`
  width: 200px;
  height: 200px;
  border-radius: ${theme.borderRadius.medium}px;
`;

const Timestamp = styled(Text)`
  font-size: 12px;
  color: ${props => (props.isSent ? theme.colors.text.primary + '80' : theme.colors.text.secondary)};
  margin-top: ${theme.spacing.xs}px;
  align-self: ${props => (props.isSent ? 'flex-end' : 'flex-start')};
`;

const DateSeparator = styled(View)`
  align-items: center;
  margin: ${theme.spacing.md}px 0;
`;

const DateSeparatorText = styled(Text)`
  font-size: 12px;
  color: ${theme.colors.text.secondary};
  background-color: ${theme.colors.text.primary}20;
  padding: ${theme.spacing.xs}px ${theme.spacing.sm}px;
  border-radius: ${theme.borderRadius.small}px;
`;

// Format timestamp to show "Today", "Yesterday", or the date
const formatTimestamp = (date) => {
  const today = new Date();
  const messageDate = new Date(date);
  const isToday = messageDate.toDateString() === today.toDateString();
  const isYesterday = new Date(today.setDate(today.getDate() - 1)).toDateString() === messageDate.toDateString();

  if (isToday) {
    return `Today, ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (isYesterday) {
    return `Yesterday, ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return `${messageDate.toLocaleDateString()}, ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
};

const MessageBubble = ({ message, isSent, showDateSeparator, date, onDelete }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleLongPress = () => {
    if (isSent) {
      Toast.show({
        type: 'info',
        text1: 'Delete Message',
        text2: 'Are you sure you want to delete this message?',
        position: 'bottom',
        visibilityTime: 3000,
        bottomOffset: 100,
        onPress: () => {
          onDelete(message._id);
          Toast.hide();
        },
        onHide: () => Toast.hide(),
      });
    }
  };

  return (
    <>
      {showDateSeparator && (
        <DateSeparator>
          <DateSeparatorText>{date}</DateSeparatorText>
        </DateSeparator>
      )}
      <Container isSent={isSent} isImage={message.isImage} onLongPress={handleLongPress}>
        {message.isImage ? (
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <MessageImage source={{ uri: message.content }} />
          </TouchableOpacity>
        ) : (
          <Text variant="body" style={{ color: isSent ? theme.colors.text.primary : theme.colors.text.primary }}>
            {message.content}
          </Text>
        )}
        <Timestamp isSent={isSent}>
          {formatTimestamp(message.createdAt)}
        </Timestamp>
      </Container>
      {message.isImage && (
        <ImageModal
          visible={modalVisible}
          imageUrl={message.content}
          onClose={() => setModalVisible(false)}
        />
      )}
    </>
  );
};

export default MessageBubble;