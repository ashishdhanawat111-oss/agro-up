const inventory = [
    { id: 1, name: "Premium Strawberries", price:250, unit: "250g", tag: "Berry Season", img: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500" },
    { id: 2, name: "Baby Spinach (Hydro)", price: 48, unit: "100g", tag: "Fresh", img: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500" },
    { id: 3, name: "Purple Broccoli", price: 65, unit: "kg", tag: "Organic", img: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=500" },
    { id: 4, name: "Alphonso Mango", price: 190, unit: "1kg", tag: "Bestseller", img: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500" },
    { id: 5, name: "Cherry Tomatoes", price: 100, unit: "box", tag: "New", img: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=500" },
    { id: 6, name: "Exotic Avocado", price: 100, unit: "pc", tag: "Imported", img: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500" },
    // New Items
    { id: 7, name: "Organic Blueberries", price: 220, unit: "125g", tag: "Superfood", img: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=500" },
    { id: 8, name: "Red Bell Pepper", price: 15, unit: "pc", tag: "Crunchy", img: "images/red-bell-pepper.png" },
    { id: 9, name: "Fresh Ginger", price: 40, unit: "250g", tag: "Root", img: "images/fresh-ginger.png" },
    { id: 10, name: "Nashik Onions", price: 35, unit: "1kg", tag: "Essential", img: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500" },
    { id: 11, name: "Italian Basil", price: 60, unit: "bunch", tag: "Aromatic", img: "images/italian-basil.png" },
    { id: 12, name: "Mini Watermelon", price: 99, unit: "pc", tag: "Summer", img: "images/mini-watermelon.png" }
];

let cart = {};
let wishlist = JSON.parse(localStorage.getItem('agro_wishlist') || '[]');

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

    // Fetch location name from pincode
    let locationName = pin; // fallback to pincode
    try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await response.json();
        if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
            const po = data[0].PostOffice[0];
            locationName = `${po.Name}, ${po.District}, ${po.State}`;
            // Save location name for reuse
            localStorage.setItem('delivery_location', locationName);
        }
    } catch (err) {
        console.log('Pincode lookup failed, using pincode as fallback:', err);
    }

    // Update UI
    document.getElementById('welcome-hero').classList.add('hidden');
    document.getElementById('product-section').classList.remove('hidden');
    document.getElementById('loc-tag').innerHTML = `<i class="fas fa-map-marker-alt"></i> Delivering to <b>${locationName}</b>`;

    // Replace pincode in search bar with location name
    const pincodeInput = document.getElementById('pincode');
    pincodeInput.value = locationName;
    pincodeInput.style.fontSize = '0.85rem';

    renderProducts();
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
    grid.innerHTML = inventory.map(item => {
        const isWished = wishlist.includes(item.id);
        return `
                <div class="product-card">
                    <span class="badge">${item.tag}</span>
                    <button class="wishlist-heart ${isWished ? 'active' : ''}" onclick="toggleWishlist(${item.id}, event)" title="Add to My List">
                        <i class="${isWished ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                    <img src="${item.img}" class="product-img">
                    <h3>${item.name}</h3>
                    <p style="color: var(--text-alt)">₹${item.price} / ${item.unit}</p>
                    <div class="qty-controls" id="btn-wrap-${item.id}">
                        ${getProductButtonHTML(item)}
                    </div>
                </div>
            `;
    }).join('');
}

function toggleWishlist(id, event) {
    event.stopPropagation();
    const btn = event.currentTarget;
    const icon = btn.querySelector('i');

    if (wishlist.includes(id)) {
        wishlist = wishlist.filter(i => i !== id);
        btn.classList.remove('active');
        icon.className = 'far fa-heart';
    } else {
        wishlist.push(id);
        btn.classList.add('active');
        icon.className = 'fas fa-heart';

        // Blossom animation
        btn.classList.add('blossom');
        // Create burst particles
        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('span');
            particle.className = 'heart-particle';
            particle.style.setProperty('--angle', (i * 60) + 'deg');
            btn.appendChild(particle);
            setTimeout(() => particle.remove(), 600);
        }
        setTimeout(() => btn.classList.remove('blossom'), 600);
    }

    localStorage.setItem('agro_wishlist', JSON.stringify(wishlist));
}

function renderMyList() {
    const panel = document.getElementById('panel-mylist');
    if (wishlist.length === 0) {
        panel.innerHTML = `
            <div class="dash-empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h3>Your List is Empty</h3>
                <p>Tap the <i class="far fa-heart" style="color:#ef4444"></i> on products to add them here.</p>
                <button class="dash-action-btn" onclick="closeDashboard()">Browse Products</button>
            </div>
        `;
        return;
    }

    let html = '<div class="mylist-grid">';
    wishlist.forEach(id => {
        const item = inventory.find(p => p.id === id);
        if (!item) return;
        html += `
            <div class="mylist-item">
                <img src="${item.img}" alt="${item.name}">
                <div class="mylist-info">
                    <h4>${item.name}</h4>
                    <p>₹${item.price} / ${item.unit}</p>
                </div>
                <div class="mylist-actions">
                    <button class="mylist-add-btn" onclick="addToCart(${item.id}); renderMyList();">ADD</button>
                    <button class="mylist-remove-btn" onclick="removeFromList(${item.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    panel.innerHTML = html;
}

function removeFromList(id) {
    wishlist = wishlist.filter(i => i !== id);
    localStorage.setItem('agro_wishlist', JSON.stringify(wishlist));
    renderMyList();
    renderProducts();
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

// ============================
// Customer Dashboard
// ============================

function openDashboard() {
    const overlay = document.getElementById('dashboard-overlay');
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Load saved profile data
    loadProfileData();
    // Load saved address data
    loadAddressData();
    // Render cart inside dashboard
    renderDashCart();
}

function closeDashboard() {
    const overlay = document.getElementById('dashboard-overlay');
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
}

function switchDashPanel(panelName, navItem) {
    // Update nav active state
    document.querySelectorAll('.dash-nav-item').forEach(item => item.classList.remove('active'));
    navItem.classList.add('active');

    // Update content panels
    document.querySelectorAll('.dash-panel').forEach(panel => panel.classList.remove('active'));
    const panel = document.getElementById('panel-' + panelName);
    if (panel) panel.classList.add('active');

    // Update title
    const titles = {
        profile: 'Profile',
        mylist: 'My List',
        wallet: 'Wallet',
        referral: 'Referral',
        kisankash: 'Agro Point',
        address: 'My Address',
        notifications: 'Notifications',
        cart: 'My Cart'
    };
    document.getElementById('dash-content-title').textContent = titles[panelName] || panelName;

    // Refresh cart when switching to cart panel
    if (panelName === 'cart') renderDashCart();
    if (panelName === 'mylist') renderMyList();
}

// --- Profile ---
function loadProfileData() {
    const profile = JSON.parse(localStorage.getItem('agro_profile') || '{}');
    if (profile.name) document.getElementById('dash-name').value = profile.name;
    if (profile.email) document.getElementById('dash-email').value = profile.email;
    if (profile.phone) {
        document.getElementById('dash-phone-input').value = profile.phone;
        document.getElementById('dash-phone').textContent = '+91 ' + profile.phone;
        document.getElementById('dash-greeting').textContent = 'Hi, ' + (profile.name || '');
    }
    if (profile.altPhone) document.getElementById('dash-alt-phone').value = profile.altPhone;
}

function updateProfile() {
    const profile = {
        name: document.getElementById('dash-name').value,
        email: document.getElementById('dash-email').value,
        phone: document.getElementById('dash-phone-input').value,
        altPhone: document.getElementById('dash-alt-phone').value
    };
    localStorage.setItem('agro_profile', JSON.stringify(profile));

    // Update greeting
    if (profile.name) document.getElementById('dash-greeting').textContent = 'Hi, ' + profile.name;
    if (profile.phone) document.getElementById('dash-phone').textContent = '+91 ' + profile.phone;

    // Show success feedback
    const btn = document.querySelector('.profile-form .dash-update-btn');
    const originalText = btn.textContent;
    btn.textContent = '✓ Updated!';
    btn.style.background = 'linear-gradient(135deg, #8cc63f, #6da326)';
    btn.style.color = 'white';
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.color = '';
    }, 2000);
}

// --- Address ---
function loadAddressData() {
    const addresses = JSON.parse(localStorage.getItem('agro_addresses') || '[]');
    const container = document.getElementById('saved-addresses');
    if (addresses.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = '<h4 style="margin-bottom: 10px; color: #555;">Saved Addresses</h4>';
    addresses.forEach((addr, idx) => {
        container.innerHTML += `
            <div class="saved-address-card">
                <p>${addr.address}, ${addr.city} - ${addr.pincode}<br>${addr.state}${addr.landmark ? ' (Near ' + addr.landmark + ')' : ''}</p>
                <button onclick="deleteAddress(${idx})"><i class="fas fa-trash"></i> Remove</button>
            </div>
        `;
    });
}

function saveAddress() {
    const addr = {
        address: document.getElementById('dash-address').value,
        city: document.getElementById('dash-city').value,
        pincode: document.getElementById('dash-pincode').value,
        state: document.getElementById('dash-state').value,
        landmark: document.getElementById('dash-landmark').value
    };

    if (!addr.address || !addr.city || !addr.pincode) {
        alert('Please fill in Address, City, and Pincode.');
        return;
    }

    const addresses = JSON.parse(localStorage.getItem('agro_addresses') || '[]');
    addresses.push(addr);
    localStorage.setItem('agro_addresses', JSON.stringify(addresses));

    // Clear form
    ['dash-address', 'dash-city', 'dash-pincode', 'dash-state', 'dash-landmark'].forEach(id => {
        document.getElementById(id).value = '';
    });

    // Show success
    const btn = document.querySelector('.address-form .dash-update-btn');
    const originalText = btn.textContent;
    btn.textContent = '✓ Address Saved!';
    btn.style.background = 'linear-gradient(135deg, #8cc63f, #6da326)';
    btn.style.color = 'white';
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.color = '';
    }, 2000);

    loadAddressData();
}

function deleteAddress(index) {
    const addresses = JSON.parse(localStorage.getItem('agro_addresses') || '[]');
    addresses.splice(index, 1);
    localStorage.setItem('agro_addresses', JSON.stringify(addresses));
    loadAddressData();
}

// --- Wallet ---
function addToWallet() {
    const amountInput = document.getElementById('wallet-amount');
    const amount = parseInt(amountInput.value);
    if (!amount || amount < 1) {
        alert('Please enter a valid amount.');
        return;
    }

    let balance = parseFloat(localStorage.getItem('agro_wallet') || '0');
    balance += amount;
    localStorage.setItem('agro_wallet', balance.toFixed(2));

    document.querySelector('.wallet-amount').textContent = '₹' + balance.toFixed(2);
    amountInput.value = '';

    // Show success
    const btn = document.querySelector('.wallet-actions .dash-action-btn');
    const originalText = btn.textContent;
    btn.textContent = '✓ Added!';
    setTimeout(() => { btn.textContent = originalText; }, 1500);
}

// --- Referral ---
function copyReferral() {
    const code = document.getElementById('referral-code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        const btn = document.querySelector('.copy-btn');
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i> Copy'; }, 2000);
    });
}

function shareReferral(platform) {
    const code = document.getElementById('referral-code').textContent;
    const message = `Join AGRO-UP for farm-fresh produce delivery! Use my referral code: ${code} and get ₹100 off your first order. 🥬🍎`;

    if (platform === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    } else if (platform === 'sms') {
        window.open(`sms:?body=${encodeURIComponent(message)}`, '_blank');
    }
}

// --- Dashboard Cart ---
function renderDashCart() {
    const container = document.getElementById('dash-cart-items');
    const summary = document.getElementById('dash-cart-summary');

    const itemIds = Object.keys(cart);
    if (itemIds.length === 0) {
        container.innerHTML = `
            <div class="dash-empty-state">
                <i class="fas fa-shopping-basket"></i>
                <h3>Your cart is empty</h3>
                <p>Add items from the product page to see them here.</p>
                <button class="dash-action-btn" onclick="closeDashboard()">Browse Products</button>
            </div>
        `;
        summary.style.display = 'none';
        return;
    }

    summary.style.display = 'block';
    let total = 0;
    let html = '';

    itemIds.forEach(id => {
        const item = inventory.find(p => p.id == id);
        if (!item) return;
        const qty = cart[id];
        const price = item.price * qty;
        total += price;

        html += `
            <div class="dash-cart-item">
                <div class="dash-cart-item-info">
                    <img src="${item.img}" class="dash-cart-item-img" alt="${item.name}">
                    <div>
                        <div class="dash-cart-item-name">${item.name}</div>
                        <div class="dash-cart-item-qty">Qty: ${qty} × ₹${item.price}</div>
                    </div>
                </div>
                <span class="dash-cart-item-price">₹${price}</span>
            </div>
        `;
    });

    container.innerHTML = html;
    document.getElementById('dash-sub-total').textContent = '₹' + total;
}

// Load wallet balance on page load
document.addEventListener('DOMContentLoaded', () => {
    const balance = localStorage.getItem('agro_wallet');
    if (balance) {
        const el = document.querySelector('.wallet-amount');
        if (el) el.textContent = '₹' + parseFloat(balance).toFixed(2);
    }
});
