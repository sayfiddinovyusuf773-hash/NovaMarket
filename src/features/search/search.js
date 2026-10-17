/**
 * NovaMarket — Universal Qidiruv Moduli (Live Search with Autocomplete)
 */
import { StorageService } from '../../services/storage.js';
import { formatPrice, highlightMatch } from '../../utils/formatters.js';
import { searchProducts } from '../../utils/searchHelper.js';

export class SearchFeature {
  constructor(options = {}) {
    this.inputId = options.inputId || 'universalSearchInput';
    this.dropdownId = options.dropdownId || 'searchSuggestionsDropdown';
    this.clearBtnId = options.clearBtnId || 'clearSearchBtn';
    this.onSelect = options.onSelect || null;
    this.onSearchSubmit = options.onSearchSubmit || null;
    this.debounceTimer = null;
  }

  init() {
    const input = document.getElementById(this.inputId);
    const dropdown = document.getElementById(this.dropdownId);
    const clearBtn = document.getElementById(this.clearBtnId);

    if (!input) return;

    input.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      if (clearBtn) clearBtn.style.display = q ? 'block' : 'none';

      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        if (q.length >= 2) {
          this.showSuggestions(q);
        } else {
          if (dropdown) dropdown.style.display = 'none';
        }

        if (this.onSearchSubmit) {
          this.onSearchSubmit(q);
        }
      }, 200);
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        clearBtn.style.display = 'none';
        if (dropdown) dropdown.style.display = 'none';
        if (this.onSearchSubmit) this.onSearchSubmit('');
      });
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = input.value.trim();
        if (dropdown) dropdown.style.display = 'none';
        if (this.onSearchSubmit) this.onSearchSubmit(val);
        const catalogEl = document.getElementById('catalog');
        if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    });

    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && dropdown && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
  }

  showSuggestions(query) {
    const dropdown = document.getElementById(this.dropdownId);
    if (!dropdown) return;

    const products = StorageService.getProducts();
    const allMatches = searchProducts(products, query);
    const matches = allMatches.slice(0, 6);

    if (matches.length === 0) {
      dropdown.innerHTML = `
        <div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 13px;">
          «${query}» bo'yicha hech qanday mahsulot topilmadi
        </div>
      `;
      dropdown.style.display = 'block';
      return;
    }

    const safeQuery = query.replace(/'/g, "\\'");

    dropdown.innerHTML = matches.map(p => `
      <div class="search-suggestion-item" onclick="window.novaMarketApp.openProductModal(${p.id}); document.getElementById('${this.dropdownId}').style.display='none';">
        <img src="${p.image}" alt="${p.name}" class="suggestion-thumb">
        <div class="suggestion-info">
          <div class="suggestion-name">${highlightMatch(p.name, query)}</div>
          <div class="suggestion-meta">${p.brand || 'NovaMarket'} • ${p.category}</div>
        </div>
        <div class="suggestion-price">${formatPrice(p.price)}</div>
      </div>
    `).join('') + `
      <div style="padding: 10px; text-align: center; background: var(--bg-subtle); border-top: 1px solid var(--border);">
        <a href="#catalog" style="font-size: 13px; font-weight: 700; color: var(--primary); text-decoration: none; display: inline-flex; align-items: center; gap: 6px;" onclick="window.novaMarketApp.catalogFeature.setSearchQuery('${safeQuery}'); document.getElementById('${this.dropdownId}').style.display='none';">
          Barcha natijalarni ko'rish (${allMatches.length} ta) <i class="fa-solid fa-arrow-right"></i>
        </a>
      </div>
    `;

    dropdown.style.display = 'block';
  }
}

