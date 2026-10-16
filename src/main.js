/**
 * NovaMarket — Asosiy Ilova Kiritish Nuqtasi (Main Application Entry Point)
 */
import { CATEGORIES } from './data/categories.js';
import { StorageService } from './services/storage.js';
import { CatalogFeature } from './features/catalog/catalog.js';
import { SearchFeature } from './features/search/search.js';
import { CartFeature } from './features/cart/cart.js';
import { CheckoutFeature } from './features/checkout/checkout.js';
import { formatPrice, formatInstallment, formatDeliveryDate, formatUzbekDateTime } from './utils/formatters.js';

class NovaMarketApp {
  constructor() {
    this.catalogFeature = new CatalogFeature({
      containerId: 'catalogProductsGrid',
      sidebarId: 'catalogSidebar'
    });

    this.cartFeature = new CartFeature({
      overlayId: 'cartDrawerOverlay',
      onUpdate: () => {
        this.catalogFeature.render();
      }
    });

    this.checkoutFeature = new CheckoutFeature({
      modalId: 'checkoutModalOverlay',
      cartFeature: this.cartFeature
    });

    this.searchFeature = new SearchFeature({
      inputId: 'universalSearchInput',
      dropdownId: 'searchSuggestionsDropdown',
      clearBtnId: 'clearSearchBtn',
      onSearchSubmit: (q) => {
        this.catalogFeature.setSearchQuery(q);
      }
    });
  }

  init() {
    this.initCity();
    this.initMegaMenu();
    this.initQuickCategories();
    this.initHeroSlider();
    this.initModals();

    this.catalogFeature.init();
    this.cartFeature.init();
    this.checkoutFeature.init();
    this.searchFeature.init();

    this.updateWishlistCount();
    this.initMobileBottomNav();
    this.initAdminSecretAccess();
  }

