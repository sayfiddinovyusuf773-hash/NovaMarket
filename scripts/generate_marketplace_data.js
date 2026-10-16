// scripts/generate_marketplace_data.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CATEGORIES_DATA = [
  {
    id: "phones_smartphones",
    name: "Telefonlar va smartfonlar",
    icon: "fa-mobile-screen-button",
    color: "#7000FF",
    banner: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      { id: "flagship_smartphones", name: "Flagman smartfonlar" },
      { id: "budget_smartphones", name: "Hamyonbop smartfonlar" },
      { id: "push_button_phones", name: "Tugmali telefonlar" },
      { id: "phone_cases", name: "G'ilof va himoya oynalari" },
      { id: "powerbanks_chargers", name: "Powerbank va zaryadlovchilar" }
    ]
  },
  {
    id: "televisions",
    name: "Televizorlar",
    icon: "fa-tv",
    color: "#0091FF",
    banner: "https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      { id: "smart_tv", name: "Smart TV televizorlar" },
      { id: "qled_oled", name: "QLED va OLED televizorlar" },
      { id: "4k_uhd", name: "4K Ultra HD televizorlar" },
      { id: "tv_brackets", name: "Televizor kronshteynlari" },
      { id: "tv_tuners_remotes", name: "Pultlar va TV pristavkalar" }
    ]
  },
  {
    id: "appliances",
    name: "Maishiy texnika",
    icon: "fa-blender",
    color: "#00B664",
    banner: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      { id: "refrigerators", name: "Sovutkichlar va muzlatkichlar" },
      { id: "washing_machines", name: "Kir yuvish mashinalari" },
      { id: "air_conditioners", name: "Konditsionerlar" },
      { id: "vacuum_cleaners", name: "Changyutgichlar" },
      { id: "stoves_ovens", name: "Gaz plitalari va pechlar" },
      { id: "microwaves", name: "Mikroto'lqinli pechlar" }
    ]
  },
  {
    id: "computers_laptops",
    name: "Kompyuterlar va noutbuklar",
    icon: "fa-laptop",
    color: "#4F46E5",
    banner: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      { id: "laptops", name: "Noutbuklar va ultrabuklar" },
      { id: "gaming_laptops", name: "O'yin noutbuklari" },
      { id: "monitors", name: "Monitorlar" },
      { id: "all_in_one", name: "Monobloklar" },
      { id: "pc_peripherals", name: "Sichqoncha va klaviaturalar" },
      { id: "pc_components", name: "SSD va ehtiyot qismlar" }
    ]
  },
  {
    id: "electronics_accessories",
    name: "Elektronika va aksessuarlar",
    icon: "fa-headphones",
    color: "#9333EA",
    banner: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      { id: "wireless_headphones", name: "Simsiz quloqchinlar" },
      { id: "smart_watches", name: "Smart-soatlar va brasletlar" },
      { id: "bluetooth_speakers", name: "Bluetooth dinamiklar" },
      { id: "game_consoles", name: "O'yin konsollari (PS5, Xbox)" },
      { id: "cameras_drones", name: "Foto va video kameralar" }
    ]
  },
  {
    id: "men_clothing",
    name: "Erkaklar kiyimi",
    icon: "fa-shirt",
    color: "#0284C7",
    banner: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      { id: "men_shirts", name: "Ko'ylaklar va pololar" },
      { id: "men_tshirts", name: "Futbolkalar va maykalar" },
      { id: "men_hoodies", name: "Xudilar va svitshotlar" },
      { id: "men_pants", name: "Shimlar va jinsilar" },
      { id: "men_suits", name: "Klassik kostyum va pidjaklar" },
      { id: "men_jackets", name: "Kurtkalar va paltolar" }
    ]
  },
  {
    id: "women_clothing",
    name: "Ayollar kiyimi",
    icon: "fa-person-dress",
    color: "#E11D48",
    banner: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      { id: "women_dresses", name: "Ko'ylaklar va sarafanlar" },
      { id: "women_blouses", name: "Bluzkalar va ko'ylaklar" },
      { id: "women_pants", name: "Shimlar va leggingslar" },
      { id: "women_skirts", name: "Yubkalar" },
      { id: "women_suits", name: "Ayollar kostyumlari" },
      { id: "women_outerwear", name: "Paltolar va kurtkalar" }
    ]
  },
  {
    id: "kids_clothing",
    name: "Bolalar kiyimi",
    icon: "fa-child",
    color: "#F59E0B",
    banner: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      { id: "boys_clothing", name: "O'g'il bolalar kiyimi" },
      { id: "girls_clothing", name: "Qiz bolalar kiyimi" },
      { id: "baby_bodysuits", name: "Chaqaloqlar uchun kiyimlar" },
      { id: "school_uniforms", name: "Maktab formalari" },
      { id: "kids_jackets", name: "Bolalar kurtkalari" }
    ]
  },
  {
    id: "summer_clothing",
    name: "Yozgi kiyimlar",
    icon: "fa-sun",
    color: "#EAB308",
    banner: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      { id: "summer_shorts", name: "Shortilar va brinjilar" },
      { id: "summer_linen", name: "Zig'ir (linen) kiyimlar" },
      { id: "swimwear", name: "Cho'milish kiyimlari" },
      { id: "summer_hats", name: "Panama va yozgi shlyapalar" },
      { id: "light_dresses", name: "Yengil shifon liboslar" }
    ]
  },
  {
    id: "winter_clothing",
    name: "Qishki kiyimlar",
    icon: "fa-snowflake",
    color: "#06B6D4",
    banner: "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      { id: "down_jackets", name: "Puxoviklar va qishki kurtkalar" },
      { id: "thermal_wear", name: "Termokiyimlar va ichki kiyim" },
      { id: "wool_sweaters", name: "Jun sviterlar va jemperlar" },
      { id: "winter_accessories", name: "Shapkalar, sharflar va qo'lqoplar" },
      { id: "ski_jackets", name: "Chang'i va tog' kiyimlari" }
    ]
  },
  {
    id: "footwear",
    name: "Oyoq kiyimlar",
    icon: "fa-shoe-prints",
    color: "#84CC16",
    banner: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      { id: "sneakers", name: "Krossovkalar va kedalar" },
      { id: "classic_shoes", name: "Klassik charm tuflilar" },
      { id: "boots", name: "Qishki botinkalar va etiklar" },
      { id: "women_heels", name: "Ayollar poshnali tuflilari" },
      { id: "home_slippers", name: "Uy shippaklari" },
      { id: "sandals", name: "Yozgi sandallar va shlyopkalar" }
    ]
  },
  {
    id: "sports_gear",
    name: "Sport kiyimlari va anjomlari",
    icon: "fa-dumbbell",
    color: "#EF4444",
    banner: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      { id: "exercise_machines", name: "Trenajyorlar va yugurish yo'lakchalari" },
      { id: "dumbbells_weights", name: "Gantellar va shtangalar" },
      { id: "bicycles_scooters", name: "Velosipedlar va samokatlar" },
      { id: "boxing_gear", name: "Boks anjomlari va qo'lqoplar" },
      { id: "sports_balls", name: "Futbol va voleybol to'plari" },
      { id: "yoga_fitness", name: "Yoga gilamchalari va aksessuarlar" }
    ]
  },
  {
    id: "furniture",
    name: "Mebel",
    icon: "fa-couch",
    color: "#D97706",
    banner: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      { id: "sofas_armchairs", name: "Divanlar va yumshoq mebel" },
      { id: "beds_mattresses", name: "Krovatlar va ortopedik matraslar" },
      { id: "wardrobes", name: "Shkaflar va komodlar" },
      { id: "tables_chairs", name: "Stol va stullar" },
      { id: "office_chairs", name: "Ofis kreslolari va stollari" },
      { id: "coffee_tables", name: "Jurnal va qahva stollari" }
    ]
  },
  {
    id: "household",
    name: "Uy-ro‘zg‘or buyumlari",
    icon: "fa-house",
    color: "#10B981",
    banner: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      { id: "lighting_lamps", name: "Yoritish jihozlari va lyustralar" },
      { id: "bedding_linens", name: "Choyshablar va adyollar" },
      { id: "carpets_curtains", name: "Gilamlar va pardalar" },
      { id: "bath_accessories", name: "Hammom aksessuarlari" },
      { id: "cleaning_supplies", name: "Tozalash vositalari va sushilkalar" },
      { id: "home_fragrance", name: "Xushbo'y hid taratgichlar" }
    ]
  },
  {
    id: "kitchenware",
    name: "Oshxona anjomlari",
    icon: "fa-kitchen-set",
    color: "#F97316",
    banner: "https://images.unsplash.com/photo-1556911073-38141963c9e0?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      { id: "cookware_pots", name: "Qozonlar va tovalar to'plami" },
      { id: "dinnerware_plates", name: "Idish-tovoqlar va likopchalar" },
      { id: "kitchen_knives", name: "Oshxona pichoqlari va stendlar" },
      { id: "glasses_mugs", name: "Bakallar, krujkalar va piyolalar" },
      { id: "kitchen_tools", name: "Oshxona mayda anjomlari" },
      { id: "thermoses", name: "Termoslar va suv idishlari" }
    ]
  },
  {
    id: "beauty_care",
    name: "Go‘zallik va parvarish",
    icon: "fa-spa",
    color: "#EC4899",
    banner: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      { id: "perfumery", name: "Atirlar va parfyumeriya" },
      { id: "skincare", name: "Teri va yuz parvarishi" },
      { id: "haircare", name: "Soch parvarishi va eliksirlar" },
      { id: "shavers_trimmers", name: "Elektr ustaralar va trimmerlar" },
      { id: "hair_dryers_stylers", name: "Fen va soch turmaklagichlar" },
      { id: "makeup", name: "Kosmetika va makiyaj" }
    ]
  },
  {
    id: "kids_toys",
    name: "Bolalar mahsulotlari va o‘yinchoqlar",
    icon: "fa-baby-carriage",
    color: "#14B8A6",
    banner: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      { id: "lego_constructors", name: "Konstruktorlar va LEGO" },
      { id: "rc_cars", name: "Masofadan boshqariladigan o'yinchoqlar" },
      { id: "strollers", name: "Bolalar aravachalari" },
      { id: "educational_toys", name: "Rivojlantiruvchi o'yinlar" },
      { id: "soft_toys", name: "Yumshoq o'yinchoqlar" },
      { id: "electric_cars", name: "Bolalar elektromobillari" }
    ]
  },
  {
    id: "auto_accessories",
    name: "Avtomobil aksessuarlari",
    icon: "fa-car",
    color: "#64748B",
    banner: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      { id: "dashcams", name: "Videoregistratorlar" },
      { id: "car_holders_chargers", name: "Telefon ushlagichlar va zaryadlovchilar" },
      { id: "car_vacuums", name: "Avtomobil changyutgichlari" },
      { id: "car_compressors", name: "Avto kompressorlar (nasoslar)" },
      { id: "seat_covers", name: "Salon chexollari va gilamchalari" },
      { id: "car_fragrances", name: "Avtomobil xushbo'ylantirgichlari" }
    ]
  },
  {
    id: "construction_tools",
    name: "Qurilish va ta’mirlash",
    icon: "fa-screwdriver-wrench",
    color: "#EA580C",
    banner: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      { id: "power_drills", name: "Elektr drel va perforatorlar" },
      { id: "tool_sets", name: "Asboblar to'plami va keyslar" },
      { id: "laser_levels", name: "Lazer daraja o'lchagichlar (uroven)" },
      { id: "grinders_saws", name: "Bolgarkalar va arralar" },
      { id: "welding_machines", name: "Payvandlash apparatlari (svarka)" },
      { id: "measurement_tools", name: "O'lchov asboblari va ruletkalar" }
    ]
  },
  {
    id: "books_stationery",
    name: "Kitoblar va kanselyariya",
    icon: "fa-book-open",
    color: "#6D28D9",
    banner: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      { id: "fiction_books", name: "Badiiy adabiyot va romanlar" },
      { id: "business_psychology", name: "Biznes va shaxsiy rivojlanish" },
      { id: "children_books", name: "Bolalar kitoblari va ertaklar" },
      { id: "dictionaries_study", name: "Lug'atlar va darsliklar" },
      { id: "pens_notebooks", name: "Ruchkalar va kundalik daftarlar" },
      { id: "art_supplies", name: "Chizmachilik va bo'yoq to'plamlari" }
    ]
  },
  {
    id: "grocery_food",
    name: "Oziq-ovqat mahsulotlari",
    icon: "fa-bowl-food",
    color: "#16A34A",
    banner: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      { id: "coffee_tea", name: "Choy va donli qahvalar" },
      { id: "sweets_chocolate", name: "Shirinliklar va shokoladlar" },
      { id: "dried_fruits_nuts", name: "Quritilgan mevalar va yong'oqlar" },
      { id: "pasta_cereals", name: "Makaron va don mahsulotlari" },
      { id: "oils_spices", name: "Zaytun moyi va ziravorlar" },
      { id: "honey_jams", name: "Tabiiy asal va murabbolar" }
    ]
  },
  {
    id: "pet_supplies",
    name: "Uy hayvonlari uchun tovarlar",
    icon: "fa-paw",
    color: "#059669",
    banner: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      { id: "cat_food", name: "Mushuklar uchun ozuqa" },
      { id: "dog_food", name: "Kuchuklar uchun quruq ozuqa" },
      { id: "pet_beds_houses", name: "Uychalar va yumshoq to'shaklar" },
      { id: "pet_hygiene", name: "Gigiyena vositalari va qumlar" },
      { id: "pet_accessories", name: "Bo'yinbog'lar va o'yinchoqlar" },
      { id: "pet_carriers", name: "Hayvonlarni tashish sumkalari" }
    ]
  },
  {
    id: "garden_outdoor",
    name: "Bog‘ va tomorqa mahsulotlari",
    icon: "fa-seedling",
    color: "#65A30D",
    banner: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      { id: "lawn_mowers", name: "Maysazor o'rgichlar (gazonokosilka)" },
      { id: "garden_hoses", name: "Sug'orish shlanglari va nasoslar" },
      { id: "chainsaws_shears", name: "Benzopilalar va sekatorlar" },
      { id: "bbq_grills", name: "Mangallar va six to'plamlari" },
      { id: "garden_furniture", name: "Bog' mebellari va osma kreslolar" },
      { id: "garden_lights", name: "Quyosh panelli bog' chiroqlari" }
    ]
  },
  {
    id: "other_goods",
    name: "Boshqa tovarlar",
    icon: "fa-box-open",
    color: "#78716C",
    banner: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80",
    subcategories: [
      { id: "musical_instruments", name: "Musiqa asboblari va gitara" },
      { id: "suitcases_luggage", name: "Sayohat chamadonlari" },
      { id: "safes_lockboxes", name: "Kodsiz va kodli metall seyflar" },
      { id: "telescopes_binoculars", name: "Optik teleskoplar va binokllar" },
      { id: "board_games", name: "Shaxmat va stol o'yinlari" },
      { id: "souvenirs_gifts", name: "Esdalik sovg'alari to'plami" }
    ]
  }
];
