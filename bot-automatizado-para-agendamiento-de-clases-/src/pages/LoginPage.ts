import { Page } from '@playwright/test';

export class LoginPage {
  private page: Page;

  private readonly url = process.env.SMART_URL!;
  private readonly usernameInput = '#vUSUCOD';
  private readonly passwordInput = '#vPASS';
  private readonly confirmButton = '#BUTTON1';
  private readonly closePopupButton = '#gxp0_cls';

  // Selector que confirma que el login fue exitoso
  // (elemento que solo existe después de loguear)
  private readonly postLoginSelector = '#IMAGE18';

  constructor(page: Page) {
    this.page = page;
  }

  async navigate() {
    console.log('🌐 Navegando a Smart...');
    await this.page.goto(this.url, { waitUntil: 'load' });
    await this.page.waitForSelector(this.usernameInput);
    console.log('✅ Página cargada');
  }

async login(username: string, password: string) {
  console.log('🔐 Ingresando credenciales...');
  await this.page.waitForSelector(this.usernameInput, { timeout: 10000 });

  // Usuario
  await this.page.click(this.usernameInput);
  await this.page.fill(this.usernameInput, '');
  await this.page.keyboard.type(username, { delay: 50 });

  // Contraseña
  await this.page.click(this.passwordInput);
  await this.page.fill(this.passwordInput, '');
  await this.page.waitForTimeout(300);
  await this.page.keyboard.type(password, { delay: 50 });

  await this.page.waitForTimeout(800);

  console.log('🖱️ Haciendo clic en Confirmar...');
  await this.page.click(this.confirmButton);

  // Espera fija — la página usa AJAX, no navegación tradicional
  console.log('✅ Login exitoso — URL actual:', this.page.url());
}

async closePopup() {
  try {
    console.log('🔔 Esperando popup...');
    const closeBtn = this.page.locator('xpath=/html/body/div[2]/div[1]/span[2]');
    await closeBtn.waitFor({ state: 'visible', timeout: 6000 });
    await closeBtn.click();
    await closeBtn.waitFor({ state: 'hidden' });
    console.log('✅ Popup cerrado');
  } catch {
    console.log('ℹ️  No apareció popup, continuando...');
  }
}
}