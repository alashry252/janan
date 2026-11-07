/**
 * Jenan Luxury Store - النسخة الكاملة الشاملة
 * الميزات: القائمة المتجاوبة، إرسال البيانات لصفحة التفاصيل، الحذف دون إغلاق، دعم الأرقام العربية، المفضلة، والواتساب
 */

// --- 1. منطق المقدمة (Intro Logic) ---
window.addEventListener('load', () => {
    const intro = document.getElementById('intro-layer');
    setTimeout(() => {
        if (intro) {
            intro.classList.add('fade-out');
            document.body.style.overflow = 'auto';
        }
    }, 4000);
});
document.body.style.overflow = 'hidden';

// --- 2. تعريف العناصر والبيانات ---
const menu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');
const cartBtn = document.getElementById('cartBtn');

let cart = JSON.parse(localStorage.getItem('jenan_cart')) || [];
cart = cart.filter(item => item && typeof item.price === 'number'); 
let wishlist = JSON.parse(localStorage.getItem('jenan_wishlist')) || [];

// وظيفة تحويل الأرقام العربية لإنجليزية للحسابات
function parsePrice(str) {
    if (!str) return 0;
    const arabicNums = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
    let result = str.toString();
    for (let i = 0; i < 10; i++) { result = result.replace(arabicNums[i], i); }
    return parseInt(result.replace(/[^\d]/g, '')) || 0;
}

// --- 3. ميزة القائمة الجانبية (Toggle Menu) للهاتف ---
if (menu && navLinks) {
    menu.addEventListener('click', () => {
        menu.classList.toggle('is-active'); // لتحويل شكل الزر (X)
        navLinks.classList.toggle('active'); // لظهور القائمة
    });

    // إغلاق القائمة عند الضغط على أي رابط بداخلها
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('is-active');
            navLinks.classList.remove('active');
        });
    });
}

// --- 4. ميزة إرسال العناصر لصفحة التفاصيل ---
window.openProductDetails = function(name, price, imageInput, cardElement) {
    let mainImg = "";
    let galleryImgs = [];

    if (Array.isArray(imageInput)) {
        mainImg = imageInput[0]; 
        galleryImgs = imageInput; 
    } else {
        mainImg = imageInput;
        galleryImgs = [imageInput];
    }
    
    const productData = {
        name: name,
        price: price,
        image: mainImg,
        gallery: galleryImgs,
        description: "تصميم ملكي فاخر من مجموعة جنان، تم اختياره بعناية ليعكس ذوقك الرفيع.",
        specs: ["قماش كريب سعودي فاخر", "حياكة يدوية دقيقة", "طرحة مجانية"]
    };
    
    localStorage.setItem('selectedProduct', JSON.stringify(productData));
    window.location.href = 'details.html';
};

// --- 5. وظيفة المفضلة (Wishlist) ---
window.toggleWishlist = function(btn, productName) {
    const icon = btn.querySelector('i');
    const index = wishlist.indexOf(productName);
    if (index === -1) {
        wishlist.push(productName);
        btn.classList.add('active');
        icon.classList.replace('fa-regular', 'fa-solid');
    } else {
        wishlist.splice(index, 1);
        btn.classList.remove('active');
        icon.classList.replace('fa-solid', 'fa-regular');
    }
    localStorage.setItem('jenan_wishlist', JSON.stringify(wishlist));
};

// --- 6. بناء هيكل السلة والبوب أب ---
const cartDropdown = document.createElement('div');
cartDropdown.className = 'cart-popdown';
cartDropdown.id = 'cartDropdown';
cartDropdown.innerHTML = `
    <div class="cart-header-title">حقيبة التسوق</div>
    <div id="cart-list" class="cart-items-container"></div>
    <div class="cart-summary">
        <div class="cart-total">الإجمالي: <span id="total-price">0</span> ج.م</div>
        <button class="whatsapp-send-btn" id="whatsapp-btn">طلب عبر الواتساب <i class="fa-brands fa-whatsapp"></i></button>
    </div>
`;
document.body.appendChild(cartDropdown);

