const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor('#5c8f69');
  tg.setBackgroundColor('#f8f3ea');
}

const products = [
  {
    id: 1,
    title: 'Букет «Нежный рассвет»',
    category: 'Букеты',
    emoji: '💐',
    price: 2490,
    tag: 'Хит продаж',
    description: 'Лёгкий букет в пастельной гамме для поздравлений, свиданий и приятных сюрпризов без повода.'
  },
  {
    id: 2,
    title: 'Розы пудровые 15 шт.',
    category: 'Розы',
    emoji: '🌹',
    price: 3190,
    tag: 'Классика',
    description: 'Композиция из пудровых роз с аккуратной упаковкой и атласной лентой.'
  },
  {
    id: 3,
    title: 'Монобукет из тюльпанов',
    category: 'Монобукеты',
    emoji: '🌷',
    price: 1890,
    tag: 'Весна',
    description: 'Яркие тюльпаны, которые создают ощущение весны и отлично подходят для подарка.'
  },
  {
    id: 4,
    title: 'Коробка с цветами и макаронс',
    category: 'Подарки',
    emoji: '🎁',
    price: 3790,
    tag: 'Подарочный набор',
    description: 'Цветочная коробка с нежными оттенками и сладким дополнением для особого случая.'
  },
  {
    id: 5,
    title: 'Комнатное растение «Фикус»',
    category: 'Растения',
    emoji: '🪴',
    price: 1590,
    tag: 'Для дома',
    description: 'Зелёный акцент для интерьера. Подходит для дома, офиса или учебного пространства.'
  },
  {
    id: 6,
    title: 'Букет «Ягодный крем»',
    category: 'Букеты',
    emoji: '🌺',
    price: 2890,
    tag: 'Новинка',
    description: 'Авторский букет в розово‑ягодных оттенках с воздушной упаковкой.'
  },
  {
    id: 7,
    title: 'Белые розы 11 шт.',
    category: 'Розы',
    emoji: '🤍',
    price: 2590,
    tag: 'Минимализм',
    description: 'Сдержанный букет из белых роз для тех, кто любит чистый и спокойный стиль.'
  },
  {
    id: 8,
    title: 'Открытка и свеча',
    category: 'Подарки',
    emoji: '🕯️',
    price: 790,
    tag: 'Дополнение',
    description: 'Небольшой подарок, который можно добавить к букету для завершения заказа.'
  }
];

const categories = ['Все', 'Букеты', 'Розы', 'Монобукеты', 'Подарки', 'Растения'];
const storageKey = 'flower-miniapp-cart-v1';

let cart = JSON.parse(localStorage.getItem(storageKey) || '{}');
let activeCategory = 'Все';
let searchQuery = '';
let currentProductId = null;

const formatPrice = (value) => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
const saveCart = () => localStorage.setItem(storageKey, JSON.stringify(cart));
const getCartCount = () => Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
const getCartItems = () => Object.values(cart);

function vibrate(type = 'light') {
  if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred(type);
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.toggle('active', page.id === pageId));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.page === pageId));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderCategories() {
  const container = document.getElementById('categoryTabs');
  container.innerHTML = categories.map(category => `
    <button class="category-btn ${category === activeCategory ? 'active' : ''}" data-category="${category}" type="button">
      ${category}
    </button>
  `).join('');
}

function productCard(product) {
  return `
    <article class="product-card">
      <button class="more-btn" data-details="${product.id}" type="button">›</button>
      <div class="product-visual">${product.emoji}</div>
      <span class="tag">${product.tag}</span>
      <h3>${product.title}</h3>
      <p>${product.description}</p>
      <div class="product-bottom">
        <strong class="price">${formatPrice(product.price)}</strong>
        <button class="add-btn" data-add="${product.id}" type="button">+</button>
      </div>
    </article>
  `;
}

function getFilteredProducts() {
  return products.filter(product => {
    const byCategory = activeCategory === 'Все' || product.category === activeCategory;
    const bySearch = product.title.toLowerCase().includes(searchQuery) || product.description.toLowerCase().includes(searchQuery);
    return byCategory && bySearch;
  });
}

function renderProducts() {
  const grid = document.getElementById('productGrid');
  const filtered = getFilteredProducts();

  grid.innerHTML = filtered.length
    ? filtered.map(productCard).join('')
    : `<div class="empty-card" style="grid-column: 1 / -1;"><div class="big">🌿</div><h2>Ничего не найдено</h2><p>Попробуйте выбрать другую категорию или изменить запрос.</p></div>`;
}

function renderPopular() {
  const popular = products.slice(0, 5);
  document.getElementById('popularList').innerHTML = popular.map(productCard).join('');
}

function updateCartCounters() {
  const count = getCartCount();
  ['cartCountHero', 'cartCountCatalog'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = count;
  });
}

function addToCart(productId) {
  const product = products.find(item => item.id === Number(productId));
  if (!product) return;

  if (!cart[product.id]) {
    cart[product.id] = { ...product, qty: 0 };
  }

  cart[product.id].qty += 1;
  saveCart();
  updateCartCounters();
  renderCart();
  vibrate('medium');

  if (tg?.showPopup) {
    tg.showPopup({
      title: 'Добавлено в корзину',
      message: `${product.title} теперь в корзине`,
      buttons: [{ type: 'ok' }]
    });
  }
}

