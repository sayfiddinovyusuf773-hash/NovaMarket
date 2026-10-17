/**
 * NovaMarket — Smart Search & Query Normalizer Helper
 * 
 * Implements:
 * 1. Cyrillic <-> Latin full transliteration (Russian & Uzbek Cyrillic).
 * 2. Colloquial Uzbek, Russian & English synonym resolution:
 *    - smartwatch / smart soat / aqlli soat / chasy
 *    - kirmoshina / kirmashina / kir yuvish mashinasi / stiralka
 *    - haladenlik / haladilnik / xolodilnik / holodilnik / muzlatgich / sovutgich
 *    - pylesos / changyutgich, kanditsaner / konditsioner, noutbuk / laptop, etc.
 * 3. Compound-word spacing tolerance (e.g. "kir mashina" == "kirmashina" == "kir yuvish").
 * 4. Multi-token queries (e.g. "samsung haladenlik", "apple smartwatch").
 * 5. Intelligent relevance scoring.
 */

const CYRILLIC_MAP = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
  'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'x', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sh',
  'ы': 'i', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  'ў': 'o', 'ғ': 'g', 'ҳ': 'h', 'қ': 'q',
  '\u044c': '', '\u044a': '', '\u042c': '', '\u042a': ''
};

export function transliterateCyrillic(str) {
  if (!str) return '';
  return str.toLowerCase().split('').map(c => CYRILLIC_MAP[c] !== undefined ? CYRILLIC_MAP[c] : c).join('');
}

