import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from 'react-native';
import styled from 'styled-components/native';
import Slider from '@react-native-community/slider';
import theme from '../styles/theme';
import Text from '../components/common/Text';
import api from '../api/api';
import useAuthStore from '../store/authStore';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { deleteItemAsync } from '../utils/secureStore';
import ImageModal from '../components/ImageModal'; // Import ImageModal

const Container = styled.ScrollView`
  flex: 1;
  background-color: ${theme.colors.background};
`;

const ProfileHeader = styled.View`
  align-items: center;
  padding: ${theme.spacing.lg}px;
  padding-top: 40px;
  background-color: ${theme.colors.accent.pink}10;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 10px;
  elevation: 5;
`;

const ProfilePhotoWrapper = styled.View`
  position: relative;
  margin-bottom: ${theme.spacing.md}px;
`;

const ProfilePhoto = styled(Image)`
  width: 180px;
  height: 180px;
  border-radius: 90px;
  border-width: 4px;
  border-color: ${theme.colors.accent.pink};
  shadow-color: #000;
  shadow-opacity: 0.2;
  shadow-radius: 5px;
  elevation: 3;
`;

const EditIcon = styled(TouchableOpacity)`
  position: absolute;
  bottom: 5px;
  right: 5px;
  background-color: ${theme.colors.accent.pink};
  border-radius: 20px;
  padding: 8px;
  shadow-color: #000;
  shadow-opacity: 0.2;
  shadow-radius: 3px;
  elevation: 2;
`;

const NameAge = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: ${theme.spacing.sm}px;
`;

const PhotosGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: ${theme.spacing.md}px;
  background-color: ${theme.colors.background};
`;

const PhotoWrapper = styled.View`
  position: relative;
  width: 48%;
  margin-bottom: ${theme.spacing.md}px;
  border-radius: ${theme.borderRadius.medium}px;
  overflow: hidden;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 5px;
  elevation: 2;
`;

const Photo = styled(Image)`
  width: 100%;
  height: 160px;
  border-radius: ${theme.borderRadius.medium}px;
`;

const DeletePhotoButton = styled(TouchableOpacity)`
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: ${theme.colors.accent.red};
  border-radius: 12px;
  padding: 4px;
`;

const AddPhotoButton = styled(TouchableOpacity)`
  width: 48%;
  height: 160px;
  border-radius: ${theme.borderRadius.medium}px;
  background-color: ${theme.colors.text.secondary}20;
  justify-content: center;
  align-items: center;
  margin-bottom: ${theme.spacing.md}px;
  border: 2px dashed ${theme.colors.text.secondary};
`;

const DetailsSection = styled.View`
  margin: ${theme.spacing.lg}px;
  padding: ${theme.spacing.lg}px;
  background-color: #000000;
  border-radius: 20px;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 10px;
  elevation: 5;
`;

const EditButton = styled(TouchableOpacity)`
  position: absolute;
  top: 20px;
  right: 20px;
`;

const FieldContainer = styled.View`
  margin-bottom: ${theme.spacing.lg}px;
`;

const Label = styled(Text)`
  font-family: Poppins-SemiBold;
  font-size: 16px;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm}px;
`;

const Input = styled(TextInput)`
  background-color: ${theme.colors.text.secondary}10;
  border-radius: 10px;
  padding: ${theme.spacing.sm}px;
  color: ${theme.colors.text.primary};
  font-family: Poppins-Regular;
  font-size: 16px;
  border: 1px solid ${theme.colors.text.secondary}20;
`;

const SliderContainer = styled.View`
  margin-bottom: ${theme.spacing.lg}px;
`;

const SliderLabel = styled(Text)`
  font-family: Poppins-SemiBold;
  font-size: 16px;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm}px;
`;

const SliderValue = styled(Text)`
  font-family: Poppins-Regular;
  font-size: 14px;
  color: ${theme.colors.text.secondary};
  margin-top: ${theme.spacing.xs}px;
`;

const OptionsContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: ${theme.spacing.lg}px;
`;

const OptionButton = styled(TouchableOpacity)`
  padding: ${theme.spacing.sm}px ${theme.spacing.md}px;
  border-radius: 20px;
  margin-right: ${theme.spacing.sm}px;
  margin-bottom: ${theme.spacing.sm}px;
  background-color: ${props =>
    props.selected
      ? theme.colors.accent.pink
      : theme.colors.text.secondary + '20'};
  border: 1px solid
    ${props =>
      props.selected
        ? theme.colors.accent.pink
        : theme.colors.text.secondary + '40'};
`;

const OptionText = styled(Text)`
  font-family: Poppins-Regular;
  font-size: 14px;
  color: ${props =>
    props.selected ? theme.colors.text.primary : theme.colors.text.secondary};
`;

const SaveButton = styled(TouchableOpacity)`
  background-color: ${theme.colors.accent.pink};
  padding: ${theme.spacing.md}px;
  border-radius: 15px;
  align-items: center;
  margin-top: ${theme.spacing.lg}px;
  shadow-color: #000;
  shadow-opacity: 0.2;
  shadow-radius: 5px;
  elevation: 3;
`;

const LogoutButton = styled(TouchableOpacity)`
  background-color: ${theme.colors.accent.red};
  padding: ${theme.spacing.md}px;
  border-radius: 15px;
  align-items: center;
  margin-top: ${theme.spacing.lg}px;
  margin-bottom: ${theme.spacing.lg}px;
  shadow-color: #000;
  shadow-opacity: 0.2;
  shadow-radius: 5px;
  elevation: 3;
`;

const ErrorMessage = styled(Text)`
  color: ${theme.colors.accent.red};
  margin-bottom: ${theme.spacing.md}px;
  text-align: center;
