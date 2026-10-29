import test from 'node:test';
import assert from 'node:assert/strict';

import {
  API_BASE_URL,
  validateMenuItem,
  sanitizeMenuItems,
  fetchMenuItems,
  createMenuItem,
  updateMenuItem,
  patchMenuItem,
  deleteMenuItem
} from '../src/modules/api.js';

function createResponse(status, body = '') {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 404 ? 'Not Found' : 'OK',
    text: async () => text
  };
}

test('API_BASE_URL defaults to the local JSON Server', () => {
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
      price: 'KSh 1,650',
      image: 'https://example.com/pasta.jpg'
    },
  ];

  const cleaned = sanitizeMenuItems(items);

  assert.equal(cleaned.length, 1);
  assert.equal(cleaned[0].name, 'Truffle Mushroom Pasta');
  assert.equal(cleaned[0].price, 1650);
});

test('menu API uses JSON REST endpoints for CRUD operations', async () => {
  const originalFetch = global.fetch;
  const items = [{ id: 1, name: 'Rice Bowl', tag: 'Healthy', description: 'Fresh and tasty', price: 800, image: 'img.jpg' }];
  const requests = [];
  global.fetch = async (url, options) => {
    requests.push({ url, ...options });
    const path = new URL(url).pathname;
    const body = options.body ? JSON.parse(options.body) : undefined;

    if (path === '/menu' && options.method === 'GET') {
      return createResponse(200, items);
    }
    if (path === '/menu' && options.method === 'POST') {
      const created = { ...body, id: 2 };
      items.push(created);
      return createResponse(201, created);
    }
    if (path === '/menu/2' && options.method === 'PUT') {
      items[1] = { ...body, id: 2 };
      return createResponse(200, items[1]);
    }
    if (path === '/menu/2' && options.method === 'PATCH') {
      items[1] = { ...items[1], ...body };
      return createResponse(200, items[1]);
    }
    if (path === '/menu/2' && options.method === 'DELETE') {
      items.splice(1, 1);
      return createResponse(204);
    }
    return createResponse(404, 'Not found');
  };

  try {
    const fetchedItems = await fetchMenuItems();
    assert.equal(fetchedItems[0].name, 'Rice Bowl');

    const created = await createMenuItem({
      name: 'Test item',
      tag: 'Test',
      description: 'Temporary test menu item.',
      price: 500,
      image: 'test.jpg'
    });
    assert.equal(created.id, 2);

    const updated = await updateMenuItem(created.id, { ...created, name: 'Updated test item' });
    assert.equal(updated.name, 'Updated test item');

    const patched = await patchMenuItem(created.id, { tag: 'Featured' });
    assert.equal(patched.tag, 'Featured');

    assert.equal(await deleteMenuItem(created.id), null);
    assert.deepEqual(
      requests.map(({ url, method }) => [url, method]),
      [
        [`${API_BASE_URL}/menu`, 'GET'],
        [`${API_BASE_URL}/menu`, 'POST'],
        [`${API_BASE_URL}/menu/2`, 'PUT'],
        [`${API_BASE_URL}/menu/2`, 'PATCH'],
        [`${API_BASE_URL}/menu/2`, 'DELETE']
      ]
    );
  } finally {
    global.fetch = originalFetch;
  }
});
