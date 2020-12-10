import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = {
    GOOGLE_API_KEY: "AIza-your-api-key" /* change it to your Google Map API key */,
    MAPBOX_API_KEY: "pk.eyJ1-your-api-key" /* change it to your MAPBOX API key */,
    LOG_FILE_PATH: "logs/"
}

export { config };