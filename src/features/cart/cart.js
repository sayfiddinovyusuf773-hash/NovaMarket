/**
 * NovaMarket — Savatcha Moduli (Slide-out Drawer, Promo codes, Totals)
 */
import { StorageService } from '../../services/storage.js';
import { formatPrice } from '../../utils/formatters.js';

export const FREE_DELIVERY_LIMIT = 150000;
export const STANDARD_SHIPPING_FEE = 20000;

export class CartFeature {
  constructor(options = {}) {
    this.overlayId = options.overlayId || 'cartDrawerOverlay';
    this.appliedPromo = null;
    this.onUpdate = options.onUpdate || null;
  }

  init() {
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    const overlay = document.getElementById(this.overlayId);
    const closeBtn = document.getElementById('cartDrawerCloseBtn');
    const headerCartBtn = document.getElementById('headerCartBtn');
    const applyPromoBtn = document.getElementById('applyPromoCodeBtn');

    if (headerCartBtn) {
      headerCartBtn.addEventListener('click', () => this.open());
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.close();
      });
    }

    if (applyPromoBtn) {
      applyPromoBtn.addEventListener('click', () => this.applyPromo());
    }
  }

  open() {
    const overlay = document.getElementById(this.overlayId);
    if (overlay) overlay.classList.add('active');
    this.render();
  }

  close() {
    const overlay = document.getElementById(this.overlayId);
    if (overlay) overlay.classList.remove('active');
  }

  applyPromo() {
    const input = document.getElementById('promoCodeInput');
    if (!input) return;
    const code = input.value.trim().toUpperCase();

    const PROMOS = {
      'NOVAMARKET': { type: 'percent', value: 10, name: 'NOVAMARKET (10% chegirma)' },
      'NOVA50': { type: 'fixed', value: 50000, name: 'NOVA50 (50 000 so\'m chegirma)' },
      'YANGI2026': { type: 'percent', value: 15, name: 'YANGI2026 (15% chegirma)' }
    };

    if (PROMOS[code]) {
      this.appliedPromo = { code, ...PROMOS[code] };
      input.value = '';
      this.render();
      window.novaMarketApp.showToast('Promokod faollashtirildi!', PROMOS[code].name, 'fa-tag');
    } else {
      window.novaMarketApp.showToast('Noto\'g\'ri promokod', 'Amaldagi kodlar: NOVAMARKET, YANGI2026', 'fa-circle-exclamation');
    }
  }

  removePromo() {
    this.appliedPromo = null;
    this.render();
    window.novaMarketApp.showToast('Promokod bekor qilindi', '', 'fa-xmark');
  }

  getTotals() {
    const cart = StorageService.getCart();
    let subtotal = 0;
    let totalItems = 0;

    cart.forEach(item => {
      const p = StorageService.getProductById(item.id);
      if (p) {
        subtotal += p.price * item.quantity;
        totalItems += item.quantity;
      }
    });

    let discount = 0;
    if (this.appliedPromo && subtotal > 0) {
      if (this.appliedPromo.type === 'percent') {
        discount = Math.round(subtotal * (this.appliedPromo.value / 100));
      } else if (this.appliedPromo.type === 'fixed') {
        discount = Math.min(subtotal, this.appliedPromo.value);
      }
    }

    const shipping = (subtotal >= FREE_DELIVERY_LIMIT || subtotal === 0) ? 0 : STANDARD_SHIPPING_FEE;
    const grandTotal = Math.max(0, subtotal - discount + shipping);

    return {
      subtotal,
      totalItems,
      discount,
      shipping,
      grandTotal,
      freeDeliveryRemaining: Math.max(0, FREE_DELIVERY_LIMIT - subtotal)
    };
  }

  render() {
    const cart = StorageService.getCart();
    const totals = this.getTotals();

    // Update Header Badge and Total
    const badge = document.getElementById('headerCartBadge');
    const mobileBadge = document.getElementById('mobileCartBadge');
    const headerTotal = document.getElementById('headerCartTotal');
    if (badge) badge.textContent = totals.totalItems;
    if (mobileBadge) mobileBadge.textContent = totals.totalItems;
    if (headerTotal) headerTotal.textContent = formatPrice(totals.grandTotal);

    // Update Drawer Title Count
    const drawerCount = document.getElementById('cartDrawerItemsCount');
    if (drawerCount) drawerCount.textContent = `(${totals.totalItems} ta)`;

    const body = document.getElementById('cartDrawerBody');
    const footer = document.getElementById('cartDrawerFooter');

    if (!body) return;

    if (cart.length === 0) {
      body.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
          <i class="fa-solid fa-basket-shopping" style="font-size: 56px; color: #CBD5E1; margin-bottom: 16px;"></i>
          <h4 style="font-size: 18px; margin-bottom: 8px;">Savatchangiz hozircha bo'sh</h4>
          <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 24px;">Bosh sahifadan yoki katalogdan xarid qilishni boshlang!</p>
          <button class="btn btn-primary" onclick="window.novaMarketApp.cartFeature.close()">Xarid qilish</button>
        </div>
      `;
      if (footer) footer.style.display = 'none';
      return;
    }

    if (footer) footer.style.display = 'block';

    body.innerHTML = cart.map(item => {
      const p = StorageService.getProductById(item.id);
      if (!p) return '';
      const itemSum = p.price * item.quantity;

      return `
        <div class="cart-item-row">
          <img src="${p.image}" alt="${p.name}" class="cart-item-thumb">
          <div class="cart-item-info">
            <h5 class="cart-item-title">${p.name}</h5>
            <div class="cart-item-price">${formatPrice(itemSum)}</div>
          </div>
          <div class="cart-item-actions">
            <div class="card-qty-controller">
              <button onclick="window.novaMarketApp.updateCartQty(${p.id}, -1)">
                <i class="fa-solid ${item.quantity === 1 ? 'fa-trash' : 'fa-minus'}"></i>
              </button>
              <span>${item.quantity}</span>
              <button onclick="window.novaMarketApp.updateCartQty(${p.id}, 1)">
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Summary Lines
    const subtotalEl = document.getElementById('cartDrawerSubtotal');
    const discountLineEl = document.getElementById('cartDrawerDiscountLine');
    const discountValEl = document.getElementById('cartDrawerDiscountVal');
    const shippingEl = document.getElementById('cartDrawerShipping');
    const totalEl = document.getElementById('cartDrawerGrandTotal');

    if (subtotalEl) subtotalEl.textContent = formatPrice(totals.subtotal);

    if (discountLineEl && discountValEl) {
      if (totals.discount > 0) {
        discountLineEl.style.display = 'flex';
        discountValEl.textContent = `-${formatPrice(totals.discount)}`;
      } else {
        discountLineEl.style.display = 'none';
      }
    }

    if (shippingEl) {
      shippingEl.textContent = totals.shipping === 0 ? "Bepul" : formatPrice(totals.shipping);
    }

    if (totalEl) totalEl.textContent = formatPrice(totals.grandTotal);

    if (this.onUpdate) this.onUpdate(totals);
  }
}
