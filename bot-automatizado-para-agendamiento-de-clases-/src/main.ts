import * as cron from 'node-cron';
import * as dotenv from 'dotenv';
import { bot, preguntarInicio } from './bot/telegram';

dotenv.config();

bot.launch();
console.log('🤖 Bot de Telegram listo y escuchando...');

cron.schedule('0 6 * * *', async () => {
  console.log('\n⏰ Son las 6:00 AM — enviando mensaje a Telegram...');
  await preguntarInicio();
}, {
  timezone: 'America/Bogota'
});