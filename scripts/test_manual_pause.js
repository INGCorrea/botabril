const { handleMessage } = require('../handlers/messageHandler');

const makeMsg = (body) => ({
  from: 'test@c.us',
  body,
  hasMedia: false,
  type: 'chat',
  fromMe: false,
  reply: async (text) => console.log('[BOT REPLY]', text)
});

(async () => {
  await handleMessage(makeMsg('hola'));
  await handleMessage(makeMsg('asesor'));
  await handleMessage(makeMsg('ya kitalo'));
  await handleMessage(makeMsg('hola'));
  await handleMessage(makeMsg('menu'));
})();
