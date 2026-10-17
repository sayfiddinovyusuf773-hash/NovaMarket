/**
 * NovaMarket — Katalog va Mahsulotlar Moduli
 */
import { StorageService } from '../../services/storage.js';
import { formatPrice, formatInstallment } from '../../utils/formatters.js';
import { getProductScore } from '../../utils/searchHelper.js';

export class CatalogFeature {
  constructor(options = {}) {
    this.containerId = options.containerId || 'catalogGrid';
    this.sidebarId = options.sidebarId || 'catalogSidebar';
    this.state = {
      activeCategory: 'all',
      searchQuery: '',
      priceMin: 0,
      priceMax: 40000000,
      selectedBrands: [],
      onlyDiscount: false,
      onlyInStock: false,
      sortBy: 'popular',
      page: 1,
      pageSize: 24
    };
    this.onStateChange = options.onStateChange || null;
    this.observer = null;
  }

  init() {
    this.bindEvents();
    this.setupScrollObserver();
    this.render();
  }

  setCategory(categoryId) {
    this.state.activeCategory = categoryId;
    this.state.page = 1;
    this.render();
  }

  setSearchQuery(query) {
    this.state.searchQuery = query ? query.trim() : '';
    if (this.state.searchQuery.length > 0) {
      // Global search spans across all categories
      this.state.activeCategory = 'all';
      document.querySelectorAll('.quick-cat-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === 'all');
      });
    }
    this.state.page = 1;
    this.render();
  }

  loadMore() {
    this.state.page++;
    this.render();
  }

  getFilteredProducts() {
    const allProducts = StorageService.getProducts();

    return allProducts.filter(p => {
      // Category Filter
      if (this.state.activeCategory !== 'all' && p.category !== this.state.activeCategory) {
        return false;
      }

      // Smart Search Query Filter with Synonyms, Transliteration & Concepts
      if (this.state.searchQuery && this.state.searchQuery.length >= 2) {
        const score = getProductScore(p, this.state.searchQuery);
        if (score <= 0) return false;
        p._searchScore = score;
      } else {
        delete p._searchScore;
      }

      // Price Filter
      if (p.price < this.state.priceMin || p.price > this.state.priceMax) {
        return false;
      }

      // Brand Filter
      if (this.state.selectedBrands.length > 0) {
        if (!this.state.selectedBrands.includes(p.brand)) return false;
      }

      // Only Discount
      if (this.state.onlyDiscount && (!p.discount || p.discount <= 0)) {
        return false;
      }

      // Only In Stock
      if (this.state.onlyInStock && (!p.inStock || p.inStock <= 0)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Prioritize higher search relevance when searching under default sorting
      if (this.state.searchQuery && (a._searchScore || b._searchScore) && this.state.sortBy === 'popular') {
        const scoreDiff = (b._searchScore || 0) - (a._searchScore || 0);
        if (scoreDiff !== 0) return scoreDiff;
      }

      if (this.state.sortBy === 'price-asc') return a.price - b.price;
      if (this.state.sortBy === 'price-desc') return b.price - a.price;
      if (this.state.sortBy === 'rating') return b.rating - a.rating;
      if (this.state.sortBy === 'discount') return (b.discount || 0) - (a.discount || 0);
      return b.id - a.id; // 'popular'
    });
  }

  render() {
    const grid = document.getElementById(this.containerId);
    if (!grid) return;

    const filtered = this.getFilteredProducts();
    const countEl = document.getElementById('catalogProductsCount');
    if (countEl) countEl.textContent = `${filtered.length} ta mahsulot`;

    const cart = StorageService.getCart();
    const wishlist = StorageService.getWishlist();

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #fff; border-radius: 12px; border: 1px solid var(--border);">
          <i class="fa-solid fa-magnifying-glass" style="font-size: 48px; color: var(--text-muted); margin-bottom: 16px;"></i>
          <h3 style="font-size: 18px; margin-bottom: 8px;">Kechirasiz, mahsulotlar topilmadi</h3>
          <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 20px;">Qidiruv so'zini o'zgartiring yoki filtrlarni tozalang.</p>
          <button class="btn btn-primary" onclick="window.novaMarketApp.resetFilters()">Filtrlarni tozalash</button>
        </div>
      `;
      this.renderPagination(0, 0);
      return;
    }

    const maxItems = this.state.page * this.state.pageSize;
    const displayedProducts = filtered.slice(0, maxItems);

    grid.innerHTML = displayedProducts.map((p, idx) => {
      const cartItem = cart.find(item => item.id === p.id);
      const inCartQty = cartItem ? cartItem.quantity : 0;
      const isWishlisted = wishlist.includes(p.id);
      const thumbUrl = p.image ? p.image.replace('w=700&q=80', 'w=360&q=75') : '';

      return `
        <div class="product-card" data-id="${p.id}">
          <!-- Badges -->
          <div class="card-badges">
            ${p.discount ? `<span class="badge-discount">-${p.discount}%</span>` : ''}
            ${p.isFastDelivery ? `<span class="badge-delivery"><i class="fa-solid fa-bolt"></i> 1 kunda</span>` : ''}
          </div>

          <!-- Wishlist -->
          <button class="card-wishlist-btn ${isWishlisted ? 'active' : ''}" onclick="window.novaMarketApp.toggleWishlist(${p.id}, event)" title="${isWishlisted ? 'Sevimlilardan o\'chirish' : 'Sevimlilarga qo\'shish'}">
            <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
          </button>

          <!-- Thumb -->
          <div class="card-thumb-wrap" onclick="window.novaMarketApp.openProductModal(${p.id})">
            <img src="${thumbUrl}" alt="${p.name}" loading="${idx < 6 ? 'eager' : 'lazy'}" decoding="async" ${idx < 4 ? 'fetchpriority="high"' : ''} onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=360&q=75';">
          </div>

          <!-- Title -->
          <h4 class="card-title" onclick="window.novaMarketApp.openProductModal(${p.id})" title="${p.name}">
            ${p.name}
          </h4>

          <!-- Rating -->
          <div class="card-rating-row">
            <i class="fa-solid fa-star rating-star-icon"></i>
            <span class="card-rating-val">${p.rating}</span>
            <span>(${p.reviewsCount} ta sharh)</span>
          </div>

          <!-- Installment Chip -->
          <div class="card-installment-chip">
            ${formatInstallment(p.price)}
          </div>

          <!-- Prices & Cart button -->
          <div class="card-footer-row">
            <div class="card-prices">
              ${p.oldPrice ? `<span class="card-old-price">${formatPrice(p.oldPrice)}</span>` : ''}
              <span class="card-current-price">${formatPrice(p.price)}</span>
            </div>

            <div class="card-cart-box">
              ${inCartQty > 0 ? `
                <div class="card-qty-controller">
                  <button onclick="window.novaMarketApp.updateCartQty(${p.id}, -1)" title="Kamaytirish">
                    <i class="fa-solid ${inCartQty === 1 ? 'fa-trash' : 'fa-minus'}"></i>
                  </button>
                  <span>${inCartQty}</span>
                  <button onclick="window.novaMarketApp.updateCartQty(${p.id}, 1)" title="Ko'paytirish">
                    <i class="fa-solid fa-plus"></i>
                  </button>
                </div>
              ` : `
                <button class="card-cart-action-btn" onclick="window.novaMarketApp.addToCart(${p.id})" title="Savatga qo'shish">
                  <i class="fa-solid fa-cart-shopping"></i>
                  <span>Savatga</span>
                </button>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.renderPagination(filtered.length, displayedProducts.length);
    if (this.onStateChange) this.onStateChange(filtered);
  }

  renderPagination(totalCount, displayedCount) {
    const container = document.getElementById('catalogPaginationContainer');
    if (!container) return;

    if (totalCount === 0 || totalCount <= this.state.pageSize) {
      container.innerHTML = '';
      return;
    }

    const remaining = totalCount - displayedCount;

    if (remaining > 0) {
      container.innerHTML = `
        <button id="catalogLoadMoreBtn" class="btn btn-outline btn-lg" style="min-width: 280px; font-weight: 700; margin: 0 auto; box-shadow: var(--shadow-sm); border-radius: 10px;">
          <i class="fa-solid fa-rotate"></i> Yana 24 ta mahsulotni ko'rsatish
          <span style="font-size: 13px; color: var(--text-muted); margin-left: 6px;">(Qolgan: ${remaining} ta)</span>
        </button>
      `;

      const btn = document.getElementById('catalogLoadMoreBtn');
      if (btn) {
        btn.addEventListener('click', () => this.loadMore());
      }
    } else {
      container.innerHTML = `
        <div style="font-size: 14px; color: var(--text-muted); font-weight: 600; padding: 14px 0;">
          <i class="fa-solid fa-circle-check" style="color: var(--success); margin-right: 6px;"></i>
          Barcha ${totalCount} ta mahsulot ko'rsatildi
        </div>
      `;
    }
  }

  setupScrollObserver() {
    const sentinel = document.getElementById('catalogScrollSentinel');
    if (!sentinel || !('IntersectionObserver' in window)) return;

    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        const filtered = this.getFilteredProducts();
        const maxItems = this.state.page * this.state.pageSize;
        if (filtered.length > maxItems) {
          this.loadMore();
        }
      }
    }, {
      rootMargin: '300px'
    });

    this.observer.observe(sentinel);
  }

  bindEvents() {
    // Sort Select
    const sortSelect = document.getElementById('catalogSortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.state.sortBy = e.target.value;
        this.state.page = 1;
        this.render();
      });
    }

    // Price Slider & Inputs
    const priceRange = document.getElementById('filterPriceRange');
    const priceMaxInput = document.getElementById('filterPriceMax');
    const priceMinInput = document.getElementById('filterPriceMin');

    if (priceRange && priceMaxInput) {
      priceRange.addEventListener('input', (e) => {
        priceMaxInput.value = e.target.value;
        this.state.priceMax = Number(e.target.value);
        this.state.page = 1;
        this.render();
      });

      priceMaxInput.addEventListener('input', (e) => {
        const val = Number(e.target.value) || 40000000;
        priceRange.value = val;
        this.state.priceMax = val;
        this.state.page = 1;
        this.render();
      });
    }

    if (priceMinInput) {
      priceMinInput.addEventListener('input', (e) => {
        this.state.priceMin = Number(e.target.value) || 0;
        this.state.page = 1;
        this.render();
      });
    }

    // Discount & InStock Toggles
    const discountCheck = document.getElementById('filterOnlyDiscount');
    if (discountCheck) {
      discountCheck.addEventListener('change', (e) => {
        this.state.onlyDiscount = e.target.checked;
        this.state.page = 1;
        this.render();
      });
    }

    const inStockCheck = document.getElementById('filterOnlyInStock');
    if (inStockCheck) {
      inStockCheck.addEventListener('change', (e) => {
        this.state.onlyInStock = e.target.checked;
        this.state.page = 1;
        this.render();
      });
    }
  }

  resetFilters() {
    this.state.activeCategory = 'all';
    this.state.searchQuery = '';
    this.state.priceMin = 0;
    this.state.priceMax = 40000000;
    this.state.selectedBrands = [];
    this.state.onlyDiscount = false;
    this.state.onlyInStock = false;
    this.state.sortBy = 'popular';
    this.state.page = 1;

    const searchInput = document.getElementById('universalSearchInput');
    if (searchInput) searchInput.value = '';

    const priceRange = document.getElementById('filterPriceRange');
    const priceMaxInput = document.getElementById('filterPriceMax');
    const priceMinInput = document.getElementById('filterPriceMin');
    if (priceRange) priceRange.value = 40000000;
    if (priceMaxInput) priceMaxInput.value = 40000000;
    if (priceMinInput) priceMinInput.value = 0;

    const discountCheck = document.getElementById('filterOnlyDiscount');
    if (discountCheck) discountCheck.checked = false;

    const inStockCheck = document.getElementById('filterOnlyInStock');
    if (inStockCheck) inStockCheck.checked = false;

    // Reset categories active class in quick-nav
    document.querySelectorAll('.quick-cat-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === 'all');
    });

    this.render();
  }
}
