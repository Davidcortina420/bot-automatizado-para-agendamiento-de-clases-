import { Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';
import { chromium } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProgramacionPage } from '../pages/ProgramacionPage';
import { AgendarPage } from '../pages/AgendarPage.ts';
import { SEDES } from '../config/sedes';
import { getHorarioDelDia } from '../config/horarios';

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
const chatId = process.env.TELEGRAM_CHAT_ID!;

interface Sesion {
  sede?: number;
  hora?: { label: string; xpath: string };
  clase?: string;
  paso?: string;
}

let sesion: Sesion = {};

async function enviar(texto: string) {
  await bot.telegram.sendMessage(chatId, texto, { parse_mode: 'Markdown' });
}

async function enviarBotones(texto: string, botones: { text: string; callback_data: string }[][]) {
  await bot.telegram.sendMessage(chatId, texto, {
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: botones }
  });
}

export async function preguntarInicio() {
  sesion = {};
  try {
    await bot.telegram.sendMessage(chatId, '🤖 *¿Deseas programar una clase hoy?*', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '✅ Sí', callback_data: 'inicio_si' },
          { text: '❌ No', callback_data: 'inicio_no' }
        ]]
      }
    });
    console.log('✅ Mensaje enviado a Telegram');
  } catch (error) {
    console.error('❌ Error enviando mensaje:', error);
  }
}

async function mostrarSedes() {
  sesion.paso = 'eligiendo_sede';
  const botones: { text: string; callback_data: string }[][] = [];
  const entries = Object.entries(SEDES);
  for (let i = 0; i < entries.length; i += 2) {
    const fila: { text: string; callback_data: string }[] = [];
    fila.push({ text: `${entries[i][0]}. ${entries[i][1]}`, callback_data: `sede_${entries[i][0]}` });
    if (entries[i + 1]) {
      fila.push({ text: `${entries[i + 1][0]}. ${entries[i + 1][1]}`, callback_data: `sede_${entries[i + 1][0]}` });
    }
    botones.push(fila);
  }
  botones.push([{ text: '❌ Cancelar', callback_data: 'cancelar' }]);
  await enviarBotones('📍 *Elige la sede:*', botones);
}

async function confirmarSede(numero: number) {
  sesion.sede = numero;
  sesion.paso = 'confirmando_sede';
  await enviarBotones(
    `📍 Sede elegida: *${SEDES[numero]}*\n¿Confirmas?`,
    [[
      { text: '✅ Confirmar', callback_data: 'sede_ok' },
      { text: '🔄 Volver', callback_data: 'volver_sede' },
      { text: '❌ Cancelar', callback_data: 'cancelar' }
    ]]
  );
}

async function mostrarHoras() {
  sesion.paso = 'eligiendo_hora';
  const horarios = getHorarioDelDia();
  if (Object.keys(horarios).length === 0) {
    await enviar('⚠️ No hay horarios disponibles para hoy.');
    return;
  }
  const botones = Object.entries(horarios).map(([num, h]) => [
    { text: `${h.label}`, callback_data: `hora_${num}` }
  ]);
  botones.push([{ text: '❌ Cancelar', callback_data: 'cancelar' }]);
  await enviarBotones('⏰ *Elige la hora:*', botones);
}

async function confirmarHora(numero: number) {
  const horarios = getHorarioDelDia();
  sesion.hora = horarios[numero];
  sesion.paso = 'confirmando_hora';
  await enviarBotones(
    `⏰ Hora elegida: *${sesion.hora.label}*\n¿Confirmas?`,
    [[
      { text: '✅ Confirmar', callback_data: 'hora_ok' },
      { text: '🔄 Volver', callback_data: 'volver_hora' },
      { text: '❌ Cancelar', callback_data: 'cancelar' }
    ]]
  );
}

async function pedirClase() {
  sesion.paso = 'esperando_clase';
  await enviar('📚 *¿Qué clase deseas agendar?*\nEscribe el número \\(ej: 16\\)');
}

async function confirmarClase(texto: string) {
  const numero = texto.replace(/[^0-9]/g, '');
  sesion.clase = `CLASE #${numero}`;
  sesion.paso = 'confirmando_clase';
  await enviarBotones(
    `📚 Clase elegida: *${sesion.clase}*\n¿Confirmas?`,
    [[
      { text: '✅ Confirmar', callback_data: 'clase_ok' },
      { text: '🔄 Volver', callback_data: 'volver_clase' },
      { text: '❌ Cancelar', callback_data: 'cancelar' }
    ]]
  );
}

