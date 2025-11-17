#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';
import { getProductSearchTexts, ProductSearchTextsRequestSchema } from './tools/api/getProductSearchTexts.js';

dotenv.config();

// Функция для получения apiKey из переменных окружения или аргументов командной строки
function getApiKey() {
  if (process.env.WB_ANALYTICS_OAUTH_TOKEN) {
    return process.env.WB_ANALYTICS_OAUTH_TOKEN;
  }
  const argApiKey = process.argv.find(arg => arg.startsWith('--apiKey='));
  if (argApiKey) {
    return argApiKey.split('=')[1];
  }
  return undefined;
}

type MCPResponse = {content: any[], isError: boolean}

async function withApiKey(block: (apiKey: string) => Promise<MCPResponse>): Promise<MCPResponse> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      content: [
        {
          type: 'text',
          text: 'API key is required. Please set WB_COMMUNICATIONS_OAUTH_TOKEN environment ' +
                'variable or provide --apiKey argument.'
        }
      ],
      isError: true
    };
  } else {
    return await block(apiKey);
  }
}

const server = new McpServer(
  {
    name: 'wb-analytics-mcp',
    version: '0.0.1'
  },
  {
    capabilities: { logging: {} }
  }
);

server.registerTool(
  'getProductSearchTexts',
  {
    description:
      'Метод формирует топ поисковых запросов по товару. ' +
      'Параметры выбора поисковых запросов: limit (количество запросов, максимум 30), topOrderBy (способ выбора топа запросов). ' +
      'Максимум 3 запроса в минуту на один аккаунт продавца.',
    inputSchema: ProductSearchTextsRequestSchema.shape
  },
  async (args, _): Promise<MCPResponse> => {
    return withApiKey(async (apiKey: string): Promise<MCPResponse> => {
      const res = await getProductSearchTexts(args, apiKey);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(res, null, 2)
          }
        ],
        isError: false
      };
    });
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('WB Analytics MCP Server Running');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
