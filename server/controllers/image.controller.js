import axios from "axios";
import userModel from "../models/user.model.js";

const generateImage = async (req, res) => {
    try {

        const {userId, prompt} = req.body;

        const user = await userModel.findById(userId);
        if(!user || !prompt) {
            return res.status(400).json({success : false, message : "Missing details"});
        }

        if(user.creditBalance < 1 || userModel.creditBalance < 0) {
            return res.status(400).json({success : false, message : "Insufficient credits", creditBalance : user.creditBalance});
        }

        const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}`;

        const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });

        if (!imageResponse || imageResponse.status !== 200 || !imageResponse.data) {
            return res.status(500).json({
                success: false,
                message: "Failed to generate image"
            });
        }

        await userModel.findByIdAndUpdate(user._id, { creditBalance: user.creditBalance - 1 });

        res.json({
            success: true,
            message: "Image generated",
            resultImage: imageUrl,
            creditBalance: user.creditBalance - 1
        });
        
    } catch (error) {
        console.error("Error in generating image", error);
        res.status(500).json({success : false, message : error.message});
    }
}

export { generateImage };