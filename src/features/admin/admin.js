/**
 * NovaMarket — Admin Dashboard Moduli (Mahsulotlar va Buyurtmalar Boshqaruvi)
 */
import { StorageService } from '../../services/storage.js';
import { CATEGORIES } from '../../data/categories.js';
import { formatPrice } from '../../utils/formatters.js';

export class AdminDashboard {
  constructor() {
    this.editingProductId = null;
    this.adminPin = 'nova2026';
  }

  init() {
    if (this.checkAuth()) {
      this.showDashboard();
    } else {
      this.showAuthScreen();
    }
  }

  checkAuth() {
    return sessionStorage.getItem('novamarket_admin_auth') === 'true';
  }

  showAuthScreen() {
    const overlay = document.getElementById('adminAuthOverlay');
    const mainContent = document.getElementById('adminMainContent');
    const authForm = document.getElementById('adminAuthForm');
    const authPinInput = document.getElementById('adminAuthPin');
    const authError = document.getElementById('adminAuthError');

    if (overlay) overlay.style.display = 'flex';
    if (mainContent) mainContent.style.display = 'none';

    if (authPinInput) {
      setTimeout(() => authPinInput.focus(), 100);
    }

    const validPins = ['nova2026', 'admin', '1234', 'nova', '1111'];

    if (authForm && !authForm.dataset.bound) {
      authForm.dataset.bound = 'true';
      authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pin = authPinInput?.value.trim().toLowerCase();
        if (validPins.includes(pin)) {
          sessionStorage.setItem('novamarket_admin_auth', 'true');
          if (authError) authError.style.display = 'none';
          this.showDashboard();
        } else {
          if (authError) authError.style.display = 'block';
          if (authPinInput) {
            authPinInput.value = '';
            authPinInput.focus();
          }
        }
      });
    }

    const quickLoginBtn = document.getElementById('adminQuickLoginBtn');
    if (quickLoginBtn && !quickLoginBtn.dataset.bound) {
      quickLoginBtn.dataset.bound = 'true';
      quickLoginBtn.addEventListener('click', () => {
        sessionStorage.setItem('novamarket_admin_auth', 'true');
        if (authError) authError.style.display = 'none';
        this.showDashboard();
      });
    }
  }

  showDashboard() {
    const overlay = document.getElementById('adminAuthOverlay');
    const mainContent = document.getElementById('adminMainContent');

    if (overlay) overlay.style.display = 'none';
    if (mainContent) mainContent.style.display = 'block';

    this.populateCategorySelect();
    this.renderStats();
    this.renderProductsTable();
    this.renderOrdersTable();
    this.bindEvents();
  }

  populateCategorySelect() {
    const select = document.getElementById('adminProdCategory');
    if (!select) return;

    select.innerHTML = CATEGORIES.map(c => `
      <option value="${c.id}">${c.name}</option>
    `).join('');
  }

  renderStats() {
    const products = StorageService.getProducts();
    const orders = StorageService.getOrders();

    const totalRevenue = orders.reduce((acc, o) => acc + (o.totals?.grandTotal || 0), 0);

    const totalProdEl = document.getElementById('adminStatTotalProducts');
    const totalOrdersEl = document.getElementById('adminStatTotalOrders');
    const totalRevEl = document.getElementById('adminStatTotalRevenue');

    if (totalProdEl) totalProdEl.textContent = products.length;
    if (totalOrdersEl) totalOrdersEl.textContent = orders.length;
    if (totalRevEl) totalRevEl.textContent = formatPrice(totalRevenue);
  }

  renderProductsTable() {
    const tbody = document.getElementById('adminProductsTableBody');
    if (!tbody) return;

    const products = StorageService.getProducts();

    if (products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px;">Mahsulotlar mavjud emas</td></tr>`;
      return;
    }

    tbody.innerHTML = products.map(p => `
      <tr>
        <td>
          <img src="${p.image}" alt="${p.name}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 6px;">
        </td>
        <td>
          <strong style="font-size: 13px; display: block;">${p.name}</strong>
          <small style="color: var(--text-muted);">${p.brand || '—'} • ${p.category}</small>
        </td>
        <td><strong>${formatPrice(p.price)}</strong></td>
        <td>${p.oldPrice ? `<span style="text-decoration: line-through; color: var(--text-muted);">${formatPrice(p.oldPrice)}</span>` : '—'}</td>
        <td>${p.discount ? `<span class="badge-discount">-${p.discount}%</span>` : '—'}</td>
        <td><span style="font-weight: 700; color: ${p.inStock > 5 ? 'var(--success)' : 'var(--danger)'};">${p.inStock || 0} dona</span></td>
        <td>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-sm btn-outline" onclick="window.adminDashboard.editProduct(${p.id})" title="Tahrirlash">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn btn-sm btn-outline" style="color: var(--danger); border-color: var(--danger);" onclick="window.adminDashboard.deleteProduct(${p.id})" title="O'chirish">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  renderOrdersTable() {
    const tbody = document.getElementById('adminOrdersTableBody');
    if (!tbody) return;

    const orders = StorageService.getOrders();

    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">Hozircha buyurtmalar yo'q</td></tr>`;
      return;
    }

    tbody.innerHTML = orders.map(o => `
      <tr>
        <td><strong>${o.orderId}</strong></td>
        <td>
          <div style="font-size: 13px; font-weight: 600;">${o.customer?.fullName || 'Xaridor'}</div>
          <small style="color: var(--text-muted);">${o.customer?.phone || '—'}</small>
        </td>
        <td>
          <small>${o.delivery?.city}, ${o.delivery?.address}</small><br>
          <small style="color: #166534; font-weight: 700;"><i class="fa-solid fa-truck-fast"></i> ${o.deliveryDays || 2} kun ichida</small>
        </td>
        <td><strong>${formatPrice(o.totals?.grandTotal || 0)}</strong></td>
        <td>
          <select class="order-status-select" onchange="window.adminDashboard.changeOrderStatus('${o.orderId}', this.value)" style="padding: 4px 8px; border-radius: 6px; font-weight: 700; font-size: 12px; border: 1px solid var(--border); ${o.status === 'Bekor qilindi' || o.status === 'Bekor qilingan' ? 'color: var(--danger); background: #FEF2F2;' : ''}">
            <option value="Yangi" ${o.status === 'Yangi' ? 'selected' : ''}>Yangi</option>
            <option value="Yig'ilmoqda" ${o.status === "Yig'ilmoqda" ? 'selected' : ''}>Yig'ilmoqda</option>
            <option value="Yetkazilmoqda" ${o.status === 'Yetkazilmoqda' ? 'selected' : ''}>Yetkazilmoqda</option>
            <option value="Yetkazib berildi" ${o.status === 'Yetkazib berildi' ? 'selected' : ''}>Yetkazib berildi</option>
            <option value="Bekor qilindi" ${o.status === 'Bekor qilindi' || o.status === 'Bekor qilingan' ? 'selected' : ''}>Bekor qilindi</option>
          </select>
        </td>
        <td><small>${new Date(o.createdAt).toLocaleDateString('uz-UZ')}</small></td>
      </tr>
    `).join('');
  }

  bindEvents() {
    const form = document.getElementById('adminProductForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSaveProduct(e));
    }

    const resetBtn = document.getElementById('adminResetCatalogBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm("Haqiqatan ham barcha mahsulotlarni boshlang'ich holatga qaytarmoqchimisiz?")) {
          StorageService.resetProductsToDefault();
          this.renderProductsTable();
          this.renderStats();
          alert("Katalog boshlang'ich holatga qaytarildi!");
        }
      });
    }

    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm("Admin panelidan chiqmoqchimisiz?")) {
          sessionStorage.removeItem('novamarket_admin_auth');
          window.location.href = 'index.html';
        }
      });
    }
  }

  handleSaveProduct(e) {
    e.preventDefault();

    const name = document.getElementById('adminProdName')?.value.trim();
    const category = document.getElementById('adminProdCategory')?.value;
    const brand = document.getElementById('adminProdBrand')?.value.trim();
    const price = Number(document.getElementById('adminProdPrice')?.value) || 0;
    const oldPrice = Number(document.getElementById('adminProdOldPrice')?.value) || null;
    const inStock = Number(document.getElementById('adminProdStock')?.value) || 10;
    const image = document.getElementById('adminProdImage')?.value.trim() || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80';
    const description = document.getElementById('adminProdDesc')?.value.trim() || '';

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
      this.editingProductId = null;
      document.getElementById('adminFormTitle').textContent = "Yangi mahsulot qo'shish";
      document.getElementById('adminSubmitBtn').textContent = "Saqlash";
    } else {
      StorageService.addProduct(payload);
    }

    document.getElementById('adminProductForm').reset();
    this.renderProductsTable();
    this.renderStats();
    alert("Mahsulot muvaffaqiyatli saqlandi!");
  }

  editProduct(id) {
    const product = StorageService.getProductById(id);
    if (!product) return;

    this.editingProductId = id;
    document.getElementById('adminFormTitle').textContent = `Tahrirlash: ${product.name}`;
    document.getElementById('adminSubmitBtn').textContent = "O'zgarishlarni saqlash";

    document.getElementById('adminProdName').value = product.name;
    document.getElementById('adminProdCategory').value = product.category;
    document.getElementById('adminProdBrand').value = product.brand || '';
    document.getElementById('adminProdPrice').value = product.price;
    document.getElementById('adminProdOldPrice').value = product.oldPrice || '';
    document.getElementById('adminProdStock').value = product.inStock || 10;
    document.getElementById('adminProdImage').value = product.image;
    document.getElementById('adminProdDesc').value = product.description || '';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteProduct(id) {
    if (confirm("Ushbu mahsulotni o'chirib tashlamoqchimisiz?")) {
      StorageService.deleteProduct(id);
      this.renderProductsTable();
      this.renderStats();
    }
  }

  changeOrderStatus(orderId, newStatus) {
    StorageService.updateOrderStatus(orderId, newStatus);
    this.renderOrdersTable();
  }
}
