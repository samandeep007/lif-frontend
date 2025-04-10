import React, { useState } from 'react';
import { View, Image, Dimensions, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { PanGestureHandler, TapGestureHandler, State } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';
import Text from './common/Text';
import { triggerHaptic } from '../utils/haptics';
import UserDetailsModal from './UserDetailsModal'; // Import the new modal component

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.2; // 20% of screen width
const SWIPE_OUT_DURATION = 300; // 300 milliseconds for a snappy feel

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

const Overlay = styled(Animated.View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.color};
  justify-content: center;
  align-items: center;
  z-index: 10; /* Ensure the overlay is above other elements */
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
  z-index: 10; /* Ensure the starburst is above other elements */
`;

const SwipeCard = ({ user, onSwipe, index }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);
  const starBurstOpacity = useSharedValue(0);
  const starBurstScale = useSharedValue(0);
  const [overlayColor, setOverlayColor] = useState(null);
  const [overlayIcon, setOverlayIcon] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility

  // Use user.photos[0]?.url if available, otherwise use user.selfie, with a fallback
  const imageUrl = user.photos && user.photos.length > 0 && user.photos[0]?.url
    ? user.photos[0].url
    : user.selfie || 'https://via.placeholder.com/300';
  console.log(`SwipeCard image URL for user ${user._id}:`, imageUrl);

  const onHandlerStateChange = (event) => {
    const { translationX, translationY, state } = event.nativeEvent;

    if (state === State.ACTIVE) {
      console.log(`Gesture active for user ${user._id}: translationX=${translationX}, translationY=${translationY}`);
      translateX.value = translationX;
      translateY.value = translationY;
      rotate.value = (translationX / (SCREEN_WIDTH / 2)) * 10; // Rotate up to 10 degrees during drag

      const swipeDirection = translationX > 0 ? 'right' : 'left';
      const opacity = Math.abs(translationX) / (SWIPE_THRESHOLD * 0.5); // Reduced denominator to make opacity increase faster

      if (translationX > 40) {
        console.log(`Setting overlay to LIKE: opacity=${opacity}`);
        setOverlayColor(`${theme.colors.accent.green}80`);
        setOverlayIcon('heart');
      } else if (translationX < -40) {
        console.log(`Setting overlay to NOPE: opacity=${opacity}`);
        setOverlayColor(`${theme.colors.accent.red}80`);
        setOverlayIcon('close');
      } else {
        console.log(`Clearing overlay: opacity=${opacity}`);
        setOverlayColor(null);
        setOverlayIcon(null);
      }

      overlayOpacity.value = opacity > 1 ? 1 : opacity;
    } else if (state === State.END) {
      console.log(`Gesture ended for user ${user._id}: translationX=${translationX}, translationY=${translationY}`);
      if (translationX > SWIPE_THRESHOLD) {
        console.log(`Swiping right on user ${user._id}`);
        onSwipe('right', user);
        triggerHaptic('medium');
        // Animate translateX, translateY, and rotate for a "like" swipe with a curved trajectory
        translateX.value = withTiming(SCREEN_WIDTH, { duration: SWIPE_OUT_DURATION, easing: Easing.out(Easing.quad) });
        translateY.value = withTiming(-SCREEN_HEIGHT * 0.2, { duration: SWIPE_OUT_DURATION, easing: Easing.out(Easing.quad) }); // Slight upward arc
        rotate.value = withTiming((translationX / (SCREEN_WIDTH / 2)) * 30, { duration: SWIPE_OUT_DURATION }); // Dynamic rotation up to 60 degrees
      } else if (translationX < -SWIPE_THRESHOLD) {
        console.log(`Swiping left on user ${user._id}`);
        onSwipe('left', user);
        triggerHaptic('medium');
        // Animate translateX, translateY, and rotate for a "pass" swipe with a curved trajectory
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: SWIPE_OUT_DURATION, easing: Easing.out(Easing.quad) });
        translateY.value = withTiming(-SCREEN_HEIGHT * 0.2, { duration: SWIPE_OUT_DURATION, easing: Easing.out(Easing.quad) }); // Slight upward arc
        rotate.value = withTiming((translationX / (SCREEN_WIDTH / 2)) * 30, { duration: SWIPE_OUT_DURATION }); // Dynamic rotation up to -60 degrees
      } else if (
        Math.abs(translationX) > 40 &&
        Math.abs(translationY) > 40
      ) {
        console.log(`Swiping up (super like) on user ${user._id}`);
        starBurstOpacity.value = withTiming(1, { duration: 300 });
        starBurstScale.value = withSpring(
          1.5,
          { damping: 10, stiffness: 100 },
          () => {
            starBurstOpacity.value = withTiming(0, { duration: 300 });
            starBurstScale.value = withTiming(0);
            translateX.value = withTiming(0, { duration: SWIPE_OUT_DURATION });
            translateY.value = withTiming(0, { duration: SWIPE_OUT_DURATION });
            rotate.value = withTiming(0, { duration: SWIPE_OUT_DURATION }); // Reset rotation for super like
          }
        );
        onSwipe('super', user);
        triggerHaptic('success');
      } else {
        console.log(`Swipe cancelled for user ${user._id}`);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);
        overlayOpacity.value = withTiming(0, { duration: 200 });
        setOverlayColor(null);
        setOverlayIcon(null);
      }
    }
  };

  const onTapHandlerStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === State.END) {
      console.log(`Card tapped for user ${user._id}`);
      setModalVisible(true);
    }
  };

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
      ],
      zIndex: -index,
      width: SCREEN_WIDTH - 40,
      height: SCREEN_HEIGHT * 0.6,
      borderRadius: theme.borderRadius.large,
      position: 'absolute',
      backgroundColor: theme.colors.text.primary,
      overflow: 'hidden',
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
    <>
      <TapGestureHandler onHandlerStateChange={onTapHandlerStateChange}>
        <PanGestureHandler onHandlerStateChange={onHandlerStateChange}>
          <Animated.View style={cardStyle}>
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
              source={{ uri: imageUrl }}
              onLoad={() => {
                console.log(`Image loaded for user ${user._id}`);
                setImageLoaded(true);
              }}
              onError={(e) => {
                console.error(`Image failed to load for user ${user._id}:`, e.nativeEvent.error);
                setImageLoaded(true); // Treat as loaded to hide the ActivityIndicator
              }}
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
            {overlayColor && overlayIcon ? (
              <Overlay style={overlayStyle} color={overlayColor}>
                <Ionicons name={overlayIcon} size={80} color="#fff" />
              </Overlay>
            ) : null}
            <StarBurst style={starBurstStyle} />
          </Animated.View>
        </PanGestureHandler>
      </TapGestureHandler>
      <UserDetailsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        user={user}
      />
    </>
  );
};

export default SwipeCard;