import { Profession } from './types';

// Norms for September
const septemberProfessions: Profession[] = [
  {
    name: "Машинист-кочегар",
    items: [
      { name: "Перчатки с точечным покрытием", unit: "пар", quantity: 1 },
      { name: "Мыло туалетное 100 гр", unit: "шт", quantity: 2 },
      { name: "Респиратор-полумаска", unit: "шт", quantity: 4 },
      { name: "Рукавицы брезентовые с наладонником", unit: "пар", quantity: 2 },
      { name: "Крем гидрофильного действия 100мл/60", unit: "шт", quantity: 1 },
      { name: "Паста очищающая", unit: "шт", quantity: 1 },
      { name: "Перчатки для защиты от повышенных температур", unit: "пар", quantity: 1 },
      { name: "Крем GECO регенерирующий 100 мл", unit: "шт", quantity: 1 },
    ],
  },
  {
    name: "Слесарь – ремонтник",
    items: [
      { name: "Перчатки с точечным покрытием", unit: "пар", quantity: 4 },
      { name: "Мыло туалетное 100 гр", unit: "шт", quantity: 2 },
      { name: "Респиратор-полумаска", unit: "шт", quantity: 4 },
      { name: "Крем GECO регенерирующий 100 мл", unit: "шт", quantity: 1 },
    ],
  },
  {
    name: "Электрогазосварщик, занятый на резке и ручной сварке",
    items: [
      { name: "Краги спилковые", unit: "пар", quantity: 1 },
      { name: "Мыло туалетное 100 гр", unit: "шт", quantity: 2 },
      { name: "Респиратор-полумаска", unit: "шт", quantity: 4 },
      { name: "Паста очищающая", unit: "шт", quantity: 1 },
      { name: "Крем УФ", unit: "шт", quantity: 1 },
      { name: "Крем GECO регенерирующий 100 мл", unit: "шт", quantity: 1 },
    ],
  },
  {
    name: "Электромонтер по ремонту и обслуживанию электрооборудования",
    items: [
      { name: "Мыло туалетное 100 гр", unit: "шт", quantity: 2 },
      { name: "Перчатки с точечным покрытием", unit: "шт", quantity: 2 },
      { name: "Крем GECO регенерирующий 100 мл", unit: "шт", quantity: 1 },
    ],
  },
    {
    name: "Аппаратчик химводоочистки",
    items: [
      { name: "Перчатки с точечным покрытием", unit: "пар", quantity: 1 },
      { name: "Мыло туалетное 100 гр", unit: "шт", quantity: 2 },
      { name: "Крем гидрофобного действия 100мл/60", unit: "шт", quantity: 1 },
      { name: "Перчатки латексные", unit: "пар", quantity: 1 },
      { name: "Крем GECO регенерирующий 100 мл", unit: "шт", quantity: 1 },
    ],
  },
];

// Norms for October-November are slightly different
const octoberNovemberProfessions: Profession[] = JSON.parse(JSON.stringify(septemberProfessions));

// Find 'Машинист-кочегар' and update their items for the Oct-Nov period.
const stokerOctNov = octoberNovemberProfessions.find(p => p.name === "Машинист-кочегар");
if (stokerOctNov) {
  // Remove the high-temperature gloves as per the Oct-Nov norms document.
  stokerOctNov.items = stokerOctNov.items.filter(
    item => item.name !== "Перчатки для защиты от повышенных температур"
  );
}

export const NORMS_DATA: Record<string, Profession[]> = {
  'Сентябрь': septemberProfessions,
  'Октябрь-Ноябрь': octoberNovemberProfessions,
};

export const NORM_PERIODS = Object.keys(NORMS_DATA);