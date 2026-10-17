/**
 * NovaMarket — Kengaytirilgan Admin Dashboard & Xavfsizlik Moduli
 * (Uzum Market darajasidagi xavfsizlik, zakaslarni to'g'irlash, ombor nazorati va audit jurnali)
 */
import { StorageService } from '../../services/storage.js';
import { CATEGORIES } from '../../data/categories.js';
import { formatPrice, formatUzbekDateTime, formatDeliveryDate } from '../../utils/formatters.js';

export class AdminDashboard {
  constructor() {
    this.editingProductId = null;
    this.currentTab = 'orders';
    this.selectedOrderStatusFilter = 'all';
    this.orderSearchQuery = '';
    this.productSearchQuery = '';
    this.productCatFilter = 'all';

    // Brute-force protection state
    this.failedAttempts = Number(sessionStorage.getItem('novamarket_failed_login_attempts') || 0);
    this.lockoutUntil = Number(sessionStorage.getItem('novamarket_lockout_until') || 0);
    this.lockoutTimer = null;
  }

  init() {
    this.initAuthLock();
    if (this.checkAuth()) {
      this.showDashboard();
    } else {
      this.showAuthScreen();
    }
  }

  checkAuth() {
    return sessionStorage.getItem('novamarket_admin_auth') === 'true';
  }

  // ================= 1. XAVFSIZLIK VA KIRISH NAZORATI =================
  initAuthLock() {
    const toggleBtn = document.getElementById('togglePasswordVisibilityBtn');
    const pinInput = document.getElementById('adminAuthPin');
    const toggleIcon = document.getElementById('togglePasswordIcon');

    if (toggleBtn && pinInput && toggleIcon) {
      toggleBtn.addEventListener('click', () => {
        if (pinInput.type === 'password') {
          pinInput.type = 'text';
          toggleIcon.className = 'fa-regular fa-eye-slash';
        } else {
          pinInput.type = 'password';
          toggleIcon.className = 'fa-regular fa-eye';
        }
      });
    }

    // Check if currently locked out
    this.checkLockoutState();
  }

  checkLockoutState() {
    const now = Date.now();
    const lockoutMsg = document.getElementById('adminAuthLockoutMsg');
    const submitBtn = document.getElementById('adminLoginSubmitBtn');
    const pinInput = document.getElementById('adminAuthPin');

    if (this.lockoutUntil > now) {
      const remainingSeconds = Math.ceil((this.lockoutUntil - now) / 1000);
      if (lockoutMsg) {
        lockoutMsg.style.display = 'block';
        const countSpan = document.getElementById('lockoutCountdown');
        if (countSpan) countSpan.textContent = remainingSeconds;
      }
      if (submitBtn) submitBtn.disabled = true;
      if (pinInput) pinInput.disabled = true;

      clearInterval(this.lockoutTimer);
      this.lockoutTimer = setInterval(() => {
        const left = Math.ceil((this.lockoutUntil - Date.now()) / 1000);
        if (left <= 0) {
          clearInterval(this.lockoutTimer);
          this.failedAttempts = 0;
          this.lockoutUntil = 0;
          sessionStorage.removeItem('novamarket_lockout_until');
          sessionStorage.removeItem('novamarket_failed_login_attempts');
          if (lockoutMsg) lockoutMsg.style.display = 'none';
          if (submitBtn) submitBtn.disabled = false;
          if (pinInput) {
            pinInput.disabled = false;
            pinInput.focus();
          }
        } else {
          const countSpan = document.getElementById('lockoutCountdown');
          if (countSpan) countSpan.textContent = left;
        }
      }, 1000);
      return true;
    }
    return false;
  }

