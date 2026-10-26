import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validateMenuItem,
  sanitizeMenuItems,
  fetchMenuItems,
  createMenuItem,
  updateMenuItem,
  patchMenuItem,
  deleteMenuItem
} from '../src/modules/api.js';

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
  assert.equal(cleaned[0].price, 1650);
});

test('mock API supports menu create, update, patch, and delete operations', async () => {
  const initialItems = await fetchMenuItems();
  assert.ok(initialItems.length > 0);
  assert.equal(initialItems[0].name, 'Crispy Chicken Bowl');

  const created = await createMenuItem({
    name: 'Test item',
    tag: 'Test',
    description: 'Temporary test menu item.',
    price: 500,
    image: 'test.jpg'
  });
  assert.ok(created.id);

  const updated = await updateMenuItem(created.id, {
    ...created,
    name: 'Updated test item'
  });
  assert.equal(updated.name, 'Updated test item');

  const patched = await patchMenuItem(created.id, { tag: 'Featured' });
  assert.equal(patched.tag, 'Featured');
  assert.equal(patched.name, 'Updated test item');

  const deleted = await deleteMenuItem(created.id);
  assert.equal(deleted.id, created.id);
  assert.equal((await fetchMenuItems()).length, initialItems.length);
});
