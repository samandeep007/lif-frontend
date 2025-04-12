import React, { useState, useEffect } from 'react';
import {
  Animated,
  Easing,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import styled from 'styled-components/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../styles/theme';
import Text from '../../components/common/Text';
import Button from '../../components/common/Button';
import api from '../../api/api';
import { triggerHaptic } from '../../utils/haptics';
import useAuthStore from '../../store/authStore';

const { width } = Dimensions.get('window');

const Container = styled.ScrollView.attrs({
  contentContainerStyle: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl /* Added for extra bottom space */,
  },
})`
  flex: 1;
  background-color: ${theme.colors.background};
`;

const LogoContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center; /* Centered */
  margin-bottom: ${theme.spacing.sm}px;
  width: 100%;
`;

const LogoText = styled(Text)`
  font-size: 48px;
  font-family: Poppins-Bold;
  color: ${theme.colors.text.primary};
  text-align: center;
`;

const HeaderText = styled(Text)`
  font-size: 24px;
  margin-bottom: ${theme.spacing.lg}px; /* Increased bottom margin */
  min-height: 32px; /* Prevents CLS */
  text-align: center;
  width: 100%;
`;

const PhotoUploadContainer = styled(TouchableOpacity)`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  border-width: 2px;
  border-color: ${theme.colors.text.primary};
  justify-content: center;
  align-items: center;
  margin-bottom: ${theme.spacing.md}px;
  overflow: hidden;
  align-self: center; /* Explicitly centered */
`;

const Photo = styled(Image)`
  width: 100%;
  height: 100%;
  border-radius: 60px;
`;

const PhotosGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center; /* Changed to center for consistent alignment */
  padding: ${theme.spacing.sm}px;
  width: 100%;
  max-width: 600px;
  align-items: center;
`;

const PhotoWrapper = styled.View`
  width: ${width < 400 ? '48%' : '31%'};
  aspect-ratio: 1;
  margin-bottom: ${theme.spacing.sm}px;
  margin-horizontal: ${theme.spacing.xs}px; /* Added for consistent spacing */
  border-radius: ${theme.borderRadius.medium}px;
  overflow: hidden;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 5px;
  elevation: 2;
`;

const GridPhoto = styled(Image)`
  width: 100%;
  height: 100%;
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
  width: ${width < 400 ? '48%' : '31%'};
  aspect-ratio: 1;
  border-radius: ${theme.borderRadius.medium}px;
  background-color: ${theme.colors.text.secondary}20;
  justify-content: center;
  align-items: center;
  margin-bottom: ${theme.spacing.sm}px;
  margin-horizontal: ${theme.spacing.xs}px; /* Added for consistent spacing */
  border: 2px dashed ${theme.colors.text.secondary};
`;

const BioInput = styled(TextInput)`
  width: 100%;
  max-width: 500px;
  height: 100px;
  border-radius: ${theme.borderRadius.small}px;
  border-width: 1px;
  border-color: ${theme.colors.text.secondary};
  padding: ${theme.spacing.sm}px;
  margin-bottom: ${theme.spacing.sm}px;
  color: ${theme.colors.text.primary};
  font-family: Poppins-Regular;
  font-size: 14px;
  text-align-vertical: top;
  align-self: center; /* Explicitly centered */
`;

const ErrorText = styled(Text)`
  color: ${theme.colors.accent.red};
  margin-top: ${theme.spacing.xs}px;
  margin-bottom: ${theme.spacing.xs}px;
  text-align: center;
  font-size: 12px;
  min-height: 16px; /* Prevents CLS */
  width: 100%;
`;

const ButtonContainer = styled.View`
  width: 100%;
  max-width: 500px;
  margin-top: ${theme.spacing.md}px;
  margin-bottom: ${theme.spacing.md}px;
  align-items: center; /* Centered */
`;

