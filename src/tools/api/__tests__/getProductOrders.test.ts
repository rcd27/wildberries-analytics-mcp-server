import dotenv from 'dotenv';
import { getProductOrders } from '../getProductOrders.js';

dotenv.config();

describe('getProductOrders integration test', () => {
  const apiKey = process.env.WB_ANALYTICS_OAUTH_TOKEN;

  beforeAll(() => {
    if (!apiKey) {
      throw new Error('WB_ANALYTICS_OAUTH_TOKEN env var is not set');
    }
  });

  it('Should return product orders with required parameters', async () => {
    const response = await getProductOrders(
      {
        period: {
          start: '2024-10-01',
          end: '2024-10-07'
        },
        nmId: 211131895,
        searchTexts: ['костюм', 'пиджак']
      },
      apiKey as string
    );

    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data.total)).toBe(true);
    expect(Array.isArray(response.data.items)).toBe(true);
  });

  it('Should return orders data with metrics', async () => {
    const response = await getProductOrders(
      {
        period: {
          start: '2024-10-01',
          end: '2024-10-03'
        },
        nmId: 211131895,
        searchTexts: ['костюм']
      },
      apiKey as string
    );

    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data.total)).toBe(true);

    if (response.data.total.length > 0) {
      const totalItem = response.data.total[0];
      expect(totalItem).toEqual(
        expect.objectContaining({
          dt: expect.any(String),
          avgPosition: expect.any(Number),
          orders: expect.any(Number)
        })
      );
    }

    if (response.data.items.length > 0) {
      const item = response.data.items[0];
      expect(item).toEqual(
        expect.objectContaining({
          text: expect.any(String),
          frequency: expect.any(Number)
        })
      );

      if (item.dateItems && item.dateItems.length > 0) {
        const dateItem = item.dateItems[0];
        expect(dateItem).toHaveProperty('dt');
        expect(dateItem).toHaveProperty('avgPosition');
        expect(dateItem).toHaveProperty('orders');
      }
    }
  });

  it('Should handle multiple search texts', async () => {
    const searchTexts = ['костюм', 'пиджак', 'брюки', 'рубашка'];

    const response = await getProductOrders(
      {
        period: {
          start: '2024-10-01',
          end: '2024-10-05'
        },
        nmId: 211131895,
        searchTexts
      },
      apiKey as string
    );

    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data.items)).toBe(true);

    // Проверяем, что поисковые запросы из результатов соответствуют запрошенным
    if (response.data.items.length > 0) {
      const resultTexts = response.data.items.map(item => item.text);
      resultTexts.forEach(text => {
        if (text) {
          expect(searchTexts).toContain(text);
        }
      });
    }
  });

  it('Should return data for 7-day period', async () => {
    const response = await getProductOrders(
      {
        period: {
          start: '2024-10-01',
          end: '2024-10-07'
        },
        nmId: 211131895,
        searchTexts: ['костюм', 'пиджак']
      },
      apiKey as string
    );

    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data.total)).toBe(true);

    // Проверяем, что количество дат в total не превышает 7
    expect(response.data.total.length).toBeLessThanOrEqual(7);
  });

  it('Should handle single search text', async () => {
    const response = await getProductOrders(
      {
        period: {
          start: '2024-10-01',
          end: '2024-10-02'
        },
        nmId: 211131895,
        searchTexts: ['костюм']
      },
      apiKey as string
    );

    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data.items)).toBe(true);

    if (response.data.items.length > 0) {
      expect(response.data.items[0].text).toBe('костюм');
    }
  });
});