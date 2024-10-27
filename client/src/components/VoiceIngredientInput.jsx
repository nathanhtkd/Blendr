import { useState, useRef } from 'react';
import { Mic, Square, Loader } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

const VoiceIngredientInput = () => {
  const { authUser } = useAuthStore();
  const { updateProfile } = useUserStore();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Validation function for ingredient structure
  const isValidIngredient = (ingredient) => {
    return (
      ingredient &&
      typeof ingredient === 'object' &&
      typeof ingredient.ingredient === 'string' &&
      typeof ingredient.quantity === 'string' &&
      ingredient.ingredient.trim() !== '' &&
      ingredient.quantity.trim() !== ''
    );
  };

  // Extract valid JSON from potential text output
  const extractJsonFromText = (text) => {
    try {
      // Find JSON-like structure within the text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;
      
      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      
      // Validate the structure matches our expected format
      if (!parsed || !Array.isArray(parsed.ingredientsList)) {
        return null;
      }

      // Filter out invalid ingredients
      const validIngredients = parsed.ingredientsList.filter(isValidIngredient);
      
      return {
        ingredientsList: validIngredients
      };
    } catch (error) {
      console.error('JSON parsing error:', error);
      return null;
    }
  };

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
      // First get the transcription using Deepgram
      const formData = new FormData();
      formData.append('file', audioBlob);

      const transcriptionResponse = await fetch(
        'https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true', 
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${import.meta.env.VITE_DEEPGRAM_API_KEY}`,
            'Content-Type': 'audio/webm',
          },
          body: audioBlob,
        }
      );

      if (!transcriptionResponse.ok) {
        throw new Error('Transcription failed');
      }

      const data = await transcriptionResponse.json();
      console.log('Deepgram response:', data); // Add debug logging
      const text = data.results?.channels[0]?.alternatives[0]?.transcript || '';
      console.log('Transcription text:', text); // Add debug logging
      setTranscriptionText(text);

      // Enhanced prompt for more reliable JSON output
      const chatResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [
            { 
              role: 'system', 
              content: `Parse ingredients into JSON format. Your response must ONLY contain valid JSON matching this exact structure, with no additional text or explanation:
              {
                "ingredientsList": [
                  { "ingredient": "item name", "quantity": "amount" }
                ]
              }
              If you cannot determine any ingredients at all, respond with exactly "VOID".
              If you can identify an ingredient but not its quantity, use "unknown" as the quantity.
              Do not make up or guess quantities if they are not clearly stated.
              Do not include any markdown formatting, comments, or explanations. Return only the JSON object or "VOID".`
            },
            { role: 'user', content: text },
          ],
          temperature: 0.3, // Lower temperature for more consistent output
        }),
      });

      if (!chatResponse.ok) {
        throw new Error('Failed to process ingredients with LLM');
      }

      const chatResult = await chatResponse.json();
      const llmOutput = chatResult.choices[0].message.content;
      
      // Handle VOID response
      if (llmOutput.trim() === 'VOID') {
        throw new Error('Could not detect any ingredients in the audio');
      }
      
      // Extract and validate JSON from LLM output
      const parsedIngredients = extractJsonFromText(llmOutput);
      
      if (!parsedIngredients || parsedIngredients.ingredientsList.length === 0) {
        throw new Error('Invalid or empty ingredients list received');
      }

      // Update using existing ingredients from authUser
      const currentIngredients = authUser?.ingredientsList || [];
      const updatedIngredients = [...currentIngredients, ...parsedIngredients.ingredientsList];
      
      await updateProfile({ ingredientsList: updatedIngredients });
      toast.success(`Added ${parsedIngredients.ingredientsList.length} ingredients successfully!`);
    } catch (error) {
      console.error('Processing Error:', error);
      toast.error(error.message || 'Failed to process ingredients');
      setTranscriptionText('Error: ' + error.message); // Show error in transcription
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
        } text-white transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isProcessing ? <Loader className="h-6 w-6 animate-spin" /> : isRecording ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
      </button>
      <p className="text-sm text-gray-600">
        {isProcessing ? 'Processing...' : isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
      </p>
      <div className="mt-4 p-4 bg-gray-50 rounded-lg max-w-md w-full">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Transcription:</h3>
        <p className="text-gray-600">
          {transcriptionText || 'No transcription available'}
        </p>
      </div>
    </div>
  );
};

export default VoiceIngredientInput;
