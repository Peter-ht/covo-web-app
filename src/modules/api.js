const DEFAULT_API_BASE_URL = 'http://localhost:3001';

export const FALLBACK_MENU_ITEMS = [
  {
    id: 1,
    name: 'Crispy Chicken Bowl',
    tag: 'High protein',
    price: 1490,
    description: 'Tender grilled chicken, brown rice, roasted greens, and citrus drizzle.',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 2,
    name: 'Truffle Mushroom Pasta',
    tag: 'Chef special',
    price: 1650,
    description: 'Creamy parmesan pasta with roasted mushrooms and fresh herbs.',
    image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 3,
    name: 'Sunrise Salmon Plate',
    tag: 'Fresh catch',
    price: 1820,
    description: 'Seared salmon, quinoa, avocado, and a bright lemon-yogurt finish.',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 4,
    name: 'Garden Wrap',
    tag: 'Veggie lover',
    price: 1240,
    description: 'Crisp greens, hummus, carrots, roasted peppers, and feta in a wrap.',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 5,
    name: 'Spicy Beef Tacos',
    tag: 'Best seller',
    price: 1380,
    description: 'Three soft tacos filled with spiced beef, slaw, and chipotle crema.',
    image: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 6,
    name: 'Safari Lager',
    tag: 'Alcohol',
    price: 750,
    description: 'A crisp local lager with a light finish, perfect for a relaxed evening.',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 7,
    name: 'Kenya Sunset Cocktail',
    tag: 'Signature sip',
    price: 1200,
    description: 'Mango, passion fruit, and citrus blended into a bright tropical cocktail.',
    image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 8,
    name: 'Berry Cheesecake',
    tag: 'Sweet finish',
    price: 890,
    description: 'Creamy cheesecake layered with berry compote and crunchy almond crumble.',
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=900&q=80'
  }
];

export const API_BASE_URL =
  (typeof window !== 'undefined' && window.COVO_CONFIG && window.COVO_CONFIG.API_BASE_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.COVO_API_BASE_URL) ||
  DEFAULT_API_BASE_URL;

function getErrorMessage(response, fallbackText) {
  const errorText = fallbackText || response.statusText || 'Request failed';
  return `Request failed (${response.status}): ${errorText}`;
}

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
    const text = await response.text();
    throw new Error(getErrorMessage(response, text || 'Unknown error'));
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
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

  const numericPrice = Number(String(item.price || '').replace(/[^\d.]/g, ''));

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

  return items.filter((item) => {
    if (!item || typeof item !== 'object') {
      return false;
    }

    const name = String(item.name || '').trim();
    const tag = String(item.tag || '').trim();
    const description = String(item.description || '').trim();

    if (name.startsWith('Order-')) {
      return false;
    }

    if (tag === 'M-Pesa') {
      return false;
    }

    if (description.startsWith('{') && description.includes('"items"')) {
      return false;
    }

    return Boolean(name && tag && description && Number(item.price) > 0);
  });
}

export async function fetchMenuItems() {
  try {
    const items = await apiRequest('/menu');
    return sanitizeMenuItems(items);
  } catch (error) {
    return sanitizeMenuItems(FALLBACK_MENU_ITEMS);
  }
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
