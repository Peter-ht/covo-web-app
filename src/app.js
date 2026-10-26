import { fetchMenuItems, createMenuItem, updateMenuItem, patchMenuItem, deleteMenuItem } from './modules/api.js';
import {
  addToCart,
  removeFromCart,
  createCart,
  getCartCount,
  getCartTotal,
  formatCurrency
} from './modules/cart.js';

const cart = createCart();
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';
const ORDER_STORAGE_KEY = 'covoOrders';
const ORDER_STATUS_OPTIONS = ['Pending', 'Preparing', 'Ready', 'Completed'];
let editingItemId = null;
let cartLink = null;
let cartIndicator = null;
let cartItemsList = null;
let cartTotal = null;
let checkoutButton = null;
let adminLoginForm = null;
let adminUsernameInput = null;
let adminPasswordInput = null;
let adminLoginMessage = null;
let adminPanel = null;
let logoutAdminButton = null;
let menuForm = null;
let menuIdInput = null;
let menuNameInput = null;
let menuTagInput = null;
let menuPriceInput = null;
let menuImageInput = null;
let menuDescriptionInput = null;
let cancelEditButton = null;
let adminMenuList = null;
let adminOrdersList = null;

function cacheDomElements() {
  cartLink = document.getElementById('cart-link');
  cartIndicator = document.getElementById('cart-indicator');
  cartItemsList = document.getElementById('cart-items');
  cartTotal = document.getElementById('cart-total');
  checkoutButton = document.querySelector('.checkout-btn');
  adminLoginForm = document.getElementById('admin-login-form');
  adminUsernameInput = document.getElementById('admin-username');
  adminPasswordInput = document.getElementById('admin-password');
  adminLoginMessage = document.getElementById('admin-login-message');
  adminPanel = document.getElementById('admin-panel');
  logoutAdminButton = document.getElementById('logout-admin');
  menuForm = document.getElementById('menu-form');
  menuIdInput = document.getElementById('menu-id');
  menuNameInput = document.getElementById('menu-name');
  menuTagInput = document.getElementById('menu-tag');
  menuPriceInput = document.getElementById('menu-price');
  menuImageInput = document.getElementById('menu-image');
  menuDescriptionInput = document.getElementById('menu-description');
  cancelEditButton = document.getElementById('cancel-edit');
  adminMenuList = document.getElementById('admin-menu-list');
  adminOrdersList = document.getElementById('admin-orders-list');
}

function showUserMessage(message, type = 'info') {
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 2600);
}

function updateCartUI() {
  const totalItems = getCartCount(cart);
  const total = getCartTotal(cart);

  if (cartLink) {
    cartLink.textContent = `Cart (${totalItems})`;
  }

  if (cartIndicator) {
    cartIndicator.textContent = `${totalItems} item${totalItems === 1 ? '' : 's'}`;
  }

  if (cartTotal) {
    cartTotal.textContent = formatCurrency(total);
  }

  if (cartItemsList) {
    if (!cart.length) {
      cartItemsList.innerHTML = '<li class="empty">Your cart is empty.</li>';
      if (cartTotal) {
        cartTotal.textContent = 'KSh 0';
      }
      return;
    }

    cartItemsList.innerHTML = cart
      .map(
        (item) => `
          <li>
            <div class="cart-item-row">
              <span>${item.name}</span>
              <div class="cart-item-actions">
                <span>x${item.quantity}</span>
                <button type="button" class="remove-btn" data-remove-name="${item.name}">Remove</button>
              </div>
            </div>
          </li>
        `
      )
      .join('');

    cartItemsList.querySelectorAll('.remove-btn').forEach((button) => {
      button.addEventListener('click', () => {
        removeFromCart(cart, button.dataset.removeName);
        updateCartUI();
      });
    });
  }
}

function setAdminAccess(isLoggedIn) {
  const isAuthenticated = Boolean(isLoggedIn);

  if (adminPanel) {
    adminPanel.classList.toggle('hidden', !isAuthenticated);
  }

  if (adminLoginForm) {
    adminLoginForm.classList.toggle('hidden', isAuthenticated);
  }

  if (adminLoginMessage) {
    adminLoginMessage.textContent = isAuthenticated ? 'Logged in as admin.' : '';
    adminLoginMessage.classList.toggle('error', false);
  }

  if (adminUsernameInput) adminUsernameInput.value = '';
  if (adminPasswordInput) adminPasswordInput.value = '';
}

function renderMenu(items) {
  const menuGrid = document.getElementById('menu-grid');

  if (!menuGrid) return;

  menuGrid.innerHTML = '';

  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'menu-card';
    card.innerHTML = `
      <div class="menu-image" style="background-image: url('${item.image}')"></div>
      <div class="menu-body">
        <div class="menu-topline">
          <span>${item.tag}</span>
          <strong>${formatCurrency(item.price)}</strong>
        </div>
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <button type="button" class="add-btn">Add to cart</button>
      </div>
    `;

    const addButton = card.querySelector('.add-btn');
    if (addButton) {
      addButton.addEventListener('click', () => {
        addToCart(cart, item);
        updateCartUI();
        showUserMessage(`${item.name} added to cart`, 'success');
      });
    }

    menuGrid.appendChild(card);
  });
}

