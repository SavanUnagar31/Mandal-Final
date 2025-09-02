# Mandal Backend
A community finance management system.

## Setup
1. Copy `.env.example` to `.env` and fill values.
2. Run `npm install`.
3. Run `npx sequelize-cli db:migrate`.
4. Run `npx sequelize-cli db:seed:all`.
5. Run `npm start`.

## Docker
```bash
docker-compose up -d