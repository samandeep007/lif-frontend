import React, { useState } from 'react';
import { Animated, Easing, Image, TouchableOpacity, TextInput, Platform } from 'react-native';
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
  padding: ${theme.spacing.lg}px;
`;

const PhotoUploadContainer = styled(TouchableOpacity)`
  width: 150px;
  height: 150px;
  border-radius: 75px;
  border-width: 2px;
  border-color: ${theme.colors.text.primary};
  justify-content: center;
  align-items: center;
  margin-bottom: ${theme.spacing.lg}px;
`;

const Photo = styled(Image)`
  width: 150px;
  height: 150px;
  border-radius: 75px;
`;

const BioInput = styled(TextInput)`
  width: 300px;
  height: 100px;
  border-radius: ${theme.borderRadius.small}px;
  border-width: 1px;
  border-color: ${theme.colors.text.secondary};
  padding: ${theme.spacing.md}px;
  margin-bottom: ${theme.spacing.sm}px;
  color: ${theme.colors.text.primary};
  font-family: Poppins-Regular;
  font-size: 16px;
  text-align-vertical: top;
`;

const ProfileSetup = ({ navigation }) => {
  const setUser = useAuthStore((state) => state.setUser);
  const [photo, setPhoto] = useState(null);
  const [bio, setBio] = useState('');
  const [errors, setErrors] = useState({});

  const photoScale = new Animated.Value(0.8);
  const bioTranslate = new Animated.Value(50);
  const continueButtonScale = new Animated.Value(0.9);

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

  const handlePhotoUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
      triggerHaptic('medium');
    }
  };

  const handleProfileSetup = async () => {
    try {
      const formData = new FormData();

      if (photo) {
        if (Platform.OS === 'web') {
          // On web, fetch the blob from the URI
          const response = await fetch(photo);
          const blob = await response.blob();
          formData.append('photo', blob, 'profile.jpg');
        } else {
          // On native, use the URI directly
          formData.append('photo', {
            uri: photo,
            type: 'image/jpeg',
            name: 'profile.jpg',
          });
        }
      }
      formData.append('bio', bio);

      console.log('FormData before sending:', formData);

      // Upload photo
      let photoResponse = null;
      if (photo) {
        console.log('Uploading photo...');
        photoResponse = await api.post('/users/photos', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('Photo upload response:', photoResponse.data);
        if (!photoResponse.data.success) {
          throw new Error('Failed to upload photo: ' + (photoResponse.data.message || 'Unknown error'));
        }
      }

      // Update bio
      console.log('Updating bio...');
      const updateResponse = await api.put('/users/me', { bio });
      console.log('Bio update response:', updateResponse.data);
      if (updateResponse.data.success) {
        setUser(updateResponse.data.data);
        console.log('User state updated:', updateResponse.data.data);
        console.log('Navigating to FinalWelcome...');
        navigation.navigate('FinalWelcome');
      } else {
        throw new Error('Failed to update bio: ' + (updateResponse.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Profile setup error:', error);
      setErrors({ general: error.message || 'Profile setup failed' });
      console.log('Error details:', error.response ? error.response.data : error);
    }
  };

  return (
    <Container>
      <Text variant="h1">Set Up Your Profile</Text>
      <Animated.View style={{ transform: [{ scale: photoScale }], marginTop: theme.spacing.md }}>
        <PhotoUploadContainer onPress={handlePhotoUpload}>
          {photo ? (
            <Photo source={{ uri: photo }} />
          ) : (
            <Ionicons name="add" size={40} color={theme.colors.text.primary} />
          )}
        </PhotoUploadContainer>
      </Animated.View>
      <Animated.View style={{ transform: [{ translateY: bioTranslate }], width: '100%' }}>
        <BioInput
          value={bio}
          onChangeText={setBio}
          placeholder="Tell us about yourself"
          placeholderTextColor={theme.colors.text.secondary}
          multiline
        />
      </Animated.View>
      {errors.general && (
        <Text style={{ color: theme.colors.accent.red, marginTop: theme.spacing.sm }}>
          {errors.general}
        </Text>
      )}
      <Animated.View style={{ transform: [{ scale: continueButtonScale }], marginTop: theme.spacing.lg }}>
        <Button
          title="Continue"
          onPress={() => {
            handleProfileSetup();
            triggerHaptic('light');
          }}
        />
      </Animated.View>
    </Container>
  );
};

export default ProfileSetup;