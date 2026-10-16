/**
 * NovaMarket — Yordamchi Formatlash Funksiyalari
 */

/**
 * Narxni o'zbek so'mida probellar bilan chiroyli formatlash
 * Masalan: 16890000 -> "16 890 000 so'm"
 */
export function formatPrice(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return "0 so'm";
  return Number(amount).toLocaleString('ru-RU') + " so'm";
}

/**
 * Nasiya / Muddatli to'lov oylik to'lovini hisoblash va formatlash
 * Masalan: 1200000 -> "oyiga 100 000 so'mdan"
 */
export function formatInstallment(price, months = 12) {
  const perMonth = Math.round(price / months);
  return `oyiga ${Number(perMonth).toLocaleString('ru-RU')} so'mdan`;
}

/**
 * Yulduzchalar reytingini HTML ko'rinishida hosil qilish
 */
export function renderRatingStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  let html = '';
  for (let i = 0; i < fullStars; i++) {
    html += '<i class="fa-solid fa-star"></i>';
  }
  if (halfStar) {
    html += '<i class="fa-solid fa-star-half-stroke"></i>';
  }
  for (let i = 0; i < emptyStars; i++) {
    html += '<i class="fa-regular fa-star"></i>';
  }
  return html;
}

/**
 * Matnni xavfsiz qilib qidiruv natijasida belgilash
 */
export function highlightMatch(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="highlight">$1</mark>');
}
