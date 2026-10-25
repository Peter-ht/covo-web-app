export function createCart() {
  return [];
}

export function formatCurrency(value) {
  const safeValue = Number(value) || 0;
  return `KSh ${safeValue.toLocaleString()}`;
}

export function getCartCount(cart) {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotal(cart) {
  return cart.reduce((sum, item) => {
    const priceValue = Number(item.price) || 0;
    return sum + priceValue * item.quantity;
  }, 0);
}

export function addToCart(cart, item) {
  const normalizedItem = {
    ...item,
    price: Number(item.price) || 0,
    quantity: 1
  };

  const existingItem = cart.find((cartItem) => cartItem.name === item.name);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push(normalizedItem);
  }

  return cart;
}

export function removeFromCart(cart, itemName) {
  const existingItem = cart.find((cartItem) => cartItem.name === itemName);

  if (!existingItem) {
    return cart;
  }

  if (existingItem.quantity > 1) {
    existingItem.quantity -= 1;
  } else {
    const index = cart.findIndex((cartItem) => cartItem.name === itemName);
    if (index >= 0) {
      cart.splice(index, 1);
    }
  }

  return cart;
}
