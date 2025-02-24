import FormData from "form-data";
import axios from "axios";
import userModel from "../models/user.model.js";
import { fal } from "@fal-ai/client";

// const generateImage = async (req, res) => {
//     try {

//         const {userId, prompt} = req.body;

//         const user = await userModel.findById(userId);
//         if(!user || !prompt) {
//             return res.status(400).json({success : false, message : "Missing details"});
//         }

//         if(user.creditBalance < 1 || userModel.creditBalance < 0) {
//             return res.status(400).json({success : false, message : "Insufficient credits", creditBalance : user.creditBalance});
//         }

//         const formData = new FormData();
//         formData.append("prompt", prompt);

//         const {data} = await axios.post('https://clipdrop-api.co/text-to-image/v1', formData, {
//             headers: {
//                 'x-api-key': process.env.CLIPDROP_API_KEY,
//             },
//             responseType: 'arraybuffer'
//         })

//         const base64Image = Buffer.from(data, 'binary').toString('base64');
//         const resultImage = `data:image/png;base64,${base64Image}`;

//         await userModel.findByIdAndUpdate(user._id, {creditBalance : user.creditBalance - 1});

//         res.json({success : true, message : "Image generated", resultImage : resultImage, creditBalance : user.creditBalance - 1});
        
//     } catch (error) {
//         console.error("Error in generating image", error);
//         res.status(500).json({success : false, message : error.message});
//     }
// }

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

        const result = await fal.subscribe("fal-ai/recraft-20b", {
            input: {
                prompt: prompt
            },
            logs: true,
            onQueueUpdate: (update) => {
                if(update.status === "IN_PROGRESS") {
                    update.logs.map((log) => log.message).forEach(console.log);
                }
            }
        })

        if (!result.data || !result.data.images || result.data.images.length === 0) {
            return res.status(500).json({ success: false, message: "Failed to generate image" });
        }
        const imageUrl = result.data.images[0].url;

        await userModel.findByIdAndUpdate(user._id, {creditBalance : user.creditBalance - 1});

        res.json({success : true, message : "Image generated", resultImage : imageUrl,  creditBalance : user.creditBalance - 1});
        
    } catch (error) {
        console.error("Error in generating image", error);
        res.status(500).json({success : false, message : error.message});
    }
}

export { generateImage };