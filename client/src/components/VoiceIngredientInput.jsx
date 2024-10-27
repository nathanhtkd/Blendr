import { useState, useRef } from 'react';
import { Mic, Square, Loader } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import toast from 'react-hot-toast';

const VoiceIngredientInput = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const { updateProfile } = useUserStore();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudioData(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const processAudioData = async (audioBlob) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-large-v3');
      formData.append('language', 'en');

      const transcriptionResponse = await fetch(
        'https://api.groq.com/openai/v1/audio/transcriptions', 
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          },
          body: formData,
        }
      );

      const { text } = await transcriptionResponse.json();
      setTranscriptionText(text);  // Set the transcription text to display

      // Process transcription for ingredient parsing
      const chatResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [
            { role: 'system', content: 'Parse ingredients into JSON format.' },
            { role: 'user', content: text },
          ],
        }),
      });

      const chatResult = await chatResponse.json();
      const parsedIngredients = JSON.parse(chatResult.choices[0].message.content);

      // Update user profile with ingredients
      const currentUser = await fetch('/api/user/profile').then((res) => res.json());
      const updatedIngredients = [...(currentUser.ingredientsList || []), ...parsedIngredients.ingredientsList];
      await updateProfile({ ingredientsList: updatedIngredients });

      toast.success('Ingredients updated successfully!');
    } catch {
      toast.error('Failed to process ingredients');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`p-4 rounded-full ${
          isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-pink-500 hover:bg-pink-600'
        } text-white transition-colors focus:outline-none`}
      >
        {isProcessing ? <Loader className="h-6 w-6 animate-spin" /> : isRecording ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
      </button>
      <p className="text-sm text-gray-600">
        {isProcessing ? 'Processing...' : isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
      </p>
      {transcriptionText && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg max-w-md w-full">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Transcription:</h3>
          <p className="text-gray-600">{transcriptionText}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceIngredientInput;