import { StorageService } from '../../services/storage.js';
import { formatPrice, formatDeliveryDate, calculateInstallment, INSTALLMENT_PLANS } from '../../utils/formatters.js';

export class CheckoutFeature {
  constructor(options = {}) {
    this.modalId = options.modalId || 'checkoutModalOverlay';
    this.cartFeature = options.cartFeature || null;
    this.selectedInstallmentMonths = 12;
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

    // Payment radio styling and installment box toggle
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
      radio.addEventListener('change', () => {
        document.querySelectorAll('.payment-card-label').forEach(label => label.classList.remove('active'));
        radio.closest('.payment-card-label')?.classList.add('active');

        const installmentBox = document.getElementById('checkoutInstallmentBox');
        if (installmentBox) {
          if (radio.value === 'nasiya') {
            installmentBox.style.display = 'block';
            this.updateInstallmentCalculation();
          } else {
            installmentBox.style.display = 'none';
          }
        }
      });
    });

    // Installment month pills
    const pillsContainer = document.getElementById('checkoutInstallmentPills');
    if (pillsContainer) {
      pillsContainer.querySelectorAll('.installment-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          pillsContainer.querySelectorAll('.installment-pill').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.selectedInstallmentMonths = parseInt(btn.dataset.months) || 12;
          this.updateInstallmentCalculation();
        });
      });
    }
  }

  updateInstallmentCalculation() {
    const totals = this.cartFeature ? this.cartFeature.getTotals() : { grandTotal: 0 };
    const grandTotal = totals.grandTotal || 0;
    const calc = calculateInstallment(grandTotal, this.selectedInstallmentMonths);

    const perMonthEl = document.getElementById('checkoutInstallmentPerMonth');
    const termSummaryEl = document.getElementById('checkoutInstallmentTermSummary');
    const totalEl = document.getElementById('checkoutInstallmentTotal');
    const firstDateEl = document.getElementById('checkoutInstallmentFirstDate');

    if (perMonthEl) perMonthEl.textContent = `${calc.formattedPerMonth} / oyiga`;
    if (termSummaryEl) termSummaryEl.textContent = `${calc.months} oylik muddat (${calc.note})`;
    if (totalEl) totalEl.textContent = `${calc.formattedTotal} (Jami to'lov)`;

    if (firstDateEl) {
      const firstDate = new Date();
      firstDate.setDate(firstDate.getDate() + 30);
      firstDateEl.textContent = `${formatDeliveryDate(firstDate.toISOString())} (30 kundan keyin)`;
    }
  }

  selectInstallmentPlan(months = 12) {
    this.selectedInstallmentMonths = months;
    const radioNasiya = document.querySelector('input[name="paymentMethod"][value="nasiya"]');
    if (radioNasiya) {
      radioNasiya.checked = true;
      document.querySelectorAll('.payment-card-label').forEach(l => l.classList.remove('active'));
      radioNasiya.closest('.payment-card-label')?.classList.add('active');
    }

    const installmentBox = document.getElementById('checkoutInstallmentBox');
    if (installmentBox) installmentBox.style.display = 'block';

    const pillsContainer = document.getElementById('checkoutInstallmentPills');
    if (pillsContainer) {
      pillsContainer.querySelectorAll('.installment-pill').forEach(b => {
        b.classList.toggle('active', parseInt(b.dataset.months) === months);
      });
    }

    this.updateInstallmentCalculation();
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

    this.updateInstallmentCalculation();
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

    // Security & Validation: Check phone number
    const cleanPhoneDigits = (phone || '').replace(/\D/g, '');
    if (!fullName || fullName.length < 2) {
      alert("Iltimos, ism va familiyangizni to'liq kiriting!");
      return;
    }

    if (!cleanPhoneDigits || cleanPhoneDigits.length < 9) {
      alert("Iltimos, to'g'ri telefon raqamingizni kiriting (+998 XX XXX XX XX)!");
      return;
    }

    if (deliveryType === 'courier' && (!address || address.length < 5)) {
      alert("Iltimos, aniq yetkazib berish manzilini (ko'cha, uy, xonadon) kiriting!");
      return;
    }

    const cart = StorageService.getCart();
    if (!cart || cart.length === 0) {
      alert("Savatchangiz bo'sh!");
      return;
    }

    // Security & Validation: Verify inventory stock before placing order
    const products = StorageService.getProducts();
    for (const item of cart) {
      const prod = products.find(p => p.id === item.id);
      if (prod && (prod.inStock === undefined || prod.inStock < item.quantity)) {
        alert(`Kechirasiz, «${prod.name}» tovaridan omborda faqat ${prod.inStock || 0} dona mavjud. Iltimos, sonini kamaytiring.`);
        return;
      }
    }

    const totals = this.cartFeature ? this.cartFeature.getTotals() : { grandTotal: 0 };

    let paymentPayload = {
      method: paymentMethod,
      isPaid: paymentMethod === 'payme' || paymentMethod === 'click'
    };

    if (paymentMethod === 'nasiya') {
      const calc = calculateInstallment(totals.grandTotal, this.selectedInstallmentMonths);
      paymentPayload = {
        method: 'nasiya',
        name: 'Muddatli to\'lov (Nasiya)',
        installmentMonths: this.selectedInstallmentMonths,
        monthlyPayment: calc.perMonth,
        totalInstallmentAmount: calc.totalAmount,
        initialPayment: 0,
        markupPercent: calc.markupPercent,
        passport: document.getElementById('checkoutNasiyaPassport')?.value.trim() || '',
        phone: document.getElementById('checkoutNasiyaPhone')?.value.trim() || phone,
        isPaid: false,
        status: 'Nasiya shartnomasi rasmiylashtirildi'
      };
    }

    const orderPayload = {
      customer: { fullName, phone },
      delivery: {
        type: deliveryType,
        city,
        address: deliveryType === 'courier' ? address : 'NovaMarket Tarqatish Punkti (PVZ)'
      },
      payment: paymentPayload,
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

    const orderDeliveryEtaEl = document.getElementById('successOrderDeliveryEta');

    if (orderIdEl) orderIdEl.textContent = order.orderId;
    if (orderAddressEl) orderAddressEl.textContent = `${order.delivery.city}, ${order.delivery.address}`;
    if (orderTotalEl) {
      if (order.payment?.method === 'nasiya') {
        orderTotalEl.textContent = `${formatPrice(order.payment.totalInstallmentAmount || order.totals.grandTotal)} (Nasiya: ${order.payment.installmentMonths} oy x ${formatPrice(order.payment.monthlyPayment)}/oy)`;
      } else {
        orderTotalEl.textContent = formatPrice(order.totals.grandTotal);
      }
    }
    if (orderDeliveryEtaEl) {
      const etaDate = order.estimatedDeliveryDate ? formatDeliveryDate(order.estimatedDeliveryDate) : '';
      orderDeliveryEtaEl.textContent = `${order.deliveryDays || 2} kun ichida (${etaDate}gacha)`;
    }

    if (successModal) successModal.classList.add('active');

    // Trigger re-render of catalog cards
    if (window.novaMarketApp && window.novaMarketApp.catalogFeature) {
      window.novaMarketApp.catalogFeature.render();
    }
  }
}
