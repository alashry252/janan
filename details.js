/**
 * Jenan Luxury - Final Details Script
 * مخصص لمعالجة الصور المتعددة وتحديث الصفحة وإدارة السلة والواتساب
 */

document.addEventListener('DOMContentLoaded', () => {
    const product = JSON.parse(localStorage.getItem('selectedProduct'));

    if (!product) {
        window.location.href = 'index.html';
        return;
    }

    // 1. تعبئة البيانات الأساسية
    document.getElementById('p-title').innerText = product.name;
    document.getElementById('current-crumb').innerText = product.name;
    
    // تنسيق السعر (رقم أو نص)
    const priceDisplay = (typeof product.price === 'number') ? 
                         product.price.toLocaleString('ar-EG') + " ج.م" : product.price;
    document.getElementById('p-price').innerText = priceDisplay;
    
    document.getElementById('p-desc').innerText = product.description || "قطعة فريدة من مجموعة جنان لوكشري المصممة بعناية.";

    // 2. معالجة الصور (الرئيسية والمعرض)
    const mainImg = document.getElementById('main-display-img');
    if (mainImg) mainImg.src = product.image;

    renderGallery(product);

    // 3. تشغيل الأنظمة
    setupMobileMenu();
    updateBadge();
    renderPopdownCart();
    renderFilteredSuggestions(product.name);

    // 4. السلة المنبثقة
    setupCartToggle();
});

// --- وظيفة بناء معرض الصور ---
function renderGallery(product) {
    const thumbList = document.getElementById('thumb-list');
    if (!thumbList) return;
    
    thumbList.innerHTML = ''; 
    let allImages = [];
    
    // دمج الصورة الأساسية مع المعرض
    if (product.gallery && Array.isArray(product.gallery)) {
        allImages = [product.image, ...product.gallery];
    } else {
        allImages = [product.image];
    }

    // منع تكرار الصور
    const uniqueImages = [...new Set(allImages)];

    uniqueImages.forEach((imgSrc, index) => {
        const imgObj = document.createElement('img');
        imgObj.src = imgSrc;
        imgObj.classList.add('thumb');
        if (index === 0) imgObj.classList.add('active');

        imgObj.onclick = function() {
            const mainDisplay = document.getElementById('main-display-img');
            mainDisplay.style.opacity = '0.4';
            setTimeout(() => {
                mainDisplay.src = imgSrc;
                mainDisplay.style.opacity = '1';
            }, 150);
            document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        };
        thumbList.appendChild(imgObj);
    });
}

// --- نظام المقترحات: استبعاد الحالي وتحديث الصفحة ---
function renderFilteredSuggestions(currentName) {
    const container = document.getElementById('suggestions-list');
    if (!container) return;

    const allProducts = [
        { name: "ازرق - خمار فاخر", price: 600, image: "image/جنان1.jpeg", gallery: ['image-details/1.jpeg','image-details/111.jpeg','image-details/11111.jpeg'] },
        { name: "خمار وجيبة", price: 750, image: "image/جنان3.jpeg", gallery: ['image-details/2.jpeg','image-details/22.jpeg','image-details/222.jpeg'] },
        { name: "عباءة خروج وبيتى", price: "نفذت الكمية", image: "image/جنان5.jpeg", gallery: ['image-details/3.jpeg','image-details/33.jpeg','image-details/333.jpeg'] },
        { name: "عباءة خروج - زيتي", price: 800, image: "image/جنان7.jpeg", gallery: ['image-details/4.jpeg','image-details/44.jpeg','image-details/444.jpeg'] },
        { name: "عباءة خروج مميزة", price: 800, image: "image/جنان9.jpeg", gallery: ['image-details/5.jpeg','image-details/55.jpeg','image-details/555.jpeg'] }
    ];

    const filtered = allProducts.filter(p => p.name.trim() !== currentName.trim());

    container.innerHTML = filtered.map(p => {
        const galleryJson = JSON.stringify(p.gallery).replace(/"/g, '&quot;');
        return `
        <div class="s-card">
            <div class="s-img-box"><img src="${p.image}"></div>
            <h4>${p.name}</h4>
            <span class="s-price">${typeof p.price === 'number' ? p.price + ' ج.م' : p.price}</span>
            <button class="s-btn" onclick="goToNewProduct('${p.name}', '${p.price}', '${p.image}', '${galleryJson}')">
                اكتشفي القطعة
            </button>
        </div>`;
    }).join('');
}

function goToNewProduct(name, price, img, galleryStr) {
    const finalPrice = isNaN(price) ? price : parseFloat(price);
    const gallery = JSON.parse(galleryStr.replace(/&quot;/g, '"'));

    const newProd = { 
        name: name, 
        price: finalPrice, 
        image: img, 
        gallery: gallery, 
        description: "قطعة مميزة وحصرية من مجموعة جنان لوكشري." 
    };
    
    localStorage.setItem('selectedProduct', JSON.stringify(newProd));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => { window.location.reload(); }, 500);
}