const notificationContainer = document.createElement('div');
notificationContainer.id = 'notification-container';
document.body.appendChild(notificationContainer);

// --- 7. تحديث واجهة السلة (UI) ---
function updateCartUI() {
    const list = document.getElementById('cart-list');
    const totalDisplay = document.getElementById('total-price');
    const badges = document.querySelectorAll('.cart-badge');
    
    list.innerHTML = cart.length === 0 ? '<p class="empty-msg" style="text-align:center; padding:20px;">الحقيبة فارغة</p>' : '';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;
        list.innerHTML += `
            <div class="cart-item-mini">
                <div class="cart-img-wrapper"><img src="${item.image}" alt=""></div>
                <div class="item-info">
                    <h6>${item.name}</h6>
                    <span class="mini-price">${item.price.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <button class="remove-item" onclick="removeFromCart(event, ${index})">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
    });

    badges.forEach(badge => {
        badge.innerText = cart.length;
        badge.style.display = cart.length > 0 ? 'flex' : 'none';
    });

    if (totalDisplay) totalDisplay.innerText = total.toLocaleString('ar-EG');
    localStorage.setItem('jenan_cart', JSON.stringify(cart));
}

// حذف عنصر دون إغلاق القائمة
window.removeFromCart = (event, index) => {
    event.stopPropagation();
    cart.splice(index, 1);
    updateCartUI();
};

// التنبيه المنبثق عند الإضافة
function showSuccessPopup(name, img) {
    const popup = document.createElement('div');
    popup.className = 'add-success-popup';
    popup.innerHTML = `<img src="${img}"><div class="popup-text"><strong>تمت الإضافة!</strong><span>${name}</span></div>`;
    notificationContainer.appendChild(popup);
    setTimeout(() => { popup.classList.add('fade-out'); setTimeout(() => popup.remove(), 500); }, 3000);
}

// --- 8. إدارة الأحداث العامة (Clicks) ---
document.addEventListener('click', (e) => {
    // 1. الضغط على "عرض التفاصيل"
    if (e.target.classList.contains('view-details') || e.target.classList.contains('abaya-overlay')) {
        const card = e.target.closest('.abaya-card');
        const imgBox = card.querySelector('.abaya-img-box');
        
        if (!imgBox.getAttribute('onclick')) {
            const name = card.querySelector('h3').innerText;
            const price = parsePrice(card.querySelector('.abaya-price').innerText);
            const image = card.querySelector('img').src;
            window.openProductDetails(name, price, image, card);
        }
    }

    // 2. إضافة للسلة
    if (e.target.closest('.add-to-cart-small')) {
        const card = e.target.closest('.abaya-card');
        if (card) {
            const product = {
                name: card.querySelector('h3').innerText,
                price: parsePrice(card.querySelector('.abaya-price').innerText),
                image: card.querySelector('img').src
            };
            cart.push(product);
            updateCartUI();
            showSuccessPopup(product.name, product.image);
            cartDropdown.classList.add('show');
        }
    }

    // 3. فتح/إغلاق السلة
    if (e.target.closest('#cartBtn')) {
        e.preventDefault();
        cartDropdown.classList.toggle('show');
    }

    // 4. إغلاق السلة والقائمة عند الضغط في الخارج
    if (!e.target.closest('.cart-popdown') && !e.target.closest('#cartBtn') && !e.target.closest('#mobile-menu')) {
        cartDropdown.classList.remove('show');
        if (menu) menu.classList.remove('is-active');
        if (navLinks) navLinks.classList.remove('active');
    }
});

cartDropdown.addEventListener('click', (e) => e.stopPropagation());

// --- 9. منطق الواتساب ---
document.getElementById('whatsapp-btn').onclick = () => {
    if (cart.length === 0) return;
    const phoneNumber = "+201069127862"; 
    let msg = "مرحباً *جنان*، أود طلب الموديلات التالية:\n\n";
    cart.forEach((item, i) => msg += `*${i+1}. ${item.name}* (${item.price.toLocaleString('ar-EG')} ج.م)\n`);
    msg += `\n*الإجمالي: ${cart.reduce((s,i)=>s+i.price,0).toLocaleString('ar-EG')} ج.م*`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`, '_blank');
};

