import puppeteer from 'puppeteer'
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import uniquid from 'uniqid'
import gTTS from 'gtts';

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

    try {
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
            {
                inputs: text,
                parameters: {
                    max_length: 150,
                    min_length: 50,
                    do_sample: false,
                }
            },
            {
                headers: {
                    "Authorization": `Bearer ${API_TOKEN}`,
                    "Content-Type": "application/json",
                }
            }
        );

        const result = response.data;
        console.log("got");
        
        if (Array.isArray(result) && result.length > 0) {
            return result[0].summary_text;
        }
        
        throw new Error('Invalid response from API');

    } catch (error) {
        console.error('Summarization error:', error);
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
            responseType: 'arraybuffer'
        });
        
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

async function generateVoiceOver(text, index, storiesDir) {
    return new Promise((resolve, reject) => {
        console.log(index, text);
        const filePath = path.join(storiesDir, `voice-${index + 1}.mp3`);
        const gtts = new gTTS(text, 'en');

        gtts.save(filePath, (err) => {
            if (err) {
                reject(new Error(`Failed to save voiceover: ${err.message}`));
            } else {
                resolve(filePath);
            }
        });
    });
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
        const wordsPerChunk = 600;
        const words = scrapedText.split(" ");
        const chunks = [];

        if(words.length <= 1800) {
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
        
        const images = await Promise.all(
            summarise.map( async (summary) => {
                return await generateImages(summary);
            })
        )
        
        const storiesDir = await saveStoriesToFile(summarise, images, url);
        console.log("stories directory", storiesDir)

        try {
            console.log("Generating voiceovers...");
            const voiceoverFiles = await Promise.all(
                summarise.map((summary, index) => generateVoiceOver(summary, index, storiesDir))
            );
            console.log("All voiceovers generated:", voiceoverFiles);
        } catch (error) {
            console.error("Error generating voiceovers:", error);
        }
        

        res.status(200).json({
            success: true,
            message: "Content extracted successfully",
            summarise: summarise,
            images: images
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export { summarize };