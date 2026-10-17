/**
 * NovaMarket — Centralized LocalStorage Service & State Store
 */
import { INITIAL_PRODUCTS } from '../data/products.js';

const CATALOG_VERSION = 'v4.1_smart_search_534';

const STORAGE_KEYS = {
  VERSION: 'novamarket_catalog_version',
  PRODUCTS: 'novamarket_custom_products',
  CART: 'novamarket_cart_items',
  WISHLIST: 'novamarket_wishlist_ids',
  ORDERS: 'novamarket_customer_orders',
  USER: 'novamarket_auth_user',
  CITY: 'novamarket_selected_city'
};

export const StorageService = {
  // ================= PRODUCTS =================
  getProducts() {
    try {
      const storedVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      
      if (!stored || storedVersion !== CATALOG_VERSION) {
        // Find any user-created custom items (custom items have id > 1000000000)
        let customItems = [];
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            customItems = parsed.filter(p => p.id > 1000000000);
          } catch (_) {}
        }
        const merged = [...customItems, ...INITIAL_PRODUCTS];
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(merged));
        localStorage.setItem(STORAGE_KEYS.VERSION, CATALOG_VERSION);
        return merged;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.error("Products load error, using initial:", e);
      return INITIAL_PRODUCTS;
    }
  },

  getProductById(id) {
    const products = this.getProducts();
    return products.find(p => p.id === Number(id));
  },

  saveProducts(products) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  addProduct(newProduct) {
    const products = this.getProducts();
    const productWithId = {
      ...newProduct,
      id: Date.now(),
      rating: 5.0,
      reviewsCount: 1,
      isFastDelivery: true
    };
    products.unshift(productWithId);
    this.saveProducts(products);
    return productWithId;
  },

  updateProduct(id, updatedFields) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === Number(id));
    if (index !== -1) {
      products[index] = { ...products[index], ...updatedFields };
      this.saveProducts(products);
      return products[index];
    }
    return null;
  },

  deleteProduct(id) {
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== Number(id));
    this.saveProducts(filtered);
    return filtered;
  },

  resetProductsToDefault() {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.VERSION, CATALOG_VERSION);
    return INITIAL_PRODUCTS;
  },

  // ================= CART =================
  getCart() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CART);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveCart(cart) {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  },

  addToCart(productId, quantity = 1) {
    const cart = this.getCart();
    const existing = cart.find(item => item.id === Number(productId));
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ id: Number(productId), quantity: quantity });
    }
    this.saveCart(cart);
    return cart;
  },

  updateCartQuantity(productId, delta) {
    let cart = this.getCart();
    const index = cart.findIndex(item => item.id === Number(productId));
    if (index !== -1) {
      cart[index].quantity += delta;
      if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
      }
      this.saveCart(cart);
    }
    return cart;
  },

  removeFromCart(productId) {
    const cart = this.getCart().filter(item => item.id !== Number(productId));
    this.saveCart(cart);
    return cart;
  },

  clearCart() {
    this.saveCart([]);
    return [];
  },

  // ================= WISHLIST =================
  getWishlist() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  toggleWishlist(productId) {
    let wishlist = this.getWishlist();
    const id = Number(productId);
    const index = wishlist.indexOf(id);
    let added = false;
    if (index === -1) {
      wishlist.push(id);
      added = true;
    } else {
      wishlist.splice(index, 1);
      added = false;
    }
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
    return { wishlist, added };
  },

  clearWishlist() {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify([]));
    return [];
  },

  // ================= ORDERS =================
  getOrders() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  createOrder(orderData) {
    const orders = this.getOrders();
    const city = orderData.delivery?.city || 'Toshkent';
    // Yetkazib berish muddati: Toshkent shahriga 2 kun, viloyatlarga 3 kun
    const deliveryDays = city.toLowerCase().includes('toshkent') ? 2 : 3;
    const now = new Date();
    const deliveryDate = new Date(now.getTime() + deliveryDays * 24 * 60 * 60 * 1000);

    const newOrder = {
      orderId: 'NM-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: now.toISOString(),
      deliveryDays,
      estimatedDeliveryDate: deliveryDate.toISOString(),
      status: 'Yangi', // Yangi, Yig'ilmoqda, Yetkazilmoqda, Yetkazib berildi, Bekor qilindi
      ...orderData
    };
    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return newOrder;
  },

  cancelOrder(orderId) {
    const orders = this.getOrders();
    const order = orders.find(o => o.orderId === orderId);
    if (!order) return { success: false, message: "Buyurtma topilmadi" };

    if (order.status === 'Bekor qilindi' || order.status === 'Bekor qilingan') {
      return { success: false, message: "Ushbu buyurtma allaqachon bekor qilingan." };
    }

    if (order.status === 'Yetkazib berildi') {
      return { success: false, message: "Buyurtma yetkazib berilgan, uni bekor qilib bo'lmaydi." };
    }

    // Yetkazilishiga 1 kun (24 soat) yoki undan kam qolganligini tekshirish
    const deliveryTime = new Date(order.estimatedDeliveryDate || (new Date(order.createdAt).getTime() + (order.deliveryDays || 2) * 24 * 3600 * 1000)).getTime();
    const hoursRemaining = (deliveryTime - Date.now()) / (1000 * 60 * 60);

    if (hoursRemaining <= 24) {
      return { 
        success: false, 
        message: "Mahsulot yetkazilishiga 1 kun yoki undan kam vaqt qoldi. Tovar yo'lga chiqarilgani sababli bekor qilib bo'lmaydi." 
      };
    }

    order.status = 'Bekor qilindi';
    order.cancelledAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return { success: true, message: "Buyurtma muvaffaqiyatli bekor qilindi.", order };
  },

  updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const order = orders.find(o => o.orderId === orderId);
    if (order) {
      order.status = newStatus;
      if (newStatus === 'Bekor qilindi' || newStatus === 'Bekor qilingan') {
        order.cancelledAt = new Date().toISOString();
      }
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    }
    return orders;
  },

  // ================= USER & LOCATION =================
  getUser() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  saveUser(userData) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
  },

  clearUser() {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  getCity() {
    return localStorage.getItem(STORAGE_KEYS.CITY) || "Toshkent";
  },

  setCity(city) {
    localStorage.setItem(STORAGE_KEYS.CITY, city);
  }
};
