const mongoose = require('mongoose');
const dotenv = require('dotenv');
const QRCode = require('qrcode');

dotenv.config();

const User = require('../models/User');
const Table = require('../models/Table');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');

const connectDB = require('../config/db');

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seeder] Clearing existing data...');
    await User.deleteMany();
    await Table.deleteMany();
    await Category.deleteMany();
    await MenuItem.deleteMany();
    await Order.deleteMany();

    console.log('[Seeder] Seeding Users...');
    // Retail Demo accounts
    const users = await User.create([
      {
        name: 'Elena Vance (General Manager)',
        email: 'manager@dineflow.com',
        password: 'password123',
        role: 'manager',
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        phone: '+1 555-0199',
      },
      {
        name: 'Elena Vance (Admin Alias)',
        email: 'admin@dineflow.com',
        password: 'password123',
        role: 'manager',
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        phone: '+1 555-0199',
      },
      {
        name: 'Marco Bellini (Kitchen Head)',
        email: 'kitchen@dineflow.com',
        password: 'password123',
        role: 'kitchen',
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=200&q=80',
        phone: '+1 555-0177',
      },
      {
        name: 'Alex Rivera (Floor Waiter)',
        email: 'waiter@dineflow.com',
        password: 'password123',
        role: 'waiter',
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        phone: '+1 555-0144',
      },
    ]);

    console.log('[Seeder] Seeding Categories...');
    const categories = await Category.create([
      {
        name: 'Starters',
        slug: 'starters',
        description: 'Artisanal appetizers and palate warmers',
        displayOrder: 1,
        icon: 'Sparkles',
      },
      {
        name: 'Mains',
        slug: 'mains',
        description: 'Signature entrees and gourmet chef specialties',
        displayOrder: 2,
        icon: 'UtensilsCrossed',
      },
      {
        name: 'Desserts',
        slug: 'desserts',
        description: 'Decadent sweets and handcrafted patisserie',
        displayOrder: 3,
        icon: 'Cake',
      },
      {
        name: 'Beverages',
        slug: 'beverages',
        description: 'Botanical mocktails, craft sodas & specialty infusions',
        displayOrder: 4,
        icon: 'Wine',
      },
    ]);

    console.log('[Seeder] Seeding 16+ Gourmet Menu Items...');
    const menuItems = await MenuItem.create([
      // Starters
      {
        name: 'Truffle & Burrata Bruschetta',
        category: 'Starters',
        price: 480,
        description: 'Creamy artisanal Puglia burrata on toasted sourdough with shaved black summer truffles, aged balsamic reduction & microbasil.',
        imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=800&q=80',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chef-preparing-a-salad-41315-large.mp4',
        dietaryTags: ['Veg', 'Chef Special'],
        spiceLevels: ['Mild', 'Medium'],
        customizations: [
          { name: 'Extra Shaved Truffle', price: 180 },
          { name: 'Gluten-Free Crostini', price: 60 },
          { name: 'Prosciutto Crisp', price: 140 },
        ],
        preparationTimeMinutes: 12,
        calories: 380,
        rating: 4.9,
      },
      {
        name: 'Crispy Calamari Fritti',
        category: 'Starters',
        price: 540,
        description: 'Tender Monterey squid dusted in sea salt & smoked paprika, flash-fried with charred lemon and saffron-garlic aioli.',
        imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-chef-cooking-in-a-pan-43403-large.mp4',
        dietaryTags: ['Non-Veg'],
        spiceLevels: ['Mild', 'Medium', 'Hot'],
        customizations: [
          { name: 'Extra Saffron Aioli', price: 50 },
          { name: 'Spicy Togarashi Dusting', price: 30 },
        ],
        preparationTimeMinutes: 10,
        calories: 420,
        rating: 4.7,
      },
      {
        name: 'Wild Forest Mushroom Cappuccino',
        category: 'Starters',
        price: 390,
        description: 'Velvety soup of porcini, morel and chanterelle mushrooms crowned with truffle froth and herbed brioche soldier.',
        imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-putting-garnishes-on-a-soup-41316-large.mp4',
        dietaryTags: ['Veg', 'Gluten-Free'],
        spiceLevels: ['Mild'],
        customizations: [
          { name: 'Extra Truffle Froth', price: 70 },
          { name: 'Garlic Butter Croutons', price: 40 },
        ],
        preparationTimeMinutes: 15,
        calories: 260,
        rating: 4.8,
      },
      {
        name: 'Smoked Salmon Avocado Tartare',
        category: 'Starters',
        price: 590,
        description: 'Loch Fyne oak-smoked salmon diced with Haas avocado, shallots, capers, yuzu dressing and nori crisps.',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chef-plating-a-salmon-dish-41318-large.mp4',
        dietaryTags: ['Non-Veg', 'Gluten-Free'],
        spiceLevels: ['Mild', 'Medium'],
        customizations: [
          { name: 'Caviar Pearl Garnish', price: 220 },
          { name: 'Avocado Extra Layer', price: 80 },
        ],
        preparationTimeMinutes: 12,
        calories: 340,
        rating: 4.9,
      },

      // Mains
      {
        name: 'Slow-Braised Rosemary Lamb Shank',
        category: 'Mains',
        price: 890,
        description: '6-hour braised New Zealand lamb shank resting over creamy parmesan polenta, heirloom baby carrots & natural jus reduction.',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chef-plating-a-dish-with-tongs-41317-large.mp4',
        dietaryTags: ['Non-Veg', 'Chef Special'],
        spiceLevels: ['Mild', 'Medium', 'Hot'],
        customizations: [
          { name: 'Truffle Mashed Potatoes', price: 120 },
          { name: 'Extra Lamb Red Wine Glaze', price: 90 },
          { name: 'Charred Asparagus Spear', price: 110 },
        ],
        preparationTimeMinutes: 22,
        calories: 780,
        rating: 5.0,
      },
      {
        name: 'Pan-Seared Chilean Sea Bass',
        category: 'Mains',
        price: 980,
        description: 'Glazed Chilean sea bass with lemongrass-ginger emulsion, wild asparagus, sautéed edamame and saffron risotto.',
        imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cooking-salmon-on-a-pan-43402-large.mp4',
        dietaryTags: ['Non-Veg', 'Gluten-Free'],
        spiceLevels: ['Mild', 'Medium'],
        customizations: [
          { name: 'Side of Lobster Mac & Cheese', price: 240 },
          { name: 'Lemon Herb Butter Infusion', price: 70 },
        ],
        preparationTimeMinutes: 20,
        calories: 620,
        rating: 4.9,
      },
      {
        name: 'Handcrafted Truffle Tagliolini',
        category: 'Mains',
        price: 680,
        description: 'Fresh artisanal egg pasta tossed in Normandy butter emulsion, 36-month Parmigiano-Reggiano and copious fresh black truffle shavings.',
        imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fresh-pasta-in-a-pan-43405-large.mp4',
        dietaryTags: ['Veg', 'Chef Special'],
        spiceLevels: ['Mild', 'Medium'],
        customizations: [
          { name: 'Double Shaved Truffle', price: 200 },
          { name: 'Burrata Cheese Topping', price: 150 },
        ],
        preparationTimeMinutes: 16,
        calories: 590,
        rating: 4.9,
      },
      {
        name: 'Grilled Wagyu Ribeye Steak (250g)',
        category: 'Mains',
        price: 1250,
        description: 'A5 Miyazaki Wagyu ribeye with marble score 8, served with roasted marrow bone, smoked Maldon salt & chimichurri.',
        imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chef-searing-a-meat-steak-43404-large.mp4',
        dietaryTags: ['Non-Veg'],
        spiceLevels: ['Medium', 'Hot', 'Extra Spicy'],
        customizations: [
          { name: 'Pan-Seared Foie Gras Slice', price: 350 },
          { name: 'Cognac Peppercorn Sauce', price: 100 },
          { name: 'Parmesan Truffle Fries', price: 130 },
        ],
        preparationTimeMinutes: 25,
        calories: 890,
        rating: 5.0,
      },
      {
        name: 'Wild Forest Wildflower Risotto',
        category: 'Mains',
        price: 590,
        description: 'Acquerello aged carnaroli rice simmered in vegetable stock, wild morels, edible wildflower petals and vegan aged parmesan.',
        imageUrl: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chef-preparing-a-salad-41315-large.mp4',
        dietaryTags: ['Veg', 'Vegan', 'Gluten-Free'],
        spiceLevels: ['Mild', 'Medium'],
        customizations: [
          { name: 'Extra Wild Morel Mushrooms', price: 120 },
          { name: 'Vegan Truffle Cream', price: 90 },
        ],
        preparationTimeMinutes: 18,
        calories: 460,
        rating: 4.8,
      },

      // Desserts
      {
        name: 'Grand Cru Dark Chocolate Lava Sphere',
        category: 'Desserts',
        price: 420,
        description: '70% Valrhona dark chocolate warm molten cake topped with Madagascar bourbon vanilla bean gelato and gold leaf.',
        imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chocolate-dessert-with-ice-cream-41320-large.mp4',
        dietaryTags: ['Veg', 'Chef Special'],
        spiceLevels: ['Mild'],
        customizations: [
          { name: 'Extra Scoop Bourbon Gelato', price: 90 },
          { name: 'Warm Salted Caramel Drizzle', price: 60 },
          { name: '24K Edible Gold Leaf', price: 150 },
        ],
        preparationTimeMinutes: 14,
        calories: 520,
        rating: 5.0,
      },
      {
        name: 'Espresso Amaretto Tiramisu',
        category: 'Desserts',
        price: 360,
        description: 'Savoiardi ladyfingers soaked in single-origin Illy espresso & Disaronno, layered with mascarpone sabayon & Valrhona cocoa.',
        imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chocolate-dessert-with-ice-cream-41320-large.mp4',
        dietaryTags: ['Veg'],
        spiceLevels: ['Mild'],
        customizations: [
          { name: 'Double Espresso Shot Side', price: 50 },
          { name: 'Amaretti Biscuit Crunch', price: 40 },
        ],
        preparationTimeMinutes: 8,
        calories: 410,
        rating: 4.9,
      },
      {
        name: 'Passionfruit Mango Panna Cotta',
        category: 'Desserts',
        price: 340,
        description: 'Silky coconut cream panna cotta topped with Alphonso mango coulis, passionfruit seeds and mint crisps.',
        imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chef-plating-a-dish-with-tongs-41317-large.mp4',
        dietaryTags: ['Veg', 'Vegan', 'Gluten-Free'],
        spiceLevels: ['Mild'],
        customizations: [
          { name: 'Fresh Raspberry Compote', price: 60 },
          { name: 'Toasted Coconut Chips', price: 30 },
        ],
        preparationTimeMinutes: 6,
        calories: 310,
        rating: 4.8,
      },

      // Beverages
      {
        name: 'Smoked Rosemary Citrus Spritz',
        category: 'Beverages',
        price: 280,
        description: 'Handcrafted mocktail with cold-pressed ruby red grapefruit, yuzu, sparkling tonic, torched organic rosemary & botanicals.',
        imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cocktail-being-poured-into-a-glass-41319-large.mp4',
        dietaryTags: ['Veg', 'Vegan', 'Gluten-Free'],
        spiceLevels: ['Mild'],
        customizations: [
          { name: 'Chia Seeds Boost', price: 30 },
          { name: 'Extra Torched Botanical Smoke', price: 50 },
        ],
        preparationTimeMinutes: 5,
        calories: 120,
        rating: 4.8,
      },
      {
        name: 'Matcha Lavender Cloud Latte',
        category: 'Beverages',
        price: 260,
        description: 'Ceremonial grade Uji Kyoto matcha whisked with oat milk, organic French lavender syrup and cold velvet foam.',
        imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cocktail-being-poured-into-a-glass-41319-large.mp4',
        dietaryTags: ['Veg', 'Vegan'],
        spiceLevels: ['Mild'],
        customizations: [
          { name: 'Almond Milk Sub', price: 30 },
          { name: 'Double Matcha Intensity', price: 60 },
        ],
        preparationTimeMinutes: 6,
        calories: 160,
        rating: 4.9,
      },
      {
        name: 'Yuzu Ginger Blossom Fizz',
        category: 'Beverages',
        price: 290,
        description: 'Japanese yuzu, organic cold-pressed ginger root, elderflower tonic, butterfly pea flower tea layer and lemon wheels.',
        imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cocktail-being-poured-into-a-glass-41319-large.mp4',
        dietaryTags: ['Veg', 'Vegan', 'Gluten-Free'],
        spiceLevels: ['Mild', 'Medium'],
        customizations: [
          { name: 'Fresh Mint Infusion', price: 25 },
          { name: 'Organic Honey Swirl', price: 40 },
        ],
        preparationTimeMinutes: 5,
        calories: 140,
        rating: 4.7,
      },
      {
        name: 'Single-Origin Ethiopian Cold Brew',
        category: 'Beverages',
        price: 240,
        description: '24-hour steeped Yirgacheffe coffee beans with notes of bergamot, jasmine and dark berries, served over crystal clear ice rock.',
        imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cocktail-being-poured-into-a-glass-41319-large.mp4',
        dietaryTags: ['Veg', 'Vegan', 'Gluten-Free'],
        spiceLevels: ['Mild'],
        customizations: [
          { name: 'Vanilla Bean Cream Float', price: 45 },
          { name: 'Caramel Macchiato Drizzle', price: 35 },
        ],
        preparationTimeMinutes: 3,
        calories: 15,
        rating: 4.9,
      },
    ]);

    console.log('[Seeder] Seeding 8 Restaurant Tables with QR Codes...');
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const tableData = [
      { tableNumber: 1, capacity: 2, section: 'Main Dining', status: 'available' },
      { tableNumber: 2, capacity: 4, section: 'Main Dining', status: 'available' },
      { tableNumber: 3, capacity: 4, section: 'Main Dining', status: 'available' },
      { tableNumber: 4, capacity: 6, section: 'Private Booth', status: 'available' }, // Default demo table
      { tableNumber: 5, capacity: 2, section: 'Patio Terrace', status: 'available' },
      { tableNumber: 6, capacity: 4, section: 'Patio Terrace', status: 'available' },
      { tableNumber: 7, capacity: 8, section: 'Rooftop Lounge', status: 'available' },
      { tableNumber: 8, capacity: 6, section: 'Rooftop Lounge', status: 'available' },
    ];

    const tables = [];
    for (const t of tableData) {
      const qrData = `${clientUrl}/menu?table=${t.tableNumber}`;
      const qrCodeUrl = await QRCode.toDataURL(qrData);
      const createdTable = await Table.create({
        ...t,
        qrCodeUrl,
      });
      tables.push(createdTable);
    }

    console.log('[Seeder] Seeding 25+ Realistic Historical Orders for Manager Analytics...');
    const customerUser = users.find((u) => u.email === 'customer@dineflow.com');
    const waiterUser = users.find((u) => u.email === 'waiter@dineflow.com');

    // Create past orders across multiple days & peak dining hours (12:00, 13:00, 19:00, 20:00, 21:00)
    const historicalOrders = [];
    const sampleItems = [
      { dish: menuItems[0], qty: 2, spice: 'Medium', addons: [{ name: 'Extra Shaved Truffle', price: 180 }] },
      { dish: menuItems[4], qty: 1, spice: 'Medium', addons: [{ name: 'Truffle Mashed Potatoes', price: 120 }] },
      { dish: menuItems[9], qty: 2, spice: 'Mild', addons: [{ name: 'Extra Scoop Bourbon Gelato', price: 90 }] },
      { dish: menuItems[12], qty: 2, spice: 'Mild', addons: [] },
      { dish: menuItems[6], qty: 1, spice: 'Mild', addons: [{ name: 'Double Shaved Truffle', price: 200 }] },
      { dish: menuItems[7], qty: 1, spice: 'Medium', addons: [{ name: 'Cognac Peppercorn Sauce', price: 100 }] },
      { dish: menuItems[1], qty: 1, spice: 'Hot', addons: [{ name: 'Extra Saffron Aioli', price: 50 }] },
      { dish: menuItems[13], qty: 2, spice: 'Mild', addons: [] },
    ];

    const now = Date.now();
    for (let i = 1; i <= 28; i++) {
      // Pick random table and random time in last 5 days
      const tableNum = (i % 8) + 1;
      const hoursAgo = (i * 3) + Math.floor(Math.random() * 5);
      const orderDate = new Date(now - hoursAgo * 3600 * 1000);

      // Select 2-3 items
      const selected = [
        sampleItems[i % sampleItems.length],
        sampleItems[(i + 2) % sampleItems.length],
      ];

      let subtotal = 0;
      const orderItems = selected.map((s) => {
        const addonTotal = s.addons.reduce((sum, a) => sum + a.price, 0);
        const itemTotal = (s.dish.price + addonTotal) * s.qty;
        subtotal += itemTotal;
        return {
          menuItemId: s.dish._id,
          name: s.dish.name,
          price: s.dish.price,
          quantity: s.qty,
          spiceLevel: s.spice,
          addons: s.addons,
          specialInstructions: 'Chef preparation requested',
          itemTotal,
        };
      });

      const tax = Math.round(subtotal * 0.05);
      const serviceFee = Math.round(subtotal * 0.02);
      const totalAmount = subtotal + tax + serviceFee;

      const servingStatus = i <= 2 ? 'prepping' : i === 3 ? 'ready' : 'served';

      historicalOrders.push({
        orderNumber: `DF-${1000 + i}`,
        tableNumber: tableNum,
        customerId: customerUser._id,
        customerName: i % 2 === 0 ? 'David Miller' : `Dining Guest ${i}`,
        customerPhone: '+1 555-0112',
        waiterId: waiterUser._id,
        items: orderItems,
        subtotal,
        tax,
        serviceFee,
        totalAmount,
        paymentStatus: 'paid',
        paymentMethod: 'razorpay',
        razorpayOrderId: `order_historical_${i}`,
        razorpayPaymentId: `pay_historical_${i}`,
        servingStatus,
        priority: i % 4 === 0 ? 'urgent' : i % 5 === 0 ? 'scheduled' : 'normal',
        scheduledTime: 'Immediate',
        timeline: [
          { status: 'placed', timestamp: orderDate, note: 'Order placed', updatedBy: 'Customer' },
          { status: 'prepping', timestamp: new Date(orderDate.getTime() + 5 * 60000), note: 'Kitchen started prep', updatedBy: 'Alex Waiter' },
          ...(servingStatus === 'ready' || servingStatus === 'served'
            ? [{ status: 'ready', timestamp: new Date(orderDate.getTime() + 18 * 60000), note: 'Dishes plated', updatedBy: 'Alex Waiter' }]
            : []),
          ...(servingStatus === 'served'
            ? [{ status: 'served', timestamp: new Date(orderDate.getTime() + 22 * 60000), note: 'Delivered to table', updatedBy: 'Alex Waiter' }]
            : []),
        ],
        createdAt: orderDate,
        updatedAt: orderDate,
      });
    }

    await Order.insertMany(historicalOrders);

    console.log('=====================================================');
    console.log('🎉 SEED COMPLETED SUCCESSFULLY!');
    console.log('=====================================================');
    console.log('⭐ Demo Accounts Created:');
    console.log('  1. Manager: admin@dineflow.com / password123');
    console.log('  2. Waiter:  waiter@dineflow.com / password123');
    console.log('  3. Customer: customer@dineflow.com / password123');
    console.log(`⭐ Gourmet Dishes: ${menuItems.length} items`);
    console.log(`⭐ Restaurant Tables: ${tables.length} tables with QR codes`);
    console.log(`⭐ Orders Seeded: ${historicalOrders.length} orders`);
    console.log('=====================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error);
    process.exit(1);
  }
};

seedData();
