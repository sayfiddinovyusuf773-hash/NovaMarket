/**
 * NovaMarket — Buyurtma Rasmiylashtirish Moduli (Checkout Feature)
 */
import { StorageService } from '../../services/storage.js';
import { formatPrice } from '../../utils/formatters.js';

export class CheckoutFeature {
  constructor(options = {}) {
    this.modalId = options.modalId || 'checkoutModalOverlay';
    this.cartFeature = options.cartFeature || null;
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    const closeBtn = document.getElementById('checkoutModalCloseBtn');
    const form = document.getElementById('checkoutOrderForm');
    const startCheckoutBtn = document.getElementById('startCheckoutBtn');

    if (startCheckoutBtn) {
      startCheckoutBtn.addEventListener('click', () => {
        if (this.cartFeature) this.cartFeature.close();
        this.open();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Payment radio styling
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
      radio.addEventListener('change', () => {
        document.querySelectorAll('.payment-card-label').forEach(label => label.classList.remove('active'));
        radio.closest('.payment-card-label')?.classList.add('active');
      });
    });
  }

  open() {
    const cart = StorageService.getCart();
    if (cart.length === 0) {
      window.novaMarketApp.showToast('Savatchangiz bo\'sh', 'Buyurtma berish uchun mahsulot tanlang', 'fa-bag-shopping');
      return;
    }

    const modal = document.getElementById(this.modalId);
    if (modal) modal.classList.add('active');

    // Update Totals in Checkout Modal
    const totals = this.cartFeature ? this.cartFeature.getTotals() : { grandTotal: 0 };
    const totalEl = document.getElementById('checkoutTotalAmountDisplay');
    if (totalEl) totalEl.textContent = formatPrice(totals.grandTotal);
  }

  close() {
    const modal = document.getElementById(this.modalId);
    if (modal) modal.classList.remove('active');
  }

  handleSubmit(e) {
    e.preventDefault();

    const fullName = document.getElementById('checkoutFullName')?.value.trim();
    const phone = document.getElementById('checkoutPhone')?.value.trim();
    const city = document.getElementById('checkoutCity')?.value.trim() || StorageService.getCity();
    const address = document.getElementById('checkoutAddress')?.value.trim();
    const deliveryType = document.querySelector('input[name="deliveryType"]:checked')?.value || 'courier';
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'payme';
    const comment = document.getElementById('checkoutComment')?.value.trim() || '';

    const cart = StorageService.getCart();
    const totals = this.cartFeature ? this.cartFeature.getTotals() : { grandTotal: 0 };

    const orderPayload = {
      customer: { fullName, phone },
      delivery: {
        type: deliveryType,
        city,
        address: deliveryType === 'courier' ? address : 'NovaMarket Tarqatish Punkti (PVZ)'
      },
      payment: {
        method: paymentMethod,
        isPaid: paymentMethod === 'payme' || paymentMethod === 'click' // simulated payment state
      },
      items: cart,
      totals,
      comment
    };

    const createdOrder = StorageService.createOrder(orderPayload);

    // Clear cart
    StorageService.clearCart();
    if (this.cartFeature) {
      this.cartFeature.appliedPromo = null;
      this.cartFeature.render();
    }

    this.close();
    this.showSuccessModal(createdOrder);
  }

  showSuccessModal(order) {
    const successModal = document.getElementById('orderSuccessModalOverlay');
    const orderIdEl = document.getElementById('successOrderNumber');
    const orderAddressEl = document.getElementById('successOrderAddress');
    const orderTotalEl = document.getElementById('successOrderTotal');

    if (orderIdEl) orderIdEl.textContent = order.orderId;
    if (orderAddressEl) orderAddressEl.textContent = `${order.delivery.city}, ${order.delivery.address}`;
    if (orderTotalEl) orderTotalEl.textContent = formatPrice(order.totals.grandTotal);

    if (successModal) successModal.classList.add('active');

    // Trigger re-render of catalog cards
    if (window.novaMarketApp && window.novaMarketApp.catalogFeature) {
      window.novaMarketApp.catalogFeature.render();
    }
  }
}
