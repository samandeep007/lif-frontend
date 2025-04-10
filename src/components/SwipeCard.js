import React, { useState } from 'react';
import { View, Image, Dimensions, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient'; // Add this import
import theme from '../styles/theme';
import Text from './common/Text';
import { triggerHaptic } from '../utils/haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_OUT_DURATION = 250;

const CardContainer = styled(Animated.View)`
  width: ${SCREEN_WIDTH - 40}px;
  height: ${SCREEN_HEIGHT * 0.6}px;
  border-radius: ${theme.borderRadius.large}px;
  position: absolute;
  background-color: ${theme.colors.text.primary};
  overflow: hidden;
`;

const CardImage = styled(Image)`
  width: 100%;
  height: 100%;
`;

const GradientOverlay = styled(Animated.View)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
`;

const InfoContainer = styled.View`
  position: absolute;
  bottom: 20px;
  left: 20px;
`;

const OverlayText = styled(Animated.Text)`
  position: absolute;
  top: 50px;
  font-family: Poppins-Bold;
  font-size: 40px;
  color: ${props => props.color};
  transform: rotate(-20deg);
`;

const StarBurst = styled(Animated.View)`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  background-color: ${theme.colors.accent.yellow};
  border-radius: 50px;
  transform: translateX(-50px) translateY(-50px);
`;

const SwipeCard = ({ user, onSwipe, index }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);
  const starBurstOpacity = useSharedValue(0);
  const starBurstScale = useSharedValue(0);
  const [overlayText, setOverlayText] = useState('');
  const [overlayColor, setOverlayColor] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {},
    onActive: event => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotate.value = (event.translationX / (SCREEN_WIDTH / 2)) * 10; // Rotate up to 10 degrees

      const swipeDirection = event.translationX > 0 ? 'right' : 'left';
      const opacity = Math.abs(event.translationX) / SWIPE_THRESHOLD;

      if (event.translationX > 50) {
        runOnJS(setOverlayText)('LIKE');
        runOnJS(setOverlayColor)(theme.colors.accent.green);
      } else if (event.translationX < -50) {
        runOnJS(setOverlayText)('NOPE');
        runOnJS(setOverlayColor)(theme.colors.accent.red);
      } else {
        runOnJS(setOverlayText)('');
        runOnJS(setOverlayColor)('');
      }

      overlayOpacity.value = opacity > 1 ? 1 : opacity;
    },
    onEnd: event => {
      if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(
          SCREEN_WIDTH,
          { duration: SWIPE_OUT_DURATION },
          () => {
            runOnJS(onSwipe)('right', user);
            runOnJS(triggerHaptic)('medium');
          }
        );
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(
          -SCREEN_WIDTH,
          { duration: SWIPE_OUT_DURATION },
          () => {
            runOnJS(onSwipe)('left', user);
            runOnJS(triggerHaptic)('medium');
          }
        );
      } else if (
        Math.abs(event.translationX) > 50 &&
        Math.abs(event.translationY) > 50
      ) {
        // Super Like (swipe up)
        starBurstOpacity.value = withTiming(1, { duration: 200 });
        starBurstScale.value = withSpring(
          1.5,
          { damping: 10, stiffness: 100 },
          () => {
            starBurstOpacity.value = withTiming(0, { duration: 200 });
            starBurstScale.value = withTiming(0);
            translateX.value = withTiming(
              0,
              { duration: SWIPE_OUT_DURATION },
              () => {
                runOnJS(onSwipe)('super', user);
                runOnJS(triggerHaptic)('success');
              }
            );
          }
        );
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);
        overlayOpacity.value = withTiming(0, { duration: 200 });
        runOnJS(setOverlayText)('');
        runOnJS(setOverlayColor)('');
      }
    },
  });

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
      ],
      zIndex: -index,
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: overlayOpacity.value,
    };
  });

  const starBurstStyle = useAnimatedStyle(() => {
    return {
      opacity: starBurstOpacity.value,
      transform: [{ scale: starBurstScale.value }],
    };
  });

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <CardContainer style={cardStyle}>
        {!imageLoaded && (
          <ActivityIndicator
            size="large"
            color={theme.colors.accent.pink}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: [{ translateX: -15 }, { translateY: -15 }],
            }}
          />
        )}
        <CardImage
          source={{ uri: user.photos[0] || 'https://via.placeholder.com/300' }}
          onLoad={() => setImageLoaded(true)}
        />
        <GradientOverlay>
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.8)', 'transparent']}
            style={{
              flex: 1,
            }}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
          />
        </GradientOverlay>
        <InfoContainer>
          <Text variant="h2">{`${user.name}, ${user.age}`}</Text>
          <Text variant="body">{user.bio || 'No bio available'}</Text>
        </InfoContainer>
        {overlayText ? (
          <OverlayText
            style={[
              overlayStyle,
              { [overlayText === 'LIKE' ? 'right' : 'left']: 50 },
            ]}
            color={overlayColor}
          >
            {overlayText}
          </OverlayText>
        ) : null}
        <StarBurst style={starBurstStyle} />
      </CardContainer>
    </PanGestureHandler>
  );
};

export default SwipeCard;
