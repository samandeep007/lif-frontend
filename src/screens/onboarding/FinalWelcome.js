import React from 'react';
import { Animated, Easing } from 'react-native';
import styled from 'styled-components/native';
import ConfettiCannon from 'react-native-confetti-cannon';
import theme from '../../styles/theme';
import Text from '../../components/common/Text';
import Button from '../../components/common/Button';
import { triggerHaptic } from '../../utils/haptics';

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.lg}px;
`;

const FinalWelcome = ({ navigation }) => {
  const welcomeOpacity = new Animated.Value(0);
  const finalButtonScale = new Animated.Value(0.9);

  Animated.parallel([
    Animated.timing(welcomeOpacity, {
      toValue: 1,
      duration: 500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }),
    Animated.spring(finalButtonScale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }),
  ]).start();

  return (
    <Container>
      <ConfettiCannon count={200} origin={{ x: -10, y: 0 }} />
      <Animated.View style={{ opacity: welcomeOpacity }}>
        <Text variant="h1">Welcome to L.I.F!</Text>
        <Text variant="body" style={{ marginTop: theme.spacing.md, textAlign: 'center' }}>
          Let’s find your match!
        </Text>
      </Animated.View>
      <Animated.View style={{ transform: [{ scale: finalButtonScale }], marginTop: theme.spacing.lg }}>
        <Button
          title="Start Swiping"
          onPress={() => {
            triggerHaptic('success');
            navigation.replace('MainTabs');
          }}
        />
      </Animated.View>
    </Container>
  );
};

export default FinalWelcome;