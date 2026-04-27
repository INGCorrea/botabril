/**
 * Configuración central del bot
 */

require('dotenv').config();

const config = {
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || 
                       'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
    },
    nodeEnv: process.env.NODE_ENV || 'development'
};

module.exports = config;