// --- 10. الستايلات الإضافية (للقائمة والسلة) ---
const style = document.createElement('style');
style.innerHTML = `
    .wishlist-btn.active i { color: #e74c3c !important; }
    .cart-popdown {
        position: fixed; top: 80px; right: 5%; width: 300px; background: #fff;
        box-shadow: 0 10px 40px rgba(0,0,0,0.15); border-radius: 8px; opacity: 0; visibility: hidden;
        transform: translateY(-10px); transition: 0.3s ease; z-index: 9999; padding: 15px; border-top: 3px solid #c5a059;
    }
    .cart-popdown.show { opacity: 1; visibility: visible; transform: translateY(0); }
    .cart-items-container { max-height: 350px; overflow-y: auto; padding-right: 5px; }
    .cart-item-mini { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; border-bottom: 1px solid #f2f2f2; padding-bottom: 10px; }
    .cart-img-wrapper { width: 45px; height: 60px; overflow: hidden; border-radius: 4px; flex-shrink: 0; }
    .cart-img-wrapper img { width: 100%; height: 100%; object-fit: cover; }
    .item-info { flex: 1; text-align: right; }
    .item-info h6 { font-size: 0.8rem; margin: 0; color: #05241d; }
    .mini-price { font-size: 0.75rem; color: #c5a059; font-weight: bold; }
    .remove-item { background: none; border: none; color: #ffbcbc; cursor: pointer; font-size: 1rem; transition: 0.2s; }
    .remove-item:hover { color: #ff4d4d; }
    .whatsapp-send-btn { width: 100%; padding: 12px; background: #25d366; color: #fff; border: none; border-radius: 5px; cursor: pointer; font-family: 'Cairo'; font-weight: bold; margin-top: 10px; }
    #notification-container { position: fixed; bottom: 20px; right: 20px; z-index: 10001; }
    .add-success-popup {
        background: #fff; border-right: 3px solid #c5a059; display: flex; align-items: center; gap: 12px; 
        padding: 8px 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-radius: 4px; margin-top: 8px;
        animation: slideIn 0.4s ease forwards; direction: rtl;
    }
    .add-success-popup img { width: 35px; height: 45px; object-fit: cover; }
    @keyframes slideIn { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
    .fade-out { opacity: 0; transition: 0.5s; }
    
    /* ستايل المنيو للموبايل عند التفعيل */
    .nav-links.active { right: 0 !important; }
    .menu-toggle.is-active .bar:nth-child(2) { opacity: 0; }
    .menu-toggle.is-active .bar:nth-child(1) { transform: translateY(8px) rotate(45deg); }
    .menu-toggle.is-active .bar:nth-child(3) { transform: translateY(-8px) rotate(-45deg); }
`;
document.head.appendChild(style);

// --- 11. تفعيل المكتبات ومراقب الظهور ---
window.onload = () => {
    updateCartUI();
    document.querySelectorAll('.abaya-card').forEach(card => {
        const title = card.querySelector('h3').innerText;
        if (wishlist.includes(title)) {
            const btn = card.querySelector('.wishlist-btn');
            if(btn) {
                btn.classList.add('active');
                btn.querySelector('i').classList.replace('fa-regular', 'fa-solid');
            }
        }
    });
};

const scriptTilt = document.createElement('script');
scriptTilt.src = "https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.7.0/vanilla-tilt.min.js";
document.head.appendChild(scriptTilt);
scriptTilt.onload = () => {
    VanillaTilt.init(document.querySelectorAll(".glass-3d"), { max: 10, speed: 400, glare: true, "max-glare": 0.2 });
};

// مراقب الظهور (Scroll Reveal)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));