const fs = require('fs').promises;

async function leerJSON(archivo) {
    try {
        const data = await fs.readFile(archivo, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error leyendo ${archivo}:`, error);
        
        // Determinar el tipo de archivo para crear la estructura adecuada
        if (archivo.includes('donaciones')) {
            return { donaciones: [] };
        } else if (archivo.includes('intercambios')) {
            return { intercambios: [] };
        } else {
            return { items: [] };
        }
    }
}

async function escribirJSON(archivo, data) {
    try {
        await fs.writeFile(archivo, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error escribiendo ${archivo}:`, error);
        return false;
    }
}

function nuevoId(items) {
    return items.length > 0 ? Math.max(...items.map(item => item.id || 0)) + 1 : 1;
}

module.exports = { leerJSON, escribirJSON, nuevoId };