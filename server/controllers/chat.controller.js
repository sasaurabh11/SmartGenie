import axios from 'axios'

const chatController = async (req, res) => {
    try {
        const {question} = req.body;

        if(!question) {
            res.status(400).json({success : false, message : "Question is required"});
        }

        const response = await axios.post(
            'https://api-inference.huggingface.co/models/meta-llama/Llama-3.3-70B-Instruct',
            {inputs: question},
            {
                headers: {
                    Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`
                }
            }
        )

        const result = response.data;
        console.log(result);

        res.status(200).json({success: true, answer: result[0].generated_text});

    } catch (error) {
        console.error("error in chatController", error);
        res.status(500).json({success: false, message: "Internal Server Error"});
    }
}

export {chatController}