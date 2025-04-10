import React, { useState } from 'react';
import { Animated, Easing } from 'react-native';
import styled from 'styled-components/native';
import theme from '../../styles/theme';
import Text from '../../components/common/Text';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import api from '../../api/api';

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.lg}px;
`;

const SignUp = ({ navigation, setFormData }) => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    age: '',
    gender: '',
  });
  const [errors, setErrors] = useState({});

  const inputTranslates = [
    new Animated.Value(50),
    new Animated.Value(50),
    new Animated.Value(50),
    new Animated.Value(50),
    new Animated.Value(50),
  ];
  const signUpButtonScale = new Animated.Value(0.9);

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
        setFormData(form); // Pass form data to parent for use in EmailVerification
        navigation.navigate('EmailVerification');
      }
    } catch (error) {
      console.error('Sign-up error:', error);
      setErrors({
        general:
          error.response?.data?.message ||
          error.message ||
          'Sign-up failed. Please try again.',
      });
    }
  };

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
};

export default SignUp;