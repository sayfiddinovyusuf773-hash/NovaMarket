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
 * Muddatli to'lov rejalari (3, 6, 12, 24 oy)
 */
export const INSTALLMENT_PLANS = {
  3: { months: 3, markupPercent: 0, label: "3 oy", note: "0% Aksiyada" },
  6: { months: 6, markupPercent: 6, label: "6 oy", note: "Qulay reja" },
  12: { months: 12, markupPercent: 15, label: "12 oy", note: "Ommabop" },
  24: { months: 24, markupPercent: 26, label: "24 oy", note: "Kichik to'lov" }
};

/**
 * Muddatli to'lov hisob-kitob funksiyasi
 */
export function calculateInstallment(amount, months = 12) {
  const plan = INSTALLMENT_PLANS[months] || INSTALLMENT_PLANS[12];
  const totalAmount = Math.round(amount * (1 + plan.markupPercent / 100));
  const perMonth = Math.round(totalAmount / plan.months);
  return {
    months: plan.months,
    markupPercent: plan.markupPercent,
    label: plan.label,
    note: plan.note,
    originalAmount: amount,
    totalAmount,
    perMonth,
    initialPayment: 0,
    formattedPerMonth: formatPrice(perMonth),
    formattedTotal: formatPrice(totalAmount)
  };
}

/**
 * Nasiya / Muddatli to'lov oylik to'lovini hisoblash va formatlash
 * Masalan: 1200000 -> "oyiga 100 000 so'mdan"
 */
export function formatInstallment(price, months = 12) {
  const calc = calculateInstallment(price, months);
  return `oyiga ${calc.formattedPerMonth}dan`;
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

/**
 * Sanani o'zbek tilida chiroyli formatlash: masalan "18-oktyabr, 14:30"
 */
export function formatUzbekDateTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  const monthsUz = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
  const day = d.getDate();
  const month = monthsUz[d.getMonth()];
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}-${month}, soat ${hours}:${minutes}`;
}

/**
 * Yetkazib berish kunini formatlash: masalan "18-oktyabr"
 */
export function formatDeliveryDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  const monthsUz = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
  const day = d.getDate();
  const month = monthsUz[d.getMonth()];
  return `${day}-${month}`;
}
