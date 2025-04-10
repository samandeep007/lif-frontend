import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Permissions from 'react-native-permissions';
import { mediaDevices, RTCPeerConnection, RTCView, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
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

const RemoteVideo = styled(RTCView)`
  flex: 1;
`;

const LocalVideo = styled(RTCView)`
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
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);

  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }, // Free Google STUN server
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  useEffect(() => {
    const setupSocket = () => {
      socketRef.current = io('https://lif-backend-awv3.onrender.com', {
        auth: { token: localStorage.getItem('authToken') || '' },
        transports: ['websocket'],
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to socket for WebRTC signaling');
      });

      socketRef.current.on('offer', async ({ callId, offer, fromUserId }) => {
        if (callId === matchId && callStatus === 'incoming') {
          peerConnectionRef.current = new RTCPeerConnection(configuration);
          peerConnectionRef.current.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
          };
          peerConnectionRef.current.onicecandidate = (event) => {
            if (event.candidate) {
              socketRef.current.emit('ice-candidate', {
                callId,
                candidate: event.candidate,
                toUserId: fromUserId,
              });
            }
          };

          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);

          socketRef.current.emit('answer', {
            callId,
            answer,
            toUserId: fromUserId,
          });
        }
      });

      socketRef.current.on('answer', async ({ callId, answer }) => {
        if (callId === matchId && callStatus === 'initiating') {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          setCallStatus('active');
        }
      });

      socketRef.current.on('ice-candidate', async ({ callId, candidate }) => {
        if (callId === matchId && peerConnectionRef.current) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      });

      socketRef.current.on('call_accepted', ({ callId, matchId: incomingMatchId, callType: incomingCallType, receiverId }) => {
        if (incomingMatchId === matchId && userId === receiverId) {
          setCallStatus('active');
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

    const setupLocalStream = async () => {
      try {
        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: callType === 'video',
        });
        setLocalStream(stream);
        return stream;
      } catch (error) {
        console.error('Error accessing media devices:', error);
        Alert.alert('Media Error', 'Unable to access camera or microphone.');
        navigation.goBack();
      }
    };

    const initiateWebRTCCall = async () => {
      const stream = await setupLocalStream();
      if (!stream) return;

      peerConnectionRef.current = new RTCPeerConnection(configuration);
      peerConnectionRef.current.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit('ice-candidate', {
            callId: matchId,
            candidate: event.candidate,
            toUserId: senderId,
          });
        }
      };

      stream.getTracks().forEach(track => peerConnectionRef.current.addTrack(track, stream));

      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      socketRef.current.emit('offer', {
        callId: matchId,
        offer,
        toUserId: senderId,
      });
    };

    requestPermissions();
    setupSocket();

    if (!isIncoming) {
      initiateWebRTCCall();
    }

    return () => {
      cleanup();
    };
  }, [isIncoming, matchId, callType, senderId, navigation]);

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  const handleAcceptCall = async () => {
    try {
      const response = await api.post('/calls/accept', { callId: matchId });
      if (response.data.success) {
        setCallStatus('active');
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
        {remoteStream && (
          <RemoteVideo
            streamURL={remoteStream.toURL()}
            style={{ flex: 1 }}
          />
        )}
        {localStream && callType === 'video' && (
          <LocalVideo
            streamURL={localStream.toURL()}
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