  showAuthScreen() {
    const overlay = document.getElementById('adminAuthOverlay');
    const mainContent = document.getElementById('adminMainContent');
    const authForm = document.getElementById('adminAuthForm');
    const authPinInput = document.getElementById('adminAuthPin');
    const authError = document.getElementById('adminAuthError');

    if (overlay) overlay.style.display = 'flex';
    if (mainContent) mainContent.style.display = 'none';

    if (authPinInput && !authPinInput.disabled) {
      setTimeout(() => authPinInput.focus(), 150);
    }

    if (authForm && !authForm.dataset.bound) {
      authForm.dataset.bound = 'true';
      authForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (this.checkLockoutState()) return;

        const enteredPin = authPinInput?.value.trim();
        const currentSecurePin = StorageService.getAdminPin();

        // Allowed: secure pin from storage or fallback initial 'nova2026'
        if (enteredPin === currentSecurePin || enteredPin === 'nova2026') {
          sessionStorage.setItem('novamarket_admin_auth', 'true');
          sessionStorage.removeItem('novamarket_failed_login_attempts');
          sessionStorage.removeItem('novamarket_lockout_until');
          this.failedAttempts = 0;
          if (authError) authError.style.display = 'none';
          StorageService.addAuditLog('Admin kirdi', "Administrator tizimga muvaffaqiyatli kirdi");
          this.showDashboard();
        } else {
          this.failedAttempts++;
          sessionStorage.setItem('novamarket_failed_login_attempts', this.failedAttempts);

          if (this.failedAttempts >= 5) {
            this.lockoutUntil = Date.now() + 60000;
            sessionStorage.setItem('novamarket_lockout_until', this.lockoutUntil);
            StorageService.addAuditLog('Xavfsizlik ogohlantirishi', '5 marta noto\'g\'ri parol kiritildi. Tizim 60s ga bloklandi!');
            this.checkLockoutState();
          } else {
            if (authError) {
              authError.textContent = `Parol noto'g'ri! (${5 - this.failedAttempts} ta urinish qoldi)`;
              authError.style.display = 'block';
            }
            if (authPinInput) {
              authPinInput.value = '';
              authPinInput.focus();
            }
          }
        }
      });
    }
  }

  showDashboard() {
    const overlay = document.getElementById('adminAuthOverlay');
    const mainContent = document.getElementById('adminMainContent');

    if (overlay) overlay.style.display = 'none';
    if (mainContent) mainContent.style.display = 'block';

    this.populateCategorySelects();
    this.renderStats();
    this.renderOrdersTable();
    this.renderProductsTable();
    this.renderAuditLogsTable();
    this.bindEvents();
  }

  // ================= 2. TAB BOSHQARUVI =================
  switchTab(tabName) {
    this.currentTab = tabName;

    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    const tabOrders = document.getElementById('adminTabOrders');
    const tabProducts = document.getElementById('adminTabProducts');
    const tabSecurity = document.getElementById('adminTabSecurity');

    if (tabOrders) tabOrders.style.display = tabName === 'orders' ? 'block' : 'none';
    if (tabProducts) tabProducts.style.display = tabName === 'products' ? 'block' : 'none';
    if (tabSecurity) tabSecurity.style.display = tabName === 'security' ? 'block' : 'none';

    if (tabName === 'orders') this.renderOrdersTable();
    if (tabName === 'products') this.renderProductsTable();
    if (tabName === 'security') this.renderAuditLogsTable();
  }

  populateCategorySelects() {
    const formSelect = document.getElementById('adminProdCategory');
    const filterSelect = document.getElementById('adminProductCatFilter');

    if (formSelect) {
      formSelect.innerHTML = CATEGORIES.map(c => `
        <option value="${c.id}">${c.name}</option>
      `).join('');
    }

    if (filterSelect) {
      filterSelect.innerHTML = `<option value="all">Barcha kategoriyalar</option>` + CATEGORIES.map(c => `
        <option value="${c.id}">${c.name}</option>
      `).join('');
    }
  }

  renderStats() {
    const products = StorageService.getProducts();
    const orders = StorageService.getOrders();

    const activeOrders = orders.filter(o => o.status !== 'Yetkazib berildi' && o.status !== 'Bekor qilindi' && o.status !== 'Bekor qilingan');
    const nasiyaOrders = orders.filter(o => o.payment?.method === 'nasiya');
    const totalRevenue = orders
      .filter(o => o.status !== 'Bekor qilindi' && o.status !== 'Bekor qilingan')
      .reduce((acc, o) => acc + (o.payment?.totalInstallmentAmount || o.totals?.grandTotal || 0), 0);

    const totalProdEl = document.getElementById('adminStatTotalProducts');
    const activeOrdersEl = document.getElementById('adminStatActiveOrders');
    const totalRevEl = document.getElementById('adminStatTotalRevenue');
    const nasiyaOrdersEl = document.getElementById('adminStatNasiyaOrders');

    if (totalProdEl) totalProdEl.textContent = `${products.length} ta`;
    if (activeOrdersEl) activeOrdersEl.textContent = `${activeOrders.length} ta`;
    if (totalRevEl) totalRevEl.textContent = formatPrice(totalRevenue);
    if (nasiyaOrdersEl) nasiyaOrdersEl.textContent = `${nasiyaOrders.length} ta`;
  }

  // ================= 3. BUYURTMALAR & MUAMMOLARNI HAL QILISH =================
  renderOrdersTable() {
    const tbody = document.getElementById('adminOrdersTableBody');
    if (!tbody) return;

    let orders = StorageService.getOrders();

    // 1. Status Filter
    if (this.selectedOrderStatusFilter !== 'all') {
      orders = orders.filter(o => o.status === this.selectedOrderStatusFilter);
    }

    // 2. Search Query (ID, Customer Name, Phone)
    if (this.orderSearchQuery) {
      const q = this.orderSearchQuery.toLowerCase();
      orders = orders.filter(o => 
        (o.orderId && o.orderId.toLowerCase().includes(q)) ||
        (o.customer?.fullName && o.customer.fullName.toLowerCase().includes(q)) ||
        (o.customer?.phone && o.customer.phone.replace(/\D/g, '').includes(q.replace(/\D/g, '')))
      );
    }

    if (orders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
            <i class="fa-solid fa-folder-open" style="font-size: 32px; margin-bottom: 8px; display: block; opacity: 0.5;"></i>
            Hozircha mos keladigan buyurtmalar topilmadi
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = orders.map(o => {
      const isCancelled = o.status === 'Bekor qilindi' || o.status === 'Bekor qilingan';
      const isDelivered = o.status === 'Yetkazib berildi';

      const itemsCount = Array.isArray(o.items) ? o.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
      const firstItem = Array.isArray(o.items) && o.items.length > 0 ? StorageService.getProductById(o.items[0].id) : null;

      let statusBadgeStyle = "background: #FEF3C7; color: #92400E;";
      if (o.status === 'Yetkazilmoqda') statusBadgeStyle = "background: #E0F2FE; color: #0369A1;";
      if (isDelivered) statusBadgeStyle = "background: #DCFCE7; color: #166534;";
      if (isCancelled) statusBadgeStyle = "background: #FEE2E2; color: #991B1B;";

      const totalDisplay = formatPrice(o.payment?.totalInstallmentAmount || o.totals?.grandTotal || 0);

      return `
        <tr style="${isCancelled ? 'opacity: 0.75; background: #fafafa;' : ''}">
          <td>
            <strong style="color: var(--primary); font-size: 13px;">${o.orderId}</strong>
            <small style="display: block; color: var(--text-muted); font-size: 11px;">
              ${new Date(o.createdAt).toLocaleDateString('uz-UZ')} ${new Date(o.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
            </small>
            ${o.adminNotes && o.adminNotes.length > 0 ? `
              <span style="font-size: 10px; background: #EDE9FE; color: #7000FF; padding: 2px 6px; border-radius: 4px; font-weight: 700; margin-top: 4px; display: inline-block;">
                <i class="fa-solid fa-comment-dots"></i> Admin izohi bor
              </span>
            ` : ''}
          </td>

          <td>
            <div style="font-weight: 700; font-size: 13px;">${o.customer?.fullName || 'Xaridor'}</div>
            <a href="tel:${o.customer?.phone || ''}" style="color: var(--primary); font-size: 12px; font-weight: 600; text-decoration: none;">
              <i class="fa-solid fa-phone" style="font-size: 10px;"></i> ${o.customer?.phone || '—'}
            </a>
          </td>

          <td>
            <div style="font-size: 12px; max-width: 220px; line-height: 1.3;">
              <strong>${o.delivery?.city || 'Toshkent'}:</strong> ${o.delivery?.address || '—'}
            </div>
            <small style="color: #166534; font-weight: 700; display: inline-block; margin-top: 3px;">
              <i class="fa-solid fa-truck"></i> ${o.deliveryDays || 2} kunda (${o.estimatedDeliveryDate ? formatDeliveryDate(o.estimatedDeliveryDate) : ''})
            </small>
          </td>

          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              ${firstItem && firstItem.image ? `<img src="${firstItem.image}" alt="" style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px; flex-shrink: 0;">` : ''}
              <div>
                <strong style="font-size: 12px;">${itemsCount} ta tovar</strong>
                <div style="font-size: 11px; color: var(--text-muted); max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${firstItem?.name || ''}
                </div>
              </div>
            </div>
          </td>

          <td>
            <div style="font-weight: 800; font-size: 13px;">${totalDisplay}</div>
            ${o.payment?.method === 'nasiya' ? `
              <span style="font-size: 11px; color: #B45309; font-weight: 700;">
                <i class="fa-solid fa-handshake"></i> Nasiya: ${formatPrice(o.payment.monthlyPayment || 0)}/oy (${o.payment.installmentMonths || 12} oy)
              </span>
            ` : `
              <small style="color: var(--text-muted); text-transform: uppercase; font-weight: 600;">
                <i class="fa-solid fa-credit-card"></i> ${o.payment?.method || 'Karta'}
              </small>
            `}
          </td>

          <td>
            <select class="order-status-select" onchange="window.adminDashboard.changeOrderStatus('${o.orderId}', this.value)" style="padding: 5px 8px; border-radius: 6px; font-weight: 700; font-size: 12px; border: 1px solid var(--border); ${statusBadgeStyle}">
              <option value="Yangi" ${o.status === 'Yangi' ? 'selected' : ''}>🟡 Yangi</option>
              <option value="Yig'ilmoqda" ${o.status === "Yig'ilmoqda" ? 'selected' : ''}>🔵 Yig'ilmoqda</option>
              <option value="Yetkazilmoqda" ${o.status === 'Yetkazilmoqda' ? 'selected' : ''}>🚚 Yetkazilmoqda</option>
              <option value="Yetkazib berildi" ${o.status === 'Yetkazib berildi' ? 'selected' : ''}>🟢 Yetkazib berildi</option>
              <option value="Bekor qilindi" ${isCancelled ? 'selected' : ''}>🔴 Bekor qilindi</option>
            </select>
          </td>

          <td>
            <div style="display: flex; gap: 6px; flex-wrap: nowrap;">
              <button class="btn btn-sm btn-outline" onclick="window.adminDashboard.openOrderDetails('${o.orderId}')" title="Buyurtma tafsilotlari">
                <i class="fa-solid fa-eye"></i>
              </button>
              <button class="btn btn-sm btn-outline" style="color: var(--primary); border-color: var(--primary);" onclick="window.adminDashboard.openEditOrderModal('${o.orderId}')" title="Muammoni to'g'irlash (Telefon, manzil, status)">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              ${!isCancelled ? `
                <button class="btn btn-sm btn-outline" style="color: var(--danger); border-color: var(--danger);" onclick="window.adminDashboard.cancelOrderPrompt('${o.orderId}')" title="Bekor qilish va tovarlarni omborga qaytarish">
                  <i class="fa-solid fa-ban"></i>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  openOrderDetails(orderId) {
    const orders = StorageService.getOrders();
    const order = orders.find(o => o.orderId === orderId);
    if (!order) return;

    const modal = document.getElementById('adminOrderDetailsModalOverlay');
    const title = document.getElementById('adminOrderDetailsModalTitle');
    const body = document.getElementById('adminOrderDetailsModalBody');
    const editTriggerBtn = document.getElementById('adminOrderDetailsEditTriggerBtn');

    if (title) title.innerHTML = `Buyurtma: <strong>${order.orderId}</strong>`;

    if (editTriggerBtn) {
      editTriggerBtn.onclick = () => {
        this.closeModal('adminOrderDetailsModalOverlay');
        this.openEditOrderModal(orderId);
      };
    }

    const itemsHtml = Array.isArray(order.items) ? order.items.map(item => {
      const prod = StorageService.getProductById(item.id);
      return `
        <div style="display: flex; gap: 12px; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border);">
          <img src="${prod?.image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=120&q=75'}" alt="" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;">
          <div style="flex: 1;">
            <div style="font-weight: 700; font-size: 13px;">${prod?.name || 'Mahsulot #' + item.id}</div>
            <div style="font-size: 12px; color: var(--text-muted);">${formatPrice(prod?.price || 0)} x ${item.quantity || 1} dona</div>
          </div>
          <div style="font-weight: 800; font-size: 13px;">
            ${formatPrice((prod?.price || 0) * (item.quantity || 1))}
          </div>
        </div>
      `;
    }).join('') : '<p>Tovarlar mavjud emas</p>';

    const notesHtml = Array.isArray(order.adminNotes) && order.adminNotes.length > 0 ? `
      <div style="margin-top: 16px; background: #F8FAFC; border: 1px solid var(--border); border-radius: 8px; padding: 12px;">
        <h5 style="margin: 0 0 8px; font-size: 13px; color: var(--text-primary);"><i class="fa-solid fa-notes-medical" style="color: var(--primary);"></i> Admin Muammo / Yechim Qaydlari:</h5>
        ${order.adminNotes.map(n => `
          <div style="font-size: 12px; margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px dashed var(--border);">
            <div style="color: var(--text-muted); font-size: 11px;">${new Date(n.date).toLocaleString('uz-UZ')}</div>
            <strong>${n.text}</strong>
          </div>
        `).join('')}
      </div>
    ` : '';

    if (body) {
      body.innerHTML = `
        <div style="background: var(--bg-subtle); padding: 16px; border-radius: 10px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Xaridor:</span> <strong>${order.customer?.fullName || '—'}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Telefon:</span> <strong>${order.customer?.phone || '—'}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Manzil:</span> <strong>${order.delivery?.city}, ${order.delivery?.address}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Yetkazish vaqti:</span> <strong>${order.deliveryDays || 2} kun ichida (${order.estimatedDeliveryDate ? formatDeliveryDate(order.estimatedDeliveryDate) : ''})</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Holati:</span> <strong>${order.status}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>To'lov usuli:</span> <strong>${order.payment?.method === 'nasiya' ? `0-0-12 Nasiya (${order.payment.installmentMonths} oy x ${formatPrice(order.payment.monthlyPayment)}/oy)` : (order.payment?.method || 'Payme')}</strong>
          </div>
        </div>

        <h4 style="font-size: 14px; margin-bottom: 10px;">Buyurtma qilingan tovarlar:</h4>
        ${itemsHtml}

        <div style="display: flex; justify-content: space-between; padding: 14px 0 0; font-size: 16px; font-weight: 800;">
          <span>Jami to'lov:</span>
          <span style="color: var(--primary);">${formatPrice(order.payment?.totalInstallmentAmount || order.totals?.grandTotal || 0)}</span>
        </div>

        ${notesHtml}
      `;
    }

    if (modal) modal.classList.add('active');
  }

  openEditOrderModal(orderId) {
    const orders = StorageService.getOrders();
    const order = orders.find(o => o.orderId === orderId);
    if (!order) return;

    const modal = document.getElementById('adminOrderEditModalOverlay');
    const title = document.getElementById('adminOrderEditModalTitle');
    if (title) title.textContent = `Buyurtma #${order.orderId} ma'lumotlarini to'g'irlash`;

    document.getElementById('editOrderIdHidden').value = order.orderId;
    document.getElementById('editOrderFullName').value = order.customer?.fullName || '';
    document.getElementById('editOrderPhone').value = order.customer?.phone || '';
    document.getElementById('editOrderCity').value = order.delivery?.city || '';
    document.getElementById('editOrderAddress').value = order.delivery?.address || '';
    document.getElementById('editOrderDeliveryDays').value = order.deliveryDays || 2;
    document.getElementById('editOrderStatusSelect').value = order.status || 'Yangi';
    document.getElementById('editOrderAdminNote').value = '';

    if (modal) modal.classList.add('active');
  }

  handleSaveOrderEdit(e) {
    e.preventDefault();

    const orderId = document.getElementById('editOrderIdHidden')?.value;
    const fullName = document.getElementById('editOrderFullName')?.value.trim();
    const phone = document.getElementById('editOrderPhone')?.value.trim();
    const city = document.getElementById('editOrderCity')?.value.trim();
    const address = document.getElementById('editOrderAddress')?.value.trim();
    const deliveryDays = document.getElementById('editOrderDeliveryDays')?.value;
    const status = document.getElementById('editOrderStatusSelect')?.value;
    const adminNote = document.getElementById('editOrderAdminNote')?.value.trim();

    if (!orderId) return;

    StorageService.updateOrderDetails(orderId, {
      customer: { fullName, phone },
      delivery: { city, address, deliveryDays },
      status,
      adminNote: adminNote ? `[Admin to'g'irlashi]: ${adminNote}` : null
    });

    this.closeModal('adminOrderEditModalOverlay');
    this.renderOrdersTable();
    this.renderStats();
    this.renderAuditLogsTable();
    alert(`Buyurtma #${orderId} muvaffaqiyatli to'g'irlandi va saqlandi!`);
  }

  cancelOrderPrompt(orderId) {
    const reason = prompt("Buyurtmani bekor qilish sababini kiriting (masalan: Mijoz telefoniga javob bermadi, xato buyurtma berilgan):", "Mijoz iltimosiga ko'ra bekor qilindi");
    if (reason === null) return;

    const res = StorageService.cancelOrder(orderId, true, reason.trim() || "Admin tomonidan bekor qilindi");
    if (res.success) {
      alert(`Buyurtma #${orderId} bekor qilindi va tovarlar omborga qaytarildi.`);
      this.renderOrdersTable();
      this.renderProductsTable();
      this.renderStats();
      this.renderAuditLogsTable();
    } else {
      alert(res.message);
    }
  }

  changeOrderStatus(orderId, newStatus) {
    StorageService.updateOrderStatus(orderId, newStatus);
    this.renderOrdersTable();
    this.renderStats();
    this.renderAuditLogsTable();
  }

  // ================= 4. MAHSULOTLAR BOSHQARUVI & OMBOR =================
  renderProductsTable() {
    const tbody = document.getElementById('adminProductsTableBody');
    const countLabel = document.getElementById('adminProductsCountLabel');
    if (!tbody) return;

    let products = StorageService.getProducts();

    // Category Filter
    if (this.productCatFilter !== 'all') {
      products = products.filter(p => p.category === this.productCatFilter);
    }

    // Search Query (Name, Brand, ID)
    if (this.productSearchQuery) {
      const q = this.productSearchQuery.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        String(p.id).includes(q)
      );
    }

    if (countLabel) {
      countLabel.textContent = `Jami ${products.length} ta mahsulot topildi (Ombor nazorati faol)`;
    }

    if (products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">Qidiruv bo'yicha mahsulot topilmadi</td></tr>`;
      return;
    }

    // Limit to top 50 in table for rapid DOM rendering
    const displayList = products.slice(0, 50);

    tbody.innerHTML = displayList.map(p => {
      const stock = Number(p.inStock) || 0;
      let stockBadge = `<span style="background: #DCFCE7; color: #166534; padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;">Omborda: ${stock} ta</span>`;
      if (stock === 0) {
        stockBadge = `<span style="background: #FEE2E2; color: #991B1B; padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;"><i class="fa-solid fa-triangle-exclamation"></i> Tugagan</span>`;
      } else if (stock <= 5) {
        stockBadge = `<span style="background: #FEF3C7; color: #92400E; padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;">Kam qoldi: ${stock} ta</span>`;
      }

      return `
        <tr>
          <td>
            <img src="${p.image}" alt="${p.name}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border);">
          </td>
          <td>
            <strong style="font-size: 13px; display: block;">${p.name}</strong>
            <small style="color: var(--text-muted);">ID: ${p.id} • ${p.brand || 'Brendsiz'}</small>
          </td>
          <td>
            <span style="font-size: 12px; color: var(--text-secondary);">${p.category}</span>
          </td>
          <td><strong>${formatPrice(p.price)}</strong></td>
          <td>${p.oldPrice ? `<span style="text-decoration: line-through; color: var(--text-muted);">${formatPrice(p.oldPrice)}</span>` : '—'}</td>
          <td>${stockBadge}</td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-sm btn-outline" style="color: var(--primary); border-color: var(--primary);" onclick="window.adminDashboard.editProduct(${p.id})" title="Tahrirlash">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn btn-sm btn-outline" style="color: var(--danger); border-color: var(--danger);" onclick="window.adminDashboard.deleteProduct(${p.id})" title="O'chirish">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('') + (products.length > 50 ? `
      <tr>
        <td colspan="7" style="text-align: center; padding: 12px; background: var(--bg-subtle); color: var(--text-muted); font-size: 12px;">
          Qolgan ${products.length - 50} ta tovar ro'yxatda mavjud. Muayyan tovarlarni topish uchun qidiruv maydonidan foydalaning.
        </td>
      </tr>
    ` : '');
  }

  handleSaveProduct(e) {
    e.preventDefault();

    const name = document.getElementById('adminProdName')?.value.trim();
    const category = document.getElementById('adminProdCategory')?.value;
    const brand = document.getElementById('adminProdBrand')?.value.trim();
    const price = Number(document.getElementById('adminProdPrice')?.value) || 0;
    const oldPrice = Number(document.getElementById('adminProdOldPrice')?.value) || null;
    const inStock = Number(document.getElementById('adminProdStock')?.value) || 0;
    const image = document.getElementById('adminProdImage')?.value.trim() || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80';
    const description = document.getElementById('adminProdDesc')?.value.trim() || '';

    if (!name || name.length < 2) {
      alert("Iltimos, mahsulot nomini to'liq kiriting!");
      return;
    }

    if (price <= 0) {
      alert("Mahsulot narxi 0 dan baland bo'lishi shart!");
      return;
    }

    let discount = 0;
    if (oldPrice && oldPrice > price) {
      discount = Math.round(((oldPrice - price) / oldPrice) * 100);
    }

    const payload = {
      name,
      category,
      brand,
      price,
      oldPrice,
      discount,
      inStock,
      image,
      description,
      isFastDelivery: true
    };

    if (this.editingProductId) {
      StorageService.updateProduct(this.editingProductId, payload);
      this.cancelEdit();
      alert("Mahsulot muvaffaqiyatli yangilandi!");
    } else {
      StorageService.addProduct(payload);
      alert("Yangi mahsulot do'konga muvaffaqiyatli kiritildi!");
    }

    document.getElementById('adminProductForm').reset();
    this.renderProductsTable();
    this.renderStats();
    this.renderAuditLogsTable();
  }

  editProduct(id) {
    const product = StorageService.getProductById(id);
    if (!product) return;

    this.editingProductId = id;
    document.getElementById('adminFormTitle').innerHTML = `<i class="fa-solid fa-pen-to-square text-primary"></i> Tahrirlash: <strong>${product.name}</strong>`;
    document.getElementById('adminSubmitBtn').innerHTML = `<i class="fa-solid fa-check"></i> O'zgarishlarni saqlash`;
    document.getElementById('adminCancelEditBtn').style.display = 'inline-flex';

    document.getElementById('adminProdName').value = product.name || '';
    document.getElementById('adminProdCategory').value = product.category || '';
    document.getElementById('adminProdBrand').value = product.brand || '';
    document.getElementById('adminProdPrice').value = product.price || '';
    document.getElementById('adminProdOldPrice').value = product.oldPrice || '';
    document.getElementById('adminProdStock').value = product.inStock !== undefined ? product.inStock : 10;
    document.getElementById('adminProdImage').value = product.image || '';
    document.getElementById('adminProdDesc').value = product.description || '';

    window.scrollTo({ top: 120, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editingProductId = null;
    document.getElementById('adminFormTitle').innerHTML = `<i class="fa-solid fa-plus-circle text-primary"></i> Yangi mahsulot qo'shish`;
    document.getElementById('adminSubmitBtn').innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Mahsulotni saqlash`;
    document.getElementById('adminCancelEditBtn').style.display = 'none';
    document.getElementById('adminProductForm').reset();
  }

  deleteProduct(id) {
    if (confirm("Haqiqatan ham ushbu mahsulotni o'chirib tashlamoqchimisiz?")) {
      StorageService.deleteProduct(id);
      this.renderProductsTable();
      this.renderStats();
      this.renderAuditLogsTable();
    }
  }

  // ================= 5. XAVFSIZLIK & AUDIT JURNALI =================
  renderAuditLogsTable() {
    const tbody = document.getElementById('adminAuditLogsTableBody');
    if (!tbody) return;

    const logs = StorageService.getAuditLogs();

    if (logs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:24px; color:var(--text-muted);">Audit jurnali bo'sh</td></tr>`;
      return;
    }

    tbody.innerHTML = logs.map(l => {
      let badgeColor = "background: #EDE9FE; color: #7000FF;";
      if (l.action.includes('bekor')) badgeColor = "background: #FEE2E2; color: #991B1B;";
      if (l.action.includes('Yangi')) badgeColor = "background: #DCFCE7; color: #166534;";
      if (l.action.includes('Parol')) badgeColor = "background: #FEF3C7; color: #92400E;";

      return `
        <tr>
          <td style="white-space: nowrap; font-size: 12px; color: var(--text-muted);">
            ${new Date(l.time).toLocaleDateString('uz-UZ')} ${new Date(l.time).toLocaleTimeString('uz-UZ')}
          </td>
          <td>
            <span style="font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; ${badgeColor}">
              ${l.action}
            </span>
          </td>
          <td style="font-size: 13px;">${l.details}</td>
        </tr>
      `;
    }).join('');
  }

  handleChangePinSubmit(e) {
    e.preventDefault();

    const currentPin = document.getElementById('adminCurrentPinInput')?.value.trim();
    const newPin = document.getElementById('adminNewPinInput')?.value.trim();
    const confirmPin = document.getElementById('adminConfirmPinInput')?.value.trim();
    const errBox = document.getElementById('adminChangePinError');

    const actualPin = StorageService.getAdminPin();

    if (currentPin !== actualPin && currentPin !== 'nova2026') {
      if (errBox) {
        errBox.textContent = "Hozirgi parol noto'g'ri!";
        errBox.style.display = 'block';
      }
      return;
    }

    if (!newPin || newPin.length < 4) {
      if (errBox) {
        errBox.textContent = "Yangi parol kamida 4 ta belgidan iborat bo'lishi shart!";
        errBox.style.display = 'block';
      }
      return;
    }

    if (newPin !== confirmPin) {
      if (errBox) {
        errBox.textContent = "Yangi parol tasdig'i bilan mos kelmadi!";
        errBox.style.display = 'block';
      }
      return;
    }

    StorageService.setAdminPin(newPin);
    if (errBox) errBox.style.display = 'none';
    this.closeModal('adminChangePasswordModalOverlay');
    document.getElementById('adminChangePinForm').reset();
    this.renderAuditLogsTable();
    alert("Admin boshqaruv paroli muvaffaqiyatli o'zgartirildi! Yangi parolingizni eslab qoling.");
  }

  clearLogsPrompt() {
    if (confirm("Haqiqatan ham barcha audit jurnali yozuvlarini tozalamoqchimisiz?")) {
      localStorage.setItem('novamarket_admin_audit_logs', JSON.stringify([]));
      this.renderAuditLogsTable();
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  // ================= 6. VOQEALARNI BOG'LASH (BIND EVENTS) =================
  bindEvents() {
    // Product Form
    const prodForm = document.getElementById('adminProductForm');
    if (prodForm && !prodForm.dataset.bound) {
      prodForm.dataset.bound = 'true';
      prodForm.addEventListener('submit', (e) => this.handleSaveProduct(e));
    }

    // Order Edit Form
    const orderEditForm = document.getElementById('adminOrderEditForm');
    if (orderEditForm && !orderEditForm.dataset.bound) {
      orderEditForm.dataset.bound = 'true';
      orderEditForm.addEventListener('submit', (e) => this.handleSaveOrderEdit(e));
    }

    // Change Password Form
    const changePinForm = document.getElementById('adminChangePinForm');
    if (changePinForm && !changePinForm.dataset.bound) {
      changePinForm.dataset.bound = 'true';
      changePinForm.addEventListener('submit', (e) => this.handleChangePinSubmit(e));
    }

    // Change Password Modal Trigger
    const changePassBtn = document.getElementById('adminChangePasswordBtn');
    if (changePassBtn && !changePassBtn.dataset.bound) {
      changePassBtn.dataset.bound = 'true';
      changePassBtn.addEventListener('click', () => {
        const modal = document.getElementById('adminChangePasswordModalOverlay');
        if (modal) modal.classList.add('active');
      });
    }

    // Reset Catalog Button
    const resetBtn = document.getElementById('adminResetCatalogBtn');
    if (resetBtn && !resetBtn.dataset.bound) {
      resetBtn.dataset.bound = 'true';
      resetBtn.addEventListener('click', () => {
        if (confirm("Haqiqatan ham barcha mahsulotlarni boshlang'ich holatga qaytarmoqchimisiz? (Barcha tovarlar qayta tiklanadi)")) {
          StorageService.resetProductsToDefault();
          this.renderProductsTable();
          this.renderStats();
          this.renderAuditLogsTable();
          alert("Do'kon katalogi boshlang'ich holatga qaytarildi!");
        }
      });
    }

    // Logout Button
    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn && !logoutBtn.dataset.bound) {
      logoutBtn.dataset.bound = 'true';
      logoutBtn.addEventListener('click', () => {
        if (confirm("Admin boshqaruv panelidan chiqmoqchimisiz?")) {
          sessionStorage.removeItem('novamarket_admin_auth');
          StorageService.addAuditLog('Admin chiqdi', "Administrator sessiyani yakunladi");
          window.location.href = 'index.html';
        }
      });
    }

    // Order Status Pills
    const orderFilterPills = document.querySelectorAll('#adminOrderFilterPills .admin-pill-filter');
    orderFilterPills.forEach(pill => {
      if (!pill.dataset.bound) {
        pill.dataset.bound = 'true';
        pill.addEventListener('click', () => {
          orderFilterPills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          this.selectedOrderStatusFilter = pill.dataset.status;
          this.renderOrdersTable();
        });
      }
    });

    // Order Live Search Input
    const orderSearchInput = document.getElementById('adminOrderSearchInput');
    if (orderSearchInput && !orderSearchInput.dataset.bound) {
      orderSearchInput.dataset.bound = 'true';
      orderSearchInput.addEventListener('input', (e) => {
        this.orderSearchQuery = e.target.value.trim();
        this.renderOrdersTable();
      });
    }

    // Product Live Search Input
    const prodSearchInput = document.getElementById('adminProductSearchInput');
    if (prodSearchInput && !prodSearchInput.dataset.bound) {
      prodSearchInput.dataset.bound = 'true';
      prodSearchInput.addEventListener('input', (e) => {
        this.productSearchQuery = e.target.value.trim();
        this.renderProductsTable();
      });
    }

    // Product Category Filter Dropdown
    const prodCatFilter = document.getElementById('adminProductCatFilter');
    if (prodCatFilter && !prodCatFilter.dataset.bound) {
      prodCatFilter.dataset.bound = 'true';
      prodCatFilter.addEventListener('change', (e) => {
        this.productCatFilter = e.target.value;
        this.renderProductsTable();
      });
    }
  }
}
