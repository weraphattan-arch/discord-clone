# Voice/Video Calls Implementation Guide

This guide explains how to set up peer-to-peer voice and video calls using WebRTC and Simple Peer.

## How Peer-to-Peer Calls Work

```
User A ←→ WebRTC Peer Connection ←→ User B
         (Direct browser-to-browser)
```

The backend signals the connection, but audio/video streams go directly between browsers.

## Installation

Already included in `npm install`:
```bash
npm install simple-peer
```

## Basic Call Flow

### 1. User A initiates call
- Creates a Peer object as "initiator"
- Backend notifies User B
- Sends signaling data through WebSocket

### 2. User B receives call
- Creates a Peer object as "non-initiator"
- Sends answer back to User A
- Exchange continues until connection established

### 3. WebRTC Connection Established
- Audio/video stream flows directly
- No server in the middle (peer-to-peer)

## Improved VoiceCall Component Example

```jsx
import { useState, useEffect, useRef } from 'react';
import SimplePeer from 'simple-peer';

export function VoiceCall({ currentUser, onEndCall, friendId }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [remoteStream, setRemoteStream] = useState(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const wsRef = useRef(null);

  // Setup WebRTC Connection
  useEffect(() => {
    setupCall();
    return () => endCall();
  }, []);

  const setupCall = async () => {
    try {
      // Get user's camera and microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection as initiator
      const peer = new SimplePeer({
        initiator: true,
        trickleIce: true,
        stream: stream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      peer.on('signal', (data) => {
        // Send signaling data to other user through WebSocket
        if (wsRef.current) {
          wsRef.current.send(JSON.stringify({
            type: 'signal',
            to: friendId,
            data: data
          }));
        }
      });

      peer.on('stream', (stream) => {
        setRemoteStream(stream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
      });

      peerRef.current = peer;

      // Setup WebSocket for signaling
      setupWebSocket();

      // Start call duration timer
      const timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    } catch (error) {
      console.error('Failed to setup call:', error);
      alert('Camera/microphone access denied');
    }
  };

  const setupWebSocket = () => {
    const ws = new WebSocket(`ws://localhost:8000/ws/${currentUser.id}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      wsRef.current = ws;
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'signal' && peerRef.current) {
        // Receive signaling data from other user
        peerRef.current.signal(message.data);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsCameraOn(!isCameraOn);
    }
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false
      });

      const screenTrack = screenStream.getVideoTracks()[0];
      const sender = peerRef.current._pc
        .getSenders()
        .find((s) => s.track && s.track.kind === 'video');

      if (sender) {
        await sender.replaceTrack(screenTrack);

        screenTrack.onended = async () => {
          const videoTrack = localStreamRef.current.getVideoTracks()[0];
          await sender.replaceTrack(videoTrack);
        };
      }
    } catch (error) {
      console.error('Failed to share screen:', error);
    }
  };

  const endCall = () => {
    // Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Close peer connection
    if (peerRef.current) {
      peerRef.current.destroy();
    }

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
    }

    onEndCall();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 bg-black flex flex-col">
      {/* Call Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-white">
            Call with {/* friend name */}
          </h3>
          <p className="text-sm text-gray-400">{formatTime(callDuration)}</p>
        </div>
        <button
          onClick={endCall}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-semibold"
        >
          📞 End Call
        </button>
      </div>

      {/* Video Grid */}
      <div className="flex-1 flex gap-4 p-4">
        {/* Local Video */}
        <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden relative">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm text-white">
            {currentUser.username} (You)
          </div>
        </div>

        {/* Remote Video */}
        <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden relative">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl">📞</span>
                </div>
                <p className="text-white">Connecting...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 border-t border-gray-700 p-4 flex justify-center gap-4">
        <button
          onClick={toggleMute}
          className={`px-6 py-3 rounded-full font-semibold transition ${
            isMuted
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          {isMuted ? '🔇' : '🎤'} Mute
        </button>

        <button
          onClick={toggleCamera}
          className={`px-6 py-3 rounded-full font-semibold transition ${
            !isCameraOn
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          {isCameraOn ? '📹' : '❌'} Camera
        </button>

        <button
          onClick={startScreenShare}
          className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-semibold"
        >
          🖥️ Share Screen
        </button>
      </div>
    </div>
  );
}
```

## STUN/TURN Servers

The config includes Google's free STUN servers:
```javascript
{
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
}
```

For production with NAT/firewall issues, consider TURN servers:
- Twilio (free trial available)
- Xirsys
- TURN server by your hosting provider

## Troubleshooting Calls

### "Camera/microphone access denied"
- Check browser permissions (top-left address bar)
- Grant access to camera and microphone

### "Connection timeout"
- Ensure backend WebSocket is running
- Check firewall settings
- Try different STUN servers

### Audio/video lags
- Reduce video resolution
- Close other bandwidth-heavy apps
- Move closer to router

### One-way audio/video
- Check if both users granted permissions
- Verify STUN server is reachable
- Try TURN server for NAT issues

## Testing Locally

1. Open two browser windows/tabs
2. Create two test accounts
3. Have them call each other
4. Open DevTools Console to see connection logs

## Group Calls (30 people)

For 30-person calls, you'll need:

```javascript
// User 1 connects to User 2
// User 2 connects to User 3
// User 3 connects to User 4... (mesh network)
// OR use a media server (more complex)

// Each user creates a peer for every other user
const peers = new Map();
for (let other of otherUsers) {
  const peer = new SimplePeer({ ...config });
  peers.set(other.id, peer);
}
```

This creates a "mesh" - everyone connects to everyone. Works up to ~8-10 people comfortably.

For 30+ people, use a media server like:
- Janus Gateway (open source)
- Kurento (open source)
- Twilio (commercial)
- AWS Chime (commercial)

## Resources

- Simple Peer: https://github.com/feross/simple-peer
- WebRTC: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
- Media Devices: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices

Start simple with 1-on-1 calls, then expand! 🎥
