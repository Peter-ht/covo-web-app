const DEFAULT_API_BASE_URL = 'http://localhost:3001';

export const FALLBACK_MENU_ITEMS = [
  {
    id: 1,
    name: 'Crispy Chicken Bowl',
    tag: 'High protein',
    price: 1490,
    description: 'Tender grilled chicken, brown rice, roasted greens, and citrus drizzle.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtdwvUUOgJkJJXyOOZI9nqNuNMdOlPTVRpyJPvivcZ8Q&s=10'
  },
  {
    id: 2,
    name: 'Truffle Mushroom Pasta',
    tag: 'Chef special',
    price: 1650,
    description: 'Creamy parmesan pasta with roasted mushrooms and fresh herbs.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStKzMvR2UPc8wSKfRzeBueJpt6acRc_GKc_1PwBjf5QA&s=10'
  },
  {
    id: 3,
    name: 'Sunrise Salmon Plate',
    tag: 'Fresh catch',
    price: 1820,
    description: 'Seared salmon, quinoa, avocado, and a bright lemon-yogurt finish.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnNChAgj0xaIv6N24AM53xJIZS5sEtNKYxKAno05XPcQ&s=10',
  },
  {
    id: 4,
    name: 'Garden Wrap',
    tag: 'Veggie lover',
    price: 1240,
    description: 'Crisp greens, hummus, carrots, roasted peppers, and feta in a wrap.',
    image: 'https://frescadostortillas.com/wp-content/uploads/2024/01/Chicken-Wrap-Garden-Vegetable.jpg'
  },
  {
    id: 5,
    name: 'Spicy Beef Tacos',
    tag: 'Best seller',
    price: 1380,
    description: 'Three soft tacos filled with spiced beef, slaw, and chipotle crema.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOwOyelR468ub6BFXCWDLJQyJX-T5PNovacSYV3lGD8Q&s=10'
  },
  {
    id: 6,
    name: 'Safari Lager',
    tag: 'Alcohol',
    price: 750,
    description: 'A crisp local lager with a light finish, perfect for a relaxed evening.',
    image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0G8b2mUVoaINoH0ej8sO0jUmJ7Ey2jtndN5cDBUehMA&s=10'
  },
  {
    id: 7,
    name: 'Kenya Sunset Cocktail',
    tag: 'Signature sip',
    price: 1200,
    description: 'Mango, passion fruit, and citrus blended into a bright tropical cocktail.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-GVsmYDLxgK36ex87hx55oqqQK3TmwKmngRNsSeOUSw&s=10'
  },
  {
    id: 8,
    name: 'Berry Cheesecake',
    tag: 'Sweet finish',
    price: 890,
    description: 'Creamy cheesecake layered with berry compote and crunchy almond crumble.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2-dLKYSxct_BVGju7vAf8-pmtOXek5USbuRxtrJewwoAMPuMiLuxea8w&s=10'
  }
];

export const API_BASE_URL =
  (typeof window !== 'undefined' && window.COVO_CONFIG && window.COVO_CONFIG.API_BASE_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.COVO_API_BASE_URL) ||
  DEFAULT_API_BASE_URL;

export async function apiRequest(endpoint, { method = 'GET', body, headers = {} } = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request failed (${response.status}): ${errorText || response.statusText || 'Unknown error'}`);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function parsePrice(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : NaN;
  }

  const text = String(value ?? '').trim();
  if (!text) {
    return NaN;
  }

  const normalized = text.replace(/[^\d.]/g, '');
  return Number(normalized);
}

export function validateMenuItem(item) {
  if (!item || typeof item !== 'object') {
    throw new Error('Menu item must be an object.');
  }

  const sanitizedItem = {
    ...item,
    name: String(item.name || '').trim(),
    tag: String(item.tag || '').trim(),
    description: String(item.description || '').trim(),
    image: String(item.image || '').trim()
  };

  const numericPrice = parsePrice(item.price);

  if (!sanitizedItem.name) {
    throw new Error('Item name is required.');
  }

  if (!sanitizedItem.tag) {
    throw new Error('Item tag is required.');
  }

  if (!sanitizedItem.description) {
    throw new Error('Item description is required.');
  }

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    throw new Error('Item price must be greater than zero.');
  }

  sanitizedItem.price = numericPrice;
  return sanitizedItem;
}

export function sanitizeMenuItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => {
      if (!item || typeof item !== 'object') {
        return false;
      }

      const name = String(item.name || '').trim();
      const tag = String(item.tag || '').trim();
      const description = String(item.description || '').trim();
      const price = parsePrice(item.price);

      if (name.toLowerCase().startsWith('order-')) {
        return false;
      }

      if (tag === 'M-Pesa') {
        return false;
      }

      if (description.startsWith('{') && description.includes('"items"')) {
        return false;
      }

      return Boolean(name && tag && description && Number.isFinite(price) && price > 0);
    })
    .map((item) => ({
      ...item,
      price: parsePrice(item.price)
    }));
}

export async function fetchMenuItems() {
  const items = await apiRequest('/menu');
  return sanitizeMenuItems(items);
}

export async function createMenuItem(item) {
  return apiRequest('/menu', {
    method: 'POST',
    body: validateMenuItem(item)
  });
}

export async function updateMenuItem(id, item) {
  return apiRequest(`/menu/${id}`, {
    method: 'PUT',
    body: validateMenuItem(item)
  });
}

export async function patchMenuItem(id, updates) {
  return apiRequest(`/menu/${id}`, {
    method: 'PATCH',
    body: updates
  });
}

export async function deleteMenuItem(id) {
  return apiRequest(`/menu/${id}`, {
    method: 'DELETE'
  });
}
