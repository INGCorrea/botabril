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

const PAUSE_WAIT = 200;

async function runScenario(name, chat, messages) {
  console.log(`\n===== SCENARIO: ${name} =====`);
  for (const text of messages) {
    console.log(`\n> USER: ${text}`);
    const msg = makeMsg(chat, text);
    await handleMessage(msg);
    await new Promise((resolve) => setTimeout(resolve, PAUSE_WAIT));
  }
}

async function run() {
  await runScenario('Standard Spanish appointment', 'chat-es-1@c.us', [
    'hola',
    'cita',
    'Juan Pérez',
    'dolor de muela',
    '5551234567',
    'ninguno',
    'mucho dolor',
    'mañana 10am'
  ]);

  await runScenario('Spanish with typos & bad phrasing', 'chat-es-2@c.us', [
    'holaa',
    'quiero cita',
    'María Gonzalez',
    'dolor de muela fuerte',
    '55 5123 4567',
    'ningunoo',
    'tengo dolor y necesito limpieza',
    'prox lunes 9am'
  ]);

  await runScenario('English broken grammar', 'chat-en-1@c.us', [
    'hi',
    'appointment',
    'jane doe',
    'tooth paiin',
    '+1 (555) 123-4567',
    'none',
    'need cleaning please',
    'next friday 4pm'
  ]);

  await runScenario('Mixed English + Spanish and bad spelling', 'chat-mix-1@c.us', [
    'hola',
    'appointment',
    'Pedro',
    'garganta dolor',
    '1234567',
    'no seguro',
    'cleaning and tooth pain',
    'lunes 22 6pm'
  ]);

  await runScenario('Suspicious / flirty customer behavior', 'chat-suspicious-1@c.us', [
    'hola',
    'menu',
    'de',
    'que hermosas',
    'hola guapa',
    'no respondas',
    'menu'
  ]);

  await runScenario('Pause the bot and ignore receptionist conversation', 'chat-pause-1@c.us', [
    'hola',
    'menu',
    'please stop bot',
    'Hola, aquí la recepcionista, dime si esto está bien',
    'Ya hablé con el cliente, ahora continúa tú',
    'menu'
  ]);

  await runScenario('Invalid phone and recovery', 'chat-invalid-1@c.us', [
    'hola',
    'cita',
    'Lucia',
    'estoy con dolor',
    '123',
    '5551234567',
    'si',
    'ninguno',
    'implante',
    '15/07/2026'
  ]);

  await runScenario('English pause command', 'chat-en-pause@c.us', [
    'hello',
    'menu',
    'talk to receptionist',
    'I am the receptionist now',
    'do not answer',
    'appointment'
  ]);

  const citasFile = path.join(__dirname, '..', 'citas.json');
  if (fs.existsSync(citasFile)) {
    const citas = JSON.parse(fs.readFileSync(citasFile, 'utf8'));
    console.log('\n===== LAST SAVED APPOINTMENT =====');
    console.log(citas[citas.length - 1]);
  } else {
    console.log('\nNo existe citas.json (aún no se guardó ninguna cita)');
  }
}

run().catch((err) => console.error(err));
