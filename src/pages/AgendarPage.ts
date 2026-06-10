import { Page, Frame } from '@playwright/test';

export class AgendarPage {
  private page: Page;

  private readonly iframeSelector = '#gxp0_ifrm';
  private readonly filtroEstado = '#vTPEAPROBO';
  private readonly claseSelector = '#span_vPRONOMPRO_0017';
  private readonly btnProgramar = 'xpath=/html/body/form/div[1]/div/table/tbody/tr/td/table/tbody/tr[2]/td/table/tbody/tr/td[1]/input[1]';
private readonly iframeModal = 'xpath=//*[@id="gxp1_b"]//iframe';
  private readonly selectHora = 'xpath=/html/body/form/div[1]/div/table/tbody/tr/td/table/tbody/tr[5]/td/div/table/tbody/tr[1]/td[4]';
  private readonly btnConfirmar = 'xpath=/html/body/form/div[1]/div/table/tbody/tr/td/table/tbody/tr[4]/td/input[1]';

  constructor(page: Page) {
    this.page = page;
  }

  private async getIframeModal(): Promise<Frame> {
  const iframeElement = await this.page.waitForSelector(this.iframeModal, { timeout: 10000 });
  const iframe = await iframeElement.contentFrame();
  if (!iframe) throw new Error('❌ No se pudo acceder al iframe del modal');
  return iframe;
}

  private async getIframe(): Promise<Frame> {
    const iframeElement = await this.page.waitForSelector(this.iframeSelector, { timeout: 10000 });
    const iframe = await iframeElement.contentFrame();
    if (!iframe) throw new Error('❌ No se pudo acceder al iframe');
    return iframe;
  }

  async seleccionarFiltroEstado() {
    console.log('🔽 Entrando al iframe principal...');
    const iframe = await this.getIframe();

    console.log('🔽 Seleccionando filtro "Pendientes para programar"...');
    await iframe.waitForSelector(this.filtroEstado, { timeout: 10000 });
    await iframe.selectOption(this.filtroEstado, { index: 2 });

    // Espera a que la tabla se actualice
    await iframe.waitForSelector(this.claseSelector, { timeout: 10000 });
    console.log('✅ Filtro aplicado');
  }

  async seleccionarClase() {
    console.log('📚 Seleccionando clase...');
    const iframe = await this.getIframe();
    await iframe.waitForSelector(this.claseSelector, { timeout: 10000 });
    await iframe.click(this.claseSelector);
    console.log('✅ Clase seleccionada');
  }

async clickProgramar() {
  console.log('🖱️  Abriendo modal de programación...');
  const iframe = await this.getIframe();
  await iframe.waitForSelector(this.btnProgramar, { timeout: 10000 });
  await iframe.click(this.btnProgramar);

  // El modal abre en la página principal, no en el iframe
  await this.page.waitForSelector('#gxp1_b', { state: 'visible', timeout: 10000 });
  console.log('✅ Modal de programación abierto');
}


async seleccionarHora() {
  console.log('⏰ Seleccionando hora 4:30...');
  const iframe = await this.getIframeModal();
  await iframe.waitForSelector(this.selectHora, { timeout: 10000 });
  await iframe.click(this.selectHora);
  await this.page.waitForTimeout(1000);
  console.log('✅ Hora seleccionada');
}

async confirmarClase() {
  console.log('✅ Confirmando clase...');
  const iframe = await this.getIframeModal();
  await iframe.waitForSelector(this.btnConfirmar, { timeout: 10000 });
  await iframe.click(this.btnConfirmar);
  console.log('🎉 Clase confirmada exitosamente');
}

  async agendarClase() {
    await this.seleccionarFiltroEstado();
    await this.seleccionarClase();
    await this.clickProgramar();

    await this.seleccionarHora();
    await this.confirmarClase();
  }
}