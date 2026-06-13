import { Page } from '@playwright/test';

export class ProgramacionPage {
  private page: Page;

  private readonly btnProgramacion = '#IMAGE18';
  private readonly planEstudiosRow = '#W0030Grid1ContainerRow_0001 td:nth-child(4)';
  private readonly btnIniciar = '#W0030BUTTON1';

  constructor(page: Page) {
    this.page = page;
  }

  async irAProgramacion() {
    console.log('📅 Navegando a Programación...');
    await this.page.waitForSelector(this.btnProgramacion, { timeout: 10000 });
    await this.page.click(this.btnProgramacion);
    await this.page.waitForLoadState('networkidle');
    console.log('✅ Sección Programación abierta');
  }

  async seleccionarPlanEstudios() {
    console.log('📋 Seleccionando plan de estudios...');
    await this.page.waitForSelector(this.planEstudiosRow, { timeout: 10000 });
    await this.page.click(this.planEstudiosRow);
    await this.page.waitForTimeout(1000);
    console.log('✅ Plan de estudios seleccionado');
  }

  async clickIniciar() {
    console.log('▶️  Haciendo clic en Iniciar...');
    await this.page.waitForSelector(this.btnIniciar, { timeout: 10000 });
    await this.page.click(this.btnIniciar);
    await this.page.waitForLoadState('networkidle');
    console.log('✅ Iniciado');
  }
}