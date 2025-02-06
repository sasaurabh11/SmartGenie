import puppeteer from 'puppeteer'
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import uniquid from 'uniqid'
import AWS from 'aws-sdk'

async function scrapeWebsite(url) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const text = await page.evaluate(() => document.body.innerText);
    await browser.close();

    return text.replace(/\s+/g, " ").trim();
}

async function summarizeText(text) {
    const API_TOKEN = process.env.HUGGINGFACE_API_KEY;
    
    const prompt = `Create a direct, clear narrative summary of the following text in exactly 50 words. 
    Present it as a standalone story without any introductory phrases like "here's" or "let me try". 
    Focus on the key information in an engaging, story-like format. Use natural, human-friendly language:

    ${text}

    Remember: The summary must be exactly 50 words or less while maintaining a natural flow and including key information.`;

    try {
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
            {
                inputs: prompt,
                parameters: {
                    max_new_tokens: 100,
                    temperature: 0.6,
                    top_p: 0.85,
                    do_sample: true,
                    return_full_text: false,
                    repetition_penalty: 1.2
                }
            },
            {
                headers: {
                    "Authorization": `Bearer ${API_TOKEN}`,
                    "Content-Type": "application/json",
                },
                timeout: 30000
            }
        );

        if (Array.isArray(response.data) && response.data.length > 0) {
            let summary = response.data[0].generated_text
                .trim()
                .replace(/^(Here'?s?\s*(an?|my)?\s*(example|try|attempt|summary)?:?\s*)/i, '')
                .replace(/^Let me\s*(try|summarize|summarise)?:?\s*/i, '')
                .replace(/^I'll\s*(try|summarize|summarise)?:?\s*/i, '')
                .replace(/\n+/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            
            summary = summary.charAt(0).toUpperCase() + summary.slice(1);
            
            if (!summary.match(/[.!?]$/)) {
                summary += '.';
            }
            
            const words = summary.split(/\s+/);
            if (words.length > 50) {
                const sentences = summary.match(/[^.!?]+[.!?]+/g) || [];
                summary = '';
                let currentWordCount = 0;
                
                for (const sentence of sentences) {
                    const sentenceWordCount = sentence.trim().split(/\s+/).length;
                    if (currentWordCount + sentenceWordCount <= 50) {
                        summary += sentence;
                        currentWordCount += sentenceWordCount;
                    } else {
                        break;
                    }
                }
            }
            
            return summary.trim();
        }
        
        throw new Error('Invalid response from API');

    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            throw new Error('Request timed out. Please try again.');
        }
        
        if (error.response?.data) {
            console.error('API Error Response:', JSON.stringify(error.response.data, null, 2));
        }
        
        throw new Error('Failed to generate summary: ' + 
            (error.response?.data?.error || error.message));
    }
}

async function generateImages(prompt) {
    const API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";
    const API_TOKEN = process.env.HUGGINGFACE_API_KEY;

    try {
        const response = await axios({
            url: API_URL,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${API_TOKEN}`,
            },
            data: { 
                inputs: prompt 
            },
            responseType: 'arraybuffer',
            timeout: 60000,
        });

        console.log('Image generated:', response.data.length, 'bytes');
        
        const base64Image = Buffer.from(response.data, 'binary').toString('base64');
        return base64Image;

    } catch (error) {
        if (error.response) {
            console.error('API Error:', error.response.data.toString());
        }
        console.error('Error generating images:', error);
        throw new Error('Failed to generate Image');
    }
}

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1'
});

const polly = new AWS.Polly();

async function generateVoiceOver(text, index, storiesDir) {
    try {
        console.log("Starting voice generation...");
        const speechMarkParams = {
            Engine: 'neural',
            LanguageCode: 'en-IN',  // Changed to Indian English
            OutputFormat: 'json',
            SpeechMarkTypes: ['word'],
            Text: text,
            VoiceId: 'Kajal'  // Changed to Indian female voice
        };

        const speechMarkResponse = await polly.synthesizeSpeech(speechMarkParams).promise();

        console.log("speechmark response", speechMarkResponse)

        const speechMarks = speechMarkResponse.AudioStream.toString()
            .split('\n')
            .filter(Boolean)
            .map(line => JSON.parse(line));

        const timingData = speechMarks.map((mark, index) => {
            const nextMark = speechMarks[index + 1];
            return {
                word: mark.value,
                startTime: mark.time / 1000, // Convert to seconds
                endTime: nextMark 
                    ? nextMark.time / 1000  // Use next word's start time as current word's end time
                    : (mark.time + mark.duration) / 1000  // For last word, use duration
            };
        });

        const audioParams = {
            Engine: 'neural',
            LanguageCode: 'en-IN',  // Changed to Indian English
            OutputFormat: 'mp3',
            Text: text,
            VoiceId: 'Kajal'  // Changed to Indian female voice
        };

        const audioResponse = await polly.synthesizeSpeech(audioParams).promise();

        console.log("audioResponse ", audioResponse)

        const audioFilePath = path.join(storiesDir, `voice-${index + 1}.mp3`);
        await fs.writeFile(audioFilePath, audioResponse.AudioStream);

        const timingFilePath = path.join(storiesDir, `voice-${index + 1}-timing.json`);
        await fs.writeFile(timingFilePath, JSON.stringify(timingData, null, 2));

        return {
            audioFile: audioFilePath,
            timingFile: timingFilePath,
            timing: timingData
        };

    } catch (error) {
        console.error("Error details:", error);
        throw new Error(`Failed to generate voiceover with timing: ${error.message}`);
    }
}

async function saveStoriesToFile(stories, images, url) {
    try {        
        const baseDir = path.join(process.cwd(), 'stories');
        await fs.mkdir(baseDir, { recursive: true });

        const uniqueDir = uniquid();
        const storiesDir = path.join(baseDir, uniqueDir);
        await fs.mkdir(storiesDir, { recursive: true });
        
        await Promise.all(stories.map((story, index) => {
            const fileName = `story-${index + 1}.txt`;
            return fs.writeFile(
                path.join(storiesDir, fileName),
                story
            )
        }))

        await Promise.all(images.map(async (base64Image, index) => {
            const imageBuffer = Buffer.from(base64Image, 'base64');
            const imagePath = path.join(storiesDir, `image-${index + 1}.png`);
            await fs.writeFile(imagePath, imageBuffer);
        }));

        await fs.writeFile(
            path.join(storiesDir, 'metadata.json'),
            JSON.stringify({
                url,
                timestamp: new Date().toISOString(),
                storyCount: stories.length
            }, null, 2)
        );

        return storiesDir;

    } catch (error) {
        console.error('Error saving stories:', error);
        throw new Error('Failed to save stories to file');
    }
}

const summarize = async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ success: false, message: "URL is required" });
        }

        const scrapedText = await scrapeWebsite(url);

        //create chunk of scraped data
        const wordsPerChunk = 5000;
        const words = scrapedText.split(" ");
        const chunks = [];

        if(words.length <= 15000) {
            const chunkSize = Math.ceil(words.length / 3);
            for (let i = 0; i < 3; i++) {
                chunks.push(words.slice(i * chunkSize, (i + 1) * chunkSize).join(" "));
            }
        }
        else {
            for (let i = 0; i < 3; i++) {
                chunks.push(words.slice(i * wordsPerChunk, (i + 1) * wordsPerChunk).join(" "));
            }
        }

        const summarise = await Promise.all(
            chunks.map(async (chunk) => {
                return await summarizeText(chunk);
            })
        )

        console.log(summarise)
        
        const images = await Promise.all(
            summarise.map( async (summary) => {
                return await generateImages(summary);
            })
        )
        
        const storiesDir = await saveStoriesToFile(summarise, images, url);
        console.log("stories directory", storiesDir)

        console.log("Generating voiceovers...");
        const voiceoverFiles = await Promise.all(
            summarise.map( async (summary, index) => await generateVoiceOver(summary, index, storiesDir))
        );
        console.log("All voiceovers generated:", voiceoverFiles);
        

        res.status(200).json({
            success: true,
            message: "Content extracted successfully",
            summarise: summarise,
            // images: images
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export { summarize };