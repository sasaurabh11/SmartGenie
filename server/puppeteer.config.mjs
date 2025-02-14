import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const config = { cacheDirectory: join(__dirname, '.cache', 'puppeteer') };

export default config;
