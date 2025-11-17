import dotenv from 'dotenv';
import { getProductSearchTexts } from '../getProductSearchTexts.js';

dotenv.config();

describe('getProductSearchTexts integration test', () => {
  const apiKey = process.env.WB_ANALYTICS_OAUTH_TOKEN;

  beforeAll(() => {
    if (!apiKey) {
      throw new Error('WB_ANALYTICS_OAUTH_TOKEN env var is not set');
    }
  });

  it('Should return product search texts with required parameters', async () => {
    const response = await getProductSearchTexts(
      {
        currentPeriod: {
          start: '2024-10-01',
          end: '2024-10-07'
        },
        nmIds: [162579635],
        topOrderBy: 'openToCart',
        orderBy: {
          field: 'avgPosition',
          mode: 'asc'
        },
        limit: 10
      },
      apiKey as string
    );

    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data.items)).toBe(true);
  });

  it('Should return search texts with past period comparison', async () => {
    const response = await getProductSearchTexts(
      {
        currentPeriod: {
          start: '2024-10-08',
          end: '2024-10-14'
        },
        pastPeriod: {
          start: '2024-10-01',
          end: '2024-10-07'
        },
        nmIds: [162579635, 166699779],
        topOrderBy: 'orders',
        orderBy: {
          field: 'orders',
          mode: 'desc'
        },
        limit: 20
      },
      apiKey as string
    );

    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data.items)).toBe(true);

    if (response.data.items.length > 0) {
      const item = response.data.items[0];
      expect(item).toEqual(
        expect.objectContaining({
          text: expect.any(String),
          nmId: expect.any(Number),
          subjectName: expect.any(String),
          brandName: expect.any(String)
        })
      );

      if (item.frequency) {
        expect(item.frequency).toHaveProperty('current');
      }

      if (item.openCard) {
        expect(item.openCard).toHaveProperty('current');
        expect(item.openCard).toHaveProperty('percentile');
      }
    }
  });

  it('Should handle different sort fields', async () => {
    const response = await getProductSearchTexts(
      {
        currentPeriod: {
          start: '2024-10-01',
          end: '2024-10-07'
        },
        nmIds: [162579635],
        topOrderBy: 'addToCart',
        orderBy: {
          field: 'visibility',
          mode: 'desc'
        },
        limit: 5
      },
      apiKey as string
    );

    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data.items)).toBe(true);
    expect(response.data.items.length).toBeLessThanOrEqual(5);
  });

  it('Should handle multiple nmIds', async () => {
    const nmIds = [162579635, 166699779, 170000000];

    const response = await getProductSearchTexts(
      {
        currentPeriod: {
          start: '2024-10-01',
          end: '2024-10-07'
        },
        nmIds,
        topOrderBy: 'cartToOrder',
        orderBy: {
          field: 'cartToOrder',
          mode: 'desc'
        },
        limit: 15
      },
      apiKey as string
    );

    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data.items)).toBe(true);

    if (response.data.items.length > 0) {
      // Проверяем, что nmId из результатов входит в наш список
      const resultNmIds = response.data.items.map(item => item.nmId);
      resultNmIds.forEach(nmId => {
        if (nmId) {
          expect(nmIds).toContain(nmId);
        }
      });
    }
  });
});