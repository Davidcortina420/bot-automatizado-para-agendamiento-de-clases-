import { Page, Frame } from '@playwright/test';

export class AgendarPage {
  private page: Page;

  private readonly iframeSelector = '#gxp0_ifrm';
  private readonly filtroEstado = '#vTPEAPROBO';
  private readonly claseSelector = '#span_vPRONOMPRO_0017';
  private readonly btnProgramar = 'xpath=/html/body/form/div[1]/div/table/tbody/tr/td/table/tbody/tr[2]/td/table/tbody/tr/td[1]/input[1]';
  private readonly iframeModal = 'xpath=//*[@id="gxp1_b"]//iframe';
  private readonly selectDia = 'xpath=//*[@id="vDIA"]/option[2]';  private readonly selectHora = 'xpath=/html/body/form/div[1]/div/table/tbody/tr/td/table/tbody/tr[5]/td/div/table/tbody/tr[1]/td[4]';
  private readonly btnConfirmar = 'xpath=/html/body/form/div[1]/div/table/tbody/tr/td/table/tbody/tr[4]/td/input[1]';
  private readonly selectSede = '#vREGCONREG';

  constructor(page: Page) {
    this.page = page;
  }

private async seleccionarClasePorNombre(iframe: Frame, nombreClase: string) {
  const numero = nombreClase.replace(/[^0-9]/g, '');
  const textoBusqueda = `CLASE ${numero}`;
  
  console.log(`📚 Buscando: "${textoBusqueda}"...`);

  const clase = iframe
    .locator('td[data-colindex="5"] span.ReadonlyAttribute')
    .filter({ hasText: textoBusqueda });

  await clase.waitFor({ state: 'visible', timeout: 10000 });
  await clase.click();
  console.log(`✅ Clase "${textoBusqueda}" seleccionada`);
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

async seleccionarClase(variableNumeroDeClase: string) {
  console.log('📚 Seleccionando clase...');
  const iframe = await this.getIframe();
  await this.seleccionarClasePorNombre(iframe, variableNumeroDeClase);
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
async seleccionarSede(numero: number) {
  const iframe = await this.getIframeModal();
  await iframe.waitForSelector(this.selectSede, { timeout: 10000 });
  await iframe.selectOption(this.selectSede, { index: numero - 1 });
  console.log(`✅ Sede seleccionada: opción ${numero}`);
}

async seleccionarFecha() {
  console.log('📅 Seleccionando fecha (día siguiente)...');
  const iframe = await this.getIframeModal();
  await iframe.waitForSelector('#vDIA', { timeout: 10000 });
  await iframe.selectOption('#vDIA', { index: 1 });
  console.log('✅ Fecha seleccionada');
}

async seleccionarHora(horaXpath: string) {
  console.log('⏰ Seleccionando hora...');
  const iframe = await this.getIframeModal();
  await iframe.waitForSelector(`xpath=${horaXpath}`, { timeout: 10000 });
  await iframe.click(`xpath=${horaXpath}`);
  console.log('✅ Hora seleccionada');
}

async confirmarClase() {
  console.log('✅ Confirmando clase...');
  const iframe = await this.getIframeModal();
  await iframe.waitForSelector(this.btnConfirmar, { timeout: 10000 });
  await iframe.click(this.btnConfirmar);
  console.log('🎉 Clase confirmada exitosamente');
}

async agendarClase(sede: number, horaXpath: string,VariableClassName : string ) {
  await this.seleccionarFiltroEstado();
  await this.seleccionarClase(VariableClassName);
  await this.clickProgramar();
  await this.seleccionarSede(sede);
  await this.seleccionarFecha();
  await this.seleccionarHora(horaXpath);
  await this.confirmarClase();


 
}
}