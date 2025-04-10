import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const triggerHaptic = (type) => {
  if (Platform.OS === 'web') {
    return; // Haptics are not supported on web, so we return early
  }

  switch (type) {
    case 'light':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case 'medium':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
    case 'success':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
    default:
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};