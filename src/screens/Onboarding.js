import React, { useState } from 'react';
import { View, Animated, Easing } from 'react-native';
import styled from 'styled-components/native';
import theme from '../styles/theme';
import Text from '../components/common/Text';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import api from '../api/api';

const Container = styled(View)`
  flex: 1;
  background-color: ${theme.colors.background};
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.lg}px;
`;

const OnboardingScreen = ({ route, navigation }) => {
  const { name } = route;

  // Animations for Welcome screen
  const [titleOpacity] = useState(new Animated.Value(0));
  const [taglineOpacity] = useState(new Animated.Value(0));
  const [buttonScale] = useState(new Animated.Value(0.9));

  // Animations for SignUp screen
  const [inputTranslates] = useState([
    new Animated.Value(50),
    new Animated.Value(50),
    new Animated.Value(50),
    new Animated.Value(50),
    new Animated.Value(50),
  ]);
  const [signUpButtonScale] = useState(new Animated.Value(0.9));

  // SignUp form state
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    age: '',
    gender: '',
  });
  const [errors, setErrors] = useState({});

  // Animation setup for Welcome screen
  if (name === 'Welcome') {
    Animated.parallel([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 500,
        delay: 200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }

  // Animation setup for SignUp screen
  if (name === 'SignUp') {
    Animated.parallel([
      ...inputTranslates.map((translate, index) =>
        Animated.timing(translate, {
          toValue: 0,
          duration: 300,
          delay: index * 100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ),
      Animated.spring(signUpButtonScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }

  // Validation for SignUp form
  const validateForm = () => {
    const newErrors = {};
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!form.password || form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!form.name) {
      newErrors.name = 'Name is required';
    }
    if (!form.age || isNaN(form.age) || form.age < 18) {
      newErrors.age = 'Age must be a number and at least 18';
    }
    if (!form.gender) {
      newErrors.gender = 'Gender is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle SignUp submission
  const handleSignUp = async () => {
    if (!validateForm()) return;

    try {
      const response = await api.post('/auth/register', {
        email: form.email,
        password: form.password,
        name: form.name,
        age: parseInt(form.age, 10),
        gender: form.gender,
      });
      if (response.data.success) {
        // Navigate to the next screen (Email Verification) in a later chunk
        console.log('Sign-up successful:', response.data.message);
      }
    } catch (error) {
      setErrors({ general: error.response?.data?.message || 'Sign-up failed' });
    }
  };

  if (name === 'Welcome') {
    return (
      <Container>
        <Animated.View style={{ opacity: titleOpacity }}>
          <Text variant="h1">Love Is Free</Text>
        </Animated.View>
        <Animated.View style={{ opacity: taglineOpacity, marginTop: theme.spacing.md }}>
          <Text variant="body">Find Your Match Today</Text>
        </Animated.View>
        <Animated.View style={{ transform: [{ scale: buttonScale }], marginTop: theme.spacing.xl }}>
          <Button title="Get Started" onPress={() => navigation.navigate('SignUp')} />
        </Animated.View>
      </Container>
    );
  }

  if (name === 'SignUp') {
    return (
      <Container>
        <Text variant="h1">Create Your Account</Text>
        {['email', 'password', 'name', 'age', 'gender'].map((field, index) => (
          <Animated.View
            key={field}
            style={{
              transform: [{ translateY: inputTranslates[index] }],
              width: '100%',
              marginTop: theme.spacing.sm,
            }}
          >
            <Input
              value={form[field]}
              onChangeText={(text) => setForm({ ...form, [field]: text })}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              error={errors[field]}
              secureTextEntry={field === 'password'}
            />
          </Animated.View>
        ))}
        {errors.general && (
          <Text style={{ color: theme.colors.accent.red, marginTop: theme.spacing.sm }}>
            {errors.general}
          </Text>
        )}
        <Animated.View style={{ transform: [{ scale: signUpButtonScale }], marginTop: theme.spacing.lg }}>
          <Button title="Sign Up" onPress={handleSignUp} />
        </Animated.View>
      </Container>
    );
  }

  return null;
};

export default OnboardingScreen;