const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { MongoMemoryServer } = require('mongodb-memory-server');

dotenv.config();

const Product = require('./models/Product');
const Order = require('./models/Order');
const Message = require('./models/Message');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

async function connectToMongo() {
  const targetUri = process.env.MONGODB_URI;
  if (targetUri) {
    console.log('Connecting to MongoDB using MONGODB_URI...');
    await mongoose.connect(targetUri, { useNewUrlParser: true, useUnifiedTopology: true });
    return;
  }

  console.warn('MONGODB_URI not provided. Falling back to in-memory MongoDB for development.');
  const memoryServer = await MongoMemoryServer.create();
  await mongoose.connect(memoryServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });
}

const sampleProducts = [
  {
    name: 'Chocolate Fudge Cake',
    description: 'Rich and moist chocolate cake layered with smooth fudge frosting.',
    price: 1500,
    image: '/Images/braggsdiner-F8RKds2YdqA-unsplash.jpg',
    category: 'Cakes',
    featured: true
  },
  {
    name: 'Cappuccino',
    description: 'Rich and creamy coffee drink with steamed milk and a layer of foam.',
    price: 800,
    image: '/Images/anubhav-arora-RFLDagtOsMM-unsplash.jpg',
    category: 'Drinks',
    featured: true
  },
  {
    name: 'Butter Croissant',
    description: 'Flaky, golden croissant made with pure butter. Crispy outside and soft inside.',
    price: 300,
    image: '/Images/imad-786-Xn3nxa_VVCM-unsplash.jpg',
    category: 'Pastries'
  },
  {
    name: 'Strawberry Cream Cake',
    description: 'Soft vanilla sponge topped with fresh strawberries and whipped cream.',
    price: 1350,
    image: '/Images/alexandra-khudyntseva-u95_MqFUaQg-unsplash.jpg',
    category: 'Cakes'
  },
  {
    name: 'Sausage Roll',
    description: 'Savoury pastry filled with juicy sausage wrapped in flaky puff pastry.',
    price: 150,
    image: '/Images/wyteshot-uVkMCdt9aJw-unsplash.jpg',
    category: 'Savory'
  },
  {
    name: 'Chocolate Chip Cookies',
    description: 'Crunchy outside, chewy inside, loaded with chocolate chips.',
    price: 350,
    image: '/Images/sj-YDvfndOs4IQ-unsplash.jpg',
    category: 'Cookies'
  },
  {
    name: 'Glazed Doughnut',
    description: 'Soft fried doughnut coated with a sweet sugar glaze.',
    price: 200,
    image: '/Images/kobby-mendez-q54Oxq44MZs-unsplash.jpg',
    category: 'Desserts'
  },
  {
    name: 'Swiss Roll',
    description: 'Delicate rolled cake filled with creamy custard and covered in powdered sugar.',
    price: 1500,
    image: '/Images/mohammad-fahim-DhChe2qNTOI-unsplash.jpg',
    category: 'Cakes'
  },
  {
    name: 'Meat Pie',
    description: 'Flaky pastry filled with seasoned meat and vegetables.',
    price: 1500,
    image: '/Images/bakir-custovic-ZJiM8gIOAp0-unsplash.jpg',
    category: 'Savory'
  }
];

const testimonials = [
  { name: 'Amina K.', feedback: 'The cakes are always fresh, and the customer service is warm. Strongly recommend!', location: 'Eldoret' },
  { name: 'David M.', feedback: 'Best bakery in town — the pastries are flaky, the coffee is perfect, and delivery is fast.', location: 'Uasin Gishu' },
  { name: 'Rita W.', feedback: 'Comrade Choice Bakery made our event extra special with a beautiful custom cake.', location: 'Nandi Hills' }
];

async function seedProducts() {
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.create(sampleProducts);
    console.log('Seeded sample bakery products.');
  }
}

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({ available: true }).sort({ featured: -1, name: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Unable to load products' });
  }
});

app.get('/api/testimonials', (req, res) => {
  res.json(testimonials);
});

app.post('/api/contact', async (req, res) => {
  try {
    const { fullname, email, phone, subject, message } = req.body;
    if (!fullname || !email || !subject || !message) {
      return res.status(400).json({ error: 'Please provide fullname, email, subject, and message.' });
    }
    await Message.create({ fullname, email, phone, subject, message });
    res.json({ success: true, message: 'Message sent successfully. We will reply soon.' });
  } catch (error) {
    res.status(500).json({ error: 'Unable to send message.' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, email, phone, address, items } = req.body;
    if (!customerName || !email || !address || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Please provide customer information and at least one order item.' });
    }

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = await Order.create({ customerName, email, phone, address, items, total });
    res.json({ success: true, orderId: order._id, total });
  } catch (error) {
    res.status(500).json({ error: 'Unable to place order.' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, async () => {
  try {
    await connectToMongo();
    await seedProducts();
    console.log(`Server is running on http://localhost:${port}`);
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
});
