import React, { useState, useEffect } from 'react';
import { Animated, Easing, Image, TouchableOpacity, TextInput, Platform, View, Dimensions } from 'react-native';
import styled from 'styled-components/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../styles/theme';
import Text from '../../components/common/Text';
import Button from '../../components/common/Button';
import api from '../../api/api';
import { triggerHaptic } from '../../utils/haptics';
import useAuthStore from '../../store/authStore';
import ImageModal from '../../components/ImageModal';

// Get screen dimensions for responsive design
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_WIDTH = Math.min(SCREEN_WIDTH - theme.spacing.md * 2, 500);

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
`;

const Header = styled.View`
  padding: ${theme.spacing.lg}px;
  border-bottom-width: 1px;
  border-bottom-color: ${theme.colors.text.secondary}20;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background-color: ${theme.colors.text.primary}10;
`;

const ContentContainer = styled.ScrollView`
  flex: 1;
  padding: ${theme.spacing.md}px;
  padding-bottom: ${theme.spacing.xl}px; /* Add padding to ensure button is fully visible */
`;

const PhotoUploadContainer = styled(TouchableOpacity)`
  width: ${SCREEN_WIDTH * 0.3}px;
  height: ${SCREEN_WIDTH * 0.3}px;
  border-radius: ${SCREEN_WIDTH * 0.15}px;
  border-width: 2px;
  border-color: ${theme.colors.text.primary};
  justify-content: center;
  align-items: center;
  margin-bottom: ${theme.spacing.md}px;
`;

const Photo = styled(Image)`
  width: 100%;
  height: 100%;
  border-radius: ${SCREEN_WIDTH * 0.15}px;
`;

const PhotosGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  padding: ${theme.spacing.sm}px;
  background-color: ${theme.colors.background};
  width: 100%;
`;

const PhotoWrapper = styled.View`
  position: relative;
  width: ${(SCREEN_WIDTH - theme.spacing.sm * 4) / 2}px;
  margin-bottom: ${theme.spacing.sm}px;
  margin-horizontal: ${theme.spacing.xs}px;
  border-radius: ${theme.borderRadius.medium}px;
  overflow: hidden;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 5px;
  elevation: 2;
`;

const GridPhoto = styled(Image)`
  width: 100%;
  height: ${(SCREEN_WIDTH - theme.spacing.sm * 4) / 2}px;
  border-radius: ${theme.borderRadius.medium}px;
`;

const DeletePhotoButton = styled(TouchableOpacity)`
  position: absolute;
  top: 6px;
  right: 6px;
  background-color: ${theme.colors.accent.red};
  border-radius: 10px;
  padding: 3px;
`;

const AddPhotoButton = styled(TouchableOpacity)`
  width: ${(SCREEN_WIDTH - theme.spacing.sm * 4) / 2}px;
  height: ${(SCREEN_WIDTH - theme.spacing.sm * 4) / 2}px;
  border-radius: ${theme.borderRadius.medium}px;
  background-color: ${theme.colors.text.secondary}20;
  justify-content: center;
  align-items: center;
  margin-bottom: ${theme.spacing.sm}px;
  margin-horizontal: ${theme.spacing.xs}px;
  border: 2px dashed ${theme.colors.text.secondary};
`;

const BioInput = styled(TextInput)`
  width: ${MAX_WIDTH}px;
  height: 100px;
  border-radius: ${theme.borderRadius.small}px;
  border-width: 1px;
  border-color: ${theme.colors.text.secondary};
  padding: ${theme.spacing.sm}px;
  margin-bottom: ${theme.spacing.md}px; /* Increased margin to prevent overlap */
  color: ${theme.colors.text.primary};
  font-family: Poppins-Regular;
  font-size: 14px;
  text-align-vertical: top;
  align-self: center;
`;

const ErrorText = styled(Text)`
  color: ${theme.colors.accent.red};
  margin-top: ${theme.spacing.xs}px;
  margin-bottom: ${theme.spacing.sm}px; /* Added margin to prevent overlap */
  text-align: center;
  font-size: 12px;
`;

const AnimatedContainer = styled(Animated.View)`
  align-items: center;
`;