`;

const ProfileScreen = ({ navigation: propNavigation }) => {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profilePic, setProfilePic] = useState(user?.selfie || '');
  const [photos, setPhotos] = useState(user?.photos || []);
  const [ageRangeMin, setAgeRangeMin] = useState(
    user?.filterPreferences?.ageRange?.min || 18
  );
  const [ageRangeMax, setAgeRangeMax] = useState(
    user?.filterPreferences?.ageRange?.max || 100
  );
  const [maxDistance, setMaxDistance] = useState(
    user?.filterPreferences?.maxDistance?.toString() || '100'
  );
  const [seekingGender, setSeekingGender] = useState(
    user?.filterPreferences?.seekingGender || 'any'
  );
  const [relationshipType, setRelationshipType] = useState(
    user?.filterPreferences?.relationshipType || 'any'
  );
  const [errorMessage, setErrorMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false); // State for ImageModal visibility
  const [selectedImageUrl, setSelectedImageUrl] = useState(null); // State for selected image URL
  const navigation = useNavigation();
  const { setToken, setIsAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log('Fetching user profile from /api/users/me');
        const response = await api.get('/users/me');
        console.log('Profile fetch response:', response.data);
        if (response.data.success) {
          setUser(response.data.data);
          setName(response.data.data.name);
          setAge(response.data.data.age.toString());
          setBio(response.data.data.bio);
          setProfilePic(response.data.data.selfie || '');
          setPhotos(response.data.data.photos || []);
          setAgeRangeMin(
            response.data.data.filterPreferences?.ageRange?.min || 18
          );
          setAgeRangeMax(
            response.data.data.filterPreferences?.ageRange?.max || 100
          );
          setMaxDistance(
            response.data.data.filterPreferences?.maxDistance?.toString() ||
              '100'
          );
          setSeekingGender(
            response.data.data.filterPreferences?.seekingGender || 'any'
          );
          setRelationshipType(
            response.data.data.filterPreferences?.relationshipType || 'any'
          );
          console.log('User profile set successfully:', response.data.data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        console.error('Error response:', error.response?.data);
        setErrorMessage(
          'Failed to fetch profile: ' + (error.message || 'Network error')
        );
      }
    };
    fetchProfile();
  }, [setUser]);

  const handleEditProfile = async () => {
    if (isEditing) {
      try {
        console.log('Saving profile changes to /api/users/me');
        console.log('Profile data to save:', {
          name,
          age: parseInt(age),
          bio,
          filterPreferences: {
            ageRange: {
              min: parseInt(ageRangeMin),
              max: parseInt(ageRangeMax),
            },
            maxDistance: parseInt(maxDistance),
            seekingGender,
            relationshipType,
          },
        });
        const response = await api.put('/users/me', {
          name,
          age: parseInt(age),
          bio,
          filterPreferences: {
            ageRange: {
              min: parseInt(ageRangeMin),
              max: parseInt(ageRangeMax),
            },
            maxDistance: parseInt(maxDistance),
            seekingGender,
            relationshipType,
          },
        });
        console.log('Profile save response:', response.data);
        if (response.data.success) {
          setUser(response.data.data);
          setErrorMessage(null);
          Alert.alert('Success', 'Profile updated successfully!');
          setIsEditing(false);
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        console.error('Error response:', error.response?.data);
        setErrorMessage(
          'Failed to update profile: ' + (error.message || 'Network error')
        );
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleUploadProfilePic = async () => {
    console.log('Starting profile picture upload process');
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      console.log('Media library permission denied');
      alert('Permission to access media library is required!');
      return;
    }

    console.log('Launching image picker for profile picture');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'image',
      allowsEditing: true,
      quality: 1,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      console.log('Image selected:', result.assets[0].uri);
      const formData = new FormData();
      if (Platform.OS === 'web') {
        console.log('Processing image for web platform');
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();
        formData.append('photo', blob, 'profile-pic.jpg');
      } else {
        console.log('Processing image for native platform');
        formData.append('photo', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'profile-pic.jpg',
        });
      }

      try {
        console.log('Uploading profile picture to /api/users/profile-pic');
        const response = await api.post('/users/profile-pic', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('Profile picture upload response:', response.data);
        if (response.data.success) {
          setProfilePic(response.data.data.selfieUrl);
          setUser(prev => ({ ...prev, selfie: response.data.data.selfieUrl }));
          setErrorMessage(null);
          Alert.alert('Success', 'Profile picture updated successfully!');
        }
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        console.error('Error response:', error.response?.data);
        setErrorMessage(
          'Failed to upload profile picture: ' +
            (error.message || 'Network error')
        );
      }
    } else {
      console.log('Image picker canceled');
    }
  };

  const handleAddPhoto = async () => {
    console.log('Starting additional photo upload process');
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      console.log('Media library permission denied');
      alert('Permission to access media library is required!');
      return;
    }

    console.log('Launching image picker for additional photo');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'image',
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      console.log('Image selected:', result.assets[0].uri);
      const formData = new FormData();
      if (Platform.OS === 'web') {
        console.log('Processing image for web platform');
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();
        formData.append('photo', blob, 'photo.jpg');
      } else {
        console.log('Processing image for native platform');
        formData.append('photo', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        });
      }

      try {
        console.log('Uploading additional photo to /api/users/photos');
        const response = await api.post('/users/photos', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('Additional photo upload response:', response.data);
        if (response.data.success) {
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
          setErrorMessage(null);
          Alert.alert('Success', 'Photo added successfully!');
        }
      } catch (error) {
        console.error('Error adding photo:', error);
        console.error('Error response:', error.response?.data);
        setErrorMessage(
          'Failed to add photo: ' + (error.message || 'Network error')
        );
      }
    } else {
      console.log('Image picker canceled');
    }
  };

  const handleDeletePhoto = async photoId => {
    console.log(`Starting photo deletion process for photoId: ${photoId}`);
    try {
      console.log(
        `Deleting photo with ID: ${photoId} via /api/users/photos/${photoId}`
      );
      const response = await api.delete(`/users/photos/${photoId}`);
      console.log('Delete photo response:', response.data);
      if (response.data.success) {
        setPhotos(prev => prev.filter(photo => photo._id !== photoId));
        setUser(prev => ({
          ...prev,
          photos: prev.photos.filter(photo => photo._id !== photoId),
        }));
        setErrorMessage(null);
        Alert.alert('Success', 'Photo deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      console.error('Error response:', error.response?.data);
      setErrorMessage(
        'Failed to delete photo: ' + (error.message || 'Network error')
      );
    }
  };

  const handlePhotoClick = url => {
    console.log('Photo clicked, opening ImageModal with URL:', url);
    setSelectedImageUrl(url);
    setImageModalVisible(true);
  };

  const handleLogout = async () => {
    console.log('Logout button clicked');
    try {
      // Clear the auth token from secure storage
      await deleteItemAsync('authToken');
      console.log('Auth token cleared from secure storage');

      // Reset the authentication state
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      console.log('Authentication state reset');

      // Navigate to the OnboardingStack
      navigation.reset({
        index: 0,
        routes: [{ name: 'OnboardingStack' }],
      });
      console.log('Navigated to OnboardingStack');
    } catch (error) {
      console.error('Error during logout:', error);
      setErrorMessage(
        'Failed to logout: ' + (error.message || 'Unknown error')
      );
    }
  };

  return (
    <Container>
      <ProfileHeader>
        <EditButton onPress={() => setIsEditing(!isEditing)}>
          <Ionicons
            name={isEditing ? 'checkmark-circle' : 'pencil'}
            size={28}
            color={
              isEditing ? theme.colors.accent.pink : theme.colors.text.primary
            }
          />
        </EditButton>
        <ProfilePhotoWrapper>
          {profilePic ? (
            <TouchableOpacity onPress={() => handlePhotoClick(profilePic)}>
              <ProfilePhoto source={{ uri: profilePic }} />
            </TouchableOpacity>
          ) : (
            <View
              style={{
                width: 180,
                height: 180,
                borderRadius: 90,
                backgroundColor: theme.colors.text.secondary + '20',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons
                name="person"
                size={90}
                color={theme.colors.text.secondary}
              />
            </View>
          )}
          {isEditing && (
            <EditIcon onPress={handleUploadProfilePic}>
              <Ionicons
                name="pencil"
                size={20}
                color={theme.colors.text.primary}
              />
            </EditIcon>
          )}
        </ProfilePhotoWrapper>
        <NameAge>
          <Text
            variant="h2"
            style={{
              color: theme.colors.text.primary,
              marginRight: theme.spacing.sm,
            }}
          >
            {name}, {age}
          </Text>
          <Text
            variant="body"
            style={{ color: theme.colors.text.secondary, fontSize: 16 }}
          >
            {user?.gender}
          </Text>
        </NameAge>
      </ProfileHeader>

      <PhotosGrid>
        {photos.map(photo => (
          <PhotoWrapper key={photo._id}>
            <TouchableOpacity onPress={() => handlePhotoClick(photo.url)}>
              <Photo source={{ uri: photo.url }} />
            </TouchableOpacity>
            {isEditing && (
              <DeletePhotoButton onPress={() => handleDeletePhoto(photo._id)}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={theme.colors.text.primary}
                />
              </DeletePhotoButton>
            )}
          </PhotoWrapper>
        ))}
        {isEditing && photos.length < 9 && (
          <AddPhotoButton onPress={handleAddPhoto}>
            <Ionicons
              name="add"
              size={40}
              color={theme.colors.text.secondary}
            />
            <Text
              style={{
                color: theme.colors.text.secondary,
                marginTop: theme.spacing.sm,
                fontSize: 14,
              }}
            >
              Add Photo
            </Text>
          </AddPhotoButton>
        )}
      </PhotosGrid>

      <DetailsSection>
        <FieldContainer>
          <Label>Name</Label>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={theme.colors.text.secondary}
            editable={isEditing}
          />
        </FieldContainer>

        <FieldContainer>
          <Label>Age</Label>
          <Input
            value={age}
            onChangeText={setAge}
            placeholder="Enter your age"
            placeholderTextColor={theme.colors.text.secondary}
            keyboardType="numeric"
            editable={isEditing}
          />
        </FieldContainer>

        <FieldContainer>
          <Label>Bio</Label>
          <Input
            value={bio}
            onChangeText={setBio}
            placeholder="Tell something about yourself"
            placeholderTextColor={theme.colors.text.secondary}
            multiline
            maxLength={500}
            editable={isEditing}
            style={{ height: 80, textAlignVertical: 'top' }}
          />
        </FieldContainer>

        {isEditing ? (
          <>
            <SliderContainer>
              <SliderLabel>Age Range</SliderLabel>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: theme.spacing.xs,
                }}
              >
                <SliderValue>{ageRangeMin}</SliderValue>
                <SliderValue>{ageRangeMax}</SliderValue>
              </View>
              <Slider
                minimumValue={18}
                maximumValue={100}
                step={1}
                value={parseInt(ageRangeMin)}
                onValueChange={value => setAgeRangeMin(value.toString())}
                minimumTrackTintColor={theme.colors.accent.pink}
                maximumTrackTintColor={theme.colors.text.secondary}
                thumbTintColor={theme.colors.accent.pink}
                disabled={!isEditing}
              />
              <Slider
                minimumValue={18}
                maximumValue={100}
                step={1}
                value={parseInt(ageRangeMax)}
                onValueChange={value => setAgeRangeMax(value.toString())}
                minimumTrackTintColor={theme.colors.accent.pink}
                maximumTrackTintColor={theme.colors.text.secondary}
                thumbTintColor={theme.colors.accent.pink}
                disabled={!isEditing}
              />
            </SliderContainer>

            <FieldContainer>
              <Label>Max Distance (km)</Label>
              <Input
                value={maxDistance}
                onChangeText={setMaxDistance}
                placeholder="Enter max distance"
                placeholderTextColor={theme.colors.text.secondary}
                keyboardType="numeric"
                editable={isEditing}
              />
            </FieldContainer>

            <FieldContainer>
              <Label>Seeking Gender</Label>
              <OptionsContainer>
                {['any', 'male', 'female'].map(option => (
                  <OptionButton
                    key={option}
                    selected={seekingGender === option}
                    onPress={() => setSeekingGender(option)}
                    disabled={!isEditing}
                  >
                    <OptionText selected={seekingGender === option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </OptionText>
                  </OptionButton>
                ))}
              </OptionsContainer>
            </FieldContainer>

            <FieldContainer>
              <Label>Relationship Type</Label>
              <OptionsContainer>
                {['any', 'casual', 'serious'].map(option => (
                  <OptionButton
                    key={option}
                    selected={relationshipType === option}
                    onPress={() => setRelationshipType(option)}
                    disabled={!isEditing}
                  >
                    <OptionText selected={relationshipType === option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </OptionText>
                  </OptionButton>
                ))}
              </OptionsContainer>
            </FieldContainer>
          </>
        ) : (
          <>
            <FieldContainer>
              <Label>Seeking</Label>
              <Text variant="body" style={{ color: theme.colors.text.primary }}>
                {user?.filterPreferences?.seekingGender === 'any'
                  ? 'Any'
                  : user?.filterPreferences?.seekingGender}
                , {user?.filterPreferences?.ageRange?.min}-
                {user?.filterPreferences?.ageRange?.max}
              </Text>
            </FieldContainer>
            <FieldContainer>
              <Label>Max Distance</Label>
              <Text variant="body" style={{ color: theme.colors.text.primary }}>
                {user?.filterPreferences?.maxDistance} km
              </Text>
            </FieldContainer>
            <FieldContainer>
              <Label>Relationship Type</Label>
              <Text variant="body" style={{ color: theme.colors.text.primary }}>
                {user?.filterPreferences?.relationshipType === 'any'
                  ? 'Any'
                  : user?.filterPreferences?.relationshipType}
              </Text>
            </FieldContainer>
          </>
        )}

        {isEditing && (
          <SaveButton onPress={handleEditProfile}>
            <Text
              style={{
                color: theme.colors.text.primary,
                fontSize: 16,
                fontFamily: 'Poppins-SemiBold',
              }}
            >
              Save Profile
            </Text>
          </SaveButton>
        )}

        <LogoutButton onPress={handleLogout}>
          <Text
            style={{
              color: theme.colors.text.primary,
              fontSize: 16,
              fontFamily: 'Poppins-SemiBold',
            }}
          >
            Logout
          </Text>
        </LogoutButton>
      </DetailsSection>

      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}

      <ImageModal
        visible={imageModalVisible}
        imageUrl={selectedImageUrl}
        onClose={() => setImageModalVisible(false)}
      />
    </Container>
  );
};

export default ProfileScreen;
