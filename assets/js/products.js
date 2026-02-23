// Sajigaz Designs — Product Data Store

const PRODUCTS = [
    {
        id: 1,
        name: "Luxury Gift Hamper",
        category: "hampers",
        categoryName: "Gift Hampers",
        price: 1299,
        originalPrice: 1699,
        rating: 4.8,
        reviews: 124,
        image: "assets/img/products/gift_hamper.png",
        images: ["assets/img/products/gift_hamper.png"],
        badge: "Best Seller",
        badgeType: "bestseller",
        description: "A stunning luxury gift hamper curated with premium chocolates, scented candles, and surprises wrapped in our signature purple-gold packaging. Perfect for birthdays, anniversaries, and celebrations.",
        details: ["Premium quality items", "Signature Sajigaz packaging", "Customizable message card", "Free gift wrapping", "Same-day delivery available"],
        tags: ["birthday", "anniversary", "luxury"],
        featured: true
    },
    {
        id: 2,
        name: "Birthday Surprise Box",
        category: "gift-boxes",
        categoryName: "Gift Boxes",
        price: 899,
        originalPrice: 1199,
        rating: 4.7,
        reviews: 89,
        image: "assets/img/products/birthday_box.png",
        images: ["assets/img/products/birthday_box.png"],
        badge: "New",
        badgeType: "new",
        description: "Make every birthday unforgettable with our signature surprise box. Filled with goodies and wrapped in our magical purple-magenta theme that screams celebration!",
        details: ["Surprise assortment inside", "Vibrant themed packaging", "Add-on balloon option", "Personalized name print", "Eco-friendly materials"],
        tags: ["birthday", "celebration", "surprise"],
        featured: true
    },
    {
        id: 3,
        name: "Personalized Photo Frame",
        category: "personalized",
        categoryName: "Personalized Gifts",
        price: 599,
        originalPrice: 799,
        rating: 4.9,
        reviews: 203,
        image: "assets/img/products/photo_frame.png",
        images: ["assets/img/products/photo_frame.png"],
        badge: "Top Pick",
        badgeType: "toppick",
        description: "Capture your most cherished memories in our beautifully crafted personalized photo frame. Decorated with floral designs and customized with your chosen name or message.",
        details: ["High-quality print on premium wood", "Custom name or message", "Available in multiple sizes", "Ready to hang or display", "Perfect keepsake gift"],
        tags: ["personalized", "photo", "memories"],
        featured: true
    },
    {
        id: 4,
        name: "Luxury Candle Gift Set",
        category: "hampers",
        categoryName: "Gift Hampers",
        price: 749,
        originalPrice: 999,
        rating: 4.6,
        reviews: 67,
        image: "assets/img/products/candle_set.png",
        images: ["assets/img/products/candle_set.png"],
        badge: "Sale",
        badgeType: "sale",
        description: "Indulge the senses with our premium scented candle set. Presented in elegant glass jars with dried flowers, this set makes the perfect self-care or gifting package.",
        details: ["Premium natural wax candles", "3 signature fragrances", "Dried flower decoration", "Gold packaging box", "Burns for 40+ hours"],
        tags: ["candle", "wellness", "luxury"],
        featured: false
    },
    {
        id: 5,
        name: "Premium Chocolate Box",
        category: "gift-boxes",
        categoryName: "Gift Boxes",
        price: 649,
        originalPrice: 849,
        rating: 4.8,
        reviews: 156,
        image: "assets/img/products/chocolate_box.png",
        images: ["assets/img/products/chocolate_box.png"],
        badge: "Love Special",
        badgeType: "special",
        description: "Sweeten every special moment with our premium heart-shaped chocolate box. Crafted with artisan chocolates and dressed in our signature red-bow packaging.",
        details: ["16 premium chocolate pieces", "Heart-shaped arrangement", "Signature red ribbon bow", "Comes in gift bag", "Shelf life: 30 days"],
        tags: ["chocolate", "valentine", "love"],
        featured: true
    },
    {
        id: 6,
        name: "Custom Printed Mug",
        category: "personalized",
        categoryName: "Personalized Gifts",
        price: 399,
        originalPrice: 549,
        rating: 4.5,
        reviews: 445,
        image: "assets/img/products/mug.png",
        images: ["assets/img/products/mug.png"],
        badge: "Popular",
        badgeType: "popular",
        description: "Start the day with a smile! Our custom printed mugs feature vibrant designs, names, or your favorite quotes. A simple yet meaningful gift for any occasion.",
        details: ["High-quality ceramic", "Custom text or image", "Dishwasher safe", "330ml capacity", "Color options available"],
        tags: ["personalized", "mug", "daily"],
        featured: false
    },
    {
        id: 7,
        name: "Name Keychain Set",
        category: "personalized",
        categoryName: "Personalized Gifts",
        price: 299,
        originalPrice: 399,
        rating: 4.4,
        reviews: 312,
        image: "assets/img/products/keychain.png",
        images: ["assets/img/products/keychain.png"],
        badge: "Budget Pick",
        badgeType: "budget",
        description: "Carry a piece of love wherever you go! Our personalized acrylic keychains come in vivid colors with your name or initials — a tiny gift with a big heart.",
        details: ["Premium acrylic material", "Custom name/initials", "Multiple color options", "Sturdy metal ring", "Perfect as return gifts"],
        tags: ["keychain", "personalized", "mini"],
        featured: false
    },
    {
        id: 8,
        name: "Festive Gift Combo",
        category: "hampers",
        categoryName: "Gift Hampers",
        price: 1599,
        originalPrice: 2199,
        rating: 4.9,
        reviews: 78,
        image: "assets/img/products/gift_hamper.png",
        images: ["assets/img/products/gift_hamper.png"],
        badge: "Festival Edition",
        badgeType: "festival",
        description: "The ultimate festive combo! Packed with sweets, chocolates, candles, a photo frame, and our signature greeting card. The most complete celebratory package Sajigaz offers.",
        details: ["8 curated items inside", "Festival themed packaging", "Free greeting card", "Customizable contents", "Bulk order discounts available"],
        tags: ["festival", "combo", "diwali"],
        featured: true
    }
];

const CATEGORIES = [
    {
        id: "hampers",
        name: "Gift Hampers",
        icon: "redeem",
        description: "Curated hampers for every occasion",
        count: PRODUCTS.filter(p => p.category === "hampers").length,
        color: "#5C2D91"
    },
    {
        id: "gift-boxes",
        name: "Gift Boxes",
        icon: "inventory_2",
        description: "Premium boxes wrapped to impress",
        count: PRODUCTS.filter(p => p.category === "gift-boxes").length,
        color: "#E1173F"
    },
    {
        id: "personalized",
        name: "Personalized Gifts",
        icon: "auto_awesome",
        description: "Made with your personal touch",
        count: PRODUCTS.filter(p => p.category === "personalized").length,
        color: "#F5A623"
    }
];

// Utility
function getProductById(id) {
    return PRODUCTS.find(p => p.id === parseInt(id));
}

function getProductsByCategory(cat) {
    if (!cat || cat === 'all') return PRODUCTS;
    return PRODUCTS.filter(p => p.category === cat);
}

function getFeaturedProducts() {
    return PRODUCTS.filter(p => p.featured);
}

function formatPrice(price) {
    return '₹' + price.toLocaleString('en-IN');
}

function getDiscountPercent(original, current) {
    return Math.round(((original - current) / original) * 100);
}
