import { chromium } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as readline from 'readline';
import * as cron from 'node-cron';
import { LoginPage } from './pages/LoginPage';
import { ProgramacionPage } from './pages/ProgramacionPage';
import { AgendarPage } from './pages/AgendarPage';

dotenv.config();

function preguntar(pregunta: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => {
    rl.question(pregunta, answer => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function ejecutarBot() {
  // Pregunta 1
  const desea = await preguntar('\n🤖 ¿Desea programar una clase hoy? (s/n): ');
  if (desea !== 's') {
    console.log('👋 Proceso cancelado. Hasta mañana.');
    return;
  }

  // Pregunta 2
  const confirma = await preguntar('⏰ La clase se agendará a las 4:30 PM el día de mañana. ¿Confirma? (s/n): ');
  if (confirma !== 's') {
    console.log('👋 Proceso cancelado.');
    return;
  }

  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  const loginPage = new LoginPage(page);
  const programacionPage = new ProgramacionPage(page);
  const agendarPage = new AgendarPage(page);

  try {
    await loginPage.navigate();
    await loginPage.login(
      process.env.SMART_USERNAME!,
      process.env.SMART_PASSWORD!
    );
    await loginPage.closePopup();

    await programacionPage.irAProgramacion();
    await programacionPage.seleccionarPlanEstudios();
    await programacionPage.clickIniciar();

    // Pregunta sede
    let sedeElegida = 0;
    while (sedeElegida < 1 || sedeElegida > 73 || isNaN(sedeElegida)) {
      const input = await preguntar('\n📍 ¿Qué sede desea? (1-73): ');
      sedeElegida = parseInt(input);
      if (isNaN(sedeElegida) || sedeElegida < 1 || sedeElegida > 73) {
        console.log('⚠️  Número inválido, intente de nuevo.');
      }
    }

    const confirmaSede = await preguntar(`📍 Sede elegida: opción ${sedeElegida} ¿Es correcta? (s/n): `);
    if (confirmaSede !== 's') {
      console.log('👋 Proceso cancelado.');
      await browser.close();
      return;
    }

    await agendarPage.agendarClase(sedeElegida);

    console.log('\n🎉 ¡Clase agendada exitosamente!');

  } catch (error) {
    console.error('❌ Error:', error);
    await page.screenshot({ path: 'screenshots/error.png' });
  } finally {
    await browser.close();
  }
}

// Scheduler — dispara todos los días a las 6:00 AM
console.log('🕐 Bot iniciado — esperando las 6:00 AM para preguntar...');
console.log('💡 También puedes correr npm run agendar para ejecutar ahora.\n');

cron.schedule('0 6 * * *', async () => {
  console.log('\n⏰ Son las 6:00 AM — iniciando proceso de agendamiento...');
  await ejecutarBot();
}, {
  timezone: 'America/Bogota'
});

export { ejecutarBot };