export function cleanSearchText(str) {
  if (!str) return '';
  let s = transliterateCyrillic(String(str));
  // Remove Uzbek apostrophes and quotes
  s = s.replace(/['`’ʻʼ"«»]/g, '');
  // Replace punctuation/hyphens with space
  s = s.replace(/[^\w\s]/g, ' ');
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

export const CONCEPTS = [
  {
    id: 'refrigerators',
    category: 'appliances',
    subCategories: ['refrigerators'],
    aliases: [
      'haladenlik', 'haladilnik', 'xolodilnik', 'holodilnik', 'xolodenlik', 'holodenlik',
      'muzlatgich', 'muzlatkich', 'sovutgich', 'savutgich', 'fridge', 'refrigerator',
      'morozilnik', 'morozilka', 'xolodelnik', 'haladelnik', 'xaladenlik', 'xaladilnik'
    ]
  },
  {
    id: 'washing_machines',
    category: 'appliances',
    subCategories: ['washing_machines'],
    aliases: [
      'kirmoshina', 'kirmashina', 'kir moshina', 'kir mashina', 'kirmashinasi', 'kirmoshinasi',
      'kir yuvish mashinasi', 'kir yuvish', 'kir yuvgich', 'kir mashinasi', 'stiralka',
      'stiralnaya mashina', 'stiralnaya', 'stiralniy', 'kir yuvadigan', 'avtomat kir'
    ]
  },
  {
    id: 'smart_watches',
    category: 'electronics_accessories',
    subCategories: ['smart_watches'],
    aliases: [
      'smartwatch', 'smart watch', 'smartwatches', 'smartsoat', 'smart soat', 'aqlli soat',
      'soat', 'soatlar', 'smartband', 'smart band', 'fitnes braslet', 'braslet',
      'apple watch', 'galaxy watch', 'watch', 'watches', 'chasy', 'smart chasy'
    ]
  },
  {
    id: 'vacuum_cleaners',
    category: 'appliances',
    subCategories: ['vacuum_cleaners'],
    aliases: [
      'changyutgich', 'chang yutgich', 'changyutkich', 'pylesos', 'pilesos', 'palisos',
      'robot changyutgich', 'simsiz changyutgich', 'chang yutadigan'
    ]
  },
  {
    id: 'air_conditioners',
    category: 'appliances',
    subCategories: ['air_conditioners'],
    aliases: [
      'konditsioner', 'konditsaner', 'kanditsaner', 'kanditsioner', 'kondisioner',
      'split sistema', 'konditsionerlar', 'konditsoner', 'konditsianer'
    ]
  },
  {
    id: 'microwaves',
    category: 'appliances',
    subCategories: ['microwaves'],
    aliases: [
      'mikrovolnovka', 'mikrovolnovaya', 'mikrotolqinli pech', 'mikrotolqinli', 'mikrotolqin'
    ]
  },
  {
    id: 'stoves_ovens',
    category: 'appliances',
    subCategories: ['stoves_ovens'],
    aliases: [
      'gaz plita', 'gazplita', 'gazovaya plita', 'plitka', 'pech', 'duxovka', 'duxovoy shkaf', 'elektr plita'
    ]
  },
  {
    id: 'dishwashers',
    category: 'appliances',
    aliases: [
      'idish yuvish', 'idish yuvish mashinasi', 'posudomoyka', 'posudomoechnaya', 'idish yuvgich'
    ]
  },
  {
    id: 'irons',
    category: 'appliances',
    aliases: [
      'dazmol', 'dazmollar', 'utyug', 'utug', 'bug generatorli dazmol', 'dazmollash'
    ]
  },
  {
    id: 'coffee_machines',
    category: 'appliances',
    aliases: [
      'kofemashina', 'kofe mashina', 'kofevarka', 'kofe qaynatgich', 'kofe apparati'
    ]
  },
  {
    id: 'all_appliances',
    category: 'appliances',
    aliases: [
      'maishiy texnika', 'maishiy', 'texnika', 'bytovaya texnika', 'uy texnikasi', 'oshxona texnikasi', 'appliances'
    ]
  },
  {
    id: 'laptops',
    category: 'computers',
    subCategories: ['laptops', 'gaming_laptops'],
    aliases: [
      'noutbuk', 'notbuk', 'laptop', 'notebook', 'kompyuter', 'netbuk', 'noutbuklar'
    ]
  },
  {
    id: 'smartphones',
    category: 'phones_smartphones',
    subCategories: ['flagship_smartphones', 'budget_smartphones', 'push_button_phones'],
    aliases: [
      'smartfon', 'telefon', 'smartfonlar', 'telefonlar', 'ayfon', 'iphone', 'samsung telefon',
      'redmi', 'xiaomi', 'mobil telefon', 'sotoviy'
    ]
  },
  {
    id: 'headphones',
    category: 'electronics_accessories',
    subCategories: ['wireless_headphones'],
    aliases: [
      'naushnik', 'naushniklar', 'quloqchin', 'quloqchinlar', 'airpods', 'galaxy buds', 'simsiz naushnik'
    ]
  },
  {
    id: 'televisions',
    category: 'tv_audio',
    subCategories: ['smart_tv', '4k_uhd', 'qled_oled'],
    aliases: [
      'televizor', 'tv', 'telvizor', 'tilvizor', 'televizorlar', 'smart tv', 'oled', 'qled'
    ]
  }
];

/**
 * Calculates a matching score for a product against a search query
 */
export function getProductScore(product, query) {
  if (!query) return 0;
  const cleanQ = cleanSearchText(query);
  if (!cleanQ || cleanQ.length < 2) return 0;

  const noSpaceQ = cleanQ.replace(/\s+/g, '');
  const tokens = cleanQ.split(' ').filter(t => t.length > 1);

  const cleanName = cleanSearchText(product.name || '');
  const cleanBrand = cleanSearchText(product.brand || '');
  const cleanCat = cleanSearchText(product.category || '');
  const cleanSubCat = cleanSearchText(product.subCategory || '');
  const cleanDesc = cleanSearchText(product.description || '');

  const noSpaceName = cleanName.replace(/\s+/g, '');

  let score = 0;
  let matchedConcept = null;

  // 1. Identify if the query triggers a known concept
  for (const concept of CONCEPTS) {
    for (const alias of concept.aliases) {
      const cleanAlias = cleanSearchText(alias);
      const noSpaceAlias = cleanAlias.replace(/\s+/g, '');

      if (cleanQ === cleanAlias || noSpaceQ === noSpaceAlias) {
        matchedConcept = concept;
        break;
      }
      if (cleanQ.includes(cleanAlias) || cleanAlias.includes(cleanQ)) {
        matchedConcept = concept;
        break;
      }
      for (const token of tokens) {
        if (token.length >= 3 && (cleanAlias === token || noSpaceAlias === token || cleanAlias.includes(token))) {
          matchedConcept = concept;
          break;
        }
      }
      if (matchedConcept) break;
    }
    if (matchedConcept) break;
  }

  // 2. Score concept match
  if (matchedConcept) {
    if (matchedConcept.subCategories && matchedConcept.subCategories.includes(product.subCategory)) {
      score += 200;
    } else if (matchedConcept.category && product.category === matchedConcept.category) {
      score += 100;
    }

    // Explicit mention of alias in name
    for (const alias of matchedConcept.aliases) {
      const cleanAlias = cleanSearchText(alias);
      if (cleanName.includes(cleanAlias)) {
        score += 80;
        break;
      }
    }
  }

  // 3. Exact & prefix matching on name
  if (cleanName === cleanQ || noSpaceName === noSpaceQ) {
    score += 180;
  } else if (cleanName.startsWith(cleanQ)) {
    score += 120;
  } else if (cleanName.includes(cleanQ) || noSpaceName.includes(noSpaceQ)) {
    score += 70;
  }

  // 4. Multi-token evaluation (Brand, Model, Specs)
  let matchedTokenCount = 0;
  for (const token of tokens) {
    let tScore = 0;
    if (cleanBrand === token) {
      tScore += 90;
    } else if (cleanBrand.includes(token)) {
      tScore += 45;
    }

    if (cleanName.includes(token) || noSpaceName.includes(token)) {
      tScore += 35;
    } else if (cleanSubCat.includes(token) || cleanCat.includes(token)) {
      tScore += 20;
    } else if (cleanDesc.includes(token)) {
      tScore += 10;
    }

    if (tScore > 0) {
      matchedTokenCount++;
      score += tScore;
    }
  }

  // 5. Handling multi-word combinations (e.g. "samsung haladenlik")
  if (tokens.length > 1) {
    if (matchedConcept) {
      // Must match non-concept tokens (e.g. brand)
      const nonConceptTokens = tokens.filter(t => 
        !matchedConcept.aliases.some(a => cleanSearchText(a).includes(t))
      );
      if (nonConceptTokens.length > 0) {
        const matchesNonConcept = nonConceptTokens.every(t => 
          cleanBrand.includes(t) || cleanName.includes(t) || cleanDesc.includes(t)
        );
        if (!matchesNonConcept) {
          return 0; // Filter out products not matching specified brand/modifier
        }
      }
      // If concept has specific subcategories, ensure product belongs to them
      if (matchedConcept.subCategories && !matchedConcept.subCategories.includes(product.subCategory)) {
        return 0;
      }
    } else {
      // No concept matched, require all tokens to match
      if (matchedTokenCount < tokens.length) {
        return 0;
      }
    }
  }

  return score;
}

/**
 * Filter and sort a list of products by query relevance
 */
export function searchProducts(products, query) {
  if (!products || !Array.isArray(products)) return [];
  if (!query || query.trim().length < 2) return products;

  const scored = [];
  for (const p of products) {
    const score = getProductScore(p, query);
    if (score > 0) {
      scored.push({ product: p, score });
    }
  }

  // Sort descending by score, then by rating
  scored.sort((a, b) => b.score - a.score || (b.product.rating || 0) - (a.product.rating || 0));
  return scored.map(s => s.product);
}

/**
 * Quick boolean check if a product matches a query
 */
export function productMatchesQuery(product, query) {
  return getProductScore(product, query) > 0;
}
