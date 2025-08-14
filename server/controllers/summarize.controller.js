import puppeteer, { executablePath } from 'puppeteer'
import fs from 'fs';
import * as fsPromises from 'fs/promises';
import path from 'path';
import axios from 'axios';
import uniquid from 'uniqid'
import AWS from 'aws-sdk'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegpath from 'ffmpeg-static'
import ffprobePath from 'ffprobe-static'
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import userModel from '../models/user.model.js';
import { GoogleGenAI } from "@google/genai";
import { RAGSystem } from '../utils/ragSystem.js';

const rag_system = new RAGSystem();
await rag_system.init()

async function scrapeWebsite(url) {
    const browser = await puppeteer.launch({ headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ],
          executablePath:
            process.env.NODE_ENV === "production"
              ? process.env.PUPPETEER_EXECUTABLE_PATH
              : puppeteer.executablePath(),
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const text = await page.evaluate(() => document.body.innerText);
    await browser.close();

    return text.replace(/\s+/g, " ").trim();
}

async function summarizeText(text) {
    const API_KEY = process.env.GOOGLE_API_KEY;
    
    if (!API_KEY) {
        throw new Error('GOOGLE_API_KEY environment variable is required');
    }
    
    const prompt = `Transform the following text into a compelling 50-word story. Write as if you're telling someone an engaging tale - use vivid language, maintain narrative flow, and capture the essence dramatically. 

Rules:
- Exactly 50 words or fewer
- Start immediately with the story (no preambles)
- Write in third person or narrative style
- Include the most crucial elements
- End with proper punctuation
- Make it read like a mini-story, not a summary

Text to transform:
${text}

Story:`;

    try {

        const ai = new GoogleGenAI({apiKey: API_KEY});

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            generationConfig: {
                temperature: 0.7,
                topP: 0.8,
                topK: 40,
                maxOutputTokens: 150,
                stopSequences: []
            }
        });

        let summary = response.text;

        summary = summary
            .trim()
            .replace(/^(Story:|Here's|This is|Summary:)/i, '')
            .replace(/\n+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        
        if (summary.length > 0) {
            summary = summary.charAt(0).toUpperCase() + summary.slice(1);
        }

        // Ensure proper ending punctuation
        if (!summary.match(/[.!?]$/)) {
            summary += '.';
        }

        // Enforce 50-word limit
        const words = summary.split(/\s+/);
        if (words.length > 50) {
            // Try to cut at sentence boundaries first
            const sentences = summary.match(/[^.!?]+[.!?]+/g) || [];
            let truncated = '';
            let wordCount = 0;
            
            for (const sentence of sentences) {
                const sentenceWords = sentence.trim().split(/\s+/).length;
                if (wordCount + sentenceWords <= 50) {
                    truncated += sentence;
                    wordCount += sentenceWords;
                } else {
                    break;
                }
            }
            
            // If no complete sentences fit, truncate at word boundary
            if (truncated.trim().length === 0) {
                truncated = words.slice(0, 50).join(' ') + '.';
            }
            
            summary = truncated.trim();
        }

        return summary;

    } catch (error) {
        console.error('Gemini API Error:', error);
        
        if (error.message?.includes('API key')) {
            throw new Error('Invalid API key. Please check your GOOGLE_GEMINI_API_KEY.');
        }
        
        if (error.message?.includes('quota')) {
            throw new Error('API quota exceeded. Please try again later.');
        }
        
        if (error.message?.includes('safety')) {
            throw new Error('Content was blocked due to safety filters. Please try different text.');
        }
        
        throw new Error(`Failed to generate summary: ${error.message || 'Unknown error'}`);
    }
}

async function generateImages(prompt) {
    const API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";
    const API_TOKEN = process.env.HUGGINGFACE_API_KEY;

    try {
        const response = await axios.post(API_URL, 
            { 
                inputs: `${prompt}, hyper-realistic, cinematic lighting, soft shadows, high-definition quality, sharp focus, intricate textures, photorealistic skin tones, natural lighting, shallow depth of field, vibrant color contrast, detailed background, professional photography quality`
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`,
                    'Accept': 'image/png',
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer',
                timeout: 60000,
            }
        );

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
            LanguageCode: 'en-IN',  
            OutputFormat: 'json',
            SpeechMarkTypes: ['word', 'sentence'],
            Text: text,
            VoiceId: 'Kajal' 
        };

        const speechMarkResponse = await polly.synthesizeSpeech(speechMarkParams).promise();

        console.log("speechmark response", speechMarkResponse)

        const speechMarks = speechMarkResponse.AudioStream.toString()
            .split('\n')
            .filter(Boolean)
            .map(line => JSON.parse(line));

        const wordMarks = speechMarks.filter(mark => mark.type === 'word');

        const timingData = wordMarks.map((mark, index) => {
            const nextMark = wordMarks[index + 1];
            const currentDuration = mark.duration / 1000;
            
            const startTime = mark.time / 1000;
            
            const endTime = nextMark 
                ? nextMark.time / 1000 
                : mark.duration 
                    ? (mark.time + mark.duration) / 1000 
                    : startTime + 0.3;
            
            return {
                word: mark.value,
                startTime: parseFloat(startTime.toFixed(3)),
                endTime: parseFloat(endTime.toFixed(3)),
                duration: parseFloat((endTime - startTime).toFixed(3))
            };
        });

        const totalDuration = parseFloat(timingData[timingData.length - 1].endTime.toFixed(3));

        const audioParams = {
            Engine: 'neural',
            LanguageCode: 'en-IN', 
            OutputFormat: 'mp3',
            Text: text,
            VoiceId: 'Kajal' 
        };

        const audioResponse = await polly.synthesizeSpeech(audioParams).promise();

        console.log("audioResponse ", audioResponse)

        const audioFilePath = path.join(storiesDir, `voice-${index + 1}.mp3`);
        await fsPromises.writeFile(audioFilePath, audioResponse.AudioStream);

        const timingFilePath = path.join(storiesDir, `voice-${index + 1}-timing.json`);
        await fsPromises.writeFile(timingFilePath, JSON.stringify({words : timingData, totalDuration: totalDuration}, null, 2));

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
        await fsPromises.mkdir(baseDir, { recursive: true });

        const uniqueDir = uniquid();
        const storiesDir = path.join(baseDir, uniqueDir);
        await fsPromises.mkdir(storiesDir, { recursive: true });
        
        await Promise.all(stories.map((story, index) => {
            const fileName = `story-${index + 1}.txt`;
            return fsPromises.writeFile(
                path.join(storiesDir, fileName),
                story
            )
        }))

        await Promise.all(images.map(async (base64Image, index) => {
            const imageBuffer = Buffer.from(base64Image, 'base64');
            const imagePath = path.join(storiesDir, `image-${index + 1}.png`);
            await fsPromises.writeFile(imagePath, imageBuffer);
        }));

        await fsPromises.writeFile(
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
        const {userId, url} = req.body;

        const user = await userModel.findById(userId);

        if (!user || !url) {
            return res.status(400).json({ success: false, message: "Missing details" });
        }

        if(user.creditBalance < 2 || userModel.creditBalance < 0) {
            return res.status(400).json({success : false, message : "Insufficient credits", creditBalance : user.creditBalance});
        }

        const scrapedText = await scrapeWebsite(url);

        const docId = `doc_${Buffer.from(url).toString("base64").replace(/=/g, "")}`;

        const chunksAdded = await rag_system.addDocument(docId, scrapedText, { source: url });
        console.log(`Added ${chunksAdded} chunks to RAG for ${url}`);

        //create chunk of scraped data
        const wordsPerChunk = 10000;
        const words = scrapedText.split(" ");
        const chunks = [];

        if(words.length <= 30000) {
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

        //summarization using hugging face
        const summarise = await Promise.all(
            chunks.map(async (chunk) => {
                return await summarizeText(chunk);
            })
        )
        
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
            storiesDir,
            docId
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


ffmpeg.setFfmpegPath(ffmpegpath)
ffmpeg.setFfprobePath(ffprobePath.path)

const buildVideo = async (req, res) => {
    try {
        const {userId, dir} = req.body;
        console.log(dir)

        const user = await userModel.findById(userId);

        if (!dir || !user) { 
            res.status(500).json({ success: false, message: "something wrong on our side for video creation" });
        }

        if(user.creditBalance < 2 || userModel.creditBalance < 0) {
            return res.status(400).json({success : false, message : "Insufficient credits", creditBalance : user.creditBalance});
        }
    
        const images = ['image-1.png', 'image-2.png', 'image-3.png'];
        const audio = ['voice-1.mp3', 'voice-2.mp3', 'voice-3.mp3'];
        const transcriptions = ['voice-1-timing.json', 'voice-2-timing.json', 'voice-3-timing.json'];
    
        for(let i = 0; i < images.length; i++) {
            const inputImage = path.join(dir, images[i]);
            const inputAudio = path.join(dir, audio[i]);
            const inputTransciption = path.join(dir, transcriptions[i]);

            // read the transcription file
            const transcription = JSON.parse(fs.readFileSync(inputTransciption, 'utf-8'));
            const words = transcription.words;
            const duration = parseFloat(transcription.totalDuration).toFixed(2);

            // Build the drawtext filter string
            let drawtextFilter = '';
            words.forEach(wordInfo => {
                const word = wordInfo.word.replace(/'/g, "’").replace(/"/g, '\"');

                const start = parseFloat(wordInfo.startTime).toFixed(2);
                const end = parseFloat(wordInfo.endTime).toFixed(2);
                drawtextFilter += `drawtext=text='${word}':fontcolor=white:fontsize=96:borderw=4:bordercolor=black:x=(w-text_w)/2:y=(h*3/4)-text_h:enable='between(t\\,${start}\\,${end})',`;
            });
            // remove last comma
            drawtextFilter = drawtextFilter.slice(0, -1);

            console.log(`Processing: ${inputImage} and ${inputAudio}`);

            const outputVideo = path.join(dir, `output-${i + 1}.mp4`);
            await new Promise((resolve, reject) => {
                ffmpeg()
                    .input(inputImage)
                    .loop(duration)
                    .input(inputAudio)
                    .audioCodec('copy')
                    .videoFilter(drawtextFilter)
                    .outputOptions([
                        '-t', duration,
                        '-preset', 'ultrafast',
                        '-vcodec', 'libx264', 
                        '-crf', '28', 
                        '-r', '24',  
                        '-s', '1280x720' 
                    ])
                    .on('error', e => {
                        console.error(e);
                        reject(e);
                    })
                    .on('end', resolve)
                    .save(outputVideo);
                });

            console.log(`${outputVideo} is complete`);
        }

        console.log('Merging 3 videos together');
        await new Promise((resolve, reject) => {
            ffmpeg()
            .input(path.join(dir, 'output-1.mp4'))
            .input(path.join(dir, 'output-2.mp4'))
            .input(path.join(dir, 'output-3.mp4'))
            .outputOptions([
                '-preset', 'ultrafast',
                '-crf', '28',
                '-r', '24',
                '-s', '1280x720'
            ])
            .on('end', resolve)
            .on('error', reject)
            .mergeToFile(path.join(dir, 'final.mp4'));
        });

        console.log('done');

        const cloudinaryResponse = await uploadOnCloudinary(path.join(dir, 'final.mp4'));
        
        fs.rmSync(dir, {recursive: true, force: true})

        if(!cloudinaryResponse) {
            res.status(400).json({success: false, message: "error in uploading in cloudinary"})
        }

        const videoUrl = cloudinaryResponse.url;
        console.log("uploading on cloudinary done!");

        await userModel.findByIdAndUpdate(user._id, {creditBalance : user.creditBalance - 2});

        res.status(200).json({ success: true, videoUrl, creditBalance : user.creditBalance - 2});
    } catch (error) {
        console.error('Error building video:', error);
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export { summarize, buildVideo };