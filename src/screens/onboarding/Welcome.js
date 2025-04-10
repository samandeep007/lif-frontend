import React from 'react';
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

const Welcome = ({ navigation }) => {
  const titleOpacity = new Animated.Value(0);
  const taglineOpacity = new Animated.Value(0);
  const buttonScale = new Animated.Value(0.9);
  const loginButtonScale = new Animated.Value(0.9);

  Animated.parallel([
    Animated.timing(titleOpacity, {
      toValue: 1,
      duration: 500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: Platform.OS !== 'web',
    }),
    Animated.timing(taglineOpacity, {
      toValue: 1,
      duration: 500,
      delay: 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: Platform.OS !== 'web',
    }),
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: Platform.OS !== 'web',
    }),
    Animated.spring(loginButtonScale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      delay: 200,
      useNativeDriver: Platform.OS !== 'web',
    }),
  ]).start();

  return (
    <Container>
      <Animated.View style={{ opacity: titleOpacity }}>
        <Text variant="h1">Love Is Free</Text>
      </Animated.View>
      <Animated.View
        style={{ opacity: taglineOpacity, marginTop: theme.spacing.md }}
      >
        <Text variant="body">Find Your Match Today</Text>
      </Animated.View>
      <Animated.View
        style={{
          transform: [{ scale: buttonScale }],
          marginTop: theme.spacing.xl,
        }}
      >
        <Button
          title="Get Started"
          onPress={() => navigation.navigate('SignUp')}
        />
      </Animated.View>
      <Animated.View
        style={{
          transform: [{ scale: loginButtonScale }],
          marginTop: theme.spacing.md,
        }}
      >
        <Button
          title="Login"
          onPress={() => navigation.navigate('Login')}
          gradient={false}
        />
      </Animated.View>
    </Container>
  );
};

export default Welcome;
