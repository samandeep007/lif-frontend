import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { ZegoUIKitPrebuiltCall, ONE_ON_ONE_VIDEO_CALL_CONFIG, ONE_ON_ONE_VOICE_CALL_CONFIG } from 'zegocloud-react-native-uikit';
import { useNavigation } from '@react-navigation/native';
import * as Permissions from 'react-native-permissions';
import api from '../api/api';
import styled from 'styled-components/native';
import theme from '../styles/theme';

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${theme.colors.background};
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-around;
  width: 100%;
  padding: ${theme.spacing.md}px;
`;

const CallScreen = ({ route }) => {
  const { userId, matchId, callType, otherUserName, isIncoming, senderId } = route.params;
  const navigation = useNavigation();
  const [callStatus, setCallStatus] = useState(isIncoming ? 'incoming' : 'initiating');

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        await Permissions.requestMultiple([
          Permissions.PERMISSIONS.ANDROID.CAMERA,
          Permissions.PERMISSIONS.ANDROID.RECORD_AUDIO,
          Permissions.PERMISSIONS.IOS.CAMERA,
          Permissions.PERMISSIONS.IOS.MICROPHONE,
        ]);
      } catch (error) {
        console.error('Error requesting permissions:', error);
        Alert.alert('Permission Error', 'Camera and microphone permissions are required for calls.');
        navigation.goBack();
      }
    };
    requestPermissions();

    if (isIncoming) {
      // For incoming calls, wait for user to accept or reject
      setCallStatus('incoming');
    } else {
      // For outgoing calls, wait for the other user to accept or reject
      const socket = io('https://lif-backend-awv3.onrender.com', {
        auth: { token: localStorage.getItem('authToken') || '' },
        transports: ['websocket'],
      });

      socket.on('call_accepted', ({ callId, matchId: incomingMatchId, callType: incomingCallType }) => {
        if (incomingMatchId === matchId && incomingCallType === callType) {
          setCallStatus('active');
        }
      });

      socket.on('call_rejected', ({ matchId: incomingMatchId }) => {
        if (incomingMatchId === matchId) {
          Alert.alert('Call Rejected', 'The other user rejected the call.');
          navigation.goBack();
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [isIncoming, matchId, callType, navigation]);

  const handleAcceptCall = async () => {
    try {
      const response = await api.post('/calls/accept', { callId: matchId });
      if (response.data.success) {
        setCallStatus('active');
      }
    } catch (error) {
      console.error('Error accepting call:', error);
      Alert.alert('Error', 'Failed to accept the call.');
      navigation.goBack();
    }
  };

  const handleRejectCall = async () => {
    try {
      await api.post('/calls/reject', { callId: matchId });
      navigation.goBack();
    } catch (error) {
      console.error('Error rejecting call:', error);
      Alert.alert('Error', 'Failed to reject the call.');
      navigation.goBack();
    }
  };

  const handleEndCall = async () => {
    try {
      await api.post(`/calls/end/${matchId}`);
      navigation.goBack();
    } catch (error) {
      console.error('Error ending call:', error);
      Alert.alert('Error', 'Failed to end the call.');
      navigation.goBack();
    }
  };

  if (callStatus === 'incoming') {
    return (
      <Container>
        <Text style={{ fontSize: 24, color: theme.colors.text.primary, marginBottom: theme.spacing.lg }}>
          Incoming {callType} call from {otherUserName}
        </Text>
        <ButtonContainer>
          <TouchableOpacity
            onPress={handleAcceptCall}
            style={{
              backgroundColor: theme.colors.accent.pink,
              padding: theme.spacing.md,
              borderRadius: theme.borderRadius.medium,
            }}
          >
            <Text style={{ color: theme.colors.text.primary, fontSize: 18 }}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleRejectCall}
            style={{
              backgroundColor: theme.colors.accent.red,
              padding: theme.spacing.md,
              borderRadius: theme.borderRadius.medium,
            }}
          >
            <Text style={{ color: theme.colors.text.primary, fontSize: 18 }}>Reject</Text>
          </TouchableOpacity>
        </ButtonContainer>
      </Container>
    );
  }

  if (callStatus === 'initiating') {
    return (
      <Container>
        <Text style={{ fontSize: 24, color: theme.colors.text.primary }}>
          Initiating {callType} call with {otherUserName}...
        </Text>
      </Container>
    );
  }

  const config = callType === 'video' ? ONE_ON_ONE_VIDEO_CALL_CONFIG : ONE_ON_ONE_VOICE_CALL_CONFIG;

  return (
    <View style={{ flex: 1 }}>
      <ZegoUIKitPrebuiltCall
        appID={parseInt(process.env.ZEGOCLOUD_APP_ID)}
        appSign={process.env.ZEGOCLOUD_SERVER_SECRET}
        userID={userId}
        userName={userId}
        callID={matchId}
        config={{
          ...config,
          onHangUp: () => {
            handleEndCall();
          },
        }}
      />
    </View>
  );
};

export default CallScreen;