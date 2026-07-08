# Comrade Choice Bakery

A bakery website built with a frontend landing page and a Node.js + Express backend using MongoDB.

## Features

- Responsive landing site with menu, gallery, contact form, testimonials, and FAQ sections.
- Functional cart panel with local storage support.
- Backend API for product catalog, contact messages, and order creation.
- MongoDB data persistence with an in-memory fallback for local development when `MONGODB_URI` is not available.

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` from `.env.example` and update `MONGODB_URI` if needed.

3. Start the app:

```bash
npm run dev
```

4. Open `http://localhost:5000` in your browser.

## API endpoints

- `GET /api/products` - list bakery items.
- `GET /api/testimonials` - sample customer testimonials.
- `POST /api/contact` - send a contact message.
- `POST /api/orders` - place a new order.
- `GET /api/health` - backend health check.
