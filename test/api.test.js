import test from 'node:test';
import assert from 'node:assert/strict';

import { validateMenuItem, API_BASE_URL, sanitizeMenuItems, fetchMenuItems } from '../src/modules/api.js';

test('API_BASE_URL defaults to local JSON server', () => {
  assert.equal(API_BASE_URL, 'http://localhost:3001');
});

test('validateMenuItem accepts valid menu data', () => {
  const item = validateMenuItem({
    name: 'Rice Bowl',
    tag: 'Healthy',
    description: 'Fresh and tasty',
    price: 'KSh 800',
    image: 'img.jpg'
  });

  assert.equal(item.name, 'Rice Bowl');
  assert.equal(item.price, 800);
});

test('validateMenuItem rejects missing required values', () => {
  assert.throws(() => validateMenuItem({ name: '', tag: '', description: '', price: 0 }), /required|greater than zero/i);
});

test('sanitizeMenuItems removes order records from the menu feed', () => {
  const items = [
    {
      id: 1,
      name: 'Truffle Mushroom Pasta',
      tag: 'Chef special',
      description: 'Creamy parmesan pasta.',
      price: 1650,
      image: 'https://example.com/pasta.jpg'
    },
    {
      id: 2,
      name: 'Order-1792870819753',
      tag: 'M-Pesa',
      description: '{"items":[{"name":"Truffle Mushroom Pasta","quantity":1,"price":1650}],"total":1650}',
      price: 1650,
      image: 'https://example.com/order.jpg'
    }
  ];

  const cleaned = sanitizeMenuItems(items);

  assert.equal(cleaned.length, 1);
  assert.equal(cleaned[0].name, 'Truffle Mushroom Pasta');
});

test('fetchMenuItems falls back to the bundled menu when the API is unavailable', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => {
    throw new Error('Failed to connect');
  };

  try {
    const items = await fetchMenuItems();
    assert.ok(Array.isArray(items));
    assert.ok(items.length > 0);
    assert.equal(items[0].name, 'Crispy Chicken Bowl');
  } finally {
    global.fetch = originalFetch;
  }
});
