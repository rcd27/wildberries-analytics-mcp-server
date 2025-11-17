import axios from 'axios';
import { z } from 'zod';
import { createResponseSchema } from '../../createResponseSchema.js';

// Период
export const PeriodSchema = z.object({
  start: z
    .string()
    .describe('Дата начала периода. Не позднее `end`. Не ранее 365 суток от сегодня'),
  end: z
    .string()
    .describe('Дата окончания периода. Не ранее 365 суток от сегодня')
});

// Прошлый период для сравнения
export const PastPeriodSchema = z.object({
  start: z
    .string()
    .describe('Дата начала периода. Не позднее `end`. Не ранее 365 суток от сегодня'),
  end: z
    .string()
    .describe('Дата окончания периода. Не позднее даты перед датой начала `currentPeriod`. Не ранее 365 суток от сегодня')
});

// Параметры сортировки
export const OrderBySchema = z.object({
  field: z
    .enum(['avgPosition', 'openCard', 'addToCart', 'openToCart', 'orders', 'cartToOrder', 'visibility'])
    .describe(
      'Поле для сортировки:\n' +
      '- avgPosition — по средней позиции\n' +
      '- addToCart — по добавлениям в корзину\n' +
      '- openCard — по открытию карточки (переход на страницу товара)\n' +
      '- orders — по количеству заказов\n' +
      '- cartToOrder — по конверсии в заказ из поиска\n' +
      '- openToCart — по конверсии в корзину из поиска\n' +
      '- visibility — по видимости товара'
    ),
  mode: z
    .enum(['asc', 'desc'])
    .describe(
      'Порядок сортировки:\n' +
      '- asc — по возрастанию\n' +
      '- desc — по убыванию'
    )
});

// Request body
export const ProductSearchTextsRequestSchema = z.object({
  currentPeriod: PeriodSchema.describe('Текущий период'),
  pastPeriod: PastPeriodSchema.optional().nullable().describe('Прошлый период для сравнения. Количество дней — меньше или равно `currentPeriod`'),
  nmIds: z
    .array(z.number().int())
    .max(50)
    .describe('Список артикулов WB'),
  topOrderBy: z
    .enum(['openCard', 'addToCart', 'openToCart', 'orders', 'cartToOrder'])
    .describe(
      'Сортировка по полю:\n' +
      '- openCard — перешли в карточку из поиска\n' +
      '- addToCart — добавили в корзину из поиска\n' +
      '- openToCart — конверсия в корзину из поиска\n' +
      '- orders — заказали товаров из поиска\n' +
      '- cartToOrder — конверсия в заказ из поиска'
    ),
  orderBy: OrderBySchema.describe('Параметры сортировки'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(30)
    .describe('Количество поисковых запросов по товару')
});

// Метрика с динамикой
const MetricWithDynamicsSchema = z.object({
  current: z.number().int().optional().nullable().describe('Текущее значение'),
  dynamics: z.number().int().optional().nullable().describe('Динамика по сравнению с предыдущим периодом, %')
});

// Метрика с динамикой и процентилем
const MetricWithDynamicsAndPercentileSchema = z.object({
  current: z.number().int().optional().nullable().describe('Текущее значение'),
  dynamics: z.number().int().optional().nullable().describe('Динамика по сравнению с предыдущим периодом, %'),
  percentile: z.number().int().optional().nullable().describe('Процент, на который показатель выше, чем у карточек конкурентов по поисковому запросу')
});

// Цена
const PriceSchema = z.object({
  minPrice: z.number().int().optional().nullable().describe('Минимальная цена продавца со скидкой продавца (без учёта скидки WB Клуба)'),
  maxPrice: z.number().int().optional().nullable().describe('Максимальная цена продавца со скидкой продавца (без учёта скидки WB Клуба)')
});

// Элемент поискового запроса
export const TableSearchTextItemSchema = z.object({
  text: z.string().optional().nullable().describe('Текст поискового запроса'),
  nmId: z.number().int().optional().nullable().describe('Артикул WB'),
  subjectName: z.string().optional().nullable().describe('Название предмета'),
  brandName: z.string().optional().nullable().describe('Бренд'),
  vendorCode: z.string().optional().nullable().describe('Артикул продавца'),
  name: z.string().optional().nullable().describe('Название товара'),
  isCardRated: z.boolean().optional().nullable().describe('Есть ли рейтинг у карточки товара'),
  rating: z.number().optional().nullable().describe('Рейтинг карточки товара'),
  feedbackRating: z.number().optional().nullable().describe('Рейтинг по отзывам'),
  price: PriceSchema.optional().nullable().describe('Цена'),
  frequency: z.object({
    current: z.number().int().optional().nullable().describe('Текущее количество'),
    dynamics: z.number().int().optional().nullable().describe('Динамика по сравнению с предыдущим периодом, %')
  }).optional().nullable().describe('Количество обращений с поисковым запросом'),
  weekFrequency: z.number().int().optional().nullable().describe('Количество обращений с поисковым запросом за неделю'),
  medianPosition: MetricWithDynamicsSchema.optional().nullable().describe('Медианная позиция. Учитываются только те позиции, из которых пользователи добавляли товар в корзину или переходили в его карточку. Серединное значение позиции в поисковой выдаче, которое исключает сильные отклонения данных от среднего значения'),
  avgPosition: MetricWithDynamicsSchema.optional().nullable().describe('Средняя позиция товара в результатах поиска'),
  openCard: MetricWithDynamicsAndPercentileSchema.optional().nullable().describe('Количество переходов в карточку товара из поиска'),
  addToCart: MetricWithDynamicsAndPercentileSchema.optional().nullable().describe('Сколько раз товар из поиска добавили в корзину'),
  openToCart: MetricWithDynamicsAndPercentileSchema.optional().nullable().describe('Конверсия в корзину из поиска — доля добавлений товара в корзину по отношению ко всем переходам в карточку товара из поиска'),
  orders: MetricWithDynamicsAndPercentileSchema.optional().nullable().describe('Сколько раз товары из поиска заказали'),
  cartToOrder: MetricWithDynamicsAndPercentileSchema.optional().nullable().describe('Конверсия в заказ из поиска — доля заказов товара по отношению ко всем добавлениям товара из поиска в корзину'),
  visibility: MetricWithDynamicsSchema.optional().nullable().describe('Процент видимости товара в результатах поиска')
}).passthrough();

// Response
export const ProductSearchTextsResponseSchema = createResponseSchema(z.object({
  items: z.array(TableSearchTextItemSchema).describe('Массив поисковых запросов')
}));

export type ProductSearchTextsRequest = z.infer<typeof ProductSearchTextsRequestSchema>;
export type ProductSearchTextsResponse = z.infer<typeof ProductSearchTextsResponseSchema>;

export async function getProductSearchTexts(
  body: ProductSearchTextsRequest,
  token: string
): Promise<ProductSearchTextsResponse> {
  const response = await axios.post(
    'https://seller-analytics-api.wildberries.ru/api/v2/search-report/product/search-texts',
    body,
    {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json'
      }
    }
  );

  return ProductSearchTextsResponseSchema.parse(response.data);
}