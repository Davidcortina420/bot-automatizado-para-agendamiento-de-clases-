import { chromium } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as readline from 'readline';
import * as cron from 'node-cron';
import { LoginPage } from './pages/LoginPage';
import { ProgramacionPage } from './pages/ProgramacionPage';
import { AgendarPage } from './pages/AgendarPage';
import { SEDES } from './config/sedes';
import { getHorarioDelDia } from './config/horarios';

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

  // Validar horarios disponibles
  const horarios = getHorarioDelDia();
  if (Object.keys(horarios).length === 0) {
    console.log('⚠️  No hay horarios configurados para hoy. Proceso cancelado.');
    return;
  }

  // Mostrar sedes
  console.log('\n📍 Sedes disponibles:\n');
  Object.entries(SEDES).forEach(([num, nombre]) => {
    console.log(`  [${num.padStart(2, ' ')}] ${nombre}`);
  });

  // Elegir sede
  let sedeElegida = 0;
  while (!SEDES[sedeElegida]) {
    const input = await preguntar('\n¿Qué sede desea? (1-73): ');
    sedeElegida = parseInt(input);
    if (!SEDES[sedeElegida]) console.log('⚠️  Número inválido, intente de nuevo.');
  }
  const confirmaSede = await preguntar(`📍 Sede: "${SEDES[sedeElegida]}" ¿Es correcta? (s/n): `);
  if (confirmaSede !== 's') {
    console.log('👋 Proceso cancelado.');
    return;
  }

  // Mostrar horarios
  console.log('\n⏰ Horas disponibles:\n');
  Object.entries(horarios).forEach(([num, h]) => {
    console.log(`  [${num}] ${h.label}`);
  });

  // Elegir hora
  let horaElegida = 0;
  while (!horarios[horaElegida]) {
    const input = await preguntar('\n¿A qué hora desea la clase?: ');
    horaElegida = parseInt(input);
    if (!horarios[horaElegida]) console.log('⚠️  Número inválido, intente de nuevo.');
  }
  const horaSeleccionada = horarios[horaElegida];
  const confirmaHora = await preguntar(`⏰ Hora: "${horaSeleccionada.label}" ¿Es correcta? (s/n): `);
  if (confirmaHora !== 's') {
    console.log('👋 Proceso cancelado.');
    return;
  }

  // Preguntar clase
  const nombreClase = await preguntar('\n📚 ¿Qué clase desea agendar? (ej: CLASE 16): ');
  if (!nombreClase.trim()) {
    console.log('⚠️  Nombre de clase inválido. Proceso cancelado.');
    return;
  }

  // Abrir navegador después de recolectar todos los datos
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

    await agendarPage.agendarClase(sedeElegida, horaSeleccionada.xpath, nombreClase.toUpperCase().trim());

    console.log('\n🎉 ¡Clase agendada exitosamente!');

  } catch (error) {
    console.error('❌ Error:', error);
    await page.screenshot({ path: 'screenshots/error.png' });
  } finally {
    await browser.close();
  }
}

console.log('🕐 Bot iniciado — esperando las 6:00 AM para preguntar...');
console.log('💡 También puedes correr npm run agendar para ejecutar ahora.\n');

cron.schedule('0 6 * * *', async () => {
  console.log('\n⏰ Son las 6:00 AM — iniciando proceso de agendamiento...');
  await ejecutarBot();
}, {
  timezone: 'America/Bogota'
});

export { ejecutarBot };