# Setup Guide

1. Clone the repository.
2. Copy `.env.example` to `.env` and fill in the required values.
3. Install dependencies: `npm install`.
4. Run migrations: `npx sequelize-cli db:migrate`.
5. Run seeders: `npx sequelize-cli db:seed:all`.
6. Start the server: `npm start`.