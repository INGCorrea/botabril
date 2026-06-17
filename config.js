/**
 * Configuración central del bot
 */

require('dotenv').config();

const config = {
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
        // En AWS EC2, dejar vacío para usar navegador del sistema
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
    },
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000
};

module.exports = config;
