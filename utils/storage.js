/**
 * Manejo de persistencia de citas en archivo JSON
 */

const fs = require('fs');
const path = require('path');
const { appendCitaRow } = require('./googleSheets');

const CITAS_FILE = path.join(__dirname, '..', 'citas.json');

const loadCitas = () => {
    try {
        if (fs.existsSync(CITAS_FILE)) {
            const data = fs.readFileSync(CITAS_FILE, 'utf-8');
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        console.error('❌ Error cargando citas:', error.message);
        return [];
    }
};

const saveCita = (citaData) => {
    try {
        const citas = loadCitas();
        const newCita = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...citaData
        };
        citas.push(newCita);
        fs.writeFileSync(CITAS_FILE, JSON.stringify(citas, null, 2));
        console.log('✅ Cita guardada en archivo');

        // ⏸️ Google Sheets PAUSADO - Las citas se guardan en citas.json
        // Para reactivar: descomentar el código de abajo
        // if (process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
        //     appendCitaRow(newCita)
        //         .then(() => console.log('✅ Cita enviada a Google Sheets'))
        //         .catch((error) => console.error('⚠️ Error enviando cita a Google Sheets:', error.message));
        // }

        return newCita;
    } catch (error) {
        console.error('❌ Error guardando cita:', error.message);
        throw error;
    }
};

const getCitas = () => loadCitas();

module.exports = {
    loadCitas,
    saveCita,
    getCitas
};
