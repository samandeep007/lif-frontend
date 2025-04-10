import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Permissions from 'react-native-permissions';
import RtcEngine, { RtcLocalView, RtcRemoteView, VideoRenderMode } from 'react-native-agora';
import api from '../api/api';
import styled from 'styled-components/native';
import theme from '../styles/theme';
import { io } from 'socket.io-client';

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
`;

const VideoContainer = styled.View`
  flex: 1;
  position: relative;
`;

const RemoteVideo = styled(RtcRemoteView)`
  flex: 1;
`;

const LocalVideo = styled(RtcLocalView)`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 120px;
  height: 160px;
  border-radius: ${theme.borderRadius.medium}px;
  border-width: 2px;
  border-color: ${theme.colors.text.primary};
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
  const [remoteUid, setRemoteUid] = useState(null);
  const [engine, setEngine] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const setupSocket = () => {
      socketRef.current = io('https://lif-backend-awv3.onrender.com', {
        auth: { token: localStorage.getItem('authToken') || '' },
        transports: ['websocket'],
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to socket for Agora signaling');
      });

      socketRef.current.on('call_accepted', ({ callId, matchId: incomingMatchId, callType: incomingCallType, receiverId }) => {
        if (incomingMatchId === matchId && userId === receiverId) {
          setCallStatus('active');
          joinChannel();
        }
      });

      socketRef.current.on('call_rejected', ({ matchId: incomingMatchId }) => {
        if (incomingMatchId === matchId) {
          Alert.alert('Call Rejected', 'The other user rejected the call.');
          cleanup();
          navigation.goBack();
        }
      });

      socketRef.current.on('call_ended', ({ callId }) => {
        if (callId === matchId) {
          cleanup();
          navigation.goBack();
        }
      });

      return () => {
        socketRef.current.disconnect();
      };
    };

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

    const initAgora = async () => {
      const appId = process.env.AGORA_APP_ID;
      if (!appId) {
        Alert.alert('Configuration Error', 'Agora App ID is not set.');
        navigation.goBack();
        return;
      }

      const rtcEngine = await RtcEngine.create(appId);
      setEngine(rtcEngine);

      rtcEngine.enableVideo();
      rtcEngine.enableAudio();

      rtcEngine.addListener('UserJoined', (uid) => {
        setRemoteUid(uid);
      });

      rtcEngine.addListener('UserOffline', () => {
        setRemoteUid(null);
        cleanup();
        navigation.goBack();
      });

      rtcEngine.addListener('Error', (err) => {
        console.error('Agora Error:', err);
        Alert.alert('Call Error', 'An error occurred during the call.');
        cleanup();
        navigation.goBack();
      });

      if (!isIncoming) {
        joinChannel();
      }
    };

    const joinChannel = async () => {
      if (engine) {
        await engine.joinChannel(null, matchId, null, parseInt(userId));
      }
    };

    requestPermissions();
    setupSocket();
    initAgora();

    return () => {
      cleanup();
    };
  }, [isIncoming, matchId, callType, userId, senderId, navigation]);

  const cleanup = () => {
    if (engine) {
      engine.leaveChannel();
      engine.destroy();
      setEngine(null);
    }
    setRemoteUid(null);
  };

  const handleAcceptCall = async () => {
    try {
      const response = await api.post('/calls/accept', { callId: matchId });
      if (response.data.success) {
        setCallStatus('active');
        joinChannel();
      }
    } catch (error) {
      console.error('Error accepting call:', error);
      Alert.alert('Error', 'Failed to accept the call.');
      cleanup();
      navigation.goBack();
    }
  };

  const handleRejectCall = async () => {
    try {
      await api.post('/calls/reject', { callId: matchId });
      cleanup();
      navigation.goBack();
    } catch (error) {
      console.error('Error rejecting call:', error);
      Alert.alert('Error', 'Failed to reject the call.');
      cleanup();
      navigation.goBack();
    }
  };

  const handleEndCall = async () => {
    try {
      await api.post(`/calls/end/${matchId}`);
      socketRef.current.emit('end-call', { callId: matchId, toUserId: senderId });
      cleanup();
      navigation.goBack();
    } catch (error) {
      console.error('Error ending call:', error);
      Alert.alert('Error', 'Failed to end the call.');
      cleanup();
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

  return (
    <Container>
      <VideoContainer>
        {remoteUid && (
          <RemoteVideo
            streamURL={remoteUid.toString()}
            renderMode={VideoRenderMode.Hidden}
            style={{ flex: 1 }}
          />
        )}
        {callType === 'video' && (
          <LocalVideo
            streamURL={userId.toString()}
            renderMode={VideoRenderMode.Hidden}
            style={{ position: 'absolute', top: 20, right: 20, width: 120, height: 160 }}
          />
        )}
      </VideoContainer>
      <ButtonContainer>
        <TouchableOpacity
          onPress={handleEndCall}
          style={{
            backgroundColor: theme.colors.accent.red,
            padding: theme.spacing.md,
            borderRadius: theme.borderRadius.medium,
          }}
        >
          <Text style={{ color: theme.colors.text.primary, fontSize: 18 }}>End Call</Text>
        </TouchableOpacity>
      </ButtonContainer>
    </Container>
  );
};

export default CallScreen;