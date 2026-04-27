/**
 * Generador de QR como imagen
 */

const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const { exec } = require('child_process');

const QR_PATH = path.join(__dirname, '..', 'qr.png');

const generateQRImage = async (qrText) => {
    try {
        // Generar imagen PNG del QR
        await QRCode.toFile(QR_PATH, qrText, {
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            width: 500
        });

        console.log('✅ Código QR generado: qr.png');
        console.log('📱 Escanea la imagen con WhatsApp para autenticar el bot\n');

        // Abrir la imagen automáticamente
        openQRImage();

        return QR_PATH;
    } catch (error) {
        console.error('❌ Error generando QR:', error.message);
        throw error;
    }
};

const openQRImage = () => {
    try {
        const platform = process.platform;
        let command;

        if (platform === 'win32') {
            command = `start "" "${QR_PATH}"`;
        } else if (platform === 'darwin') {
            command = `open "${QR_PATH}"`;
        } else {
            command = `xdg-open "${QR_PATH}"`;
        }

        exec(command, (error) => {
            if (error) {
                console.log(`⚠️  No se pudo abrir automáticamente. Abre manualmente: ${QR_PATH}`);
            }
        });
    } catch (error) {
        console.error('⚠️  Error abriendo QR:', error.message);
    }
};

const deleteQRImage = () => {
    try {
        if (fs.existsSync(QR_PATH)) {
            fs.unlinkSync(QR_PATH);
            console.log('🗑️  Archivo QR eliminado');
        }
    } catch (error) {
        console.error('⚠️  Error eliminando QR:', error.message);
    }
};

module.exports = {
    generateQRImage,
    deleteQRImage
};