const ProfileSetup = ({ navigation }) => {
  const setUser = useAuthStore((state) => state.setUser);
  const [profilePic, setProfilePic] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [bio, setBio] = useState('');
  const [errors, setErrors] = useState({});
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);

  const photoScale = new Animated.Value(0.8);
  const bioTranslate = new Animated.Value(50);
  const continueButtonScale = new Animated.Value(0.9);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(photoScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(bioTranslate, {
        toValue: 0,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(continueButtonScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!profilePic) {
      newErrors.profilePic = 'Please upload a profile photo';
    }
    if (!bio || bio.trim().length === 0) {
      newErrors.bio = 'Please enter a bio';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoUpload = async (isProfilePic = true) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        console.log('Media library permission denied');
        Alert.alert('Permission Denied', 'Permission to access media library is required!');
        return;
      }

      console.log(`Launching image picker for ${isProfilePic ? 'profile' : 'additional'} photo`);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: isProfilePic ? [1, 1] : undefined,
        quality: 1,
      });

      if (!result.canceled) {
        console.log('Image selected:', result.assets[0].uri);
        const formData = new FormData();
        if (Platform.OS === 'web') {
          console.log('Processing image for web platform');
          const response = await fetch(result.assets[0].uri);
          const blob = await response.blob();
          formData.append('photo', blob, isProfilePic ? 'profile-pic.jpg' : 'photo.jpg');
        } else {
          console.log('Processing image for native platform');
          formData.append('photo', {
            uri: result.assets[0].uri,
            type: 'image/jpeg',
            name: isProfilePic ? 'profile-pic.jpg' : 'photo.jpg',
          });
        }

        const endpoint = isProfilePic ? '/users/profile-pic' : '/users/photos';
        console.log(`Uploading ${isProfilePic ? 'profile' : 'additional'} photo to ${endpoint}...`);
        const response = await api.post(endpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log(`Photo upload response (${endpoint}):`, response.data);
        if (response.data.success) {
          if (isProfilePic) {
            const selfieUrl = response.data.data.selfieUrl;
            console.log('Setting profilePic to:', selfieUrl);
            // Add cache-busting query parameter to prevent caching issues
            setProfilePic(`${selfieUrl}?t=${new Date().getTime()}`);
            setUser(prev => ({ ...prev, selfie: selfieUrl }));
          } else {
            const newPhoto = { url: response.data.data.url, _id: response.data.data._id };
            console.log('Adding new photo to photos:', newPhoto);
            setPhotos(prev => [...prev, newPhoto]);
            setUser(prev => ({ ...prev, photos: [...prev.photos, newPhoto] }));
          }
          setErrors(prev => ({ ...prev, profilePic: null, photos: null }));
          triggerHaptic('medium');
        } else {
          throw new Error(`Failed to upload ${isProfilePic ? 'profile' : 'additional'} photo: ${response.data.message || 'Unknown error'}`);
        }
      } else {
        console.log('Image picker canceled');
      }
    } catch (error) {
      console.error(`Error uploading ${isProfilePic ? 'profile' : 'additional'} photo:`, error);
      setErrors(prev => ({
        ...prev,
        [isProfilePic ? 'profilePic' : 'photos']: error.message || `Failed to upload ${isProfilePic ? 'profile' : 'additional'} photo`,
      }));
    }
  };

  const handleDeletePhoto = async (photoId) => {
    console.log(`Starting photo deletion process for photoId: ${photoId}`);
    try {
      console.log(`Deleting photo with ID: ${photoId} via /api/users/photos/${photoId}`);
      const response = await api.delete(`/users/photos/${photoId}`);
      console.log('Delete photo response:', response.data);
      if (response.data.success) {
        setPhotos(prev => prev.filter(photo => photo._id !== photoId));
        setUser(prev => ({ ...prev, photos: prev.photos.filter(photo => photo._id !== photoId) }));
        setErrors(prev => ({ ...prev, photos: null }));
        Alert.alert('Success', 'Photo deleted successfully!');
      } else {
        throw new Error('Failed to delete photo: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      setErrors(prev => ({
        ...prev,
        photos: error.message || 'Failed to delete photo',
      }));
    }
  };

  const handlePhotoClick = (url) => {
    console.log('Photo clicked, opening ImageModal with URL:', url);
    setSelectedImageUrl(url);
    setImageModalVisible(true);
  };

  const handleProfileSetup = async () => {
    if (!validateForm()) return;

    try {
      console.log('Updating bio...');
      const updateResponse = await api.put('/users/me', { bio });
      console.log('Bio update response:', updateResponse.data);
      if (updateResponse.data.success) {
        setUser(updateResponse.data.data);
        console.log('User state updated:', updateResponse.data.data);
        console.log('Navigating to FinalWelcome...');
        navigation.navigate('FinalWelcome');
        triggerHaptic('light');
      } else {
        throw new Error('Failed to update bio: ' + (updateResponse.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Profile setup error:', error);
      if (error.response && error.response.status === 401) {
        setErrors({ general: 'Unauthorized: Please log in again.' });
      } else {
        setErrors({ general: error.message || 'Profile setup failed. Please try again.' });
      }
      console.log('Error details:', error.response ? error.response.data : error);
    }
  };

  return (
    <Container>
      <Header>
        <Text style={{ fontSize: 48, fontFamily: 'Poppins-Bold', color: theme.colors.text.primary }}>
          LIF
        </Text>
        <Ionicons name="heart" size={48} color={theme.colors.accent.pink} style={{ marginLeft: theme.spacing.sm }} />
      </Header>
      <ContentContainer contentContainerStyle={{ alignItems: 'center' }}>
        <Text variant="h1" style={{ fontSize: 24, marginVertical: theme.spacing.sm }}>
          Set Up Your Profile
        </Text>
        <AnimatedContainer style={{ transform: [{ scale: photoScale }] }}>
          <PhotoUploadContainer onPress={() => handlePhotoUpload(true)}>
            {profilePic ? (
              <TouchableOpacity onPress={() => handlePhotoClick(profilePic)}>
                <Photo source={{ uri: profilePic }} />
              </TouchableOpacity>
            ) : (
              <Ionicons name="add" size={32} color={theme.colors.text.primary} />
            )}
          </PhotoUploadContainer>
        </AnimatedContainer>
        {errors.profilePic && (
          <ErrorText>{errors.profilePic}</ErrorText>
        )}
        <PhotosGrid>
          {photos.map(photo => (
            <PhotoWrapper key={photo._id}>
              <TouchableOpacity onPress={() => handlePhotoClick(photo.url)}>
                <GridPhoto source={{ uri: photo.url }} />
              </TouchableOpacity>
              <DeletePhotoButton onPress={() => handleDeletePhoto(photo._id)}>
                <Ionicons name="close-circle" size={16} color={theme.colors.text.primary} />
              </DeletePhotoButton>
            </PhotoWrapper>
          ))}
          {photos.length < 9 && (
            <AddPhotoButton onPress={() => handlePhotoUpload(false)}>
              <Ionicons name="add" size={32} color={theme.colors.text.secondary} />
              <Text style={{ color: theme.colors.text.secondary, marginTop: theme.spacing.xs, fontSize: 12 }}>
                Add Photo
              </Text>
            </AddPhotoButton>
          )}
        </PhotosGrid>
        {errors.photos && (
          <ErrorText>{errors.photos}</ErrorText>
        )}
        <AnimatedContainer style={{ transform: [{ translateY: bioTranslate }] }}>
          <BioInput
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            placeholderTextColor={theme.colors.text.secondary}
            multiline
          />
        </AnimatedContainer>
        {errors.bio && (
          <ErrorText>{errors.bio}</ErrorText>
        )}
        {errors.general && (
          <ErrorText>{errors.general}</ErrorText>
        )}
        <AnimatedContainer style={{ transform: [{ scale: continueButtonScale }], marginTop: theme.spacing.md }}>
          <Button
            title="Continue"
            onPress={() => {
              handleProfileSetup();
              triggerHaptic('light');
            }}
            textStyle={{ fontSize: 14 }}
          />
        </AnimatedContainer>
      </ContentContainer>
      <ImageModal
        visible={imageModalVisible}
        imageUrl={selectedImageUrl}
        onClose={() => setImageModalVisible(false)}
      />
    </Container>
  );
};

export default ProfileSetup;