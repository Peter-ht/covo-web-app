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

let menuItems = FALLBACK_MENU_ITEMS.map((item) => ({ ...item }));

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
  return sanitizeMenuItems(menuItems).map((item) => ({ ...item }));
}

export async function createMenuItem(item) {
  const newItem = {
    ...validateMenuItem(item),
    id: Math.max(0, ...menuItems.map((entry) => Number(entry.id) || 0)) + 1
  };
  menuItems = [...menuItems, newItem];
  return { ...newItem };
}

export async function updateMenuItem(id, item) {
  const index = menuItems.findIndex((entry) => String(entry.id) === String(id));
  if (index < 0) {
    throw new Error(`Menu item ${id} was not found.`);
  }

  const updatedItem = { ...validateMenuItem(item), id: menuItems[index].id };
  menuItems = menuItems.map((entry, entryIndex) => entryIndex === index ? updatedItem : entry);
  return { ...updatedItem };
}

export async function patchMenuItem(id, updates) {
  const currentItem = menuItems.find((entry) => String(entry.id) === String(id));
  if (!currentItem) {
    throw new Error(`Menu item ${id} was not found.`);
  }

  return updateMenuItem(id, { ...currentItem, ...updates });
}

export async function deleteMenuItem(id) {
  const item = menuItems.find((entry) => String(entry.id) === String(id));
  if (!item) {
    throw new Error(`Menu item ${id} was not found.`);
  }

  menuItems = menuItems.filter((entry) => String(entry.id) !== String(id));
  return { ...item };
}
