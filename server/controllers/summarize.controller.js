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
    const API_TOKEN = process.env.HUGGINGFACE_API_KEY;
    
    const prompt = `You are an expert storyteller. Summarize the following text in exactly 50 words as a seamless, engaging short story.Start directly with the story—no introductions, summaries, titles, phrases like "Here’s", "Goes:", "Summary:", "Revised version:", or any meta-language. Write in a natural, human-like tone with smooth flow. End naturally with a period:

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
                timeout: 60000
            }
        );

        if (Array.isArray(response.data) && response.data.length > 0) {
            let summary = response.data[0].generated_text
                .trim()
                .replace(/^(Goes:|The revised version:|Summary:|Here's\s*(an?|my)?\s*(example|try|attempt|summary)?:?|Let me\s*(try|summarize)?:?|I'll\s*(try|summarize)?:?)/i, '')
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
                inputs: `${prompt}, hyper-realistic, cinematic lighting, soft shadows, high-definition quality, sharp focus, intricate textures, photorealistic skin tones, natural lighting, shallow depth of field, vibrant color contrast, detailed background, professional photography quality`
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

        //summarization using hugging face
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
            storiesDir
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