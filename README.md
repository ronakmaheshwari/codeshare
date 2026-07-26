# CodeShare

A real-time collaborative code editor built with **Bun**, **React**, **WebSockets**, **Express**, **PostgreSQL**, **Prisma**, and **Redis**. CodeShare allows multiple users to join a room, edit code together in real time, chat, and manage collaborative coding sessions.

---

## Features

* 🚀 Real-time collaborative code editing
* 👥 Multi-user rooms with WebSocket synchronization
* 🔐 User authentication with JWT
* 📧 Email verification & password reset
* 💬 Real-time chat
* ⚡ Redis caching
* 🗄️ PostgreSQL database with Prisma ORM
* 🎨 Monaco Editor integration
* 📱 Responsive React UI
* 🐳 Docker & Docker Compose support
* ☁️ Deployment-ready for Render + Vercel

---

## Tech Stack

### Frontend

* Bun
* React 19
* TypeScript
* React Router
* Monaco Editor
* Axios
* TanStack Query
* Tailwind CSS
* HeroUI

### Backend

* Bun
* Express
* Prisma ORM
* PostgreSQL
* Redis
* WebSockets (`ws`)
* JWT Authentication
* Zod Validation
* Resend Email API

---

## Project Structure

```text
codeshare/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── build.ts
│   └── package.json
│
├── backend/
│   ├── prisma/
│   ├── routes/
│   ├── utils/
│   ├── websockets.ts
│   ├── main.ts
│   └── package.json
│
├── docker/
├── nginx/
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Clone the repository

```bash
git clone https://github.com/ronakmaheshwari/codeshare.git
cd codeshare
```

---

## Backend Setup

```bash
cd backend

bun install
```

Generate Prisma Client

```bash
bun run generate:db
```

Run database migrations

```bash
bunx prisma migrate deploy
```

or during development

```bash
bunx prisma db push
```

Start the backend

```bash
bun run dev
```

---

## WebSocket Server

Run the WebSocket server separately.

```bash
bun run socket
```

---

## Frontend Setup

```bash
cd frontend

bun install

bun run dev
```

Build

```bash
bun run build
```

---

## Environment Variables

### Backend

Create `.env`

```env
DATABASE_URL=

JWT_SECRET=

REDIS_URL=

RESEND_API_KEY=

FRONTEND_URL=
```

---

### Frontend

If using Bun's bundler, define the API URLs inside `build.ts` or inject them during the build.

Example:

```ts
define: {
  "import.meta.env.VITE_API_URL": JSON.stringify(process.env.VITE_API_URL),
  "import.meta.env.VITE_WEBSOCKET_URL": JSON.stringify(process.env.VITE_WEBSOCKET_URL),
}
```

---

## Docker

Start the complete application

```bash
docker compose up --build
```

This starts:

* PostgreSQL
* Backend API
* WebSocket services
* Frontend
* Nginx

---

## Deployment

### Frontend

Deploy on **Vercel**

Required environment variables:

```env
VITE_API_URL=https://your-backend.onrender.com
VITE_WEBSOCKET_URL=wss://your-websocket.onrender.com
```

---

### Backend

Deploy on **Render**

Required environment variables:

```env
DATABASE_URL=

JWT_SECRET=

REDIS_URL=

RESEND_API_KEY=
```

Run migrations after deployment:

```bash
bunx prisma migrate deploy
```

---

## API

Authentication

* `POST /user/signup`
* `POST /user/login`
* `POST /user/forgot-password`
* `POST /user/reset-password`

Rooms

* Create room
* Join room
* Manage participants
* Collaborative editing

Dashboard

* User dashboard
* Room history

---

## Future Improvements

* Voice chat
* Video collaboration
* Syntax highlighting themes
* File explorer
* Multiple language execution
* Presence indicators
* Operational Transform / CRDT synchronization
* Invite links with permissions

---

## License

This project is licensed under the MIT License.

---

## Author

**Ronak Maheshwari**

GitHub: [https://github.com/ronakmaheshwari](https://github.com/ronakmaheshwari)
