import React, { useState, useEffect } from 'react';
import { Animated, Easing, Image, TouchableOpacity, TextInput, Platform, View } from 'react-native';
import styled from 'styled-components/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../styles/theme';
import Text from '../../components/common/Text';
import Button from '../../components/common/Button';
import api from '../../api/api';
import { triggerHaptic } from '../../utils/haptics';
import useAuthStore from '../../store/authStore';

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.md}px; /* Reduced padding */
`;

const PhotoUploadContainer = styled(TouchableOpacity)`
  width: 120px; /* Reduced from 150px */
  height: 120px; /* Reduced from 150px */
  border-radius: 60px; /* Adjusted for new size */
  border-width: 2px;
  border-color: ${theme.colors.text.primary};
  justify-content: center;
  align-items: center;
  margin-bottom: ${theme.spacing.md}px; /* Reduced margin */
`;

const Photo = styled(Image)`
  width: 120px; /* Reduced from 150px */
  height: 120px; /* Reduced from 150px */
  border-radius: 60px; /* Adjusted for new size */
`;

const PhotosGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center; /* Centered the grid */
  padding: ${theme.spacing.sm}px; /* Reduced padding */
  background-color: ${theme.colors.background};
  width: 100%;
`;

const PhotoWrapper = styled.View`
  position: relative;
  width: 45%; /* Slightly reduced to fit centered layout */
  margin-bottom: ${theme.spacing.sm}px; /* Reduced margin */
  margin-horizontal: ${theme.spacing.xs}px; /* Added small horizontal margin for spacing */
  border-radius: ${theme.borderRadius.medium}px;
  overflow: hidden;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 5px;
  elevation: 2;
`;

const GridPhoto = styled(Image)`
  width: 100%;
  height: 130px; /* Reduced from 160px */
  border-radius: ${theme.borderRadius.medium}px;
`;

const DeletePhotoButton = styled(TouchableOpacity)`
  position: absolute;
  top: 6px; /* Reduced from 8px */
  right: 6px; /* Reduced from 8px */
  background-color: ${theme.colors.accent.red};
  border-radius: 10px; /* Reduced from 12px */
  padding: 3px; /* Reduced from 4px */
`;

const AddPhotoButton = styled(TouchableOpacity)`
  width: 45%; /* Slightly reduced to fit centered layout */
  height: 130px; /* Reduced from 160px */
  border-radius: ${theme.borderRadius.medium}px;
  background-color: ${theme.colors.text.secondary}20;
  justify-content: center;
  align-items: center;
  margin-bottom: ${theme.spacing.sm}px; /* Reduced margin */
  margin-horizontal: ${theme.spacing.xs}px; /* Added small horizontal margin for spacing */
  border: 2px dashed ${theme.colors.text.secondary};
`;

const BioInput = styled(TextInput)`
  width: 500px; /* Reduced from 300px */
  height: 100px; /* Reduced from 100px */
  border-radius: ${theme.borderRadius.small}px;
  border-width: 1px;
  border-color: ${theme.colors.text.secondary};
  padding: ${theme.spacing.sm}px; /* Reduced padding */
  margin-bottom: ${theme.spacing.sm}px;
  color: ${theme.colors.text.primary};
  font-family: Poppins-Regular;
  font-size: 14px; /* Reduced from 16px */
  text-align-vertical: top;
  align-self: center; /* Centered */
`;

const ErrorText = styled(Text)`
  color: ${theme.colors.accent.red};
  margin-top: ${theme.spacing.xs}px; /* Reduced margin */
  text-align: center;
  font-size: 12px; /* Reduced font size */
`;

const ProfileSetup = ({ navigation }) => {
  const setUser = useAuthStore((state) => state.setUser);
  const [profilePic, setProfilePic] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [bio, setBio] = useState('');
  const [errors, setErrors] = useState({});

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
  }, []); // Empty dependency array ensures this runs only once on mount

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
            setProfilePic(response.data.data.selfieUrl);
            setUser(prev => ({ ...prev, selfie: response.data.data.selfieUrl }));
          } else {
            setPhotos(prev => [...prev, { url: response.data.data.url, _id: response.data.data._id }]);
            setUser(prev => ({ ...prev, photos: [...prev.photos, { url: response.data.data.url, _id: response.data.data._id }] }));
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

  const handleProfileSetup = async () => {
    if (!validateForm()) return;

    try {
      // Update bio
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
      <Text variant="h1" style={{ fontSize: 24, marginBottom: theme.spacing.sm /* Reduced font size and margin */ }}>
        Set Up Your Profile
      </Text>
      <Animated.View style={{ transform: [{ scale: photoScale }] }}>
        <PhotoUploadContainer onPress={() => handlePhotoUpload(true)}>
          {profilePic ? (
            <Photo source={{ uri: profilePic }} />
          ) : (
            <Ionicons name="add" size={32} color={theme.colors.text.primary} /> 
          )}
        </PhotoUploadContainer>
      </Animated.View>
      {errors.profilePic && (
        <ErrorText>{errors.profilePic}</ErrorText>
      )}
      <PhotosGrid>
        {photos.map(photo => (
          <PhotoWrapper key={photo._id}>
            <GridPhoto source={{ uri: photo.url }} />
            <DeletePhotoButton onPress={() => handleDeletePhoto(photo._id)}>
              <Ionicons name="close-circle" size={16} color={theme.colors.text.primary} /> /* Reduced icon size */
            </DeletePhotoButton>
          </PhotoWrapper>
        ))}
        {photos.length < 9 && (
          <AddPhotoButton onPress={() => handlePhotoUpload(false)}>
            <Ionicons name="add" size={32} color={theme.colors.text.secondary} /> 
            <Text style={{ color: theme.colors.text.secondary, marginTop: theme.spacing.xs, fontSize: 12 /* Reduced font size */ }}>
              Add Photo
            </Text>
          </AddPhotoButton>
        )}
      </PhotosGrid>
      {errors.photos && (
        <ErrorText>{errors.photos}</ErrorText>
      )}
      <Animated.View style={{ transform: [{ translateY: bioTranslate }] }}>
        <BioInput
          value={bio}
          onChangeText={setBio}
          placeholder="Tell us about yourself"
          placeholderTextColor={theme.colors.text.secondary}
          multiline
        />
      </Animated.View>
      {errors.bio && (
        <ErrorText>{errors.bio}</ErrorText>
      )}
      {errors.general && (
        <ErrorText>{errors.general}</ErrorText>
      )}
      <Animated.View style={{ transform: [{ scale: continueButtonScale }], marginTop: theme.spacing.md /* Reduced margin */ }}>
        <Button
          title="Continue"
          onPress={() => {
            handleProfileSetup();
            triggerHaptic('light');
          }}
          textStyle={{ fontSize: 14 /* Reduced font size */ }}
        />
      </Animated.View>
    </Container>
  );
};

export default ProfileSetup;