// --- وظائف السلة ---
function addToCartDetailed() {
    const product = JSON.parse(localStorage.getItem('selectedProduct'));
    let cart = JSON.parse(localStorage.getItem('jenan_cart')) || [];
    const itemPrice = (typeof product.price === 'number') ? product.price : 0;
    
    cart.push({ name: product.name, price: itemPrice, image: product.image });
    localStorage.setItem('jenan_cart', JSON.stringify(cart));
    
    updateBadge();
    renderPopdownCart();
    showNotification(product.name, product.image);
    
    const popdown = document.getElementById('cartPopdown');
    if (popdown) {
        popdown.classList.add('show');
        setTimeout(() => popdown.classList.remove('show'), 3000);
    }
}

function renderPopdownCart() {
    const container = document.getElementById('cartItemsContainer');
    const totalEl = document.getElementById('cartTotal');
    let cart = JSON.parse(localStorage.getItem('jenan_cart')) || [];
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:15px; color:#999;">الحقيبة فارغة</p>';
        if (totalEl) totalEl.innerText = '٠ ج.م';
        return;
    }

    let total = 0;
    container.innerHTML = cart.map((item, index) => {
        total += item.price;
        return `
            <div class="cart-item-mini">
                <div class="cart-img-wrapper"><img src="${item.image}"></div>
                <div class="item-info">
                    <h6>${item.name}</h6>
                    <span class="mini-price">${item.price.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <button class="remove-item" onclick="removeFromCart(event, ${index})">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>`;
    }).join('');
    if (totalEl) totalEl.innerText = total.toLocaleString('ar-EG') + " ج.م";
}

function removeFromCart(event, index) {
    event.stopPropagation();
    let cart = JSON.parse(localStorage.getItem('jenan_cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('jenan_cart', JSON.stringify(cart));
    renderPopdownCart();
    updateBadge();
}

// --- وظائف تم حل مشاكلها (Send to WhatsApp & Toggle Heart) ---

function sendToWhatsApp() {
    const cart = JSON.parse(localStorage.getItem('jenan_cart')) || [];
    if (cart.length === 0) {
        alert("حقيبة التسوق فارغة حالياً!");
        return;
    }

    let message = "مرحباً جنان لوكشري، أود طلب القطع التالية:\n\n";
    let total = 0;
    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} - ${item.price} ج.م\n`;
        total += item.price;
    });
    message += `\nالإجمالي: ${total} ج.م`;
    
    const phoneNumber = "201211819366";
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
}

function toggleHeart(button) {
    const icon = button.querySelector('i');
    button.classList.toggle('active');
    if (button.classList.contains('active')) {
        icon.className = 'fa-solid fa-heart';
        icon.style.color = '#ff4d4d';
    } else {
        icon.className = 'fa-regular fa-heart';
        icon.style.color = '';
    }
}

// --- إعدادات الواجهة ---
function setupCartToggle() {
    const cartBtn = document.getElementById('cartBtn');
    const popdown = document.getElementById('cartPopdown');
    if (cartBtn && popdown) {
        cartBtn.onclick = (e) => { e.stopPropagation(); popdown.classList.toggle('show'); };
        document.addEventListener('click', (e) => {
            if (!popdown.contains(e.target) && !cartBtn.contains(e.target)) {
                popdown.classList.remove('show');
            }
        });
    }
}

function setupMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.onclick = () => {
            menuToggle.classList.toggle('is-active');
            navLinks.classList.toggle('active');
        };
    }
}

function updateBadge() {
    const cart = JSON.parse(localStorage.getItem('jenan_cart')) || [];
    document.querySelectorAll('.cart-badge').forEach(b => {
        b.innerText = cart.length;
        b.style.display = cart.length > 0 ? 'flex' : 'none';
    });
}

function showNotification(name, img) {
    const container = document.getElementById('notification-container');
    if (!container) return;
    const notification = document.createElement('div');
    notification.className = 'add-success-popup';
    notification.innerHTML = `
        <img src="${img}">
        <div style="flex:1; text-align:right;">
            <h6 style="margin:0; font-size:0.85rem;">تمت الإضافة بنجاح</h6>
            <p style="margin:0; font-size:0.75rem; color:#c5a059;">${name}</p>
        </div>`;
    container.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}