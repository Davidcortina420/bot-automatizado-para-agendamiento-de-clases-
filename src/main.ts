import { chromium } from '@playwright/test';
import * as dotenv from 'dotenv';
import { LoginPage } from './pages/LoginPage';
import { ProgramacionPage } from './pages/ProgramacionPage';
import { AgendarPage } from './pages/AgendarPage';

dotenv.config();

async function run() {
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

    await agendarPage.agendarClase();

    console.log('🎉 Flujo completo exitoso');
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('❌ Error:', error);
    await page.screenshot({ path: 'screenshots/error.png' });
  } finally {
    await browser.close();
  }
}

run();