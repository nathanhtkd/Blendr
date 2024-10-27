import { AccessToken } from 'livekit-server-sdk';
import dotenv from 'dotenv';

dotenv.config();

export const getVoiceAgentToken = async (req, res) => {
  try {
    const { user } = req;
    
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    
    if (!apiKey || !apiSecret) {
      throw new Error('LiveKit credentials not configured');
    }

    const token = new AccessToken(apiKey, apiSecret, {
      identity: user._id,
      name: user.name,
    });

    // Add grants for the voice agent room
    token.addGrant({
      room: `ingredients_${user._id}`,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    const jwt = await token.toJwt();

    res.status(200).json({
      success: true,
      token: jwt,
    });
  } catch (error) {
    console.error('Error generating voice agent token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate voice agent token',
    });
  }
};
