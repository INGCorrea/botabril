/**
 * Manejo de persistencia de citas en archivo JSON
 */

const fs = require('fs');
const path = require('path');

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
