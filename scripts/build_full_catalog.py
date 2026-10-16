# scripts/build_full_catalog.py
# -*- coding: utf-8 -*-
import json
import os

CATEGORIES = [
    {
        "id": "phones_smartphones",
        "name": "Telefonlar va smartfonlar",
        "icon": "fa-mobile-screen-button",
        "color": "#7000FF",
        "banner": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
        "subcategories": [
            {"id": "flagship_smartphones", "name": "Flagman smartfonlar"},
            {"id": "budget_smartphones", "name": "Hamyonbop smartfonlar"},
            {"id": "push_button_phones", "name": "Tugmali telefonlar"},
            {"id": "phone_cases", "name": "G'ilof va himoya oynalari"},
            {"id": "powerbanks_chargers", "name": "Powerbank va zaryadlovchilar"}
        ]
    },
    {
        "id": "televisions",
        "name": "Televizorlar",
        "icon": "fa-tv",
        "color": "#0091FF",
        "banner": "https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=1200&q=80",
        "subcategories": [
            {"id": "smart_tv", "name": "Smart TV televizorlar"},
            {"id": "qled_oled", "name": "QLED va OLED televizorlar"},
            {"id": "4k_uhd", "name": "4K Ultra HD televizorlar"},
            {"id": "tv_brackets", "name": "Televizor kronshteynlari"},
            {"id": "tv_tuners_remotes", "name": "Pultlar va TV pristavkalar"}
        ]
    },
    {
        "id": "appliances",
        "name": "Maishiy texnika",
        "icon": "fa-blender",
        "color": "#00B664",
        "banner": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
        "subcategories": [
            {"id": "refrigerators", "name": "Sovutkichlar va muzlatkichlar"},
            {"id": "washing_machines", "name": "Kir yuvish mashinalari"},
            {"id": "air_conditioners", "name": "Konditsionerlar"},
            {"id": "vacuum_cleaners", "name": "Changyutgichlar"},
            {"id": "stoves_ovens", "name": "Gaz plitalari va pechlar"},
            {"id": "microwaves", "name": "Mikroto'lqinli pechlar"}
        ]
    },
    {
        "id": "computers_laptops",
        "name": "Kompyuterlar va noutbuklar",
        "icon": "fa-laptop",
        "color": "#4F46E5",
        "banner": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
        "subcategories": [
            {"id": "laptops", "name": "Noutbuklar va ultrabuklar"},
            {"id": "gaming_laptops", "name": "O'yin noutbuklari"},
            {"id": "monitors", "name": "Monitorlar"},
            {"id": "all_in_one", "name": "Monobloklar"},
            {"id": "pc_peripherals", "name": "Sichqoncha va klaviaturalar"},
            {"id": "pc_components", "name": "SSD va ehtiyot qismlar"}
        ]
    },
    {
        "id": "electronics_accessories",
        "name": "Elektronika va aksessuarlar",
        "icon": "fa-headphones",
        "color": "#9333EA",
        "banner": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
        "subcategories": [
            {"id": "wireless_headphones", "name": "Simsiz quloqchinlar"},
            {"id": "smart_watches", "name": "Smart-soatlar va brasletlar"},
            {"id": "bluetooth_speakers", "name": "Bluetooth dinamiklar"},
            {"id": "game_consoles", "name": "O'yin konsollari (PS5, Xbox)"},
            {"id": "cameras_drones", "name": "Foto va video kameralar"}
        ]
    },
    {
        "id": "men_clothing",
        "name": "Erkaklar kiyimi",
        "icon": "fa-shirt",
        "color": "#0284C7",
        "banner": "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=1200&q=80",
        "subcategories": [
            {"id": "men_shirts", "name": "Ko'ylaklar va pololar"},
            {"id": "men_tshirts", "name": "Futbolkalar va maykalar"},
            {"id": "men_hoodies", "name": "Xudilar va svitshotlar"},
            {"id": "men_pants", "name": "Shimlar va jinsilar"},
            {"id": "men_suits", "name": "Klassik kostyum va pidjaklar"},
            {"id": "men_jackets", "name": "Kurtkalar va paltolar"}
        ]
    },
    {
        "id": "women_clothing",
        "name": "Ayollar kiyimi",
        "icon": "fa-person-dress",
        "color": "#E11D48",
        "banner": "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
        "subcategories": [
            {"id": "women_dresses", "name": "Ko'ylaklar va sarafanlar"},
            {"id": "women_blouses", "name": "Bluzkalar va ko'ylaklar"},
            {"id": "women_pants", "name": "Shimlar va leggingslar"},
            {"id": "women_skirts", "name": "Yubkalar"},
            {"id": "women_suits", "name": "Ayollar kostyumlari"},
            {"id": "women_outerwear", "name": "Paltolar va kurtkalar"}
        ]
    },
    {
        "id": "kids_clothing",
        "name": "Bolalar kiyimi",
        "icon": "fa-child",
        "color": "#F59E0B",
        "banner": "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1200&q=80",
        "subcategories": [
            {"id": "boys_clothing", "name": "O'g'il bolalar kiyimi"},
            {"id": "girls_clothing", "name": "Qiz bolalar kiyimi"},
            {"id": "baby_bodysuits", "name": "Chaqaloqlar uchun kiyimlar"},
            {"id": "school_uniforms", "name": "Maktab formalari"},
            {"id": "kids_jackets", "name": "Bolalar kurtkalari"}
        ]
    },
    {
        "id": "summer_clothing",
        "name": "Yozgi kiyimlar",
        "icon": "fa-sun",
        "color": "#EAB308",
        "banner": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
        "subcategories": [
            {"id": "summer_shorts", "name": "Shortilar va brinjilar"},
            {"id": "summer_linen", "name": "Zig'ir (linen) kiyimlar"},
            {"id": "swimwear", "name": "Cho'milish kiyimlari"},
            {"id": "summer_hats", "name": "Panama va yozgi shlyapalar"},
            {"id": "light_dresses", "name": "Yengil shifon liboslar"}
        ]
    },
    {
        "id": "winter_clothing",
        "name": "Qishki kiyimlar",
        "icon": "fa-snowflake",
        "color": "#06B6D4",
        "banner": "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=1200&q=80",
        "subcategories": [
            {"id": "down_jackets", "name": "Puxoviklar va qishki kurtkalar"},
            {"id": "thermal_wear", "name": "Termokiyimlar va ichki kiyim"},
            {"id": "wool_sweaters", "name": "Jun sviterlar va jemperlar"},
            {"id": "winter_accessories", "name": "Shapkalar, sharflar va qo'lqoplar"},
            {"id": "ski_jackets", "name": "Chang'i va tog' kiyimlari"}
        ]
    },
    {
        "id": "footwear",
        "name": "Oyoq kiyimlar",
        "icon": "fa-shoe-prints",
        "color": "#84CC16",
        "banner": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
        "subcategories": [
            {"id": "sneakers", "name": "Krossovkalar va kedalar"},
            {"id": "classic_shoes", "name": "Klassik charm tuflilar"},
            {"id": "boots", "name": "Qishki botinkalar va etiklar"},
            {"id": "women_heels", "name": "Ayollar poshnali tuflilari"},
            {"id": "home_slippers", "name": "Uy shippaklari"},
            {"id": "sandals", "name": "Yozgi sandallar va shlyopkalar"}
        ]
    },
    {
        "id": "sports_gear",
        "name": "Sport kiyimlari va anjomlari",
        "icon": "fa-dumbbell",
        "color": "#EF4444",
        "banner": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
        "subcategories": [
            {"id": "exercise_machines", "name": "Trenajyorlar va yugurish yo'lakchalari"},
            {"id": "dumbbells_weights", "name": "Gantellar va shtangalar"},
            {"id": "bicycles_scooters", "name": "Velosipedlar va samokatlar"},
            {"id": "boxing_gear", "name": "Boks anjomlari va qo'lqoplar"},
            {"id": "sports_balls", "name": "Futbol va voleybol to'plari"},
            {"id": "yoga_fitness", "name": "Yoga gilamchalari va aksessuarlar"}
        ]
    },
    {
        "id": "furniture",
        "name": "Mebel",
        "icon": "fa-couch",
        "color": "#D97706",
        "banner": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
        "subcategories": [
            {"id": "sofas_armchairs", "name": "Divanlar va yumshoq mebel"},
            {"id": "beds_mattresses", "name": "Krovatlar va ortopedik matraslar"},
            {"id": "wardrobes", "name": "Shkaflar va komodlar"},
            {"id": "tables_chairs", "name": "Stol va stullar"},
            {"id": "office_chairs", "name": "Ofis kreslolari va stollari"},
            {"id": "coffee_tables", "name": "Jurnal va qahva stollari"}
        ]
    },
    {
        "id": "household",
        "name": "Uy-ro‘zg‘or buyumlari",
        "icon": "fa-house",
        "color": "#10B981",
        "banner": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
        "subcategories": [
            {"id": "lighting_lamps", "name": "Yoritish jihozlari va lyustralar"},
            {"id": "bedding_linens", "name": "Choyshablar va adyollar"},
            {"id": "carpets_curtains", "name": "Gilamlar va pardalar"},
            {"id": "bath_accessories", "name": "Hammom aksessuarlari"},
            {"id": "cleaning_supplies", "name": "Tozalash vositalari va sushilkalar"},
            {"id": "home_fragrance", "name": "Xushbo'y hid taratgichlar"}
        ]
    },
    {
        "id": "kitchenware",
        "name": "Oshxona anjomlari",
        "icon": "fa-kitchen-set",
        "color": "#F97316",
        "banner": "https://images.unsplash.com/photo-1556911073-38141963c9e0?auto=format&fit=crop&w=1200&q=80",
        "subcategories": [
            {"id": "cookware_pots", "name": "Qozonlar va tovalar to'plami"},
            {"id": "dinnerware_plates", "name": "Idish-tovoqlar va likopchalar"},
            {"id": "kitchen_knives", "name": "Oshxona pichoqlari va stendlar"},
            {"id": "glasses_mugs", "name": "Bakallar, krujkalar va piyolalar"},
            {"id": "kitchen_tools", "name": "Oshxona mayda anjomlari"},
            {"id": "thermoses", "name": "Termoslar va suv idishlari"}
        ]
    },
    {
        "id": "beauty_care",
        "name": "Go‘zallik va parvarish",
        "icon": "fa-spa",
        "color": "#EC4899",
        "banner": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
        "subcategories": [
            {"id": "perfumery", "name": "Atirlar va parfyumeriya"},
            {"id": "skincare", "name": "Teri va yuz parvarishi"},
            {"id": "haircare", "name": "Soch parvarishi va eliksirlar"},
            {"id": "shavers_trimmers", "name": "Elektr ustaralar va trimmerlar"},
            {"id": "hair_dryers_stylers", "name": "Fen va soch turmaklagichlar"},
            {"id": "makeup", "name": "Kosmetika va makiyaj"}
        ]
    },
    {
        "id": "kids_toys",
        "name": "Bolalar mahsulotlari va o‘yinchoqlar",
        "icon": "fa-baby-carriage",
        "color": "#14B8A6",
        "banner": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1200&q=80",
        "subcategories": [
            {"id": "lego_constructors", "name": "Konstruktorlar va LEGO"},
            {"id": "rc_cars", "name": "Masofadan boshqariladigan o'yinchoqlar"},
            {"id": "strollers", "name": "Bolalar aravachalari"},
            {"id": "educational_toys", "name": "Rivojlantiruvchi o'yinlar"},
            {"id": "soft_toys", "name": "Yumshoq o'yinchoqlar"},
            {"id": "electric_cars", "name": "Bolalar elektromobillari"}
        ]
    },
    {
        "id": "auto_accessories",
        "name": "Avtomobil aksessuarlari",
        "icon": "fa-car",
        "color": "#64748B",
        "banner": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
        "subcategories": [
            {"id": "dashcams", "name": "Videoregistratorlar"},
            {"id": "car_holders_chargers", "name": "Telefon ushlagichlar va zaryadlovchilar"},
            {"id": "car_vacuums", "name": "Avtomobil changyutgichlari"},
            {"id": "car_compressors", "name": "Avto kompressorlar (nasoslar)"},
            {"id": "seat_covers", "name": "Salon chexollari va gilamchalari"},
            {"id": "car_fragrances", "name": "Avtomobil xushbo'ylantirgichlari"}
        ]
    },
    {
        "id": "construction_tools",
        "name": "Qurilish va ta’mirlash",
        "icon": "fa-screwdriver-wrench",
        "color": "#EA580C",
        "banner": "https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=1200&q=80",
        "subcategories": [
            {"id": "power_drills", "name": "Elektr drel va perforatorlar"},
            {"id": "tool_sets", "name": "Asboblar to'plami va keyslar"},
            {"id": "laser_levels", "name": "Lazer daraja o'lchagichlar (uroven)"},
            {"id": "grinders_saws", "name": "Bolgarkalar va arralar"},
            {"id": "welding_machines", "name": "Payvandlash apparatlari (svarka)"},
            {"id": "measurement_tools", "name": "O'lchov asboblari va ruletkalar"}
        ]
    },
    {
        "id": "books_stationery",
        "name": "Kitoblar va kanselyariya",
        "icon": "fa-book-open",
        "color": "#6D28D9",
        "banner": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&q=80",
        "subcategories": [
            {"id": "fiction_books", "name": "Badiiy adabiyot va romanlar"},
            {"id": "business_psychology", "name": "Biznes va shaxsiy rivojlanish"},
            {"id": "children_books", "name": "Bolalar kitoblari va ertaklar"},
            {"id": "dictionaries_study", "name": "Lug'atlar va darsliklar"},
            {"id": "pens_notebooks", "name": "Ruchkalar va kundalik daftarlar"},
            {"id": "art_supplies", "name": "Chizmachilik va bo'yoq to'plamlari"}
        ]
    },
    {
        "id": "grocery_food",
        "name": "Oziq-ovqat mahsulotlari",
        "icon": "fa-bowl-food",
        "color": "#16A34A",
        "banner": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
        "subcategories": [
            {"id": "coffee_tea", "name": "Choy va donli qahvalar"},
            {"id": "sweets_chocolate", "name": "Shirinliklar va shokoladlar"},
            {"id": "dried_fruits_nuts", "name": "Quritilgan mevalar va yong'oqlar"},
            {"id": "pasta_cereals", "name": "Makaron va don mahsulotlari"},
            {"id": "oils_spices", "name": "Zaytun moyi va ziravorlar"},
            {"id": "honey_jams", "name": "Tabiiy asal va murabbolar"}
        ]
    },
    {
        "id": "pet_supplies",
        "name": "Uy hayvonlari uchun tovarlar",
        "icon": "fa-paw",
        "color": "#059669",
        "banner": "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1200&q=80",
        "subcategories": [
            {"id": "cat_food", "name": "Mushuklar uchun ozuqa"},
            {"id": "dog_food", "name": "Kuchuklar uchun quruq ozuqa"},
            {"id": "pet_beds_houses", "name": "Uychalar va yumshoq to'shaklar"},
            {"id": "pet_hygiene", "name": "Gigiyena vositalari va qumlar"},
            {"id": "pet_accessories", "name": "Bo'yinbog'lar va o'yinchoqlar"},
            {"id": "pet_carriers", "name": "Hayvonlarni tashish sumkalari"}
        ]
    },
    {
        "id": "garden_outdoor",
        "name": "Bog‘ va tomorqa mahsulotlari",
        "icon": "fa-seedling",
        "color": "#65A30D",
        "banner": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
        "subcategories": [
            {"id": "lawn_mowers", "name": "Maysazor o'rgichlar (gazonokosilka)"},
            {"id": "garden_hoses", "name": "Sug'orish shlanglari va nasoslar"},
            {"id": "chainsaws_shears", "name": "Benzopilalar va sekatorlar"},
            {"id": "bbq_grills", "name": "Mangallar va six to'plamlari"},
            {"id": "garden_furniture", "name": "Bog' mebellari va osma kreslolar"},
            {"id": "garden_lights", "name": "Quyosh panelli bog' chiroqlari"}
        ]
    },
    {
        "id": "other_goods",
        "name": "Boshqa tovarlar",
        "icon": "fa-box-open",
        "color": "#78716C",
        "banner": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80",
        "subcategories": [
            {"id": "musical_instruments", "name": "Musiqa asboblari va gitara"},
            {"id": "suitcases_luggage", "name": "Sayohat chamadonlari"},
            {"id": "safes_lockboxes", "name": "Kodsiz va kodli metall seyflar"},
            {"id": "telescopes_binoculars", "name": "Optik teleskoplar va binokllar"},
            {"id": "board_games", "name": "Shaxmat va stol o'yinlari"},
            {"id": "souvenirs_gifts", "name": "Esdalik sovg'alari to'plami"}
        ]
    }
]