async function mostrarResumen() {
  sesion.paso = 'resumen';
  await enviarBotones(
    `📋 *RESUMEN DE TU CLASE*\n` +
    `─────────────────\n` +
    `📍 Sede: *${SEDES[sesion.sede!]}*\n` +
    `⏰ Hora: *${sesion.hora!.label}*\n` +
    `📚 Clase: *${sesion.clase}*\n` +
    `─────────────────\n` +
    `¿Todo está correcto?`,
    [
      [{ text: '✅ Confirmar y agendar', callback_data: 'agendar_final' }],
      [{ text: '📍 Cambiar sede',        callback_data: 'cambiar_sede' }],
      [{ text: '⏰ Cambiar hora',        callback_data: 'cambiar_hora' }],
      [{ text: '📚 Cambiar clase',       callback_data: 'cambiar_clase' }],
      [{ text: '❌ Cancelar todo',       callback_data: 'cancelar' }]
    ]
  );
}

async function ejecutarPlaywright() {
  await enviar('⏳ *Agendando tu clase\\.\\.\\. por favor espera\\.*');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const loginPage = new LoginPage(page);
  const programacionPage = new ProgramacionPage(page);
  const agendarPage = new AgendarPage(page);

  try {
    await loginPage.navigate();
    await loginPage.login(process.env.SMART_USERNAME!, process.env.SMART_PASSWORD!);
    await loginPage.closePopup();
    await programacionPage.irAProgramacion();
    await programacionPage.seleccionarPlanEstudios();
    await programacionPage.clickIniciar();
    await agendarPage.agendarClase(sesion.sede!, sesion.hora!.xpath, sesion.clase!);

    const screenshotPath = 'screenshots/confirmacion.png';
    await page.screenshot({ path: screenshotPath });
    await enviar('🎉 *¡Clase agendada exitosamente\\!*');
    await bot.telegram.sendPhoto(chatId, { source: screenshotPath });

  } catch (error) {
    const screenshotPath = 'screenshots/error-telegram.png';
    await page.screenshot({ path: screenshotPath });
    await enviar('❌ *Ocurrió un error al agendar la clase\\.*');
    await bot.telegram.sendPhoto(chatId, { source: screenshotPath });
    console.error('Error:', error);
  } finally {
    await browser.close();
    sesion = {};
  }
}

// Comando start
bot.on('message', async (ctx) => {
  const msg = ctx.message as any;
  const userChatId = String(ctx.chat.id);
  console.log('📨 Mensaje:', msg.text, 'chat ID:', userChatId);

  if (!msg.text) return;

  if (msg.text === '/start') {
    await preguntarInicio();
    return;
  }

  if (sesion.paso === 'esperando_clase') {
    await confirmarClase(msg.text);
  }
});

// Callbacks de botones
bot.on('callback_query', async (ctx) => {
  const data = (ctx.callbackQuery as any).data as string;
  await ctx.answerCbQuery();

  if (data === 'cancelar')   { sesion = {}; await enviar('👋 Proceso cancelado\\.'); return; }
  if (data === 'inicio_no')  { sesion = {}; await enviar('👋 Ok, hasta mañana\\.'); return; }
  if (data === 'inicio_si')  { await mostrarSedes(); return; }

  if (data.startsWith('sede_') && sesion.paso === 'eligiendo_sede') {
    await confirmarSede(parseInt(data.replace('sede_', '')));
    return;
  }

  if (data === 'sede_ok')      { await mostrarHoras(); return; }
  if (data === 'volver_sede')  { await mostrarSedes(); return; }

  if (data.startsWith('hora_') && sesion.paso === 'eligiendo_hora') {
    await confirmarHora(parseInt(data.replace('hora_', '')));
    return;
  }

  if (data === 'hora_ok')      { await pedirClase(); return; }
  if (data === 'volver_hora')  { await mostrarHoras(); return; }
  if (data === 'clase_ok')     { await mostrarResumen(); return; }
  if (data === 'volver_clase') { await pedirClase(); return; }
  if (data === 'cambiar_sede') { await mostrarSedes(); return; }
  if (data === 'cambiar_hora') { await mostrarHoras(); return; }
  if (data === 'cambiar_clase'){ await pedirClase(); return; }
  if (data === 'agendar_final'){ await ejecutarPlaywright(); return; }
});

export { bot };