import { useEffect, useState } from 'react';
import { Room } from 'livekit-client'; // Removed RoomEvent as it was not used
import { useAuthStore } from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';
import { Mic, MicOff, Loader } from 'lucide-react';
import axios from 'axios';

const VoiceIngredientInput = () => {
  const [room, setRoom] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  // Removed authUser and updateProfile as they were not used

  const fetchVoiceAgentToken = async () => {
    try {
      const response = await axios.get('/voice-agent/token');
      return response.data.token;
    } catch (error) {
      console.error('Failed to fetch voice agent token:', error);
      throw error;
    }
  };

  const connectToVoiceAgent = async () => {
    try {
      setIsConnecting(true);
      // In a real implementation, you would fetch this token from your server
      const token = await fetchVoiceAgentToken();
      
      const newRoom = new Room();
      await newRoom.connect(window.env.NEXT_PUBLIC_LIVEKIT_URL, token); // Changed process.env to window.env
      
      // Enable local audio
      await newRoom.localParticipant.enableAudio();
      
      setRoom(newRoom);
      setIsListening(true);
    } catch (error) {
      console.error('Failed to connect to voice agent:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectFromVoiceAgent = async () => {
    if (room) {
      await room.disconnect();
      setRoom(null);
      setIsListening(false);
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      disconnectFromVoiceAgent();
    } else {
      connectToVoiceAgent();
    }
  };

  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={toggleVoiceInput}
        disabled={isConnecting}
        className={`p-4 rounded-full ${
          isListening ? 'bg-pink-500' : 'bg-gray-200'
        } transition-colors duration-200`}
      >
        {isConnecting ? (
          <Loader className="w-6 h-6 animate-spin text-gray-600" />
        ) : isListening ? (
          <Mic className="w-6 h-6 text-white" />
        ) : (
          <MicOff className="w-6 h-6 text-gray-600" />
        )}
      </button>
      <p className="text-sm text-gray-600">
        {isConnecting
          ? 'Connecting to voice assistant...'
          : isListening
          ? 'Listening... Tell me what ingredients you have'
          : 'Click to start voice input'}
      </p>
    </div>
  );
};

export default VoiceIngredientInput;
