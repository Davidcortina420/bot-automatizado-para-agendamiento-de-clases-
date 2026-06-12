export interface Horario {
  label: string;
  xpath: string;
}

export const HORARIOS_SABADO: Record<number, Horario> = {
  1: { label: '7:00 AM',  xpath: '/html/body/form/div[1]/div/table/tbody/tr/td/table/tbody/tr[5]/td/div/table/tbody/tr[1]/td[3]' },
  2: { label: '8:30 AM',  xpath: '/html/body/form/div[1]/div/table/tbody/tr/td/table/tbody/tr[5]/td/div/table/tbody/tr[2]/td[3]' },
  3: { label: '10:00 AM', xpath: '/html/body/form/div[1]/div/table/tbody/tr/td/table/tbody/tr[5]/td/div/table/tbody/tr[3]/td[3]' },
  4: { label: '11:00 AM', xpath: '/html/body/form/div[1]/div/table/tbody/tr/td/table/tbody/tr[5]/td/div/table/tbody/tr[4]/td[3]' },
  5: { label: '1:30 PM',  xpath: '/html/body/form/div[1]/div/table/tbody/tr/td/table/tbody/tr[5]/td/div/table/tbody/tr[5]/td[3]' },
  6: { label: '3:00 PM',  xpath: '/html/body/form/div[1]/div/table/tbody/tr/td/table/tbody/tr[5]/td/div/table/tbody/tr[6]/td[3]' }
};

export const HORARIOS_SEMANA: Record<number, Horario> = {
  1: { label: '6:00 AM',  xpath: '' },
  2: { label: '7:30 AM',  xpath: '' },
  3: { label: '9:00 AM',  xpath: '' },
  4: { label: '10:30 AM', xpath: '' },
  5: { label: '12:00 PM', xpath: '' },
  6: { label: '1:30 PM',  xpath: '' },
  7: { label: '3:00 PM',  xpath: '' },
  8: { label: '4:30 PM',  xpath: '' },
  9: { label: '6:00 PM',  xpath: '' }
};

export function getHorarioDelDia(): Record<number, Horario> {
  const dia = new Date().getDay();
  // 5 = viernes (programa para sábado), 6 = sábado
  const esSabadoOVispera = dia === 5 || dia === 6;

  if (esSabadoOVispera) {
    return HORARIOS_SABADO;
  }

  // Filtra solo los que tienen xpath definido
  const horariosValidos = Object.fromEntries(
    Object.entries(HORARIOS_SEMANA).filter(([, h]) => h.xpath !== '')
  ) as Record<number, Horario>;

  return horariosValidos;
}