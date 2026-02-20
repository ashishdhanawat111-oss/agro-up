const inventory = [
    { id: 1, name: "Premium Strawberries", price: 299, unit: "250g", tag: "Berry Season", img: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500" },
    { id: 2, name: "Baby Spinach (Hydro)", price: 85, unit: "100g", tag: "Fresh", img: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500" },
    { id: 3, name: "Purple Broccoli", price: 140, unit: "pc", tag: "Organic", img: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=500" },
    { id: 4, name: "Alphonso Mango", price: 650, unit: "6pcs", tag: "Bestseller", img: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500" },
    { id: 5, name: "Cherry Tomatoes", price: 110, unit: "box", tag: "New", img: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=500" },
    { id: 6, name: "Exotic Avocado", price: 190, unit: "pc", tag: "Imported", img: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500" },
    // New Items
    { id: 7, name: "Organic Blueberries", price: 350, unit: "125g", tag: "Superfood", img: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=500" },
    { id: 8, name: "Red Bell Pepper", price: 45, unit: "pc", tag: "Crunchy", img: "https://images.unsplash.com/photo-1563565375-f3fdf5ec2e97?w=500" },
    { id: 9, name: "Fresh Ginger", price: 40, unit: "250g", tag: "Root", img: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500" },
    { id: 10, name: "Nashik Onions", price: 35, unit: "1kg", tag: "Essential", img: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500" },
    { id: 11, name: "Italian Basil", price: 60, unit: "bunch", tag: "Aromatic", img: "https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=500" },
    { id: 12, name: "Mini Watermelon", price: 120, unit: "pc", tag: "Summer", img: "https://images.unsplash.com/photo-1563114773-880cd2bfcf75?w=500" }
];

let cart = {};

// --- Persistent Location Logic ---

document.addEventListener('DOMContentLoaded', () => {
    // Check for saved pincode
    const savedPin = localStorage.getItem('delivery_pincode');
    const modal = document.getElementById('pincode-modal');

    if (savedPin) {
        // Pre-fill and load immediately
        document.getElementById('pincode').value = savedPin;
        if (modal) modal.style.display = 'none'; // Force hide without animation
        checkLocation(); // Load products immediately
    } else {
        // Focus input if modal is shown
        const modalInput = document.getElementById('modal-pincode');
        if (modalInput) {
            modalInput.focus();
            modalInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') checkModalLocation();
            });
        }
    }
});

function checkModalLocation() {
    const modalInput = document.getElementById('modal-pincode');
    const pin = modalInput.value;

    if (pin.length < 6) {
        modalInput.style.borderColor = '#ef4444';
        modalInput.style.background = '#fff1f2';
        setTimeout(() => {
            modalInput.style.borderColor = '#e2e8f0';
            modalInput.style.background = '#f1f5f9';
        }, 1000);
        return;
    }

    // Save Pincode to Local Storage
    localStorage.setItem('delivery_pincode', pin);

    document.getElementById('pincode').value = pin;

    const modal = document.getElementById('pincode-modal');
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';

    setTimeout(() => {
        modal.classList.add('hidden');
        checkLocation();
    }, 400);
}

async function checkLocation() {
    const pin = document.getElementById('pincode').value;
    if (pin.length < 6) return;

    // Also save if changed from navbar
    localStorage.setItem('delivery_pincode', pin);

    document.getElementById('welcome-hero').innerHTML = "<h1>Finding store...</h1>";

    setTimeout(() => {
        document.getElementById('welcome-hero').classList.add('hidden');
        document.getElementById('product-section').classList.remove('hidden');
        document.getElementById('loc-tag').innerHTML = `<i class="fas fa-map-marker-alt"></i> Delivering to <b>${pin}</b>`;
        renderProducts();
    }, 800);
}

// --- Render Logic ---

function getProductButtonHTML(item) {
    const qty = cart[item.id] ? cart[item.id].qty : 0;

    if (qty === 0) {
        return `<button class="btn-add-initial" onclick="updateCartItem(${item.id}, 1)">ADD</button>`;
    } else {
        return `
                    <div class="btn-counter-group">
                        <button class="btn-counter-action" onclick="updateCartItem(${item.id}, -1)">-</button>
                        <span style="font-weight: 700; font-size: 1rem;">${qty}</span>
                        <button class="btn-counter-action" onclick="updateCartItem(${item.id}, 1)">+</button>
                    </div>
                `;
    }
}

function renderProducts() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = inventory.map(item => `
                <div class="product-card">
                    <span class="badge">${item.tag}</span>
                    <img src="${item.img}" class="product-img">
                    <h3>${item.name}</h3>
                    <p style="color: var(--text-alt)">₹${item.price} / ${item.unit}</p>
                    <div class="qty-controls" id="btn-wrap-${item.id}">
                        ${getProductButtonHTML(item)}
                    </div>
                </div>
            `).join('');
}

function updateCartItem(id, change) {
    const item = inventory.find(p => p.id === id);

    if (!cart[id]) {
        cart[id] = { ...item, qty: 0 };
    }

    cart[id].qty += change;

    if (cart[id].qty <= 0) {
        delete cart[id];
    }

    const btnWrap = document.getElementById(`btn-wrap-${id}`);
    if (btnWrap) {
        btnWrap.innerHTML = getProductButtonHTML(item);
    }

    updateUI();
}

function updateUI() {
    let total = 0, count = 0;
    const list = document.getElementById('cart-items-list');

    list.innerHTML = Object.values(cart).map(i => {
        total += i.price * i.qty;
        count += i.qty;
        return `
                    <div style="display:flex; gap:15px; margin-bottom:20px;">
                        <img src="${i.img}" style="width:60px; height:60px; border-radius:10px; object-fit:cover">
                        <div>
                            <h4 style="margin:0">${i.name}</h4>
                            <p style="margin:0; font-size:0.9rem">₹${i.price} x ${i.qty}</p>
                            <div style="margin-top:5px; display:flex; gap:10px; align-items:center;">
                                <button onclick="updateCartItem(${i.id}, -1)" style="width:24px;height:24px;border:1px solid #ddd;background:white;border-radius:4px;cursor:pointer">-</button>
                                <span>${i.qty}</span>
                                <button onclick="updateCartItem(${i.id}, 1)" style="width:24px;height:24px;border:1px solid #ddd;background:white;border-radius:4px;cursor:pointer">+</button>
                            </div>
                        </div>
                    </div>
                `;
    }).join('');

    const cartInfo = document.getElementById('cart-btn-info');
    if (count === 0) {
        cartInfo.innerHTML = '<span class="cart-empty-text">My Cart</span>';
    } else {
        cartInfo.innerHTML = `
                    <span class="cart-items-count">${count} items</span>
                    <span class="cart-total-price">₹${total}</span>
                `;
    }

    document.getElementById('sub-total').innerText = `₹${total}`;
}

function toggleCart() { document.getElementById('cart-sidebar').classList.toggle('active'); }

function openAddressForm() {
    if (Object.keys(cart).length === 0) {
        const list = document.getElementById('cart-items-list');
        list.innerHTML = `
                    <div style="text-align:center; padding: 40px 20px; color: var(--text-alt);">
                        <i class="fas fa-basket-shopping" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.3;"></i>
                        <p>Your cart is empty.</p>
                        <button onclick="toggleCart()" style="background:none; border:none; color:var(--brand); font-weight:700; cursor:pointer;">Browse Products</button>
                    </div>
                `;
        return;
    }

    document.getElementById('cart-view').classList.add('hidden');
    document.getElementById('address-view').classList.remove('hidden');
}

function backToCart() {
    document.getElementById('cart-view').classList.remove('hidden');
    document.getElementById('address-view').classList.add('hidden');
}

function placeOrder() {
    const addrInput = document.getElementById('address');
    const addr = addrInput.value;
    const inputWrap = addrInput.parentElement;

    const existingError = inputWrap.querySelector('.error-msg');
    if (existingError) existingError.remove();

    if (!addr || !addr.trim()) {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-msg';
        errorMsg.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please enter your delivery address';
        errorMsg.style.cssText = 'color: #ef4444; font-size: 0.85rem; margin-top: 8px; display: flex; align-items: center; gap: 5px; animation: fadeIn 0.3s ease;';

        inputWrap.appendChild(errorMsg);
        addrInput.style.borderColor = '#ef4444';
        addrInput.focus();

        addrInput.addEventListener('input', () => {
            addrInput.style.borderColor = '#e2e8f0';
            const err = inputWrap.querySelector('.error-msg');
            if (err) err.remove();
        }, { once: true });

        return;
    }

    const addressView = document.getElementById('address-view');
    addressView.innerHTML = `
                <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; animation: fadeIn 0.5s ease;">
                    <div style="width: 80px; height: 80px; background: #d1fae5; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; animation: popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);">
                        <i class="fas fa-check" style="font-size: 40px; color: #059669;"></i>
                    </div>
                    <h3 style="font-size: 1.5rem; margin: 0 0 10px 0;">Order Confirmed!</h3>
                    <p style="color: #64748b; margin-bottom: 30px; line-height: 1.5;">
                        We've received your order.<br>
                        Delivering to <b>${addr}</b> in 10-15 mins.
                    </p>
                    <button class="pay-btn" onclick="location.reload()">Start New Order</button>
                </div>
                <style>
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes popIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                </style>
            `;

    cart = {};
    updateUI();
    renderProducts();
}