function getStoredOrders() {
  try {
    const storedOrders = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY) || '[]');
    return Array.isArray(storedOrders) ? storedOrders : [];
  } catch (error) {
    return [];
  }
}

function saveStoredOrders(orders) {
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
}

function updateTrackingStatus() {
  const trackingStatus = document.querySelector('.tracking-status');
  const progressSteps = document.querySelectorAll('.progress-steps span');
  const progressLine = document.querySelector('.progress-line span');

  if (!trackingStatus || !progressLine || !progressSteps.length) {
    return;
  }

  const orders = getStoredOrders();
  const latestOrder = orders[0];
  const status = latestOrder && latestOrder.status ? latestOrder.status : 'Pending';

  trackingStatus.textContent = status;

  const statusIndex = ORDER_STATUS_OPTIONS.indexOf(status);
  const percentage = statusIndex >= 0
    ? ((statusIndex + 1) / ORDER_STATUS_OPTIONS.length) * 100
    : 25;

  progressLine.style.width = `${percentage}%`;

  progressSteps.forEach((step, index) => {
    const isDone = index <= statusIndex;
    step.classList.toggle('done', isDone);
  });
}

function renderAdminOrders(orders = getStoredOrders()) {
  if (!adminOrdersList) return;

  adminOrdersList.innerHTML = '';

  if (!orders.length) {
    adminOrdersList.innerHTML = '<li class="empty-order">No customer orders yet.</li>';
    updateTrackingStatus();
    return;
  }

  orders.forEach((order) => {
    const orderItem = document.createElement('li');
    const itemSummary = (order.items || [])
      .map((item) => `${item.name} x${item.quantity}`)
      .join(', ') || 'No items';
    const currentStatus = order.status || 'Pending';
    const statusClass = currentStatus.toLowerCase().replace(/\s+/g, '-');

    orderItem.className = 'admin-order-item';
    orderItem.innerHTML = `
      <div class="admin-order-main">
        <div class="admin-order-header">
          <strong>Order #${order.id}</strong>
          <span class="order-total">${formatCurrency(order.total || 0)}</span>
        </div>
        <p class="order-phone">Customer: ${order.phone || 'Guest'}</p>
        <p class="order-items">${itemSummary}</p>
      </div>
      <div class="order-status-panel">
        <span class="order-status-badge ${statusClass}">${currentStatus}</span>
        <label class="order-status-wrap">
          <span>Status</span>
          <select class="order-status-select" data-order-id="${order.id}">
            ${ORDER_STATUS_OPTIONS.map(
              (status) => `<option value="${status}" ${status === currentStatus ? 'selected' : ''}>${status}</option>`
            ).join('')}
          </select>
        </label>
      </div>
    `;

    const statusSelect = orderItem.querySelector('.order-status-select');
    statusSelect.addEventListener('change', (event) => {
      const nextStatus = event.target.value;
      const updatedOrders = getStoredOrders().map((entry) =>
        String(entry.id) === String(order.id) ? { ...entry, status: nextStatus } : entry
      );

      saveStoredOrders(updatedOrders);
      renderAdminOrders(updatedOrders);
      updateTrackingStatus();
      showUserMessage(`Order #${order.id} marked as ${nextStatus}.`, 'success');
    });

    adminOrdersList.appendChild(orderItem);
  });

  updateTrackingStatus();
}