const ProfileSetup = ({ navigation }) => {
  const setUser = useAuthStore(state => state.setUser);
  const [profilePic, setProfilePic] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [bio, setBio] = useState('');
  const [errors, setErrors] = useState({});

  const photoScale = new Animated.Value(1);
  const bioTranslate = new Animated.Value(0);
  const continueButtonScale = new Animated.Value(1);

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
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Denied',
          'Permission to access media library is required!'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: isProfilePic ? [1, 1] : undefined,
        quality: 1,
      });

      if (!result.canceled) {
        const formData = new FormData();
        if (Platform.OS === 'web') {
          const response = await fetch(result.assets[0].uri);
          const blob = await response.blob();
          formData.append(
            'photo',
            blob,
            isProfilePic ? 'profile-pic.jpg' : 'photo.jpg'
          );
        } else {
          formData.append('photo', {
            uri: result.assets[0].uri,
            type: 'image/jpeg',
            name: isProfilePic ? 'profile-pic.jpg' : 'photo.jpg',
          });
        }

        const endpoint = isProfilePic ? '/users/profile-pic' : '/users/photos';
        const response = await api.post(endpoint, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data.success) {
          if (isProfilePic) {
            setProfilePic(response.data.data.selfieUrl);
            setUser(prev => ({
              ...prev,
              selfie: response.data.data.selfieUrl,
            }));
          } else {
            setPhotos(prev => [
              ...prev,
              { url: response.data.data.url, _id: response.data.data._id },
            ]);
            setUser(prev => ({
              ...prev,
              photos: [
                ...prev.photos,
                { url: response.data.data.url, _id: response.data.data._id },
              ],
            }));
          }
          setErrors(prev => ({ ...prev, profilePic: null, photos: null }));
          triggerHaptic('medium');
        } else {
          throw new Error(
            `Failed to upload ${isProfilePic ? 'profile' : 'additional'} photo`
          );
        }
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [isProfilePic ? 'profilePic' : 'photos']:
          error.message ||
          `Failed to upload ${isProfilePic ? 'profile' : 'additional'} photo`,
      }));
    }
  };

  const handleDeletePhoto = async photoId => {
    try {
      const response = await api.delete(`/users/photos/${photoId}`);
      if (response.data.success) {
        setPhotos(prev => prev.filter(photo => photo._id !== photoId));
        setUser(prev => ({
          ...prev,
          photos: prev.photos.filter(photo => photo._id !== photoId),
        }));
        setErrors(prev => ({ ...prev, photos: null }));
        Alert.alert('Success', 'Photo deleted successfully!');
      } else {
        throw new Error('Failed to delete photo');
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        photos: error.message || 'Failed to delete photo',
      }));
    }
  };

  const handleProfileSetup = async () => {
    if (!validateForm()) return;

    try {
      const updateResponse = await api.put('/users/me', { bio });
      if (updateResponse.data.success) {
        setUser(updateResponse.data.data);
        navigation.navigate('FinalWelcome');
        triggerHaptic('light');
      } else {
        throw new Error('Failed to update bio');
      }
    } catch (error) {
      setErrors({
        general:
          error.response?.status === 401
            ? 'Unauthorized: Please log in again.'
            : 'Profile setup failed. Please try again.',
      });
    }
  };

  return (
    <Container>
      <LogoContainer>
        <LogoText>LIF</LogoText>
        <Ionicons
          name="heart"
          size={48}
          color={theme.colors.accent.pink}
          style={{ marginLeft: theme.spacing.sm }}
        />
      </LogoContainer>

      <HeaderText variant="h1">Set Up Your Profile</HeaderText>

      <Animated.View style={{ transform: [{ scale: photoScale }] }}>
        <PhotoUploadContainer onPress={() => handlePhotoUpload(true)}>
          {profilePic ? (
            <Photo source={{ uri: profilePic }} resizeMode="cover" />
          ) : (
            <Ionicons name="add" size={32} color={theme.colors.text.primary} />
          )}
        </PhotoUploadContainer>
      </Animated.View>

      {errors.profilePic && <ErrorText>{errors.profilePic}</ErrorText>}

      <PhotosGrid>
        {photos.map(photo => (
          <PhotoWrapper key={photo._id}>
            <GridPhoto source={{ uri: photo.url }} resizeMode="cover" />
            <DeletePhotoButton onPress={() => handleDeletePhoto(photo._id)}>
              <Ionicons
                name="close-circle"
                size={16}
                color={theme.colors.text.primary}
              />
            </DeletePhotoButton>
          </PhotoWrapper>
        ))}
        {photos.length < 9 && (
          <AddPhotoButton onPress={() => handlePhotoUpload(false)}>
            <Ionicons
              name="add"
              size={32}
              color={theme.colors.text.secondary}
            />
            <Text
              style={{
                color: theme.colors.text.secondary,
                marginTop: theme.spacing.xs,
                fontSize: 12,
              }}
            >
              Add Photo
            </Text>
          </AddPhotoButton>
        )}
      </PhotosGrid>

      {errors.photos && <ErrorText>{errors.photos}</ErrorText>}

      <Animated.View
        style={{
          transform: [{ translateY: bioTranslate }],
          width: '100%',
          alignItems: 'center',
        }}
      >
        <BioInput
          value={bio}
          onChangeText={setBio}
          placeholder="Tell us about yourself"
          placeholderTextColor={theme.colors.text.secondary}
          multiline
        />
      </Animated.View>

      {errors.bio && <ErrorText>{errors.bio}</ErrorText>}
      {errors.general && <ErrorText>{errors.general}</ErrorText>}

      <ButtonContainer>
        <Animated.View style={{ transform: [{ scale: continueButtonScale }] }}>
          <Button
            title="Continue"
            onPress={() => {
              handleProfileSetup();
              triggerHaptic('light');
            }}
            textStyle={{ fontSize: 14 }}
          />
        </Animated.View>
      </ButtonContainer>
    </Container>
  );
};

export default ProfileSetup;
