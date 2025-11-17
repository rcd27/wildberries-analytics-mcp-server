<img src="https://badge.mcpx.dev?type=server" title="MCP Server"/>

# WB Analytics MCP Server

MCP сервер для работы с API Wilberries Analytics.

## Установка

```bash
npm install
```

## Настройка

1. Создайте файл `.env` в корневой директории проекта(по примеру `.env.example`)
2. Добавьте следующие переменные окружения:
   ```
   WB_ANALYTICS_OAUTH_TOKEN=your_oauth_token_here
   ```

## Запуск

### Разработка
```bash
npm run dev
```

### Продакшн
```bash
npm run build
npm start
```

### Дебаг
```bash
npx @modelcontextprotocol/inspector node ./build/index.js
```

## Использование
* TODO