# Curated product catalog items for all 24 categories
# Each entry will generate 22 diverse, realistic products for its category
CATEGORY_ITEMS_DEF = {
    "phones_smartphones": {
        "seller": "NovaTech Mobile Rasmiy Do'koni",
        "items": [
            ("Apple iPhone 16 Pro Max 256GB Cho'l Titani", "Apple", "iPhone 16 Pro Max", "flagship_smartphones", 16890000, 18500000, 9, "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=700&q=80", {"Ekran": "6.9 Super Retina XDR OLED", "Protsessor": "Apple A18 Pro", "Xotira": "256 GB", "Kamera": "48+48+12 MP"}),
            ("Samsung Galaxy S24 Ultra 12/512GB Kulrang Titan", "Samsung", "Galaxy S24 Ultra", "flagship_smartphones", 14290000, 15900000, 10, "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=700&q=80", {"Ekran": "6.8 Dynamic AMOLED 2X 120Hz", "Protsessor": "Snapdragon 8 Gen 3", "Xotira": "512 GB", "Kamera": "200+50+12+10 MP"}),
            ("Apple iPhone 16 128GB Moviy", "Apple", "iPhone 16", "flagship_smartphones", 11200000, 12500000, 10, "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=700&q=80", {"Ekran": "6.1 OLED Super Retina", "Protsessor": "Apple A18", "Xotira": "128 GB", "Kamera": "48+12 MP"}),
            ("Samsung Galaxy A55 5G 8/256GB Binafsharang", "Samsung", "Galaxy A55", "budget_smartphones", 4350000, 4800000, 9, "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=700&q=80", {"Ekran": "6.6 Super AMOLED 120Hz", "Protsessor": "Exynos 1480", "Xotira": "256 GB", "Batareya": "5000 mA/soat"}),
            ("Xiaomi 14 Ultra 16/512GB Leica Qora", "Xiaomi", "14 Ultra", "flagship_smartphones", 13500000, 14900000, 9, "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=700&q=80", {"Kamera": "50+50+50+50 MP Leica", "Ekran": "6.73 WQHD+ AMOLED", "Protsessor": "Snapdragon 8 Gen 3"}),
            ("Redmi Note 13 Pro+ 5G 12/512GB Oq", "Xiaomi", "Redmi Note 13 Pro+", "budget_smartphones", 4750000, 5300000, 10, "https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=700&q=80", {"Kamera": "200 MP OIS", "Zaryad": "120W tezkor zaryad", "Ekran": "1.5K AMOLED 120Hz"}),
            ("POCO F6 Pro 12/256GB Oq metall", "POCO", "F6 Pro", "budget_smartphones", 5100000, 5700000, 11, "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=700&q=80", {"Ekran": "WQHD+ Flow AMOLED", "Protsessor": "Snapdragon 8 Gen 2", "Zaryad": "120W HyperCharge"}),
            ("Honor Magic6 Pro 12/512GB Yashil", "Honor", "Magic6 Pro", "flagship_smartphones", 11800000, 12900000, 9, "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=700&q=80", {"Ekran": "6.8 LTPO OLED 120Hz", "Kamera": "180 MP Periscope Zoom", "Batareya": "5600 mA/soat"}),
            ("Google Pixel 9 Pro 128GB Obsidian", "Google", "Pixel 9 Pro", "flagship_smartphones", 12400000, 13800000, 10, "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=700&q=80", {"Protsessor": "Google Tensor G4", "Ekran": "6.3 Super Actua OLED", "AI": "Google Gemini o'rnatilgan"}),
            ("OnePlus 12 16/512GB Zumrad yashil", "OnePlus", "12", "flagship_smartphones", 9800000, 10900000, 10, "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=700&q=80", {"Ekran": "2K 120Hz ProXDR", "Kamera": "Hasselblad 4th Gen", "Batareya": "5400 mA/soat"}),
            ("Samsung Galaxy Z Fold6 12/256GB Kumush", "Samsung", "Z Fold6", "flagship_smartphones", 19900000, 22000000, 10, "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=700&q=80", {"Asosiy ekran": "7.6 Dynamic AMOLED 2X", "Buklanuvchi dizayn": "Armor Aluminum", "AI": "Galaxy AI"}),
            ("Nokia 105 4G Tugmali ishonchli telefon", "Nokia", "105 4G", "push_button_phones", 320000, 390000, 18, "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=700&q=80", {"Aloqa": "4G VoLTE", "Batareya": "1450 mA/soat (2 haftagacha)", "Fonarik": "Katta LED"}),
            ("Artel Mobile U5 Tugmali telefon", "Artel", "U5", "push_button_phones", 250000, 290000, 14, "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&w=700&q=80", {"SIM": "2 ta SIM-karta", "Radio": "FM antennasiz ishlaydi", "Kafolat": "1 yil"}),
            ("Baseus 65W GaN tezkor quvvatlagich 3-portli", "Baseus", "GaN5 Pro 65W", "powerbanks_chargers", 320000, 390000, 18, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=700&q=80", {"Quvvat": "65W Max", "Portlar": "2x Type-C + 1x USB-A", "Texnologiya": "GaN Fast"}),
            ("Anker 737 Powerbank 24000mAh 140W", "Anker", "737 PowerCore", "powerbanks_chargers", 1450000, 1680000, 14, "https://images.unsplash.com/photo-1609592424364-77292271bc20?auto=format&fit=crop&w=700&q=80", {"Sig'im": "24 000 mA/soat", "Quvvat": "140W ikki tomonlama", "Ekran": "Smart raqamli displey"}),
            ("Xiaomi Mi Power Bank 3 20000mAh 18W", "Xiaomi", "Power Bank 3", "powerbanks_chargers", 280000, 340000, 18, "https://images.unsplash.com/photo-1622445268048-2f4705504781?auto=format&fit=crop&w=700&q=80", {"Sig'im": "20 000 mA/soat", "Chiqish": "2x USB-A + 1x Type-C", "Himoya": "9 bosqichli xavfsizlik"}),
            ("Spigen Ultra Hybrid iPhone 16 Pro g'ilofi", "Spigen", "Ultra Hybrid", "phone_cases", 220000, 260000, 15, "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=700&q=80", {"Material": "TPU + Polikarbonat", "Himoya": "Air Cushion burchaklar", "Moslik": "MagSafe qo'llab-quvvatlaydi"}),
            ("Nillkin CamShield Pro Samsung S24 Ultra g'ilofi", "Nillkin", "CamShield Pro", "phone_cases", 160000, 195000, 18, "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=700&q=80", {"Kamera qopqog'i": "Siljuvchi pardali qopqoq", "Material": "Zarbalarga chidamli", "Rang": "Qora mot"}),
            ("Baseus 100W Type-C to Type-C kabel 2 metr", "Baseus", "Cafule 100W", "powerbanks_chargers", 95000, 120000, 21, "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=700&q=80", {"Tok kuchi": "100W 5A Power Delivery", "Uzunlik": "2 metr o'rilgan", "Tezlik": "480 Mbps ma'lumot uzatish"}),
            ("Hoco 20W PD Apple Lightning kabel 1.2m", "Hoco", "X38 Cool", "powerbanks_chargers", 45000, 60000, 25, "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=700&q=80", {"Quvvat": "20W tezkor zaryad", "Qoplama": "Mustahkam neylon", "Konnektor": "Zanglamaydigan qotishma"}),
            ("Smartfon Samsung Galaxy A15 6/128GB Moviy", "Samsung", "Galaxy A15", "budget_smartphones", 2200000, 2500000, 12, "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=700&q=80", {"Ekran": "6.5 Super AMOLED 90Hz", "Batareya": "5000 mA/soat", "Xotira": "128 GB"}),
            ("Smartfon Xiaomi Redmi 13C 8/256GB Yashil", "Xiaomi", "Redmi 13C", "budget_smartphones", 1950000, 2250000, 13, "https://images.unsplash.com/photo-1570891836654-d4961a7b6929?auto=format&fit=crop&w=700&q=80", {"Ekran": "6.74 90Hz", "Kamera": "50 MP AI", "Xotira": "256 GB"})
        ]
    },
    "televisions": {
        "seller": "NovaMarket Rasmiy TV Markazi",
        "items": [
            ("Samsung 65 Neo QLED 4K QN90D Smart TV", "Samsung", "QN90D 65", "qled_oled", 18900000, 21000000, 10, "https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=700&q=80", {"Ekran": "65 4K Neo QLED 144Hz", "Protsessor": "NQ4 AI Gen2", "Ovoz": "Dolby Atmos 60W", "Tizim": "Tizen OS"}),
            ("LG OLED 55 C4 4K evo Smart webOS TV", "LG", "OLED55C4", "qled_oled", 16500000, 18200000, 9, "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=700&q=80", {"Ekran": "55 4K OLED evo 144Hz", "Protsessor": "alpha 9 Gen7 AI", "Ovoz": "Dolby Vision & Atmos", "Geyming": "G-Sync va FreeSync"}),
            ("Sony Bravia 75 XR Mini-LED 4K Google TV", "Sony", "XR-75X95L", "4k_uhd", 28500000, 31000000, 8, "https://images.unsplash.com/photo-1577975882846-431adc8c2009?auto=format&fit=crop&w=700&q=80", {"Ekran": "75 4K Mini-LED", "Protsessor": "Cognitive Processor XR", "Ovoz": "Acoustic Multi-Audio", "Tizim": "Google TV"}),
            ("TCL 65 QLED 4K Google TV 120Hz DLG", "TCL", "65C645", "qled_oled", 7400000, 8200000, 10, "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=700&q=80", {"Ekran": "65 QLED 4K HDR10+", "Tizim": "Google TV", "Ovoz": "Onkyo Audio 2.1", "Geyming": "Game Master"}),
            ("Xiaomi TV A Pro 55 4K UHD Smart TV", "Xiaomi", "A Pro 55", "smart_tv", 4850000, 5400000, 10, "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=700&q=80", {"Ekran": "55 4K UHD Bezel-less", "Ovoz": "Dolby Audio 24W", "Tizim": "Google TV", "Xotira": "2GB RAM + 16GB ROM"}),
            ("Artel 43 Smart LED TV Android 11", "Artel", "43AF9000", "smart_tv", 2850000, 3200000, 11, "https://images.unsplash.com/photo-1528928441742-b4ccac1bb04c?auto=format&fit=crop&w=700&q=80", {"Ekran": "43 Full HD LED", "Tizim": "Android TV 11", "Tyuner": "DVB-T2/C/S2", "Kafolat": "3 yil to'liq kafolat"}),
            ("Hisense 50 4K UHD Smart VIDAA TV", "Hisense", "50A6K", "4k_uhd", 4200000, 4700000, 11, "https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=700&q=80", {"Ekran": "50 4K UHD Dolby Vision", "Tizim": "VIDAA U6", "Texnologiya": "DTS Virtual:X", "Sport rejimi": "AI Sports Mode"}),
            ("Samsung 55 Crystal 4K UHD DU7100 Smart TV", "Samsung", "UE55DU7100", "4k_uhd", 6200000, 6900000, 10, "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=700&q=80", {"Ekran": "55 Crystal UHD 4K", "Protsessor": "Crystal Processor 4K", "Tizim": "Tizen Smart Hub", "Dizayn": "AirSlim"}),
            ("LG 43 4K UHD AI ThinQ Smart TV", "LG", "43UT8000", "smart_tv", 4500000, 5000000, 10, "https://images.unsplash.com/photo-1577975882846-431adc8c2009?auto=format&fit=crop&w=700&q=80", {"Ekran": "43 4K Real UHD", "Protsessor": "alpha 5 Gen7 AI", "Tizim": "webOS 24", "Pult": "Magic Remote ovozli"}),
            ("Philips 55 The One Ambilight 4K TV", "Philips", "55PUS8818", "4k_uhd", 8900000, 9900000, 10, "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=700&q=80", {"Ekran": "55 4K 120Hz", "Yoritish": "3 tomonlama Ambilight", "Tizim": "Google TV", "Ovoz": "Bowers & Wilkins"}),
            ("Shivaki 32 Smart LED TV Android", "Shivaki", "32SH9000", "smart_tv", 1750000, 1950000, 10, "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=700&q=80", {"Ekran": "32 HD Ready", "Tizim": "Android Smart", "Wi-Fi": "Bor", "Oshxona va yotoqxona uchun": "Ideal o'lcham"}),
            ("Samsung The Frame 55 QLED Art Mode TV", "Samsung", "LS03D 55", "qled_oled", 14500000, 16200000, 11, "https://images.unsplash.com/photo-1528928441742-b4ccac1bb04c?auto=format&fit=crop&w=700&q=80", {"Rejim": "Art Mode san'at asari", "Ekran": "55 Matte Display QLED", "Ramka": "Almashuvchi magnit ramka"}),
            ("Xiaomi Mi TV Box S 2nd Gen 4K Media Player", "Xiaomi", "MDZ-28-AA", "tv_tuners_remotes", 620000, 720000, 14, "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=700&q=80", {"Ruxsat": "4K Ultra HD 60fps", "Tizim": "Google TV", "Xususiyatlar": "Dolby Vision va Atmos", "Xotira": "2GB + 8GB"}),
            ("Apple TV 4K 128GB Wi-Fi + Ethernet", "Apple", "MN893", "tv_tuners_remotes", 2250000, 2500000, 10, "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=700&q=80", {"Chip": "Apple A15 Bionic", "Ovoz": "Dolby Atmos Spatial Audio", "Pult": "Siri Remote USB-C", "Xotira": "128 GB"}),
            ("North Bayou NB F80 Monitor va TV kronshteyni", "North Bayou", "NB-F80", "tv_brackets", 280000, 350000, 20, "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=700&q=80", {"Moslik": "17 dan 32 dyuymgacha", "Gazlift": "Erkin 3D harakat", "Yuk ko'tarish": "9 kg gacha"}),
            ("Kronshteyn devoriy 32-65 dyuym buriluvchi", "Holdex", "HX-402", "tv_brackets", 210000, 270000, 22, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=700&q=80", {"Moslik": "32 dan 65 dyuymgacha", "VESA": "400x400 mm", "Burchak": "180 daraja burilish"}),
            ("Baseus 8K HDMI 2.1 kabel 3 metr", "Baseus", "High Definition 8K", "tv_tuners_remotes", 140000, 180000, 22, "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=700&q=80", {"Tezlik": "48 Gbps o'tkazuvchanlik", "Ruxsat": "8K 60Hz / 4K 120Hz", "Uzunlik": "3 metr o'rilgan"}),
            ("TCL 50 4K HDR Google TV Dolby Audio", "TCL", "50P635", "4k_uhd", 3800000, 4200000, 10, "https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=700&q=80", {"Ekran": "50 4K HDR 10", "Tizim": "Google TV", "Dizayn": "Metallic Bezel-less"}),
            ("LG 65 QNED 4K MiniLED 120Hz TV", "LG", "65QNED86", "qled_oled", 15200000, 16900000, 10, "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=700&q=80", {"Ekran": "65 QNED MiniLED", "Protsessor": "alpha 8 AI 4K", "Ovoz": "AI Sound Pro 9.1.2"}),
            ("Artel 32 Oddiy LED TV HD Tyunerli", "Artel", "32AH9000", "smart_tv", 1450000, 1650000, 12, "https://images.unsplash.com/photo-1577975882846-431adc8c2009?auto=format&fit=crop&w=700&q=80", {"Ekran": "32 HD LED", "Portlar": "USB + 2x HDMI", "Kafolat": "3 yil rasmiy Artel kafolati"}),
            ("Samsung 85 Crystal 4K Katta Ekran TV", "Samsung", "UE85DU7100", "4k_uhd", 18500000, 20500000, 10, "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=700&q=80", {"Ekran": "85 dyuym 4K Ultra HD", "Kinozal effekti": "Q-Symphony qo'llaydi", "Tizim": "Tizen OS"}),
            ("Universal Smart TV pulti Air Mouse va mikrofonli", "G20S", "Pro BT", "tv_tuners_remotes", 95000, 125000, 24, "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=700&q=80", {"Aloqa": "Bluetooth + 2.4G USB", "Giroskop": "Havo sichqonchasi", "Ovozli qidiruv": "Google Assistant"})
        ]
    }
}

def generate_full_catalog():
    all_products = []
    
    # 1. Add specific hand-crafted items for phones and televisions
    for cat_id, data in CATEGORY_ITEMS_DEF.items():
        seller = data["seller"]
        for idx, item in enumerate(data["items"]):
            name, brand, model, subcat, price, oldPrice, disc, img, specs = item
            prod_id = 1000 + len(all_products) + 1
            all_products.append({
                "id": prod_id,
                "name": name,
                "category": cat_id,
                "subCategory": subcat,
                "brand": brand,
                "model": model,
                "price": price,
                "oldPrice": oldPrice,
                "discount": disc,
                "monthlyInstallment": round(price / 12),
                "rating": round(4.7 + (idx % 4) * 0.1, 1),
                "reviewsCount": 18 + (idx * 17) % 250,
                "isFastDelivery": True,
                "inStock": 8 + (idx * 5) % 40,
                "image": img,
                "images": [img, img, img],
                "description": f"{brand} {model} — NovaMarket rasmiy kafolati bilan yuqori sifatli marketplace mahsuloti. Tezkor 1 kunda yetkazib berish va 0% muddatli to'lov mavjud.",
                "specs": specs,
                "colors": ["Qora", "Kumush", "Ko'k"],
                "sizes": ["Standart"],
                "seller": seller
            })

    # Curated templates and photo pools for remaining 22 categories
    category_templates = {
        "appliances": {
            "seller": "Artel & Bosch Official Tashkent",
            "images": [
                "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=700&q=80",
                "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=700&q=80",
                "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=700&q=80",
                "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=700&q=80",
                "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=700&q=80"
            ],
            "subcats": ["refrigerators", "washing_machines", "air_conditioners", "vacuum_cleaners", "stoves_ovens", "microwaves"],
            "brands": ["LG", "Samsung", "Bosch", "Artel", "Gree", "Beko", "Haier", "Tefal", "DeLonghi"],
            "titles": [
                ("Muzlatgich {brand} No Frost 380L Inverter", 7200000, 8100000, "refrigerators", {"Hajm": "380L", "Kompressor": "Smart Inverter"}),
                ("Kir yuvish mashinasi {brand} Eco Inverter 8kg", 4900000, 5600000, "washing_machines", {"Yuklama": "8 kg", "Aylanish": "1400 ayl/daq"}),
                ("Konditsioner {brand} Inverter 12000 BTU Wi-Fi", 5300000, 5950000, "air_conditioners", {"Maydon": "40 kv.m", "Freon": "R32"}),
                ("Changyutgich {brand} Siklon filtrli 2200W", 1350000, 1600000, "vacuum_cleaners", {"Quvvat": "2200W", "Filtr": "HEPA 13"}),
                ("Mikroto'lqinli pech {brand} 23L Biokeramika", 1250000, 1450000, "microwaves", {"Quvvat": "850W", "Hajm": "23L"}),
                ("Gaz plita {brand} 4 ko'zli elektr pechli", 3400000, 3900000, "stoves_ovens", {"Ko'zlar": "4 ta gaz", "Pech": "Elektr grilli"}),
                ("Robot changyutgich {brand} Lidar navigatsiyali", 3600000, 4200000, "vacuum_cleaners", {"So'rish": "4000 Pa", "Nam tozalash": "Bor"}),
                ("Avtomat kofemashina {brand} Espresso & Cappuccino", 5800000, 6600000, "microwaves", {"Bosim": "15 Bar", "Kapuchinator": "Avtomatik"}),
                ("Idish yuvish mashinasi {brand} 14 kishilik", 6200000, 7100000, "washing_machines", {"Sig'im": "14 komplekt", "Suv sarfi": "9.5L"}),
                ("Elektr choynak {brand} 1.7L zanglamaydigan po'lat", 380000, 460000, "stoves_ovens", {"Hajm": "1.7L", "Quvvat": "2200W"}),
                ("Blender {brand} 1200W titanium pichoqli", 540000, 650000, "stoves_ovens", {"Quvvat": "1200W", "Tezliklar": "5 bosqich"}),
                ("Dazmol {brand} bug' generatorli 2600W", 890000, 1050000, "washing_machines", {"Par zarbasi": "240 g/daq", "Taglik": "SteamGlide"})
            ]
        },
        "computers_laptops": {
            "seller": "NovaComputers Tashkent",
            "images": [
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&q=80",
                "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=700&q=80",
                "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=700&q=80",
                "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=80",
                "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=700&q=80"
            ],
            "subcats": ["laptops", "gaming_laptops", "monitors", "all_in_one", "pc_peripherals", "pc_components"],
            "brands": ["Apple", "ASUS", "Lenovo", "HP", "Dell", "Acer", "Logitech", "Razer", "Samsung"],
            "titles": [
                ("Apple MacBook Air 13 M3 16/512GB Space Gray", 16800000, 18500000, "laptops", {"Chip": "Apple M3", "Xotira": "16GB Unified", "SSD": "512GB"}),
                ("O'yin noutbuki {brand} RTX 4060 16GB/1TB 165Hz", 13900000, 15400000, "gaming_laptops", {"Videokarta": "RTX 4060 8GB", "Protsessor": "Intel i7-13700H"}),
                ("Noutbuk {brand} 15.6 IPS Core i5 16GB/512GB", 6800000, 7600000, "laptops", {"Ekran": "15.6 FHD IPS", "SSD": "512GB NVMe"}),
                ("Monitor {brand} 27 QHD 2K 165Hz Gaming IPS", 3100000, 3600000, "monitors", {"Ruxsat": "2560x1440 2K", "Chastota": "165Hz 1ms"}),
                ("Monitor {brand} 34 Curved Ultrawide 144Hz", 5900000, 6800000, "monitors", {"Ekran": "34 3440x1440 WQHD", "Egrilik": "1500R"}),
                ("Monoblok {brand} 24 Core i5 / 16GB / 512GB SSD", 7900000, 8900000, "all_in_one", {"Ekran": "23.8 FHD IPS", "Komplekt": "Simsiz klaviatura va sichqoncha"}),
                ("Mexanik klaviatura {brand} RGB Hot-swap simsiz", 850000, 990000, "pc_peripherals", {"Svitchlar": "Gateron Red", "Aloqa": "Bluetooth+2.4G+Type-C"}),
                ("Geymer sichqonchasi {brand} 26K DPI optik sensor", 520000, 620000, "pc_peripherals", {"DPI": "26000 DPI", "Og'irlik": "60g yengil"}),
                ("SSD to'plagich {brand} 1TB NVMe M.2 PCIe 4.0", 1150000, 1350000, "pc_components", {"Tezlik": "7450 MB/s", "Format": "M.2 2280"}),
                ("Operativ xotira {brand} DDR5 32GB (2x16GB) 6000MHz", 1450000, 1700000, "pc_components", {"Chastota": "6000 MHz", "Tayming": "CL30"}),
                ("Noutbuk tagligi sovutgichli {brand} 6 ta kulerli", 280000, 350000, "pc_peripherals", {"Ventilyatorlar": "6x LED kuler", "Podstavka": "Sozlanuvchi"}),
                ("Tizim bloki {brand} Core i5-13400F / RTX 3060 12GB", 9800000, 11000000, "all_in_one", {"Videokarta": "RTX 3060 12GB", "RAM": "16GB DDR4", "SSD": "1TB"})
            ]
        },
        "electronics_accessories": {
            "seller": "Audio & Gadget Store",
            "images": [
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80",
                "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=700&q=80",
                "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=700&q=80",
                "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=700&q=80"
            ],
            "subcats": ["wireless_headphones", "smart_watches", "bluetooth_speakers", "game_consoles", "cameras_drones"],
            "brands": ["Apple", "Sony", "JBL", "Marshall", "Samsung", "Xiaomi", "DJI", "GoPro"],
            "titles": [
                ("Apple AirPods Pro 2 USB-C faol shovqin bostiruvchi", 2950000, 3300000, "wireless_headphones", {"Chip": "Apple H2", "Shovqin bostirish": "2x faol ANC"}),
                ("Sony WH-1000XM5 simsiz premium naushnik", 4200000, 4800000, "wireless_headphones", {"Avtonomiya": "30 soat", "ANC": "8 ta mikrofonli"}),
                ("Marshall Stanmore III Bluetooth akustik kolonka", 4600000, 5200000, "bluetooth_speakers", {"Quvvat": "80W RMS", "Dizayn": "Klassik vinil"}),
                ("JBL Charge 5 suv o'tkazmaydigan portativ kolonka", 1850000, 2150000, "bluetooth_speakers", {"Suvga chidamlilik": "IP67", "Batareya": "20 soat"}),
                ("Apple Watch Series 10 GPS 46mm Jet Black", 5400000, 5900000, "smart_watches", {"Ekran": "Katta OLED", "Sensorlar": "EKG va yurak urishi"}),
                ("Sony PlayStation 5 Slim 1TB o'yin konsoli", 6400000, 7200000, "game_consoles", {"Xotira": "1 TB SSD", "Pult": "DualSense haptic"}),
                ("GoPro HERO 12 Black 5.3K Action kamera", 4900000, 5500000, "cameras_drones", {"Video": "5.3K 60fps", "Stabilizatsiya": "HyperSmooth 6.0"}),
                ("DJI Mini 4 Pro pultli ixcham kvadrokopter", 11500000, 12900000, "cameras_drones", {"Vazni": "249 g", "Masofa": "20 km FHD video uzatish"}),
                ("Samsung Galaxy Watch 6 Classic 47mm LTE", 3800000, 4300000, "smart_watches", {"Bezel": "Aylanuvchi mexanik", "Ekran": "Sapfir shisha"}),
                ("Xiaomi Sound Outdoor 30W simsiz kolonka", 650000, 780000, "bluetooth_speakers", {"Quvvat": "30W", "Himoya": "IP67 chang va suv"}),
                ("Geympad Sony DualSense PS5 simsiz pult", 890000, 1050000, "game_consoles", {"Aloqa": "Bluetooth", "Taktil": "Haptic Feedback"}),
                ("Boya BY-V20 ikkita simsiz mikrofon Type-C", 420000, 520000, "wireless_headphones", {"Masofa": "50 metr", "Qisqichli": "Smartfonlar uchun"})
            ]
        },
        "men_clothing": {
            "seller": "NovaMen Official Store",
            "images": [
                "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=700&q=80",
                "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=700&q=80",
                "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=700&q=80",
                "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80"
            ],
            "subcats": ["men_shirts", "men_tshirts", "men_hoodies", "men_pants", "men_suits", "men_jackets"],
            "brands": ["Zara Men", "Massimo Dutti", "Tommy Hilfiger", "Lacoste", "Nike", "Levi's", "Terra Pro"],
            "titles": [
                ("Erkaklar 100% paxtali klassik ko'ylak oq", 280000, 350000, "men_shirts", {"Mato": "100% tabiiy paxta", "Bichim": "Slim-fit"}),
                ("Erkaklar klassik ikki qismli kostyum-shim to'plami", 1450000, 1750000, "men_suits", {"Mato": "Jun va poliviskoza", "Astar": "Nafas oluvchi shoyi"}),
                ("Erkaklar qalin paxtali xudi sport uslubida", 340000, 420000, "men_hoodies", {"Mato": "3 ipli futer paxta", "Kapyushon": "Qalin ikki qavat"}),
                ("Erkaklar original Levi's 501 klassik jinsi shimi", 850000, 1050000, "men_pants", {"Model": "501 Original Straight", "Mato": "100% qalin denim"}),
                ("Erkaklar paxtali polo futbolkasi zamonaviy", 240000, 290000, "men_shirts", {"Mato": "Pike paxta", "Yoqa": "Trikotaj qattiq"}),
                ("Erkaklar yengil shamol o'tkazmaydigan kurtkasi", 680000, 820000, "men_jackets", {"Xususiyat": "Suv va shamoldan himoya", "Fasl": "Bahor/Kuz"}),
                ("Erkaklar kargo shimi paxtali ko'p cho'ntakli", 380000, 460000, "men_pants", {"Cho'ntaklar": "6 ta funksional", "Beldan": "Rezinka va tasma"}),
                ("Erkaklar kundalik asosiy paxtali futbolkalar to'plami (3 dona)", 210000, 270000, "men_tshirts", {"Paket": "3 dona (Oq, Qora, Kulrang)", "Mato": "100% paxta"}),
                ("Erkaklar qishki junli izolyatsiyalangan jiletkasi", 450000, 540000, "men_jackets", {"To'ldiruvchi": "Hollofiber", "Yengsiz": "Qulay harakat"}),
                ("Erkaklar sport to'plami (xudi va shim) paxtali", 520000, 640000, "men_hoodies", {"Mato": "Turkiya paxtasi", "Mavsum": "Bahor-Kuz"}),
                ("Erkaklar klassik charm kamari metall to'qa bilan", 160000, 210000, "men_pants", {"Material": "100% tabiiy buzoq charmi", "Eni": "3.5 sm"}),
                ("Erkaklar qalin qishki paltosi junli mato", 1650000, 1950000, "men_jackets", {"Tarkibi": "70% jun, 30% poliester", "Uzunlik": "Tizzagacha"})
            ]
        },
        "women_clothing": {
            "seller": "NovaLady Fashion House",
            "images": [
                "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=700&q=80",
                "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80",
                "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=700&q=80",
                "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=700&q=80"
            ],
            "subcats": ["women_dresses", "women_blouses", "women_pants", "women_skirts", "women_suits", "women_outerwear"],
            "brands": ["Mango", "Zara", "Massimo Dutti", "H&M", "Stradivarius", "Adl"],
            "titles": [
                ("Ayollar midi shoyi ko'ylak belbog'li nafis", 480000, 590000, "women_dresses", {"Mato": "Viskoza va atlas shoyi", "Uzunlik": "Midi"}),
                ("Ayollar klassik ikki bortli kostyumi (pidjak va shim)", 1250000, 1490000, "women_suits", {"Mato": "Klassik kostyumbop", "Rang": "Krem va qora"}),
                ("Ayollar oq ipak bluzkasi bayramona yoqali", 320000, 390000, "women_blouses", {"Mato": "Sun'iy ipak", "Yeng": "Manshetli uzun"}),
                ("Ayollar keng palazzo shimi yuqori bel bilan", 360000, 440000, "women_pants", {"Bichim": "Keng palazzo", "Bel": "Elastik yuqori bel"}),
                ("Ayollar paxtali oversize xudi yumshoq astarli", 350000, 420000, "women_outerwear", {"Mato": "Turk paxtasi", "Bichim": "Oversize qulay"}),
                ("Ayollar pliseli trapesiya yubkasi zamonaviy", 290000, 360000, "women_skirts", {"Mato": "Shifon astarli", "Bel": "Qulay rezinka"}),
                ("Ayollar kashmir jun kardigan tugmali V-yoqa", 420000, 510000, "women_outerwear", {"Tarkibi": "Kashmir va jun aralashmasi", "Fasl": "Bahor-Kuz"}),
                ("Ayollar klassik trenjkot paltosi qum rangli", 1100000, 1350000, "women_outerwear", {"Uzunlik": "Tizzadan past", "Suv o'tkazmas": "Maxsus qoplama"}),
                ("Ayollar sport leggings va top to'plami fitnes", 340000, 420000, "women_pants", {"Texnologiya": "Seamless choksiz", "Effect": "Push-up bel"}),
                ("Ayollar yozgi havodor sarafan gul bosmali", 380000, 460000, "women_dresses", {"Mato": "100% yengil shtapel", "Bichim": "Erkin"}),
                ("Ayollar charm kurtkasi zamonaviy bayker uslubida", 780000, 950000, "women_outerwear", {"Material": "Eko-charm yumshoq", "Fasl": "Demisezon"}),
                ("Ayollar paxtali qulay uy pijama to'plami", 270000, 340000, "women_dresses", {"Mato": "Organik paxta", "Komplekt": "Ko'ylak va shim"})
            ]
        }
    }

    # Add the remaining 20 categories dynamically
    remaining_cats = [c for c in CATEGORIES if c["id"] not in ["phones_smartphones", "televisions", "appliances", "computers_laptops", "electronics_accessories", "men_clothing", "women_clothing"]]
    
    # Pre-crafted specific product names and properties per remaining category
    generic_domains = {
        "kids_clothing": {
            "seller": "Baby & Kids Fashion",
            "img": "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=700&q=80",
            "items": [
                ("O'g'il bolalar paxtali sport to'plami (xudi va shim)", 280000, 340000, "boys_clothing"),
                ("Qiz bolalar bayramona chiroyli ko'ylagi tul bilan", 320000, 390000, "girls_clothing"),
                ("Chaqaloqlar uchun organik paxta bodi to'plami (5 dona)", 210000, 260000, "baby_bodysuits"),
                ("Bolalar qishki kombinezoni suv o'tkazmaydigan", 650000, 780000, "kids_jackets"),
                ("O'g'il bolalar maktab kostyumi va shimi to'plami", 580000, 700000, "school_uniforms"),
                ("Qiz bolalar maktab sarfani va jaketi", 420000, 510000, "school_uniforms"),
                ("Bolalar paxtali pijama to'plami yoqimli printli", 160000, 200000, "boys_clothing"),
                ("Bolalar qalin jinsi shimi elastik bel bilan", 220000, 270000, "boys_clothing"),
                ("Bolalar shamolga chidamli kapyushonli kurtkasi", 380000, 460000, "kids_jackets"),
                ("Qiz bolalar trikotaj kardigani naqshli", 240000, 290000, "girls_clothing"),
                ("Bolalar paxtali futbolkalar to'plami (3 dona)", 150000, 190000, "boys_clothing"),
                ("Chaqaloqlar konvert-adyoli jundan", 260000, 320000, "baby_bodysuits")
            ]
        },
        "summer_clothing": {
            "seller": "Summer Breeze Collection",
            "img": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80",
            "items": [
                ("Erkaklar yozgi zig'ir (linen) shortilari qulay", 230000, 290000, "summer_shorts"),
                ("Ayollar yengil havodor shifon yozgi ko'ylagi", 390000, 480000, "light_dresses"),
                ("Erkaklar plyaj shortilari tez quriydigan matoli", 160000, 210000, "swimwear"),
                ("Ayollar cho'milish kiyimi (bikini va pareo to'plami)", 280000, 350000, "swimwear"),
                ("Uniseks paxtali panama shlyapa quyoshdan saqlovchi", 95000, 130000, "summer_hats"),
                ("Erkaklar qisqa yengli zig'ir ko'ylak nafas oluvchi", 290000, 360000, "summer_linen"),
                ("Ayollar yozgi paxtali krop-top va shorti to'plami", 240000, 300000, "summer_shorts"),
                ("Ayollar somon shlyapasi keng hoshiyali quyoshga qarshi", 140000, 180000, "summer_hats"),
                ("Erkaklar yozgi yengil paxtali brinjilari", 195000, 245000, "summer_shorts"),
                ("Ayollar yozgi ipakli kombinezoni tasmali", 420000, 520000, "light_dresses"),
                ("Bolalar yozgi paxtali qumloq to'plami futbolka va shorti", 145000, 185000, "summer_shorts"),
                ("Quyoshdan himoyalovchi yengil yozgi kepka paxtali", 85000, 115000, "summer_hats")
            ]
        },
        "winter_clothing": {
            "seller": "Nordic Warmth Winter Store",
            "img": "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=700&q=80",
            "items": [
                ("Erkaklar qalin g'oz pati bilan to'ldirilgan puxovik", 1450000, 1750000, "down_jackets"),
                ("Ayollar uzun qishki kurtkasi tabiiy mo'yna yoqali", 1580000, 1890000, "down_jackets"),
                ("Uniseks qishki termokiyim to'plami faol isituvchi", 320000, 390000, "thermal_wear"),
                ("100% merinos juni qalin sviter baland yoqali", 480000, 590000, "wool_sweaters"),
                ("Erkaklar qishki junli izolyatsiyalangan kargo shimi", 390000, 470000, "thermal_wear"),
                ("Qishki jun shapka va uzun sharf to'plami uniseks", 180000, 230000, "winter_accessories"),
                ("Sensorli ekranlar uchun qishki charm qo'lqoplar junli", 140000, 185000, "winter_accessories"),
                ("Ayollar qalin qishki dublyonkasi zamonaviy eko-mo'yna", 1250000, 1500000, "down_jackets"),
                ("Erkaklar tog' chang'i kurtkasi suv o'tkazmaydigan membranali", 980000, 1200000, "ski_jackets"),
                ("Bolalar qishki qalin jun paypoqlari (3 juft)", 75000, 100000, "winter_accessories"),
                ("Ayollar qishki trikotaj ko'ylagi issiq matoli", 380000, 460000, "wool_sweaters"),
                ("Erkaklar qishki harbiy uslubdagi alyaska parkasi", 1150000, 1400000, "down_jackets")
            ]
        },
        "footwear": {
            "seller": "NovaShoes Footwear",
            "img": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80",
            "items": [
                ("Nike Air Jordan 1 Retro High krossovkalari", 1650000, 1950000, "sneakers"),
                ("Adidas Ultraboost Light professional yugurish krossovkasi", 1450000, 1720000, "sneakers"),
                ("New Balance 9060 kundalik zamonaviy krossovkalari", 1350000, 1600000, "sneakers"),
                ("Erkaklar tabiiy buzoq charmidan klassik oksford tuflilari", 890000, 1080000, "classic_shoes"),
                ("Ayollar nafis baland poshnali qora tuflilari bayramona", 580000, 710000, "women_heels"),
                ("Timberland 6-Inch Premium qishki suv o'tkazmaydigan botinkalari", 1850000, 2200000, "boots"),
                ("UGG Classic Ultra Mini qishki etiklari tabiiy qo'y junli", 1100000, 1350000, "boots"),
                ("Puma Suede Classic zamonaviy ko'cha kedalari", 780000, 940000, "sneakers"),
                ("Asics Gel-Kayano 30 yugurish sport poyabzali", 1550000, 1850000, "sneakers"),
                ("Erkaklar qulay yumshoq charm mokasinalari", 480000, 590000, "classic_shoes"),
                ("Ayollar zamonaviy loferlari metall zanjirli qora", 420000, 520000, "classic_shoes"),
                ("Qulay ortopedik uy shippaklari tabiiy kigizli", 120000, 160000, "home_slippers")
            ]
        },
        "sports_gear": {
            "seller": "SportMaster Uzbekistan",
            "img": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=700&q=80",
            "items": [
                ("Trinx M100 Pro tog' velosipedi 26 alyuminiy rama", 2450000, 2890000, "bicycles_scooters"),
                ("Torneo 20 kg xromlangan portativ gantellar to'plami", 680000, 850000, "dumbbells_weights"),
                ("Xiaomi WalkingPad R2 buklanuvchi yugurish yo'lakchasi", 5900000, 6800000, "exercise_machines"),
                ("Everlast charm boks qoplari va qo'lqoplari to'plami", 850000, 1050000, "boxing_gear"),
                ("Adidas Champions League rasmiy termo-chokli futbol to'pi", 420000, 520000, "sports_balls"),
                ("Mikasa V200W professional voleybol to'pi FIVB tasdiqlagan", 680000, 820000, "sports_balls"),
                ("Yoga va fitnes uchun 10mm sirpanmaydigan gilamcha (mat)", 195000, 250000, "yoga_fitness"),
                ("Kettler ko'p funksiyali uy turnik-brus devoriy kompleksi", 750000, 920000, "exercise_machines"),
                ("Fitnes elastik rezinkalar to'plami 5 ta turli qarshilikli", 95000, 130000, "yoga_fitness"),
                ("Izolyatsiyalangan sport termobutulkasi 1000ml zanglamaydigan", 140000, 180000, "yoga_fitness"),
                ("Velosiped xavfsizlik dubulg'asi aerodinamik chiroqli", 260000, 330000, "bicycles_scooters"),
                ("Elektrosamokat Xiaomi Mi Electric Scooter 4 Pro", 7200000, 8400000, "bicycles_scooters")
            ]
        },
        "furniture": {
            "seller": "NovaMebel Uy va Ofis",
            "img": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=80",
            "items": [
                ("Skandinavcha uslubdagi keng burchak divani yotoq mexanizmli", 5800000, 6900000, "sofas_armchairs"),
                ("Askona ortopedik ikki kishilik krovat va 7-zonalik matras", 7200000, 8500000, "beds_mattresses"),
                ("Ochilib-yopiluvchi 6 kishilik ovqatlanish stoli va stullar", 4500000, 5400000, "tables_chairs"),
                ("3 eshikli zamonaviy kiyim shkafi oyna va tortmalar bilan", 3800000, 4600000, "wardrobes"),
                ("Ergonomik to'rli ofis kreslosi bel tayanchi va bosh suyanchiq bilan", 1450000, 1780000, "office_chairs"),
                ("Loft uslubidagi eman daraxti sirtli zamonaviy yozuv stoli", 1250000, 1550000, "tables_chairs"),
                ("Mehmonxona uchun zamonaviy osma TV tumbasi va javonlar", 1850000, 2250000, "coffee_tables"),
                ("Yumshoq baxmal kreslo oyoq tayanchi (pufik) bilan", 1650000, 1980000, "sofas_armchairs"),
                ("4 qavatli poyabzal javoni (obuvnitsa) qulay o'rindiq bilan", 780000, 950000, "wardrobes"),
                ("Bolalar uchun ikki qavatli xavfsiz yog'och krovat", 4200000, 5100000, "beds_mattresses"),
                ("Kofe stoli metall karkas va marmar sirti bilan", 680000, 840000, "coffee_tables"),
                ("Yotoqxona uchun 2 ta tumba to'plami yashirin tortmali", 890000, 1100000, "beds_mattresses")
            ]
        },
        "household": {
            "seller": "Home Comfort Tashkent",
            "img": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80",
            "items": [
                ("LED kristall zamonaviy osma lyustra pultli 3 xil rangda", 1450000, 1800000, "lighting_lamps"),
                ("100% Misr paxtasidan ikki kishilik hashamatli choyshab to'plami", 580000, 720000, "bedding_linens"),
                ("Qalin jakkardli yorug'lik o'tkazmaydigan pardalar (Blackout)", 420000, 530000, "carpets_curtains"),
                ("Yumshoq xona gilami 2x3 metr qalin zich to'qilgan", 1350000, 1680000, "carpets_curtains"),
                ("Bambuk hammom aksessuarlari to'plami 4 qismli", 240000, 310000, "bath_accessories"),
                ("Qalin mikrofibra hammom sochiqlari to'plami (4 dona)", 195000, 250000, "bath_accessories"),
                ("Ultratovushli xushbo'y hid beruvchi havo namlagich chiroqli", 260000, 340000, "home_fragrance"),
                ("Metall kiyim quritgich (sushilka) 20m osma sig'imli", 280000, 360000, "cleaning_supplies"),
                ("Bug'li dazmol taxtasi rozetka va metall sim ushlagich bilan", 380000, 480000, "cleaning_supplies"),
                ("Kir yuvish uchun 3 bo'limli qulay g'ildirakli savat", 210000, 280000, "cleaning_supplies"),
                ("Anatomik xotirali ortopedik yostiq Memory Foam", 290000, 370000, "bedding_linens"),
                ("Stol usti LED sensorli o'qish lampasi yorqinligi sozlanuvchi", 175000, 230000, "lighting_lamps")
            ]
        },
        "kitchenware": {
            "seller": "Chef Cuisine Official",
            "img": "https://images.unsplash.com/photo-1556911073-38141963c9e0?auto=format&fit=crop&w=700&q=80",
            "items": [
                ("Tefal Ingenio 12 qismli olinadigan tutqichli qozonlar to'plami", 2450000, 2900000, "cookware_pots"),
                ("Zanglamaydigan po'latdan 6 qismli oshpaz pichoqlari stend bilan", 480000, 610000, "kitchen_knives"),
                ("Luminarc 24 kishilik fransuz shisha idish-tovoqlar to'plami", 850000, 1050000, "dinnerware_plates"),
                ("Chexiya kristall bakallari to'plami (6 dona)", 380000, 480000, "glasses_mugs"),
                ("Elektr choynak va keramika damlagich to'plami stendli", 520000, 650000, "thermoses"),
                ("Silikon oshxona anjomlari to'plami (12 dona yog'och tutqichli)", 210000, 280000, "kitchen_tools"),
                ("Cho'yan qovurish tovasi chuqur qopqoqli 28 sm", 320000, 410000, "cookware_pots"),
                ("Non saqlash qutisi (xlebnitsa) bambuk qopqoqli metall", 240000, 310000, "kitchen_tools"),
                ("Ziravorlar uchun 16 qismli aylanuvchi metall stend", 280000, 360000, "kitchen_tools"),
                ("Zanglamaydigan termos-choynak 2L harorat ko'rsatgichli", 195000, 255000, "thermoses"),
                ("Granit qoplamali vafli va sendvich pishirgich 3-in-1", 340000, 430000, "cookware_pots"),
                ("Shisha havo o'tkazmaydigan oziq-ovqat konteynerlari to'plami (5 dona)", 165000, 220000, "kitchen_tools")
            ]
        },
        "beauty_care": {
            "seller": "NovaBeauty Cosmetics",
            "img": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=700&q=80",
            "items": [
                ("Dior Sauvage Eau de Parfum erkaklar atiri 100ml", 1950000, 2300000, "perfumery"),
                ("Chanel Coco Mademoiselle ayollar parfyumi 100ml", 2150000, 2550000, "perfumery"),
                ("Dyson Supersonic feni magnit nozullar bilan fuksiya", 5800000, 6700000, "hair_dryers_stylers"),
                ("Philips Series 9000 elektr ustarasi nam va quruq soqol", 2450000, 2900000, "shavers_trimmers"),
                ("Braun Silk-expert Pro 5 fotoepilyator uy sharoitida", 4600000, 5400000, "shavers_trimmers"),
                ("La Roche-Posay Anthelios SPF50+ quyoshdan himoya kremi", 260000, 320000, "skincare"),
                ("Estee Lauder Advanced Night Repair yuz zardobi 50ml", 1150000, 1400000, "skincare"),
                ("Olaplex No.3 sochni tiklovchi professional eliksir", 380000, 470000, "haircare"),
                ("Oral-B iO Series 9 aqlli elektr tish cho'tkasi", 2800000, 3300000, "shavers_trimmers"),
                ("The Ordinary Niacinamide 10% + Zinc 1% yuz zardobi", 145000, 185000, "skincare"),
                ("Maybelline Sky High uzaytiruvchi tush va pomada to'plami", 160000, 210000, "makeup"),
                ("Soch tekislovchi titan dazmol Babyliss Pro", 680000, 840000, "hair_dryers_stylers")
            ]
        },
        "kids_toys": {
            "seller": "ToyLand Uzbekistan",
            "img": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=700&q=80",
            "items": [
                ("LEGO City 60316 Politsiya uchastkasi 668 qismli", 890000, 1050000, "lego_constructors"),
                ("Chicco Bravo Trio Travel System universal bolalar aravachasi", 3200000, 3800000, "strollers"),
                ("Mercedes-Benz G63 masofadan boshqariladigan bolalar elektromobili", 2850000, 3400000, "electric_cars"),
                ("Magnitli konstruktor 100 qismli rivojlantiruvchi to'plam", 290000, 370000, "educational_toys"),
                ("Katta interaktiv gapiruvchi ayiqcha bolalar uchun", 340000, 430000, "soft_toys"),
                ("Yog'ochdan yasalgan Montessori mantiqiy o'yinlar taxtasi", 220000, 280000, "educational_toys"),
                ("Bolalar uchun chizma molberti ikki tomonlama doska bilan", 360000, 450000, "educational_toys"),
                ("Hot Wheels 10 ta metall poyga mashinalari to'plami", 210000, 270000, "rc_cars"),
                ("Barbie Dreamhouse katta 3 qavatli qo'g'irchoq uyi", 1650000, 2000000, "educational_toys"),
                ("Bolalar uchun yumshoq proyektor yulduzli osmon chirog'i", 175000, 230000, "soft_toys"),
                ("Masofadan boshqariladigan tezyurar 4x4 drift mashinasi", 390000, 490000, "rc_cars"),
                ("LEGO Technic 42151 Bugatti Bolide poyga avtomobili", 650000, 780000, "lego_constructors")
            ]
        },
        "auto_accessories": {
            "seller": "AvtoLux Official Store",
            "img": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=700&q=80",
            "items": [
                ("Videoregistrator 70mai Dash Cam Pro Plus+ A500S GPS va Wi-Fi", 890000, 1100000, "dashcams"),
                ("Baseus 15W simsiz tezkor zaryadlovchi avtomobil telefon ushlagichi", 320000, 390000, "car_holders_chargers"),
                ("Baseus A2 Pro portativ avtomobil changyutgichi 6000Pa", 380000, 460000, "car_vacuums"),
                ("70mai portativ avto kompressor (nasos) raqamli manometrli", 490000, 590000, "car_compressors"),
                ("EVA 3D salon poliklari barcha mashinalar uchun universal", 350000, 440000, "seat_covers"),
                ("Avtomobil uchun charm chexollar to'plami anatomik yostiqli", 1250000, 1550000, "seat_covers"),
                ("Baseus metall avtomobil xushbo'ylantirgichi panelli", 95000, 130000, "car_fragrances"),
                ("Avtomobil akkumulyatorini tezkor yurgizuvchi Powerbank Booster 12000mAh", 680000, 830000, "car_holders_chargers"),
                ("Avtomobil yuvish uchun yuqori bosimli ko'pikli pistolet", 220000, 280000, "car_vacuums"),
                ("Avto oynalari uchun qishki muz erituvchi va antifog spreyi", 65000, 90000, "car_fragrances"),
                ("70mai orqa ko'rinish kamerasi RC06 to'liq to'plam", 260000, 330000, "dashcams"),
                ("Avtomobil eshiklariga o'rnatiluvchi himoya rezina lentalari", 45000, 65000, "seat_covers")
            ]
        },
        "construction_tools": {
            "seller": "Master Tool Building",
            "img": "https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=700&q=80",
            "items": [
                ("Bosch Professional GBH 2-26 DRE perforator 800W keysda", 1650000, 1950000, "power_drills"),
                ("DeWalt 20V simsiz drel-shurupovert 2 ta akkumulyator bilan", 1450000, 1750000, "power_drills"),
                ("Deko 168 qismli universal metall asboblar to'plami keysda", 680000, 850000, "tool_sets"),
                ("Huepar 3D 12 chiziqli yashil nurli lazer uroven pultli", 1150000, 1400000, "laser_levels"),
                ("Total 2200W burchakli maydalagich (bolgarka) 230mm", 780000, 940000, "grinders_saws"),
                ("Crown 2000W qurilish feni harorat regulyatori bilan", 360000, 450000, "power_drills"),
                ("Stanley 8 metrli magnitli lenta o'lchagich (ruletka)", 120000, 160000, "measurement_tools"),
                ("Inverter payvandlash apparati (svarka) Resanta 220A", 1350000, 1650000, "welding_machines"),
                ("Ingco havoli kraskapult bo'yoq purkash moslamasi 800ml", 280000, 360000, "power_drills"),
                ("To'liq elektriklar asboblar to'plami raqamli multimetr bilan", 420000, 520000, "tool_sets"),
                ("Bosch sirkulyar qo'l arrasi 1400W 190mm diskli", 1100000, 1350000, "grinders_saws"),
                ("Optik lazer masofa o'lchagich (lazernaya ruletka) 60m", 290000, 380000, "measurement_tools")
            ]
        },
        "books_stationery": {
            "seller": "Hilol Nashr & Kitoblar Dunyosi",
            "img": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=700&q=80",
            "items": [
                ("Jeyms Klir «Atom Odatlari» — O'zbek tilida qattiq muqovada", 75000, 95000, "business_psychology"),
                ("Abdulla Qodiriy «O'tkan Kunlar» va «Mehrobdan Chayon» sovg'abop", 120000, 150000, "fiction_books"),
                ("Robert Kiyosaki «Boy Ota, Kambag'al Ota» bestseller", 65000, 85000, "business_psychology"),
                ("Brayan Treysi «Chala qolgan ishlarni unuting» vaqt boshqaruvi", 55000, 75000, "business_psychology"),
                ("Katta O'zbekcha-Inglizcha ensiklopedik lug'at 100 000 so'z", 140000, 180000, "dictionaries_study"),
                ("O'zbekiston Milliy Ensiklopediyasi rangli suratlar bilan", 220000, 280000, "dictionaries_study"),
                ("Bolalar uchun ertaklar va mantiqiy jumboqlar kitobi", 45000, 65000, "children_books"),
                ("Parker Jotter original metall sharikli ruchka qutida", 260000, 330000, "pens_notebooks"),
                ("Moleskine klassik qattiq muqovali kundalik daftar (bloknot)", 185000, 240000, "pens_notebooks"),
                ("Deli 72 rangli professional akvarel qalamlar to'plami", 145000, 190000, "art_supplies"),
                ("Antuan de Sent-Ekzyuperi «Kichkina Shahzoda» bezakli nashr", 50000, 70000, "fiction_books"),
                ("Kantselyariya to'plami (skotch, qaychi, zımba, qisqichlar)", 85000, 115000, "pens_notebooks")
            ]
        },
        "grocery_food": {
            "seller": "NovaMarket Supermarket",
            "img": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=80",
            "items": [
                ("Lavazza Qualita Oro tabiiy arabika donli qahvasi 1kg", 320000, 390000, "coffee_tea"),
                ("Ahmad Tea Earl Grey xushbo'y qora choyi bergamotli 500g", 85000, 110000, "coffee_tea"),
                ("Lindt Excellence 85% achchiq Shveysariya shokoladi (5 dona)", 195000, 250000, "sweets_chocolate"),
                ("Monini Extra Virgin sovuq presslangan zaytun moyi 1 litr", 175000, 220000, "oils_spices"),
                ("Barilla Spaghetti No.5 italyan makaroni 500g (5 pachka)", 95000, 125000, "pasta_cereals"),
                ("O'zbekistonning tabiiy tog' asali toza asal 1kg shisha bankada", 140000, 180000, "honey_jams"),
                ("Samarkand quritilgan saralangan mevalari va yong'oqlari 1kg", 160000, 210000, "dried_fruits_nuts"),
                ("Ferrero Rocher bayramona shokolad konfetlari qutisi 300g", 125000, 160000, "sweets_chocolate"),
                ("Lipton Yellow Label yuqori sifatli qora choy 500g", 65000, 85000, "coffee_tea"),
                ("Nutella findiqli shokolad kremi 750g oilaviy bankada", 98000, 125000, "sweets_chocolate"),
                ("Basmati saralangan uzun guruchi 2kg premium to'plam", 85000, 110000, "pasta_cereals"),
                ("Zanjabil va limonli tabiiy murabbo 450g", 42000, 58000, "honey_jams")
            ]
        },
        "pet_supplies": {
            "seller": "ZooLand Pet Supplies",
            "img": "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=700&q=80",
            "items": [
                ("Royal Canin kattalar mushuklari uchun premium quruq ozuqa 4kg", 460000, 560000, "cat_food"),
                ("Pro Plan kichik zotli kuchuklar uchun to'laqonli ozuqa 3kg", 390000, 480000, "dog_food"),
                ("Mushuklar uchun 3 qavatli tirnoq charxlash majmuasi va uycha", 480000, 610000, "pet_beds_houses"),
                ("Kuchuklar uchun avtomatik lenta bo'yinbog' (ruletka) 5 metrli", 145000, 190000, "pet_accessories"),
                ("Mushuklar uchun bentonit gigiyenik qum (to'ldirgich) 10L lavanda", 85000, 115000, "pet_hygiene"),
                ("Hayvonlar uchun avtomatik suv favvorasi (fontan) filtrli 2.5L", 240000, 310000, "pet_accessories"),
                ("Kuchuk va mushuklar junini tarash uchun massaj cho'tkasi", 75000, 105000, "pet_hygiene"),
                ("Mushuklar uchun interaktiv aylanuvchi lazer o'yinchoq", 120000, 160000, "pet_accessories"),
                ("Hayvonlarni tashish uchun qulay ventilyatsiyali sumka-boks", 260000, 330000, "pet_carriers"),
                ("Kuchuklar uchun tish tozalovchi o'yinchoq suyaklar to'plami", 65000, 90000, "pet_accessories"),
                ("Kuchuklar uchun qishki issiq kiyim-kombinezon suv o'tkazmaydigan", 185000, 240000, "pet_accessories"),
                ("Mushuklar uchun silika-gel hid yo'qotuvchi qum 5L", 110000, 145000, "pet_hygiene")
            ]
        },
        "garden_outdoor": {
            "seller": "Garden & Yard Tools Tashkent",
            "img": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=700&q=80",
            "items": [
                ("Bosch ARM 32 elektr maysazor o'rgich (gazonokosilka) 1200W", 1750000, 2100000, "lawn_mowers"),
                ("Gardena 20 metrli o'zi yig'iluvchi sug'orish shlangi va pistolet", 680000, 830000, "garden_hoses"),
                ("Stihl 2 taktli kuchli benzinli zanjirli arra (benzopila)", 1950000, 2350000, "chainsaws_shears"),
                ("Fiskars professional bog'dorchilik sekatori (qaychi)", 220000, 280000, "chainsaws_shears"),
                ("Qalin metall shashlik mangali 12 ta zanglamaydigan six bilan", 480000, 600000, "bbq_grills"),
                ("Bog' va veranda uchun chidamli osma kreslo-pilla (kokon)", 1850000, 2250000, "garden_furniture"),
                ("Qorong'uda avtomatik yonuvchi quyosh panelli bog' chiroqlari (8 ta)", 190000, 250000, "garden_lights"),
                ("Karcher K5 yuqori bosimli ko'chma avto va bog' moykasi", 3450000, 4100000, "garden_hoses"),
                ("Bog'dorchilik o'g'itlari va ko'katlar urug'lari katta to'plami", 95000, 130000, "garden_furniture"),
                ("Dala hovli uchun yig'iluvchi alyuminiy stol va 4 stul to'plami", 1450000, 1780000, "garden_furniture"),
                ("Daraxt shoxlarini kesuvchi uzun teleskopik arra Gardena", 360000, 450000, "chainsaws_shears"),
                ("Bog' uchun suv purkovchi avtomatik aylanuvchi nasadkalar", 85000, 115000, "garden_hoses")
            ]
        },
        "other_goods": {
            "seller": "NovaMarket Universal Mall",
            "img": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=700&q=80",
            "items": [
                ("Yamaha F310 akustik gitara g'ilof va mediatorlar bilan", 1950000, 2300000, "musical_instruments"),
                ("Samsonite 4 g'ildirakli mustahkam sayohat chamadoni 75L", 1850000, 2200000, "suitcases_luggage"),
                ("Elektron kodli metall seyf uy va ofis uchun A4 sig'imli", 890000, 1100000, "safes_lockboxes"),
                ("Celestron AstroMaster 70AZ fazoviy teleskop shtativ bilan", 2450000, 2900000, "telescopes_binoculars"),
                ("Bushnell 10x42 suv o'tkazmaydigan sayyohlik binokli", 780000, 950000, "telescopes_binoculars"),
                ("Casio CT-S300 dinamik klaviaturali professional sintezator", 2650000, 3100000, "musical_instruments"),
                ("Shveytsariya ko'p qirrali armiya pichog'i Victorinox 14 funksiyali", 420000, 520000, "souvenirs_gifts"),
                ("Qo'lda o'yilgan yog'och shaxmat va shashka katta taxtasi bilan", 380000, 480000, "board_games"),
                ("Qimmatbaho esdalik sovg'alar to'plami Parker va charm hamyon", 450000, 560000, "souvenirs_gifts"),
                ("Monopoliya klassik stol o'yini o'zbek va rus tillarida", 160000, 210000, "board_games"),
                ("Sayohat uchun orqa ryukzaki noutbuk bo'limi va USB portli", 280000, 360000, "suitcases_luggage"),
                ("Yong'inga chidamli hujjatlar uchun maxsus metall keys", 650000, 800000, "safes_lockboxes")
            ]
        }
    }

    # Generate products for all remaining categories
    for cat in CATEGORIES:
        cid = cat["id"]
        # Skip phones and tvs as they were added in first phase
        if cid in ["phones_smartphones", "televisions"]:
            continue
            
        conf = generic_domains.get(cid, generic_domains.get("household"))
        seller = conf.get("seller", "NovaMarket Rasmiy Do'koni")
        base_img = conf.get("img", cat["banner"])
        items = conf.get("items", [])
        
        # We need at least 22 items per category
        idx = 0
        while len([p for p in all_products if p["category"] == cid]) < 22:
            template = items[idx % len(items)]
            name_base, price, oldPrice, subcat = template
            cycle = (idx // len(items))
            
            # Create distinct variations if cycle > 0
            if cycle == 0:
                name = name_base
                final_price = price
                final_old = oldPrice
            elif cycle == 1:
                name = f"{name_base} (Premium Nashr / To'plam)"
                final_price = int(price * 1.15)
                final_old = int(oldPrice * 1.18)
            else:
                name = f"{name_base} (Model V{cycle + 1})"
                final_price = int(price * 0.92)
                final_old = int(oldPrice * 0.95)
                
            disc = round(((final_old - final_price) / final_old) * 100) if final_old > final_price else 0
            prod_id = 1000 + len(all_products) + 1
            
            all_products.append({
                "id": prod_id,
                "name": name,
                "category": cid,
                "subCategory": subcat,
                "brand": cat["name"].split()[0],
                "model": f"NV-{cid[:3].upper()}-{100 + idx}",
                "price": final_price,
                "oldPrice": final_old,
                "discount": disc,
                "monthlyInstallment": round(final_price / 12),
                "rating": round(4.6 + (idx % 5) * 0.08, 1),
                "reviewsCount": 15 + (idx * 13) % 200,
                "isFastDelivery": True,
                "inStock": 10 + (idx * 7) % 50,
                "image": base_img,
                "images": [base_img, base_img, base_img],
                "description": f"{name} — NovaMarket platformasida eng ko'p sotilayotgan va ishonchli xaridorlar bahosiga ega mahsulot. 1 kunda yetkazib berish va 0% muddatli to'lov (nasiya) kafolatlanadi.",
                "specs": {
                    "Kategoriya": cat["name"],
                    "Kafolat": "1 yil rasmiy kafolat",
                    "Yetkazib berish": "1 kunda bepul (PVZ)",
                    "Ishlab chiqaruvchi": "Original sertifikatlangan"
                },
                "colors": ["Standart", "Qora", "Oq"],
                "sizes": ["M", "L", "XL"] if "clothing" in cid else ["Standart"],
                "seller": seller
            })
            idx += 1

    return all_products

products = generate_full_catalog()
print(f"Generated {len(products)} products across {len(CATEGORIES)} categories.")

# Count per category
counts = {}
for p in products:
    counts[p["category"]] = counts.get(p["category"], 0) + 1

for cat in CATEGORIES:
    print(f" - {cat['name']} ({cat['id']}): {counts.get(cat['id'], 0)} mahsulot")

# Write to src/data/categories.js
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cat_path = os.path.join(base_dir, "src", "data", "categories.js")
prod_path = os.path.join(base_dir, "src", "data", "products.js")

with open(cat_path, "w", encoding="utf-8") as f:
    f.write("/**\n * NovaMarket — 24 Asosiy Kategoriyalar Ro'yxati (Marketplace Taxonomy)\n */\n")
    f.write("export const CATEGORIES = ")
    f.write(json.dumps(CATEGORIES, ensure_ascii=False, indent=2))
    f.write(";\n")

print(f"Saved CATEGORIES to {cat_path}")

with open(prod_path, "w", encoding="utf-8") as f:
    f.write("/**\n * NovaMarket — Katta Mahsulotlar Katalogi (500+ Products across all 24 categories)\n")
    f.write(" * Real rasmlar, to'liq texnik xususiyatlar, o'zbekcha tavsiflar va so'mdagi narxlar.\n */\n")
    f.write("export const INITIAL_PRODUCTS = ")
    f.write(json.dumps(products, ensure_ascii=False, indent=2))
    f.write(";\n")

print(f"Saved INITIAL_PRODUCTS ({len(products)} items) to {prod_path}")
