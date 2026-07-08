const API_BASE = '/api';
const CART_STORAGE_KEY = 'comradeChoiceCart';

function initCarousel() {
  const slides = document.querySelectorAll('.slide');
  if (!slides.length) return;

  let currentSlide = 0;
  const showSlide = (index) => {
    slides.forEach((slide) => slide.classList.remove('active'));
    slides[index].classList.add('active');
  };

  const nextSlide = () => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  };

  showSlide(currentSlide);
  setInterval(nextSlide, 4000);
}

function initHamburger() {
  const hamburger = document.querySelector('.hamburger');
  const navbar = document.querySelector('.navbar');
  if (!hamburger || !navbar) return;

  hamburger.addEventListener('click', () => {
    navbar.classList.toggle('open');
    const icon = hamburger.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-times');
    }
  });
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  renderCartCount();
}

function renderCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartButton = document.querySelector('.header-icons button[aria-label="cart"]');
  if (!cartButton) return;

  let badge = cartButton.querySelector('.cart-count');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'cart-count';
    cartButton.appendChild(badge);
  }
  badge.textContent = count;
  badge.style.display = count ? 'inline-flex' : 'none';
}

function createCartPanel() {
  if (document.getElementById('cartPanel')) return;

  const panelHtml = `
    <div class="cart-panel" id="cartPanel" aria-hidden="true">
      <div class="cart-backdrop" id="cartBackdrop"></div>
      <aside class="cart-drawer" role="dialog" aria-label="Shopping cart">
        <div class="cart-header">
          <h2>Your cart</h2>
          <button class="cart-close" aria-label="Close cart"><i class="fas fa-times"></i></button>
        </div>
        <div class="cart-body">
          <div class="cart-items" id="cartItems"></div>
          <div class="cart-empty-message">Your cart is empty. Add items from the menu to begin.</div>
        </div>
        <div class="cart-footer">
          <div class="cart-summary">
            <span>Total</span>
            <strong id="cartTotal">KES 0</strong>
          </div>
          <div class="cart-actions">
            <button class="clear-cart" type="button">Clear cart</button>
          </div>
          <form class="checkout-form" id="checkoutForm">
            <h3>Checkout</h3>
            <input type="text" name="customerName" placeholder="Full name" required>
            <input type="email" name="email" placeholder="Email address" required>
            <input type="tel" name="phone" placeholder="Phone number">
            <input type="text" name="address" placeholder="Delivery address" required>
            <button type="submit" class="submit-btn">Place order</button>
            <p class="checkout-message" id="checkoutMessage"></p>
          </form>
        </div>
      </aside>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', panelHtml);
  const cartButton = document.querySelector('.header-icons button[aria-label="cart"]');
  const panel = document.getElementById('cartPanel');
  const backdrop = document.getElementById('cartBackdrop');
  const closeButton = panel.querySelector('.cart-close');
  const clearButton = panel.querySelector('.clear-cart');
  const checkoutForm = document.getElementById('checkoutForm');

  const openCart = () => {
    panel.classList.add('visible');
    panel.setAttribute('aria-hidden', 'false');
    renderCart();
  };

  const closeCart = () => {
    panel.classList.remove('visible');
    panel.setAttribute('aria-hidden', 'true');
  };

  if (cartButton) {
    cartButton.addEventListener('click', openCart);
  }
  backdrop.addEventListener('click', closeCart);
  closeButton.addEventListener('click', closeCart);
  clearButton.addEventListener('click', () => {
    saveCart([]);
    renderCart();
  });

  checkoutForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const cart = getCart();
    if (!cart.length) {
      showCheckoutMessage('Please add items to your cart before placing an order.', false);
      return;
    }

    const formData = new FormData(checkoutForm);
    const order = {
      customerName: formData.get('customerName').trim(),
      email: formData.get('email').trim(),
      phone: formData.get('phone').trim(),
      address: formData.get('address').trim(),
      items: cart.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    };

    if (!order.customerName || !order.email || !order.address) {
      showCheckoutMessage('Please fill in your name, email, and address.', false);
      return;
    }

    showCheckoutMessage('Placing your order…', true);

    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to process your order.');
      }
      saveCart([]);
      checkoutForm.reset();
      renderCart();
      showCheckoutMessage(`Order received! Your order ID is ${data.orderId}.`, true);
    } catch (error) {
      showCheckoutMessage(error.message || 'Order failed. Please try again.', false);
    }
  });
}

function showCheckoutMessage(message, success) {
  const messageElement = document.getElementById('checkoutMessage');
  if (!messageElement) return;
  messageElement.textContent = message;
  messageElement.className = success ? 'checkout-message success' : 'checkout-message error';
}

function renderCart() {
  const cart = getCart();
  const cartItemsContainer = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const emptyMessage = document.querySelector('.cart-empty-message');

  if (!cartItemsContainer || !cartTotal || !emptyMessage) return;

  cartItemsContainer.innerHTML = '';
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = `KES ${total}`;

  if (!cart.length) {
    emptyMessage.style.display = 'block';
    return;
  }

  emptyMessage.style.display = 'none';

  cart.forEach((item, index) => {
    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item';
    itemElement.innerHTML = `
      <div class="cart-item-details">
        <img src="${item.image}" alt="${item.name}">
        <div>
          <h4>${item.name}</h4>
          <p>${item.description}</p>
          <span>KES ${item.price} x ${item.quantity}</span>
        </div>
      </div>
      <div class="cart-item-actions">
        <button class="quantity-btn" data-index="${index}" data-action="decrease">-</button>
        <span>${item.quantity}</span>
        <button class="quantity-btn" data-index="${index}" data-action="increase">+</button>
        <button class="remove-btn" data-index="${index}">Remove</button>
      </div>
    `;
    cartItemsContainer.appendChild(itemElement);
  });

  cartItemsContainer.querySelectorAll('.quantity-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const index = parseInt(button.dataset.index, 10);
      const action = button.dataset.action;
      updateCartQuantity(index, action === 'increase' ? 1 : -1);
    });
  });

  cartItemsContainer.querySelectorAll('.remove-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const index = parseInt(button.dataset.index, 10);
      removeCartItem(index);
    });
  });
}

function updateCartQuantity(index, change) {
  const cart = getCart();
  if (!cart[index]) return;
  cart[index].quantity = Math.max(1, cart[index].quantity + change);
  saveCart(cart);
  renderCart();
}

function removeCartItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product._id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product._id,
      name: product.name,
      description: product.description,
      image: product.image,
      price: product.price,
      quantity: 1
    });
  }
  saveCart(cart);
  renderCart();
}

function renderProducts(products, container) {
  if (!container) return;
  container.innerHTML = products.map((product) => `
    <div class="menu-item">
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <div class="menu-footer">
        <span class="price">KES ${product.price}</span>
        <button class="add-cart" type="button" data-product-id="${product._id}"><i class="fas fa-cart-plus"></i></button>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.add-cart').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.productId;
      const product = products.find((item) => item._id === id);
      if (product) {
        addToCart(product);
      }
    });
  });
}

