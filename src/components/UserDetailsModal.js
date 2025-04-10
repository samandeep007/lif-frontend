import React, { useState, useRef } from 'react';
import { Modal, View, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import styled from 'styled-components/native';
import theme from '../styles/theme';
import Text from './common/Text';
import { Ionicons } from '@expo/vector-icons';
import ImageModal from './ImageModal';

// Define SCREEN_WIDTH and SCREEN_HEIGHT before using them in styled components
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ModalContainer = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
  padding: ${theme.spacing.lg}px;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg}px;
`;

const PhotoContainer = styled.View`
  margin-bottom: ${theme.spacing.lg}px;
  position: relative; /* Allow absolute positioning of buttons */
`;

const Photo = styled(Image)`
  width: ${SCREEN_WIDTH - 40}px;
  height: ${SCREEN_HEIGHT * 0.4}px;
  border-radius: ${theme.borderRadius.large}px;
`;

const PaginationContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: ${theme.spacing.sm}px;
`;

const PaginationDot = styled.View`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${props => (props.active ? theme.colors.accent.pink : theme.colors.text.secondary)};
  margin: 0 ${theme.spacing.xs}px;
`;

const NavButton = styled(TouchableOpacity)`
  position: absolute;
  top: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 20px;
  padding: ${theme.spacing.sm}px;
  z-index: 20; /* Ensure buttons are above the carousel */
`;

const PrevButton = styled(NavButton)`
  left: ${theme.spacing.sm}px;
`;

const NextButton = styled(NavButton)`
  right: ${theme.spacing.sm}px;
`;

const UserDetailsModal = ({ visible, onClose, user }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [magnifierVisible, setMagnifierVisible] = useState(false);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState(null);
  const scrollViewRef = useRef(null);

  if (!user) return null;

  const photos = user.photos && user.photos.length > 0
    ? user.photos.map(photo => photo.url || 'https://via.placeholder.com/300')
    : user.selfie
      ? [user.selfie]
      : ['https://via.placeholder.com/300'];

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (SCREEN_WIDTH - 40));
    setCurrentPhotoIndex(index);
  };

  const handlePhotoTap = (photoUrl) => {
    console.log(`Photo tapped: ${photoUrl}`);
    setSelectedPhotoUrl(photoUrl);
    setMagnifierVisible(true);
  };

  const handlePrevPress = () => {
    const newIndex = Math.max(0, currentPhotoIndex - 1);
    setCurrentPhotoIndex(newIndex);
    scrollViewRef.current.scrollTo({ x: newIndex * (SCREEN_WIDTH - 40), animated: true });
  };

  const handleNextPress = () => {
    const newIndex = Math.min(photos.length - 1, currentPhotoIndex + 1);
    setCurrentPhotoIndex(newIndex);
    scrollViewRef.current.scrollTo({ x: newIndex * (SCREEN_WIDTH - 40), animated: true });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <ModalContainer>
        <Header>
          <Text variant="h1">{`${user.name}, ${user.age}`}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={30} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </Header>
        <ScrollView showsVerticalScrollIndicator={false}>
          <PhotoContainer>
            {photos.length > 1 ? (
              <>
                <ScrollView
                  ref={scrollViewRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                >
                  {photos.map((photoUrl, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handlePhotoTap(photoUrl)}
                      activeOpacity={0.8}
                    >
                      <Photo source={{ uri: photoUrl }} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <PrevButton
                  onPress={handlePrevPress}
                  disabled={currentPhotoIndex === 0}
                  style={{ transform: [{ translateY: -((SCREEN_HEIGHT * 0.4) / 2) }] }} // Center vertically
                >
                  <Ionicons
                    name="chevron-back"
                    size={24}
                    color={currentPhotoIndex === 0 ? theme.colors.text.secondary : '#fff'}
                  />
                </PrevButton>
                <NextButton
                  onPress={handleNextPress}
                  disabled={currentPhotoIndex === photos.length - 1}
                  style={{ transform: [{ translateY: -((SCREEN_HEIGHT * 0.4) / 2) }] }} // Center vertically
                >
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color={currentPhotoIndex === photos.length - 1 ? theme.colors.text.secondary : '#fff'}
                  />
                </NextButton>
                <PaginationContainer>
                  {photos.map((_, index) => (
                    <PaginationDot
                      key={index}
                      active={index === currentPhotoIndex}
                    />
                  ))}
                </PaginationContainer>
              </>
            ) : (
              <TouchableOpacity
                onPress={() => handlePhotoTap(photos[0])}
                activeOpacity={0.8}
              >
                <Photo source={{ uri: photos[0] }} />
              </TouchableOpacity>
            )}
          </PhotoContainer>
          <Text variant="body">{user.bio || 'No bio available'}</Text>
        </ScrollView>
      </ModalContainer>
      <ImageModal
        visible={magnifierVisible}
        imageUrl={selectedPhotoUrl}
        onClose={() => setMagnifierVisible(false)}
      />
    </Modal>
  );
};

export default UserDetailsModal;