function renderAdminMenu(items) {
  if (!adminMenuList) return;

  adminMenuList.innerHTML = '';

  items.forEach((item) => {
    const listItem = document.createElement('li');
    listItem.className = 'admin-menu-item';
    listItem.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <small>${item.tag}</small>
      </div>
      <div class="admin-menu-item-actions">
        <button type="button" class="edit-btn" data-id="${item.id}">Edit</button>
        <button type="button" class="delete-btn" data-id="${item.id}">Delete</button>
      </div>
    `;

    const editButton = listItem.querySelector('.edit-btn');
    const deleteButton = listItem.querySelector('.delete-btn');
    const featuredButton = document.createElement('button');
    featuredButton.type = 'button';
    featuredButton.className = 'edit-btn';
    featuredButton.textContent = item.tag === 'Featured' ? 'Unfeature' : 'Feature';
    featuredButton.addEventListener('click', async () => {
      try {
        await patchMenuItem(item.id, { tag: item.tag === 'Featured' ? 'Chef special' : 'Featured' });
        showUserMessage('Menu highlight updated.', 'success');
        await loadMenu();
      } catch (error) {
        showUserMessage(error.message || 'Unable to update highlight.', 'error');
      }
    });

    editButton.addEventListener('click', () => beginEdit(item));
    deleteButton.addEventListener('click', () => deleteMenuItemById(item.id));

    const actions = listItem.querySelector('.admin-menu-item-actions');
    actions.appendChild(featuredButton);
    adminMenuList.appendChild(listItem);
  });
}

function resetMenuForm() {
  if (menuForm) {
    menuForm.reset();
  }
  editingItemId = null;
  if (menuIdInput) menuIdInput.value = '';
  if (cancelEditButton) cancelEditButton.classList.add('hidden');
}

function beginEdit(item) {
  editingItemId = item.id;
  if (menuIdInput) menuIdInput.value = item.id;
  if (menuNameInput) menuNameInput.value = item.name;
  if (menuTagInput) menuTagInput.value = item.tag;
  if (menuPriceInput) menuPriceInput.value = item.price;
  if (menuImageInput) menuImageInput.value = item.image;
  if (menuDescriptionInput) menuDescriptionInput.value = item.description;
  if (cancelEditButton) cancelEditButton.classList.remove('hidden');
  if (menuForm) menuForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function loadMenu() {
  try {
    const items = await fetchMenuItems();
    renderMenu(items);
    renderAdminMenu(items);
    updateCartUI();
  } catch (error) {
    showUserMessage(error.message || 'Unable to load menu.', 'error');
    renderMenu([]);
    renderAdminMenu([]);
    updateCartUI();
  }
}

async function handleCheckout() {
  if (!cart.length) {
    showUserMessage('Your cart is empty.', 'error');
    return;
  }

  try {
    const order = {
      id: Date.now(),
      items: cart.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      total: getCartTotal(cart),
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    await saveOrder(order);
    renderAdminOrders();
    cart.length = 0;
    updateCartUI();
    showUserMessage('Order placed successfully.', 'success');
  } catch (error) {
    showUserMessage(error.message || 'Unable to place order.', 'error');
  }
}

async function saveOrder(order) {
  const storedOrders = getStoredOrders();
  const nextOrders = [order, ...storedOrders];
  saveStoredOrders(nextOrders);
  return order;
}

async function handleMenuSubmit(event) {
  event.preventDefault();

  const payload = {
    name: menuNameInput.value.trim(),
    tag: menuTagInput.value.trim(),
    price: Number(menuPriceInput.value),
    description: menuDescriptionInput.value.trim(),
    image: menuImageInput.value.trim()
  };

  try {
    if (!payload.name || !payload.tag || !payload.description || !payload.image || !payload.price) {
      throw new Error('Please complete all menu fields.');
    }

    if (editingItemId) {
      await updateMenuItem(editingItemId, payload);
      showUserMessage('Menu item updated.', 'success');
    } else {
      await createMenuItem(payload);
      showUserMessage('Menu item added.', 'success');
    }

    resetMenuForm();
    await loadMenu();
  } catch (error) {
    showUserMessage(error.message || 'Unable to save menu item.', 'error');
  }
}

async function deleteMenuItemById(id) {
  try {
    await deleteMenuItem(id);
    showUserMessage('Menu item deleted.', 'success');
    if (editingItemId === id) {
      resetMenuForm();
    }
    await loadMenu();
  } catch (error) {
    showUserMessage(error.message || 'Unable to delete menu item.', 'error');
  }
}

function bindEventListeners() {
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const username = adminUsernameInput ? adminUsernameInput.value.trim() : '';
      const password = adminPasswordInput ? adminPasswordInput.value.trim() : '';

      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        sessionStorage.setItem('covoAdminLoggedIn', 'true');
        setAdminAccess(true);
        showUserMessage('Admin login successful.', 'success');
        return;
      }

      if (adminLoginMessage) {
        adminLoginMessage.textContent = 'Incorrect username or password.';
        adminLoginMessage.classList.add('error');
      }
      showUserMessage('Incorrect username or password.', 'error');
    });
  }

  if (logoutAdminButton) {
    logoutAdminButton.addEventListener('click', () => {
      sessionStorage.removeItem('covoAdminLoggedIn');
      setAdminAccess(false);
      showUserMessage('You have logged out.', 'info');
    });
  }

  if (checkoutButton) {
    checkoutButton.addEventListener('click', handleCheckout);
  }

  if (menuForm) {
    menuForm.addEventListener('submit', handleMenuSubmit);
  }

  if (cancelEditButton) {
    cancelEditButton.addEventListener('click', resetMenuForm);
  }
}

function initializeApp() {
  cacheDomElements();
  bindEventListeners();

  const isLoggedIn = sessionStorage.getItem('covoAdminLoggedIn') === 'true';
  setAdminAccess(isLoggedIn);
  renderAdminOrders();
  updateTrackingStatus();
  loadMenu();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

window.cartApi = {
  fetchMenuItems,
  createMenuItem,
  updateMenuItem,
  patchMenuItem,
  deleteMenuItem,
  addToCart,
  removeFromCart,
  getCartTotal,
  getCartCount,
  cart
};
