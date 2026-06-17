const { google } = require('googleapis');
const path = require('path');

const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const sheetRange = process.env.GOOGLE_SHEETS_RANGE;
const credentialsRaw = process.env.GOOGLE_SHEETS_CREDENTIALS || '';

const parseCredentials = () => {
  if (!credentialsRaw) {
    throw new Error('Falta la variable de entorno GOOGLE_SHEETS_CREDENTIALS');
  }

  try {
    return JSON.parse(credentialsRaw);
  } catch (error) {
    const fullPath = path.isAbsolute(credentialsRaw)
      ? credentialsRaw
      : path.resolve(process.cwd(), credentialsRaw);
    return require(fullPath);
  }
};

const getSheetsClient = async () => {
  if (!spreadsheetId) {
    throw new Error('Falta la variable de entorno GOOGLE_SHEETS_SPREADSHEET_ID');
  }

  const credentials = parseCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  return google.sheets({ version: 'v4', auth });
};

const quoteSheetName = (name) => {
  if (/^'.*'$/.test(name)) {
    return name;
  }

  const quoted = name.replace(/'/g, "''");
  return `'${quoted}'`;
};

const normalizeRange = (range) => {
  if (!range) return range;
  const parts = range.split('!');
  if (parts.length !== 2) return range;

  const sheetName = parts[0].trim();
  const rangePart = parts[1].trim();

  if (sheetName.startsWith("'") && sheetName.endsWith("'")) {
    return `${sheetName}!${rangePart}`;
  }

  return `${quoteSheetName(sheetName)}!${rangePart}`;
};

const getDefaultRange = async (sheets) => {
  const response = await sheets.spreadsheets.get({ spreadsheetId });
  const firstSheet = response.data.sheets?.[0];
  const title = firstSheet?.properties?.title || 'Sheet1';
  return `${quoteSheetName(title)}!A:E`;
};

const appendCitaRow = async (cita) => {
  const sheets = await getSheetsClient();
  const range = sheetRange ? normalizeRange(sheetRange) : await getDefaultRange(sheets);

  const values = [
    cita.timestamp,
    cita.nombre,
    cita.telefono,
    cita.sintomas,
    cita.fecha
  ];

  return sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [values] }
  });
};

module.exports = {
  appendCitaRow
};
