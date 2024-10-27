import axios from "axios"; // Use axios instead of request (more modern)

export const getNutritionInfo = async (req, res) => {
    try {
        const { query } = req.query;
        
        const response = await axios.get('https://api.calorieninjas.com/v1/nutrition', {
            params: { query },
            headers: {
                'X-Api-Key': process.env.CALORIE_NINJA_API_KEY
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching nutrition info:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching nutrition information"
        });
    }
};
