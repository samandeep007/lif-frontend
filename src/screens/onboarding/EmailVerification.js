import React, { useEffect } from 'react';
import { Animated, Easing, Platform } from 'react-native';
import styled from 'styled-components/native';
import theme from '../../styles/theme';
import Text from '../../components/common/Text';
import Button from '../../components/common/Button';

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.lg}px;
`;

const EmailVerification = ({ navigation }) => {
  const messageOpacity = new Animated.Value(0);
  const loginButtonScale = new Animated.Value(0.9);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(messageOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(loginButtonScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <Container>
      <Animated.View style={{ opacity: messageOpacity }}>
        <Text variant="h1">Check Your Email</Text>
        <Text
          variant="body"
          style={{ marginTop: theme.spacing.md, textAlign: 'center' }}
        >
          We have sent you a verification email.
        </Text>
      </Animated.View>
      <Animated.View
        style={{
          transform: [{ scale: loginButtonScale }],
          marginTop: theme.spacing.lg,
        }}
      >
        <Button title="Login" onPress={() => navigation.replace('Login')} />
      </Animated.View>
    </Container>
  );
};

export default EmailVerification;
