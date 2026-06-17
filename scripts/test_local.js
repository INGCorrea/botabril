const { handleMessage } = require('../handlers/messageHandler');
const fs = require('fs');
const path = require('path');

function makeMsg(from, body) {
  return {
    from,
    body,
    hasMedia: false,
    type: 'chat',
    fromMe: false,
    reply: async (text) => {
      console.log(`[BOT REPLY] ${text}`);
    }
  };
}

async function run() {
  const chat = 'testchat@c.us';
  const seq = [
    'hola',
    'cita',
    'Juan Perez',
    'dolor de muela',
    '5551234567',
    'ninguno',
    'mucho dolor',
    'mañana 10am'
  ];

  for (const text of seq) {
    console.log(`\n> USER: ${text}`);
    const msg = makeMsg(chat, text);
    await handleMessage(msg);
    await new Promise(r => setTimeout(r, 200));
  }

  const citasFile = path.join(__dirname, '..', 'citas.json');
  if (fs.existsSync(citasFile)) {
    const citas = JSON.parse(fs.readFileSync(citasFile, 'utf8'));
    console.log('\nÚltima cita guardada:');
    console.log(citas[citas.length - 1]);
  } else {
    console.log('\nNo existe citas.json (aún no se guardó ninguna cita)');
  }
}

run().catch(err => console.error(err));