async function fetchProducts() {
  try {
    const response = await fetch(`${API_BASE}/products`);
    const products = await response.json();

    const menuContainer = document.querySelector('.menu-container');
    if (menuContainer) {
      renderProducts(products, menuContainer);
    }

    const featuredContainer = document.getElementById('featuredProducts');
    if (featuredContainer) {
      const featured = products.filter((product) => product.featured).slice(0, 4);
      featuredContainer.innerHTML = featured.map((product) => `
        <div class="special-item">
          <img src="${product.image}" alt="${product.name}">
          <div>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="special-footer">
              <span>KES ${product.price}</span>
              <button class="add-cart" type="button" data-product-id="${product._id}"><i class="fas fa-cart-plus"></i></button>
            </div>
          </div>
        </div>
      `).join('');

      featuredContainer.querySelectorAll('.add-cart').forEach((button) => {
        button.addEventListener('click', () => {
          const id = button.dataset.productId;
          const product = products.find((item) => item._id === id);
          if (product) addToCart(product);
        });
      });
    }
  } catch (error) {
    console.error('Could not load products', error);
  }
}

function renderTestimonials(testimonials) {
  const container = document.getElementById('testimonialsContainer');
  if (!container) return;
  container.innerHTML = testimonials.map((testimonial) => `
    <div class="testimonial-card">
      <p>"${testimonial.feedback}"</p>
      <h4>${testimonial.name}</h4>
      <span>${testimonial.location}</span>
    </div>
  `).join('');
}

async function fetchTestimonials() {
  try {
    const response = await fetch(`${API_BASE}/testimonials`);
    const testimonials = await response.json();
    renderTestimonials(testimonials);
  } catch (error) {
    console.error('Unable to load testimonials', error);
  }
}

function handleContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  const resultElement = document.getElementById('contactResult');
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const data = {
      fullname: formData.get('fullname').trim(),
      email: formData.get('email').trim(),
      phone: formData.get('phone').trim(),
      subject: formData.get('subject').trim(),
      message: formData.get('message').trim()
    };

    resultElement.textContent = 'Sending message...';
    resultElement.className = 'form-result';
    try {
      const response = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const responseBody = await response.json();
      if (!response.ok) {
        throw new Error(responseBody.error || 'Unable to send message');
      }
      contactForm.reset();
      resultElement.textContent = responseBody.message || 'Message sent successfully.';
      resultElement.classList.add('success');
    } catch (error) {
      resultElement.textContent = error.message || 'Failed to send your message. Please try again.';
      resultElement.classList.add('error');
    }
  });
}

function handleNewsletterForm() {
  const newsletterForm = document.getElementById('newsletterForm');
  if (!newsletterForm) return;
  const resultElement = document.getElementById('newsletterResult');

  newsletterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = newsletterForm.querySelector('input[name="newsletterEmail"]').value.trim();
    if (!email) {
      resultElement.textContent = 'Please enter a valid email address.';
      resultElement.className = 'form-result error';
      return;
    }
    newsletterForm.reset();
    resultElement.textContent = 'You are subscribed! We will share new flavors and offers soon.';
    resultElement.className = 'form-result success';
  });
}

function bindOrderNowButtons() {
  const orderButtons = document.querySelectorAll('[data-action="open-cart"]');
  orderButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const cartButton = document.querySelector('.header-icons button[aria-label="cart"]');
      if (cartButton) cartButton.click();
    });
  });
}

function init() {
  initCarousel();
  initHamburger();
  createCartPanel();
  renderCartCount();
  renderCart();
  fetchProducts();
  fetchTestimonials();
  handleContactForm();
  handleNewsletterForm();
  bindOrderNowButtons();
}

window.addEventListener('DOMContentLoaded', init);

























































