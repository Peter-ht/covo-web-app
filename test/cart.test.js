import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createCart,
  addToCart,
  removeFromCart,
  getCartCount,
  getCartTotal,
  formatCurrency
} from '../src/modules/cart.js';

test('createCart returns an empty array', () => {
  const cart = createCart();
  assert.deepEqual(cart, []);
});

test('addToCart adds new item and increments quantity', () => {
  const cart = createCart();
  addToCart(cart, { name: 'Burger', price: 500 });
  addToCart(cart, { name: 'Burger', price: 500 });

  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 2);
  assert.equal(cart[0].price, 500);
});

test('removeFromCart reduces quantity and removes item when zero', () => {
  const cart = [{ name: 'Salad', price: 300, quantity: 2 }];

  removeFromCart(cart, 'Salad');
  assert.equal(cart[0].quantity, 1);

  removeFromCart(cart, 'Salad');
  assert.deepEqual(cart, []);
});

test('getCartCount and getCartTotal compute totals correctly', () => {
  const cart = [
    { name: 'Burger', price: 500, quantity: 2 },
    { name: 'Tea', price: 120, quantity: 1 }
  ];

  assert.equal(getCartCount(cart), 3);
  assert.equal(getCartTotal(cart), 1120);
  assert.equal(formatCurrency(1120), 'KSh 1,120');
});
