import axios from 'axios';
import { z } from 'zod';
import { createResponseSchema } from '../../createResponseSchema.js';

// Период для запроса заказов
export const PeriodOrdersRequestSchema = z.object({
  start: z
    .string()
    .describe('Дата начала периода. Не позднее `end`. Не ранее 365 суток от сегодня'),
  end: z
    .string()
    .describe('Дата окончания периода. Не ранее 365 суток от сегодня')
});

// Request body
export const ProductOrdersRequestSchema = z.object({
  period: PeriodOrdersRequestSchema.describe('Текущий период. Максимум 7 суток'),
  nmId: z
    .number()
    .int()
    .describe('Артикул WB'),
  searchTexts: z
    .array(z.string())
    .min(1)
    .max(30)
    .describe('Поисковые запросы')
});

// Метрики заказов
export const ProductOrdersMetricsSchema = z.object({
  dt: z
    .string()
    .optional()
    .nullable()
    .describe('Дата сбора статистики'),
  avgPosition: z
    .number()
    .int()
    .optional()
    .nullable()
    .describe('Средняя позиция товара в результатах поиска'),
  orders: z
    .number()
    .int()
    .optional()
    .nullable()
    .describe('Сколько раз товары из поиска заказали')
}).passthrough();

// Элемент таблицы заказов по поисковому запросу
export const ProductOrdersTextItemSchema = z.object({
  text: z
    .string()
    .optional()
    .nullable()
    .describe('Текст поискового запроса'),
  frequency: z
    .number()
    .int()
    .optional()
    .nullable()
    .describe('Количество обращений с поисковым запросом'),
  dateItems: z
    .array(ProductOrdersMetricsSchema)
    .optional()
    .nullable()
    .describe('Статистика по датам')
}).passthrough();

// Response
export const ProductOrdersResponseSchema = createResponseSchema(z.object({
  total: z
    .array(ProductOrdersMetricsSchema)
    .describe('Итог по товарам'),
  items: z
    .array(ProductOrdersTextItemSchema)
    .describe('Элементы таблицы')
}));

export type ProductOrdersRequest = z.infer<typeof ProductOrdersRequestSchema>;
export type ProductOrdersResponse = z.infer<typeof ProductOrdersResponseSchema>;

export async function getProductOrders(
  body: ProductOrdersRequest,
  token: string
): Promise<ProductOrdersResponse> {
  const response = await axios.post(
    'https://seller-analytics-api.wildberries.ru/api/v2/search-report/product/orders',
    body,
    {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json'
      }
    }
  );

  return ProductOrdersResponseSchema.parse(response.data);
}