function changeQty(productId, direction) {
  if (!cart[productId]) return;
  cart[productId].qty += direction;
  if (cart[productId].qty <= 0) delete cart[productId];
  saveCart();
  updateCartCounters();
  renderCart();
}

function removeItem(productId) {
  delete cart[productId];
  saveCart();
  updateCartCounters();
  renderCart();
}

function renderCart() {
  const list = document.getElementById('cartList');
  const items = getCartItems();

  if (!items.length) {
    list.innerHTML = `
      <article class="empty-card">
        <div class="big">🛒</div>
        <h2>Корзина пустая</h2>
        <p>Добавьте букет или подарок из каталога.</p>
        <button class="primary-btn" data-page="catalog-page" type="button">Перейти в каталог</button>
      </article>
    `;
  } else {
    list.innerHTML = items.map(item => `
      <article class="cart-item">
        <div class="cart-visual">${item.emoji}</div>
        <div>
          <h3>${item.title}</h3>
          <p>${formatPrice(item.price)}</p>
          <div class="qty-row">
            <div class="qty-controls">
              <button data-qty-minus="${item.id}" type="button">−</button>
              <strong>${item.qty}</strong>
              <button data-qty-plus="${item.id}" type="button">+</button>
            </div>
            <button class="remove-btn" data-remove="${item.id}" type="button">Удалить</button>
          </div>
        </div>
      </article>
    `).join('');
  }

  const itemsPrice = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const delivery = itemsPrice === 0 ? 0 : itemsPrice >= 3990 ? 0 : 300;
  const total = itemsPrice + delivery;

  document.getElementById('cartItemsPrice').textContent = formatPrice(itemsPrice);
  document.getElementById('deliveryPrice').textContent = delivery ? formatPrice(delivery) : 'Бесплатно';
  document.getElementById('cartTotal').textContent = formatPrice(total);
  document.getElementById('openCheckoutBtn').disabled = items.length === 0;
}

function openProductModal(productId) {
  const product = products.find(item => item.id === Number(productId));
  if (!product) return;
  currentProductId = product.id;

  document.getElementById('modalFlower').textContent = product.emoji;
  document.getElementById('modalCategory').textContent = product.category;
  document.getElementById('modalTitle').textContent = product.title;
  document.getElementById('modalDescription').textContent = product.description;
  document.getElementById('modalPrice').textContent = formatPrice(product.price);
  document.getElementById('modalTag').textContent = product.tag;
  document.getElementById('productModal').classList.add('open');
  document.getElementById('productModal').setAttribute('aria-hidden', 'false');
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('open');
  document.getElementById('productModal').setAttribute('aria-hidden', 'true');
}

function openCheckoutModal() {
  if (!getCartItems().length) return;
  document.getElementById('checkoutModal').classList.add('open');
  document.getElementById('checkoutModal').setAttribute('aria-hidden', 'false');
}

function closeCheckoutModal() {
  document.getElementById('checkoutModal').classList.remove('open');
  document.getElementById('checkoutModal').setAttribute('aria-hidden', 'true');
}

function clearCart() {
  cart = {};
  saveCart();
  updateCartCounters();
  renderCart();
}

function checkoutSuccess() {
  clearCart();
  closeCheckoutModal();
  showPage('home-page');

  if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');

  if (tg?.showPopup) {
    tg.showPopup({
      title: 'Заказ оформлен',
      message: 'Демо‑заказ успешно создан. Для диплома это показывает сценарий покупки.',
      buttons: [{ type: 'ok' }]
    });
  } else {
    alert('Заказ оформлен! Это демонстрационный сценарий.' );
  }
}

document.addEventListener('click', (event) => {
  const pageButton = event.target.closest('[data-page]');
  if (pageButton) showPage(pageButton.dataset.page);

  const addButton = event.target.closest('[data-add]');
  if (addButton) addToCart(addButton.dataset.add);

  const detailsButton = event.target.closest('[data-details]');
  if (detailsButton) openProductModal(detailsButton.dataset.details);

  const categoryButton = event.target.closest('[data-category]');
  if (categoryButton) {
    activeCategory = categoryButton.dataset.category;
    renderCategories();
    renderProducts();
  }

  const minus = event.target.closest('[data-qty-minus]');
  if (minus) changeQty(minus.dataset.qtyMinus, -1);

  const plus = event.target.closest('[data-qty-plus]');
  if (plus) changeQty(plus.dataset.qtyPlus, 1);

  const remove = event.target.closest('[data-remove]');
  if (remove) removeItem(remove.dataset.remove);

  if (event.target.closest('[data-close-modal]')) closeProductModal();
  if (event.target.closest('[data-close-checkout]')) closeCheckoutModal();
});

document.getElementById('searchInput').addEventListener('input', (event) => {
  searchQuery = event.target.value.trim().toLowerCase();
  renderProducts();
});

document.getElementById('modalAddBtn').addEventListener('click', () => {
  if (currentProductId) addToCart(currentProductId);
  closeProductModal();
});

document.getElementById('clearCartBtn').addEventListener('click', clearCart);
document.getElementById('openCheckoutBtn').addEventListener('click', openCheckoutModal);
document.getElementById('checkoutForm').addEventListener('submit', (event) => {
  event.preventDefault();
  checkoutSuccess();
  event.target.reset();
});

renderCategories();
renderPopular();
renderProducts();
renderCart();
updateCartCounters();
