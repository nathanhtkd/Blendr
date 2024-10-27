import { useState, useRef } from 'react';
import { Camera, Upload, Loader, X } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

const ImageIngredientInput = () => {
  const { authUser } = useAuthStore();
  const { updateProfile } = useUserStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setIsCameraReady(false);
  };

  const startCamera = async () => {
    console.log('Starting camera...');
    try {
      // First, ensure video element exists
      if (!videoRef.current) {
        console.error('Video element ref not found - aborting camera start');
        return;
      }

      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      console.log('Requesting media stream...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Stream obtained:', stream);
      
      // Set showCamera first to ensure video element is rendered
      setShowCamera(true);
      
      // Small delay to ensure DOM is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (videoRef.current) {
        console.log('Setting video source...');
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        videoRef.current.oncanplay = () => {
          console.log('Video can play, attempting playback...');
          videoRef.current.play()
            .then(() => {
              console.log('Video playback started successfully');
              setIsCameraReady(true);
            })
            .catch(error => {
              console.error('Video play error:', error);
              toast.error('Failed to start camera preview');
            });
        };
      }
    } catch (error) {
      console.error('Camera Error:', error);
      toast.error('Camera access denied. Please check your browser settings and ensure camera permissions are enabled.');
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !isCameraReady) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    setPreviewImage(imageDataUrl);
    stopCamera();
    processImage(imageDataUrl);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        processImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imageData) => {
    setIsProcessing(true);
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "llama-3.2-11b-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Identify only the food ingredients clearly visible in the image. Provide the ingredient name and, if possible, a best-guess quantity. Use appropriate units if needed (e.g., "500g," "250ml") or a simple count if applicable (e.g., "1 apple"). Do not guess or add items not clearly visible. If no ingredients are identifiable, respond with "VOID." If a quantity cannot be estimated, set "quantity" as "unknown." Respond only with the JSON structure below, and do not include any additional text or explanations:

                        {
                        "ingredientsList": [
                            { "ingredient": "item name", "quantity": "estimated amount" }
                        ]
                        }`
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageData
                  }
                }
              ]
            }
          ],
          temperature: 0.0,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      const result = await response.json();
      const parsedIngredients = JSON.parse(result.choices[0].message.content);

      // Check for VOID response
      if (parsedIngredients.ingredientsList[0]?.ingredient === "VOID") {
        throw new Error('No ingredients detected in image');
      }

      // Check for empty ingredients list
      if (!parsedIngredients.ingredientsList || !parsedIngredients.ingredientsList.length) {
        throw new Error('No ingredients detected in image');
      }

      // Update using existing ingredients from authUser
      const currentIngredients = authUser?.ingredientsList || [];
      const updatedIngredients = [...currentIngredients, ...parsedIngredients.ingredientsList];
      
      await updateProfile({ ingredientsList: updatedIngredients });
      toast.success(`Added ${parsedIngredients.ingredientsList.length} ingredients successfully!`);
    } catch (error) {
      console.error('Processing Error:', error);
      toast.error(error.message || 'Failed to process ingredients');
    } finally {
      setIsProcessing(false);
      setPreviewImage(null);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Camera button and file input */}
      {!showCamera && !previewImage && (
        <div className="flex gap-4">
          <button
            onClick={startCamera}
            disabled={isProcessing}
            className="p-4 rounded-full bg-pink-500 hover:bg-pink-600 text-white transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="h-6 w-6" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="p-4 rounded-full bg-pink-500 hover:bg-pink-600 text-white transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="h-6 w-6" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
      )}

      {/* Always render the video element but keep it hidden when not in use */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="hidden w-10 h-10 object-cover"
        style={{ minHeight: '10px' }}
      />

      {/* Camera UI overlay */}
      {showCamera && (
        <div className="flex flex-col gap-2 w-full max-w-md">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full aspect-[4/3] object-cover rounded-lg bg-black"
          />
          
          <div className="flex justify-center gap-4 -mt-14 mb-4 relative z-10">
            <button
              onClick={stopCamera}
              className="p-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              onClick={captureImage}
              disabled={!isCameraReady}
              className="p-2.5 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {previewImage && !isProcessing && (
        <div className="relative w-full max-w-md">
          <img src={previewImage} alt="Preview" className="rounded-lg w-full" />
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-2 right-2 p-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {isProcessing && (
        <div className="flex items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-pink-500" />
        </div>
      )}

      <p className="text-sm text-gray-600">
        {isProcessing ? 'Processing image...' : 'Take a photo or upload an image of your ingredients'}
      </p>
    </div>
  );
};

export default ImageIngredientInput;
