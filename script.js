const availableProducts = [
    { id: 1, name: "Relaxed Fit T-shirt", price: 12.99, available: 12, image: "https://placehold.co/80x80/FFD700/000000?text=T-shirt" },
    { id: 2, name: "Nylon Cap", price: 8.99, available: 14, image: "https://placehold.co/80x80/87CEEB/000000?text=Cap" },
    { id: 3, name: "Massive Sport Shoes", price: 8.99, available: 0, image: "https://placehold.co/80x80/20B2AA/000000?text=Shoes" }, 
    { id: 4, name: "Hooded Sweatshirt Relaxed Fit", price: 16.99, available: 2, image: "https://placehold.co/80x80/FF6347/000000?text=Sweater" },
    { id: 5, name: "Relaxed Fit Pima Cotton Sweater", price: 19.99, available: 4, image: "https://placehold.co/80x80/BA55D3/000000?text=Pima" }
  ];
 
  const cart = new Map();

  const productsContainer = document.getElementById('products-container');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const emptyCartMessage = document.getElementById('empty-cart-message');
  const discountAmountElem = document.getElementById('discount-amount');
  const deliveryCostElem = document.getElementById('delivery-cost');
  const taxAmountElem = document.getElementById('tax-amount');
  const cartTotalValueElem = document.getElementById('cart-total-value');
  const promoCodeInput = document.getElementById('promo-code-input');
  const applyPromoBtn = document.getElementById('apply-promo-btn');
  const messageBox = document.getElementById('message-box');
 
  let discount = 0;
  const deliveryCost = 0; 
  const taxRate = 0.10; 
  
  /**
  * @param {string} message 
  * @param {boolean} isError 
  */
  function showMessage(message, isError = false) {
    messageBox.textContent = message;
    messageBox.classList.remove('error', 'show'); 
    if (isError) {
        messageBox.classList.add('error');
    }
    messageBox.classList.add('show');
   
    setTimeout(() => {
        messageBox.classList.remove('show');
    }, 3000);
  }
  
  function renderProducts() {
    productsContainer.innerHTML = ''; 
    availableProducts.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        productItem.dataset.productId = product.id; 
  
        const isOutOfStock = product.available === 0;
  
        productItem.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="text-sm ${isOutOfStock ? 'text-red-500' : 'text-gray-500'}">
                    ${product.available} available
                </div>
            </div>
            <button class="add-to-cart-btn" ${isOutOfStock ? 'disabled' : ''}>
                ${isOutOfStock ? 'Немає в наявності' : 'Додати'}
            </button>
        `;
  
        const addButton = productItem.querySelector('.add-to-cart-btn');
        if (!isOutOfStock) {
            addButton.addEventListener('click', () => addToCart(product.id));
        }
        productsContainer.appendChild(productItem);
    });
  }
  
  function renderCart() {
    cartItemsContainer.innerHTML = ''; 
    if (cart.size === 0) {
        emptyCartMessage.style.display = 'block'; 
    } else {
        emptyCartMessage.style.display = 'none'; 
        cart.forEach(item => {
            const cartItemDiv = document.createElement('div');
            cartItemDiv.className = 'cart-item';
            cartItemDiv.dataset.productId = item.product.id; 
            const productData = availableProducts.find(p => p.id === item.product.id);
  
            cartItemDiv.innerHTML = `
                <img src="${item.product.image}" alt="${item.product.name}" class="product-image">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.product.name}</div>
                    <div class="cart-item-price">$${item.product.price.toFixed(2)}</div>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn decrease-btn" data-id="${item.product.id}">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn increase-btn" data-id="${item.product.id}" ${item.quantity >= productData.available ? 'disabled' : ''}>+</button>
                </div>
                <button class="remove-item-btn" data-id="${item.product.id}">X</button>
            `;
            cartItemsContainer.appendChild(cartItemDiv);
        });
    }
    updateCartSummary(); 
  }

  function updateCartSummary() {
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.product.price * item.quantity;
    });
 
    const finalSubtotalAfterDiscount = Math.max(0, subtotal - discount);
  
    const tax = finalSubtotalAfterDiscount * taxRate;
  
    const total = finalSubtotalAfterDiscount + deliveryCost + tax;
  
    discountAmountElem.textContent = `-$${discount.toFixed(2)}`;
    deliveryCostElem.textContent = `$${deliveryCost.toFixed(2)}`;
    taxAmountElem.textContent = `$${tax.toFixed(2)}`;
    cartTotalValueElem.textContent = `$${total.toFixed(2)}`;
  }
  
  
  /**
  * @param {number} productId 
  */
  function addToCart(productId) {
    const product = availableProducts.find(p => p.id === productId);
  
    if (!product) {
        showMessage('Помилка: Товар не знайдено.', true);
        return;
    }
  
    if (product.available === 0) {
        showMessage('Цей товар немає в наявності.', true);
        return;
    }
  
    if (cart.has(productId)) {
        const cartItem = cart.get(productId);
        if (cartItem.quantity < product.available) {
            cartItem.quantity++;
            showMessage(`${product.name} додано до кошика. Кількість: ${cartItem.quantity}`);
        } else {
            showMessage(`Не можна додати більше ${product.name}. Досягнуто максимальної кількості.`, true);
        }
    } else {
        cart.set(productId, { product: product, quantity: 1 });
        showMessage(`${product.name} додано до кошика.`);
    }
    renderCart(); 
  }
  cartItemsContainer.addEventListener('click', (event) => {
    const target = event.target;
    
    if (!target.dataset.id) return;
  
    const productId = parseInt(target.dataset.id);
  
    if (target.classList.contains('increase-btn')) {
        const cartItem = cart.get(productId);
        const product = availableProducts.find(p => p.id === productId); 
        if (cartItem && product && cartItem.quantity < product.available) {
            cartItem.quantity++;
            showMessage(`Збільшено кількість ${product.name} до ${cartItem.quantity}.`);
        } else if (cartItem.quantity >= product.available) {
             showMessage(`Не можна додати більше ${product.name}. Досягнуто максимальної кількості.`, true);
        }
    }
    
    else if (target.classList.contains('decrease-btn')) {
        const cartItem = cart.get(productId);
        if (cartItem) {
            cartItem.quantity--;
            if (cartItem.quantity <= 0) {
                cart.delete(productId); 
                showMessage(`${cartItem.product.name} видалено з кошика.`);
            } else {
                showMessage(`Зменшено кількість ${cartItem.product.name} до ${cartItem.quantity}.`);
            }
        }
    }
    
    else if (target.classList.contains('remove-item-btn')) {
        const cartItem = cart.get(productId);
        if (cartItem) {
            cart.delete(productId);
            showMessage(`${cartItem.product.name} видалено з кошика.`);
        }
    }
    renderCart(); 
  });
  
  
  applyPromoBtn.addEventListener('click', () => {
    const promoCode = promoCodeInput.value.trim().toUpperCase();
    if (promoCode === 'DISCOUNT10') { 
        discount = 10.00; 
        showMessage('Промокод успішно застосовано! Знижка $10.');
    } else if (promoCode === '') {
        discount = 0; 
        showMessage('Промокод очищено.');
    } else {
        discount = 0; 
        showMessage('Недійсний промокод.', true);
    }
    renderCart(); 
  });
  
  
  document.addEventListener('DOMContentLoaded', () => {
    renderProducts(); 
    renderCart();     
  });