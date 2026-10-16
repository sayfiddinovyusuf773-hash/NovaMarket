import { INITIAL_PRODUCTS } from '../src/data/products.js';
import { CATEGORIES } from '../src/data/categories.js';
import { formatPrice, formatInstallment } from '../src/utils/formatters.js';

console.log('--- NOVAMARKET TEST SUITE ---');

// Test 1: Category count must be exactly 24
console.log(`[TEST 1] Kategoriyalar soni: ${CATEGORIES.length}`);
if (CATEGORIES.length !== 24) {
  throw new Error(`Xatolik: Kategoriyalar soni aynan 24 ta bo'lishi kerak, lekin ${CATEGORIES.length} ta topildi!`);
}
console.log('✅ 24 ta asosiy kategoriya to\'liq mavjud.');

// Test 2: Products count must be 500+
console.log(`[TEST 2] Boshlang'ich mahsulotlar soni: ${INITIAL_PRODUCTS.length}`);
if (INITIAL_PRODUCTS.length < 500) {
  throw new Error(`Xatolik: Mahsulotlar soni 500 tadan kam: ${INITIAL_PRODUCTS.length}`);
}
console.log(`✅ Mahsulotlar soni talabga javob beradi: ${INITIAL_PRODUCTS.length} ta mahsulot.`);

// Test 3: Formatting tests in Uzbek So'm
const formattedPrice = formatPrice(12450000);
if (!formattedPrice.includes("so'm")) {
  throw new Error(`Xatolik: formatPrice noto'g'ri ishladi: ${formattedPrice}`);
}
console.log(`[TEST 3] formatPrice(12450000) = "${formattedPrice}" ✅`);

const formattedInstallment = formatInstallment(12000000, 12);
if (!formattedInstallment.includes("oyiga") || !formattedInstallment.includes("so'mdan")) {
  throw new Error(`Xatolik: formatInstallment noto'g'ri: ${formattedInstallment}`);
}
console.log(`[TEST 4] formatInstallment(12000000) = "${formattedInstallment}" ✅`);

// Test 4: Checking each product has image, price, specs, name, monthlyInstallment
INITIAL_PRODUCTS.forEach(p => {
  if (!p.id || !p.name || !p.price || !p.image || !p.category || !p.monthlyInstallment) {
    throw new Error(`Xatolik: Mahsulot ID=${p.id} (${p.name}) da majburiy maydonlar to'liq emas!`);
  }
});
console.log('✅ Barcha 528 ta mahsulot to\'liq ma\'lumotlar (ID, nomi, narxi, rasmi, toifasi, muddatli to\'lov) bilan ta\'minlangan.');

// Test 5: Verify all 24 categories have items
const categoryDistribution = {};
INITIAL_PRODUCTS.forEach(p => {
  categoryDistribution[p.category] = (categoryDistribution[p.category] || 0) + 1;
});

CATEGORIES.forEach(cat => {
  const count = categoryDistribution[cat.id] || 0;
  if (count < 20) {
    throw new Error(`Xatolik: "${cat.name}" (${cat.id}) kategoriyasida mahsulotlar kam: ${count} ta!`);
  }
});
console.log('✅ Barcha 24 ta kategoriyaning har birida 20+ ta mahsulot mavjud.');

console.log('🎉 BARCHA NOVAMARKET TESTLARI MUVAFFAQIYATLI O\'TDI!');
