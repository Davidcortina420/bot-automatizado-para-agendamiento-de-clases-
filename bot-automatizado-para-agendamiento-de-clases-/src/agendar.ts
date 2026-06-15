import * as dotenv from 'dotenv';
dotenv.config();

import { preguntarInicio } from './bot/telegram';
import { bot } from './bot/telegram';

bot.launch();
preguntarInicio();