  // ================= SECRET ADMIN ACCESS =================
  initAdminSecretAccess() {
    // 1. Maxfiy klaviatura tugmasi: Ctrl + Shift + A (Mac: Cmd + Shift + A)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a' || e.code === 'KeyA')) {
        e.preventDefault();
        window.location.href = 'admin.html';
      }
    });

    // 2. Maxfiy logotip bosilishi: Logotip ustiga ketma-ket 5 marta tez bosish
    const logo = document.querySelector('header .logo');
    if (logo) {
      let clickCount = 0;
      let clickTimer = null;
      logo.addEventListener('click', (e) => {
        clickCount++;
        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => {
          clickCount = 0;
        }, 2000);

        if (clickCount >= 5) {
          e.preventDefault();
          clickCount = 0;
          window.location.href = 'admin.html';
        }
      });
    }
  }

  // ================= CITY SELECTION =================
  initCity() {
    const currentCity = StorageService.getCity();
    const cityEl = document.getElementById('topBarCurrentCity');
    const mobileCityEl = document.getElementById('mobileTopCity');
    if (cityEl) cityEl.textContent = currentCity;
    if (mobileCityEl) mobileCityEl.textContent = currentCity;

    const cityBtn = document.getElementById('topBarCityBtn');
    if (cityBtn) {
      cityBtn.addEventListener('click', () => {
        this.openModal('cityModalOverlay');
      });
    }
  }

  selectCity(city) {
    StorageService.setCity(city);
    const cityEl = document.getElementById('topBarCurrentCity');
    const mobileCityEl = document.getElementById('mobileTopCity');
    if (cityEl) cityEl.textContent = city;
    if (mobileCityEl) mobileCityEl.textContent = city;
    this.closeModal('cityModalOverlay');
    this.showToast('Shahar o\'zgartirildi', `Yetkazib berish shahri: ${city}`, 'fa-location-dot');
  }

  toggleMobileFilters() {
    const sidebar = document.getElementById('catalogSidebar');
    if (sidebar) {
      sidebar.classList.toggle('active');
    }
  }

  handleNavTab(tabName) {
    document.querySelectorAll('.mobile-nav-item').forEach(btn => btn.classList.remove('active'));
    if (tabName === 'home') {
      const homeBtn = document.getElementById('mobileNavHome');
      if (homeBtn) homeBtn.classList.add('active');
      this.closeMegaMenu();
      this.closeModal('wishlistModalOverlay');
      this.closeModal('ordersModalOverlay');
      this.closeCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tabName === 'catalog') {
      const catalogBtn = document.getElementById('mobileNavCatalog');
      if (catalogBtn) catalogBtn.classList.add('active');
      this.toggleMegaMenu();
    } else if (tabName === 'cart') {
      const cartBtn = document.getElementById('mobileNavCart');
      if (cartBtn) cartBtn.classList.add('active');
      this.openCart();
    } else if (tabName === 'wishlist') {
      const wishlistBtn = document.getElementById('mobileNavWishlist');
      if (wishlistBtn) wishlistBtn.classList.add('active');
      this.openWishlistModal();
    } else if (tabName === 'orders') {
      const ordersBtn = document.getElementById('mobileNavOrders');
      if (ordersBtn) ordersBtn.classList.add('active');
      this.openOrdersModal();
    }
  }

  // ================= MOBILE BOTTOM NAVIGATION =================
  initMobileBottomNav() {
    const homeBtn = document.getElementById('mobileNavHome');
    const catalogBtn = document.getElementById('mobileNavCatalog');
    const cartBtn = document.getElementById('mobileNavCart');
    const wishlistBtn = document.getElementById('mobileNavWishlist');
    const ordersBtn = document.getElementById('mobileNavOrders');

    const setActive = (targetBtn) => {
      document.querySelectorAll('.mobile-nav-item').forEach(b => b.classList.remove('active'));
      if (targetBtn) targetBtn.classList.add('active');
    };

    if (homeBtn) {
      homeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeMegaMenu();
        this.closeModal('wishlistModalOverlay');
        this.closeModal('ordersModalOverlay');
        this.closeCart();
        setActive(homeBtn);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    if (catalogBtn) {
      catalogBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeModal('wishlistModalOverlay');
        this.closeModal('ordersModalOverlay');
        this.closeCart();
        this.toggleMegaMenu();
      });
    }

    if (cartBtn) {
      cartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeMegaMenu();
        this.closeModal('wishlistModalOverlay');
        this.closeModal('ordersModalOverlay');
        this.openCart();
        setActive(cartBtn);
      });
    }

    if (wishlistBtn) {
      wishlistBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeMegaMenu();
        this.closeCart();
        this.closeModal('ordersModalOverlay');
        this.openWishlistModal();
        setActive(wishlistBtn);
      });
    }

    if (ordersBtn) {
      ordersBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeMegaMenu();
        this.closeCart();
        this.closeModal('wishlistModalOverlay');
        this.openOrdersModal();
        setActive(ordersBtn);
      });
    }
  }

  // ================= MEGA MENU =================
  initMegaMenu() {
    const catalogBtn = document.getElementById('headerCatalogBtn');
    const megaMenu = document.getElementById('headerMegaMenu');
    const list = document.getElementById('megaMenuCategoriesList');
    const content = document.getElementById('megaMenuSubcatContent');

    if (!catalogBtn || !megaMenu || !list || !content) return;

    catalogBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMegaMenu();
    });

    document.addEventListener('click', (e) => {
      const mobileBtn = document.getElementById('mobileNavCatalog');
      if (
        !megaMenu.contains(e.target) &&
        !catalogBtn.contains(e.target) &&
        (!mobileBtn || !mobileBtn.contains(e.target))
      ) {
        this.closeMegaMenu();
      }
    });

    list.innerHTML = CATEGORIES.map((cat, idx) => `
      <div class="mega-menu-cat-item ${idx === 0 ? 'active' : ''}" data-cat="${cat.id}">
        <div class="mega-menu-cat-left">
          <i class="fa-solid ${cat.icon}" style="color: ${cat.color};"></i>
          <span>${cat.name}</span>
        </div>
        <i class="fa-solid fa-chevron-right" style="font-size: 11px; color: var(--text-muted);"></i>
      </div>
    `).join('');

    const renderSubcats = (catId) => {
      const cat = CATEGORIES.find(c => c.id === catId) || CATEGORIES[0];
      content.innerHTML = `
        <div class="subcat-group">
          <h4>${cat.name} bo'limlari</h4>
          <ul class="subcat-list">
            ${cat.subcategories.map(sub => `
              <li>
                <a href="#catalog" onclick="window.novaMarketApp.filterCategory('${cat.id}'); window.novaMarketApp.closeMegaMenu();">
                  ${sub.name}
                </a>
              </li>
            `).join('')}
          </ul>
        </div>
        <div class="subcat-group">
          <h4>Ommabop filtrlar</h4>
          <ul class="subcat-list">
            <li><a href="#catalog" onclick="window.novaMarketApp.filterCategory('${cat.id}'); window.novaMarketApp.catalogFeature.state.onlyDiscount=true; window.novaMarketApp.catalogFeature.render(); window.novaMarketApp.closeMegaMenu();">🔥 Chegirmadagi tovarlar</a></li>
            <li><a href="#catalog" onclick="window.novaMarketApp.filterCategory('${cat.id}'); window.novaMarketApp.catalogFeature.state.onlyInStock=true; window.novaMarketApp.catalogFeature.render(); window.novaMarketApp.closeMegaMenu();">⚡ 1 kunda yetkazish</a></li>
          </ul>
        </div>
        <div class="subcat-group" style="display: flex; flex-direction: column; justify-content: center; align-items: center; background: var(--bg-subtle); border-radius: 12px; padding: 20px; text-align: center;">
          <img src="${cat.banner}" alt="${cat.name}" style="height: 120px; width: 100%; object-fit: cover; border-radius: 8px; margin-bottom: 12px;">
          <button class="btn btn-primary btn-sm btn-block" onclick="window.novaMarketApp.filterCategory('${cat.id}'); window.novaMarketApp.closeMegaMenu();">
            Bo'limga o'tish
          </button>
        </div>
      `;
    };

    renderSubcats(CATEGORIES[0].id);

    list.querySelectorAll('.mega-menu-cat-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        list.querySelectorAll('.mega-menu-cat-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        renderSubcats(item.dataset.cat);
      });
      item.addEventListener('click', () => {
        this.filterCategory(item.dataset.cat);
        this.closeMegaMenu();
      });
    });
  }

  toggleMegaMenu() {
    const catalogBtn = document.getElementById('headerCatalogBtn');
    const megaMenu = document.getElementById('headerMegaMenu');
    const mobileBtn = document.getElementById('mobileNavCatalog');
    const homeBtn = document.getElementById('mobileNavHome');
    if (!megaMenu) return;

    const isActive = megaMenu.classList.toggle('active');
    if (catalogBtn) catalogBtn.classList.toggle('active', isActive);
    if (mobileBtn) {
      document.querySelectorAll('.mobile-nav-item').forEach(b => b.classList.remove('active'));
      if (isActive) {
        mobileBtn.classList.add('active');
      } else if (homeBtn) {
        homeBtn.classList.add('active');
      }
    }
  }

  closeMegaMenu() {
    const catalogBtn = document.getElementById('headerCatalogBtn');
    const megaMenu = document.getElementById('headerMegaMenu');
    const mobileBtn = document.getElementById('mobileNavCatalog');
    const homeBtn = document.getElementById('mobileNavHome');
    if (catalogBtn) catalogBtn.classList.remove('active');
    if (megaMenu) megaMenu.classList.remove('active');
    if (mobileBtn) mobileBtn.classList.remove('active');
    if (homeBtn && !document.querySelector('.modal-overlay.active') && !document.querySelector('.cart-overlay.active')) {
      homeBtn.classList.add('active');
    }
  }

  openCart() {
    if (this.cartFeature) {
      this.cartFeature.open();
    }
  }

  closeCart() {
    if (this.cartFeature) {
      this.cartFeature.close();
    }
  }

  // ================= QUICK CATEGORY PILLS =================
  initQuickCategories() {
    const list = document.getElementById('quickCategoriesList');
    if (!list) return;

    list.innerHTML = `
      <button class="quick-cat-btn active" data-category="all" onclick="window.novaMarketApp.filterCategory('all')">
        <i class="fa-solid fa-border-all"></i> Barchasi
      </button>
    ` + CATEGORIES.map(c => `
      <button class="quick-cat-btn" data-category="${c.id}" onclick="window.novaMarketApp.filterCategory('${c.id}')">
        <i class="fa-solid ${c.icon}" style="color: ${c.color};"></i> ${c.name}
      </button>
    `).join('');
  }

  filterCategory(catId) {
    document.querySelectorAll('.quick-cat-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === catId);
    });

    this.catalogFeature.setCategory(catId);

    const catalogEl = document.getElementById('catalog');
    if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
  }

  resetFilters() {
    this.catalogFeature.resetFilters();
  }

  // ================= HERO SLIDER =================
  initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const prev = document.getElementById('heroSlidePrevBtn');
    const next = document.getElementById('heroSlideNextBtn');
    if (!slides.length) return;

    let current = 0;
    const show = (idx) => {
      slides.forEach(s => s.classList.remove('active'));
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add('active');
    };

    let timer = setInterval(() => show(current + 1), 5000);

    if (next) next.addEventListener('click', () => {
      clearInterval(timer);
      show(current + 1);
      timer = setInterval(() => show(current + 1), 5000);
    });

    if (prev) prev.addEventListener('click', () => {
      clearInterval(timer);
      show(current - 1);
      timer = setInterval(() => show(current - 1), 5000);
    });
  }

  // ================= WISHLIST =================
  toggleWishlist(productId, event) {
    if (event) event.stopPropagation();
    const result = StorageService.toggleWishlist(productId);
    const p = StorageService.getProductById(productId);

    if (result.added) {
      this.showToast('Sevimlilarga qo\'shildi', p?.name || 'Mahsulot', 'fa-heart');
    } else {
      this.showToast('Sevimlilardan o\'chirildi', p?.name || 'Mahsulot', 'fa-heart-crack');
    }

    this.updateWishlistCount();
    this.catalogFeature.render();
  }

  updateWishlistCount() {
    const count = StorageService.getWishlist().length;
    const badge = document.getElementById('headerWishlistBadge');
    const mobileBadge = document.getElementById('mobileWishlistBadge');
    if (badge) badge.textContent = count;
    if (mobileBadge) mobileBadge.textContent = count;
  }

  openWishlistModal() {
    const modal = document.getElementById('wishlistModalOverlay');
    const list = document.getElementById('wishlistModalItemsList');
    if (!modal || !list) return;

    const wishlistIds = StorageService.getWishlist();
    if (wishlistIds.length === 0) {
      list.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <i class="fa-regular fa-heart" style="font-size: 48px; color: #CBD5E1; margin-bottom: 12px;"></i>
          <h4>Sevimlilar ro'yxatingiz bo'sh</h4>
          <p style="color: var(--text-secondary); font-size: 14px; margin-top: 6px;">Yoqqan mahsulotlarni yurakcha orqali saqlab qo'ying!</p>
        </div>
      `;
    } else {
      list.innerHTML = wishlistIds.map(id => {
        const p = StorageService.getProductById(id);
        if (!p) return '';
        return `
          <div class="cart-item-row">
            <img src="${p.image}" alt="${p.name}" class="cart-item-thumb">
            <div class="cart-item-info">
              <h5 class="cart-item-title">${p.name}</h5>
              <div class="cart-item-price">${formatPrice(p.price)}</div>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-sm btn-primary" onclick="window.novaMarketApp.addToCart(${p.id}); window.novaMarketApp.closeModal('wishlistModalOverlay');">
                <i class="fa-solid fa-bag-shopping"></i> Savatchaga
              </button>
              <button class="btn btn-sm btn-outline" onclick="window.novaMarketApp.toggleWishlist(${p.id}); window.novaMarketApp.openWishlistModal();" title="O'chirish">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    modal.classList.add('active');
  }

  // ================= CART SHORTCUTS =================
  addToCart(productId, qty = 1) {
    StorageService.addToCart(productId, qty);
    this.cartFeature.render();
    this.catalogFeature.render();
    const p = StorageService.getProductById(productId);
    this.showToast('Savatchaga qo\'shildi', p?.name || '', 'fa-bag-shopping');
  }

  updateCartQty(productId, delta) {
    StorageService.updateCartQuantity(productId, delta);
    this.cartFeature.render();
    this.catalogFeature.render();
  }

  // ================= PRODUCT DETAIL MODAL =================
  openProductModal(productId) {
    const p = StorageService.getProductById(productId);
    if (!p) return;

    const modal = document.getElementById('productDetailModalOverlay');
    const container = document.getElementById('productDetailModalBody');
    if (!modal || !container) return;

    const specsRows = p.specs ? Object.entries(p.specs).map(([key, val]) => `
      <tr>
        <td>${key}</td>
        <td>${val}</td>
      </tr>
    `).join('') : '<tr><td colspan="2">Qo\'shimcha parametrlar kiritilmagan</td></tr>';

    container.innerHTML = `
      <div class="product-detail-grid">
        <div class="detail-gallery">
          <img src="${p.image}" alt="${p.name}" class="detail-main-img" id="detailMainModalImg">
        </div>
        <div class="detail-info-box">
          <h2>${p.name}</h2>
          <div class="detail-seller-badge">
            Sotuvchi: <strong>${p.seller || 'NovaMarket Rasmiy Do\'koni'}</strong> •
            <span><i class="fa-solid fa-star text-secondary"></i> ${p.rating} (${p.reviewsCount} ta sharh)</span>
          </div>

          <div class="detail-price-box">
            <div class="detail-price-main">${formatPrice(p.price)}</div>
            ${p.oldPrice ? `<div style="text-decoration: line-through; color: var(--text-muted); font-size: 14px;">${formatPrice(p.oldPrice)}</div>` : ''}
            <div class="detail-installment-box">
              <i class="fa-solid fa-wallet"></i> ${formatInstallment(p.price)}
            </div>
          </div>

          <table class="detail-specs-table">
            <tbody>
              <tr><td>Kategoriya</td><td>${p.category}</td></tr>
              <tr><td>Brend</td><td>${p.brand || 'NovaMarket'}</td></tr>
              ${specsRows}
              <tr><td>Mavjudligi</td><td style="color: var(--success); font-weight: 700;">Omborda bor (${p.inStock || 15} dona)</td></tr>
            </tbody>
          </table>

          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 24px;">
            ${p.description || ''}
          </p>

          <div style="display: flex; gap: 12px;">
            <button class="btn btn-primary btn-lg" style="flex: 1;" onclick="window.novaMarketApp.addToCart(${p.id}); window.novaMarketApp.closeModal('productDetailModalOverlay');">
              <i class="fa-solid fa-bag-shopping"></i> Savatchaga qo'shish
            </button>
            <button class="btn btn-outline btn-lg" onclick="window.novaMarketApp.toggleWishlist(${p.id});" title="Sevimlilarga">
              <i class="fa-regular fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('active');
  }

  // ================= GENERAL MODALS =================
  initModals() {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
      });
    });

    const detailClose = document.getElementById('productDetailCloseBtn');
    if (detailClose) {
      detailClose.addEventListener('click', () => this.closeModal('productDetailModalOverlay'));
    }

    const wishlistClose = document.getElementById('wishlistModalCloseBtn');
    if (wishlistClose) {
      wishlistClose.addEventListener('click', () => this.closeModal('wishlistModalOverlay'));
    }

    const cityClose = document.getElementById('cityModalCloseBtn');
    if (cityClose) {
      cityClose.addEventListener('click', () => this.closeModal('cityModalOverlay'));
    }

    const wishlistHeaderBtn = document.getElementById('headerWishlistBtn');
    if (wishlistHeaderBtn) {
      wishlistHeaderBtn.addEventListener('click', () => this.openWishlistModal());
    }

    const successClose = document.getElementById('orderSuccessModalCloseBtn');
    if (successClose) {
      successClose.addEventListener('click', () => this.closeModal('orderSuccessModalOverlay'));
    }

    const ordersClose = document.getElementById('ordersModalCloseBtn');
    if (ordersClose) {
      ordersClose.addEventListener('click', () => this.closeModal('ordersModalOverlay'));
    }
  }

  // ================= ORDERS MODAL =================
  openOrdersModal() {
    const modal = document.getElementById('ordersModalOverlay');
    const list = document.getElementById('ordersModalList');
    if (!modal || !list) return;

    const orders = StorageService.getOrders();
    if (orders.length === 0) {
      list.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <i class="fa-solid fa-box-open" style="font-size: 48px; color: #CBD5E1; margin-bottom: 14px;"></i>
          <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 6px;">Sizda hali buyurtmalar mavjud emas</h4>
          <p style="color: var(--text-secondary); font-size: 14px;">Katalogdan o'zingizga yoqqan mahsulotlarni tanlang va xarid qiling!</p>
        </div>
      `;
    } else {
      list.innerHTML = orders.map(o => {
        // Delivery ETA & 1-day remaining cancellation rule
        const now = Date.now();
        const deliveryDays = o.deliveryDays || (o.delivery?.city?.toLowerCase().includes('toshkent') ? 2 : 3);
        const deliveryTime = new Date(o.estimatedDeliveryDate || (new Date(o.createdAt).getTime() + deliveryDays * 24 * 3600 * 1000)).getTime();
        const msRemaining = deliveryTime - now;
        const hoursRemaining = msRemaining / (1000 * 60 * 60);

        const isCancelled = o.status === 'Bekor qilindi' || o.status === 'Bekor qilingan';
        const isDelivered = o.status === 'Yetkazib berildi';
        const isTooLateToCancel = hoursRemaining <= 24;

        // Status badge styling
        let badgeBg = '#EBF8FF';
        let badgeColor = '#0284C7';
        if (isCancelled) {
          badgeBg = '#FEE2E2';
          badgeColor = '#DC2626';
        } else if (isDelivered) {
          badgeBg = '#DCFCE7';
          badgeColor = '#15803D';
        } else if (o.status === "Yig'ilmoqda") {
          badgeBg = '#FEF3C7';
          badgeColor = '#D97706';
        } else if (o.status === 'Yetkazilmoqda') {
          badgeBg = '#F3E8FF';
          badgeColor = '#7E22CE';
        }

        const formattedEtaDate = formatDeliveryDate(new Date(deliveryTime).toISOString());
        const createdDateStr = formatUzbekDateTime(o.createdAt);

        // Cancellation action or notice
        let cancelSectionHtml = '';
        if (isCancelled) {
          cancelSectionHtml = `
            <div class="order-cancelled-notice">
              <i class="fa-solid fa-ban"></i> Ushbu buyurtma bekor qilingan
            </div>
          `;
        } else if (isDelivered) {
          cancelSectionHtml = `
            <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 8px 12px; font-size: 12.5px; color: #166534; font-weight: 700; display: flex; align-items: center; gap: 6px; margin-top: 10px;">
              <i class="fa-solid fa-circle-check"></i> Mahsulot muvaffaqiyatli yetkazib berilgan
            </div>
          `;
        } else if (isTooLateToCancel) {
          cancelSectionHtml = `
            <div class="order-lock-notice">
              <i class="fa-solid fa-lock" style="color: #D97706; font-size: 14px;"></i>
              <div style="flex: 1;">
                <strong>Bekor qilish imkoni yo'q:</strong> Mahsulot olib kelinishiga 1 kundan kam vaqt qoldi. Tovar yo'lda yoki kuryerga topshirilgan.
              </div>
            </div>
          `;
        } else {
          // More than 1 day remains: user can cancel!
          cancelSectionHtml = `
            <div class="order-cancel-row">
              <span class="order-cancel-hint">
                <i class="fa-regular fa-clock" style="color: var(--primary);"></i> Yetkazilishiga 1 kundan ko'p vaqt bor (bekor qilish mumkin)
              </span>
              <button type="button" class="btn-outline-danger" onclick="window.novaMarketApp.cancelUserOrder('${o.orderId}')">
                <i class="fa-solid fa-xmark"></i> Buyurtmani bekor qilish
              </button>
            </div>
          `;
        }

        // Items preview
        const itemsHtml = (o.items || []).map(item => {
          const p = StorageService.getProductById(item.id);
          if (!p) return '';
          return `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 13px;">
              <img src="${p.image}" alt="${p.name}" style="width: 36px; height: 36px; border-radius: 6px; object-fit: cover; border: 1px solid #ECEFF2;">
              <div style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                <span style="font-weight: 600;">${p.name}</span>
                <span style="color: var(--text-muted); margin-left: 6px;">× ${item.quantity} dona</span>
              </div>
              <strong style="font-size: 12.5px;">${formatPrice(p.price * item.quantity)}</strong>
            </div>
          `;
        }).join('');

        return `
          <div class="order-card-box">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div>
                <strong style="color: var(--primary); font-size: 15px;">#${o.orderId}</strong>
                <span style="font-size: 12px; color: var(--text-muted); margin-left: 8px;">${createdDateStr}</span>
              </div>
              <span style="display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; background: ${badgeBg}; color: ${badgeColor};">
                ${o.status || 'Yangi'}
              </span>
            </div>

            <!-- Delivery Time & City -->
            <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin: 10px 0;">
              <div class="order-delivery-eta-badge">
                <i class="fa-solid fa-truck-fast"></i> Yetkazib berish: <strong>${formattedEtaDate}gacha (${deliveryDays} kun ichida)</strong>
              </div>
            </div>

            <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">
              <i class="fa-solid fa-location-dot text-primary"></i> Yetkazish manzili: <strong>${o.delivery?.city || ''}, ${o.delivery?.address || ''}</strong>
            </div>

            <!-- Items list -->
            <div style="background: #F8FAFC; border-radius: 8px; padding: 10px; margin-bottom: 12px;">
              ${itemsHtml || `<div style="font-size: 13px; color: var(--text-muted);">Mahsulotlar: ${o.items?.length || 0} xil</div>`}
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px;">
              <span style="font-size: 13px; color: var(--text-muted);">Jami to'lov:</span>
              <strong style="font-size: 16px; color: var(--dark);">${formatPrice(o.totals?.grandTotal || 0)}</strong>
            </div>

            ${cancelSectionHtml}
          </div>
        `;
      }).join('');
    }

    modal.classList.add('active');
  }

  cancelUserOrder(orderId) {
    if (!confirm(`#${orderId} raqamli buyurtmani haqiqatan ham bekor qilmoqchimisiz?`)) {
      return;
    }

    const res = StorageService.cancelOrder(orderId);
    if (res.success) {
      this.showToast('Buyurtma bekor qilindi', `#${orderId} muvaffaqiyatli bekor qilindi`, 'fa-ban');
      this.openOrdersModal();
    } else {
      alert(res.message);
    }
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
    const homeBtn = document.getElementById('mobileNavHome');
    if (homeBtn && !document.querySelector('.modal-overlay.active') && !document.querySelector('.cart-overlay.active') && !document.querySelector('.mega-menu.active')) {
      document.querySelectorAll('.mobile-nav-item').forEach(b => b.classList.remove('active'));
      homeBtn.classList.add('active');
    }
  }

  showToast(title, message, icon = 'fa-check') {
    const container = document.getElementById('toastNotificationContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-icon"><i class="fa-solid ${icon}"></i></div>
      <div class="toast-content">
        <strong>${title}</strong>
        ${message ? `<span>${message}</span>` : ''}
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }
}

// Instantiate and expose globally with immediate fallback
const initNovaMarket = () => {
  if (!window.novaMarketApp) {
    window.novaMarketApp = new NovaMarketApp();
    window.novaMarketApp.init();
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNovaMarket);
} else {
  initNovaMarket();
}
