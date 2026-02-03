// scripts/seed.js
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://designdevproenmanuel_db_user:204488292535*Ez@cluster0.9cczmo6.mongodb.net/food-delivery?retryWrites=true&w=majority';

const restaurantSchema = new mongoose.Schema({
  ownerId: mongoose.Schema.Types.ObjectId,
  name: String,
  description: String,
  image: String,
  location: {
    address: String,
    lat: Number,
    lng: Number,
  },
  cuisine: String,
  rating: Number,
  deliveryTime: String,
  isOpen: Boolean,
  createdAt: Date,
});

const menuItemSchema = new mongoose.Schema({
  restaurantId: mongoose.Schema.Types.ObjectId,
  name: String,
  description: String,
  price: Number,
  image: String,
  category: String,
  available: Boolean,
  createdAt: Date,
});

const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);
const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);

// 🌎 Ubicaciones variadas en Anaco y alrededores (Anzoátegui, Venezuela)
const sampleRestaurants = [
  // ITALIANA
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    ownerId: new mongoose.Types.ObjectId(),
    name: 'Pizzería Napolitana',
    description: 'Las mejores pizzas al horno de leña',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
    location: {
      address: 'Av. Principal, Anaco, Anzoátegui',
      lat: 10.2541,
      lng: -64.4728,
    },
    cuisine: 'Italiana',
    rating: 4.5,
    deliveryTime: '30-40 min',
    isOpen: true,
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439021'),
    ownerId: new mongoose.Types.ObjectId(),
    name: 'La Trattoria',
    description: 'Auténtica comida italiana casera',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',
    location: {
      address: 'Calle Bolívar, Centro Anaco',
      lat: 10.2580,
      lng: -64.4690,
    },
    cuisine: 'Italiana',
    rating: 4.7,
    deliveryTime: '35-45 min',
    isOpen: true,
  },

  // AMERICANA
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
    ownerId: new mongoose.Types.ObjectId(),
    name: 'Burger House',
    description: 'Hamburguesas gourmet y papas fritas',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    location: {
      address: 'Centro Comercial Anaco Plaza',
      lat: 10.2600,
      lng: -64.4650,
    },
    cuisine: 'Americana',
    rating: 4.3,
    deliveryTime: '25-35 min',
    isOpen: true,
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439022'),
    ownerId: new mongoose.Types.ObjectId(),
    name: 'American Diner',
    description: 'Comida rápida estilo americano',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800',
    location: {
      address: 'Av. Intercomunal Anaco-Barcelona',
      lat: 10.2450,
      lng: -64.4800,
    },
    cuisine: 'Americana',
    rating: 4.2,
    deliveryTime: '20-30 min',
    isOpen: true,
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439023'),
    ownerId: new mongoose.Types.ObjectId(),
    name: 'Wings & More',
    description: 'Alitas, dedos de pollo y salsas variadas',
    image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=800',
    location: {
      address: 'Zona Industrial Anaco',
      lat: 10.2520,
      lng: -64.4770,
    },
    cuisine: 'Americana',
    rating: 4.4,
    deliveryTime: '25-35 min',
    isOpen: true,
  },

  // JAPONESA
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
    ownerId: new mongoose.Types.ObjectId(),
    name: 'Sushi Tokyo',
    description: 'Sushi fresco y auténtico',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
    location: {
      address: 'Calle Miranda, Anaco',
      lat: 10.2565,
      lng: -64.4715,
    },
    cuisine: 'Japonesa',
    rating: 4.7,
    deliveryTime: '35-45 min',
    isOpen: true,
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439024'),
    ownerId: new mongoose.Types.ObjectId(),
    name: 'Sakura Sushi Bar',
    description: 'Rolls creativos y sashimi premium',
    image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800',
    location: {
      address: 'Urbanización San Francisco, Anaco',
      lat: 10.2610,
      lng: -64.4680,
    },
    cuisine: 'Japonesa',
    rating: 4.8,
    deliveryTime: '40-50 min',
    isOpen: true,
  },

  // MEXICANA
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439014'),
    ownerId: new mongoose.Types.ObjectId(),
    name: 'Tacos El Mexicano',
    description: 'Tacos y burritos auténticos',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
    location: {
      address: 'Plaza Bolívar, Anaco',
      lat: 10.2575,
      lng: -64.4735,
    },
    cuisine: 'Mexicana',
    rating: 3,
    deliveryTime: '20-30 min',
    isOpen: true,
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439025'),
    ownerId: new mongoose.Types.ObjectId(),
    name: 'Cantina Mexicana',
    description: 'Comida tex-mex con sabor auténtico',
    image: 'https://images.unsplash.com/photo-1599974292914-53a09e34ed2d?w=800',
    location: {
      address: 'Av. Bolívar Este, Anaco',
      lat: 10.2530,
      lng: -64.4760,
    },
    cuisine: 'Mexicana',
    rating: 4.5,
    deliveryTime: '25-35 min',
    isOpen: true,
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439026'),
    ownerId: new mongoose.Types.ObjectId(),
    name: 'Quesadillas Express',
    description: 'Quesadillas, nachos y enchiladas',
    image: 'https://images.unsplash.com/photo-1628191010210-a59de9428762?w=800',
    location: {
      address: 'Sector Las Mercedes, Anaco',
      lat: 10.2495,
      lng: -64.4795,
    },
    cuisine: 'Mexicana',
    rating: 4.1,
    deliveryTime: '20-30 min',
    isOpen: true,
  },

  // VENEZOLANA
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439031'),
    ownerId: new mongoose.Types.ObjectId(),
    name: 'Arepera La Guaricha',
    description: 'Arepas rellenas y cachapas tradicionales',
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800',
    location: {
      address: 'Calle Sucre, Centro Anaco',
      lat: 10.2590,
      lng: -64.4700,
    },
    cuisine: 'Venezolana',
    rating: 4.6,
    deliveryTime: '15-25 min',
    isOpen: true,
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439032'),
    ownerId: new mongoose.Types.ObjectId(),
    name: 'Sabor Criollo',
    description: 'Pabellón, asado negro y más platos típicos',
    image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800',
    location: {
      address: 'Av. Miranda, Anaco',
      lat: 10.2555,
      lng: -64.4745,
    },
    cuisine: 'Venezolana',
    rating: 4.8,
    deliveryTime: '30-40 min',
    isOpen: true,
  },

  // CHINA
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439041'),
    ownerId: new mongoose.Types.ObjectId(),
    name: 'Chifa Oriental',
    description: 'Comida china y chifa peruano',
    image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800',
    location: {
      address: 'Calle Comercio, Anaco',
      lat: 10.2570,
      lng: -64.4720,
    },
    cuisine: 'China',
    rating: 4.3,
    deliveryTime: '30-40 min',
    isOpen: true,
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439042'),
    ownerId: new mongoose.Types.ObjectId(),
    name: 'Wok Express',
    description: 'Arroz chino, chow mein y dim sum',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800',
    location: {
      address: 'Centro Comercial Los Andes, Anaco',
      lat: 10.2505,
      lng: -64.4785,
    },
    cuisine: 'China',
    rating: 4.1,
    deliveryTime: '25-35 min',
    isOpen: true,
  },

  // POSTRES Y CAFÉ
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439051'),
    ownerId: new mongoose.Types.ObjectId(),
    name: 'Dulce Tentación',
    description: 'Postres artesanales, tortas y helados',
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800',
    location: {
      address: 'Av. Principal, Sector Centro',
      lat: 10.2585,
      lng: -64.4695,
    },
    cuisine: 'Postres',
    rating: 4.9,
    deliveryTime: '20-30 min',
    isOpen: true,
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439052'),
    ownerId: new mongoose.Types.ObjectId(),
    name: 'Café Aroma',
    description: 'Café premium, sándwiches y repostería',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
    location: {
      address: 'Plaza San Antonio, Anaco',
      lat: 10.2545,
      lng: -64.4755,
    },
    cuisine: 'Café',
    rating: 4.7,
    deliveryTime: '15-25 min',
    isOpen: true,
  },

  // PARRILLA/CARNES
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439061'),
    ownerId: new mongoose.Types.ObjectId(),
    name: 'La Parrilla Criolla',
    description: 'Carnes a la parrilla y chorizos artesanales',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
    location: {
      address: 'Av. Intercomunal, Sector Industrial',
      lat: 10.2480,
      lng: -64.4810,
    },
    cuisine: 'Parrilla',
    rating: 4.6,
    deliveryTime: '35-45 min',
    isOpen: true,
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439062'),
    ownerId: new mongoose.Types.ObjectId(),
    name: 'Asados Don Pepe',
    description: 'Especialidad en carnes asadas y costillas BBQ',
    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800',
    location: {
      address: 'Urbanización El Dorado, Anaco',
      lat: 10.2615,
      lng: -64.4665,
    },
    cuisine: 'Parrilla',
    rating: 4.5,
    deliveryTime: '40-50 min',
    isOpen: true,
  },
  {
  _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439063'), // ⚠️ Cambia el último número
  ownerId: new mongoose.Types.ObjectId(),
  name: 'Nombre de tu Restaurante',
  description: 'Descripción breve',
  image: 'https://images.unsplash.com/photo-XXXXXXX?w=800',
  location: {
    address: 'Dirección en Anaco',
    lat: 9.433379584590748, // Coordenadas de Anaco
    lng: -64.47508516562338,
  },
  cuisine: 'Tipo de Cocina', // Ej: Italiana, Mexicana, etc.
  rating: 4.5,
  deliveryTime: '30-40 min',
  isOpen: true,
},
];

// 🍕 MENÚS COMPLETOS PARA CADA RESTAURANTE
const sampleMenuItems = [
  // ========== PIZZERÍA NAPOLITANA ==========
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    name: 'Pizza Margarita',
    description: 'Tomate, mozzarella y albahaca fresca',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
    category: 'Pizzas',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    name: 'Pizza Pepperoni',
    description: 'Pepperoni, mozzarella y salsa de tomate',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800',
    category: 'Pizzas',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    name: 'Pizza Cuatro Quesos',
    description: 'Mozzarella, gorgonzola, parmesano y provolone',
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96c47?w=800',
    category: 'Pizzas',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    name: 'Pasta Carbonara',
    description: 'Pasta con crema, panceta y parmesano',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800',
    category: 'Pastas',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    name: 'Lasagna Bolognesa',
    description: 'Capas de pasta, carne y queso gratinado',
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',
    category: 'Pastas',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    name: 'Tiramisú',
    description: 'Postre italiano con café y mascarpone',
    price: 6.99,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800',
    category: 'Postres',
    available: true,
  },

  // ========== BURGER HOUSE ==========
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
    name: 'Classic Burger',
    description: 'Carne Angus, lechuga, tomate, cebolla y queso',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800',
    category: 'Hamburguesas',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
    name: 'Bacon Cheeseburger',
    description: 'Doble carne, bacon crujiente y queso cheddar',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800',
    category: 'Hamburguesas',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
    name: 'BBQ Burger',
    description: 'Carne, aros de cebolla, bacon y salsa BBQ',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800',
    category: 'Hamburguesas',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
    name: 'Papas Fritas',
    description: 'Papas crujientes con sal marina',
    price: 3.99,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800',
    category: 'Acompañantes',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
    name: 'Aros de Cebolla',
    description: 'Aros de cebolla crujientes con salsa ranch',
    price: 4.99,
    image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=800',
    category: 'Acompañantes',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
    name: 'Milkshake de Chocolate',
    description: 'Batido cremoso de chocolate belga',
    price: 5.99,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800',
    category: 'Bebidas',
    available: true,
  },

  // ========== SUSHI TOKYO ==========
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
    name: 'California Roll',
    description: '8 piezas con cangrejo, aguacate y pepino',
    price: 10.99,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
    category: 'Rolls',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
    name: 'Spicy Tuna Roll',
    description: '8 piezas con atún picante y aguacate',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800',
    category: 'Rolls',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
    name: 'Dragon Roll',
    description: '10 piezas con camarón tempura y anguila',
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800',
    category: 'Rolls',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
    name: 'Sashimi Mixto',
    description: '12 piezas de pescado fresco variado',
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1563612116625-3012372fccce?w=800',
    category: 'Sashimi',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
    name: 'Tempura de Camarones',
    description: '6 camarones empanizados crujientes',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800',
    category: 'Entradas',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
    name: 'Mochi de Té Verde',
    description: '3 piezas de postre japonés tradicional',
    price: 6.99,
    image: 'https://images.unsplash.com/photo-1582716401301-b2407dc7563d?w=800',
    category: 'Postres',
    available: true,
  },

  // ========== TACOS EL MEXICANO ==========
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439014'),
    name: 'Tacos de Carne Asada',
    description: '3 tacos con carne asada, cilantro y cebolla',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
    category: 'Tacos',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439014'),
    name: 'Tacos al Pastor',
    description: '3 tacos con cerdo marinado y piña',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1599974292914-53a09e34ed2d?w=800',
    category: 'Tacos',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439014'),
    name: 'Burrito Supreme',
    description: 'Burrito grande con carne, frijoles, arroz y queso',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800',
    category: 'Burritos',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439014'),
    name: 'Quesadilla de Pollo',
    description: 'Tortilla con queso fundido y pollo a la parrilla',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=800',
    category: 'Quesadillas',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439014'),
    name: 'Nachos Supreme',
    description: 'Nachos con queso, guacamole, crema y jalapeños',
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1613514785940-daed07799d9b?w=800',
    category: 'Entradas',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439014'),
    name: 'Churros con Cajeta',
    description: '6 churros con dulce de leche',
    price: 5.99,
    image: 'https://images.unsplash.com/photo-1622484211052-76c9c7d71bcd?w=800',
    category: 'Postres',
    available: true,
  },

  // ========== LA TRATTORIA ==========
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439021'),
    name: 'Ravioli de Ricotta',
    description: 'Ravioles rellenos de ricotta con salsa de tomate',
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1587740908075-9ea5eb6a0b6d?w=800',
    category: 'Pastas',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439021'),
    name: 'Risotto ai Funghi',
    description: 'Arroz cremoso con hongos porcini',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1476124369491-c735b0e0e4b3?w=800',
    category: 'Risottos',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439021'),
    name: 'Panna Cotta',
    description: 'Postre italiano de crema con frutos rojos',
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800',
    category: 'Postres',
    available: true,
  },

  // ========== AMERICAN DINER ==========
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439022'),
    name: 'Hot Dog Clásico',
    description: 'Salchicha premium con mostaza y ketchup',
    price: 5.99,
    image: 'https://images.unsplash.com/photo-1612392061787-2d078b45f39a?w=800',
    category: 'Hot Dogs',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439022'),
    name: 'Nuggets de Pollo',
    description: '10 piezas con salsas variadas',
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800',
    category: 'Pollo',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439022'),
    name: 'Malteada de Vainilla',
    description: 'Cremosa malteada de vainilla',
    price: 4.99,
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=800',
    category: 'Bebidas',
    available: true,
  },

  // ========== WINGS & MORE ==========
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439023'),
    name: 'Alitas BBQ',
    description: '12 alitas con salsa barbacoa',
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800',
    category: 'Alitas',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439023'),
    name: 'Alitas Picantes',
    description: '12 alitas con salsa buffalo picante',
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=800',
    category: 'Alitas',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439023'),
    name: 'Dedos de Pollo',
    description: '8 tiras de pollo empanizadas',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800',
    category: 'Pollo',
    available: true,
  },

  // ========== SAKURA SUSHI BAR ==========
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439024'),
    name: 'Rainbow Roll',
    description: '8 piezas con variedad de pescados frescos',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
    category: 'Rolls',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439024'),
    name: 'Gyoza de Cerdo',
    description: '6 dumplings japoneses al vapor',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800',
    category: 'Entradas',
    available: true,
  },

  // ========== CANTINA MEXICANA ==========
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439025'),
    name: 'Enchiladas Verdes',
    description: '3 enchiladas con salsa verde y crema',
    price: 10.99,
    image: 'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?w=800',
    category: 'Platillos',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439025'),
    name: 'Fajitas Mixtas',
    description: 'Pollo y res con pimientos y tortillas',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1605333396915-425e6997c1ce?w=800',
    category: 'Platillos',
    available: true,
  },

  // ========== QUESADILLAS EXPRESS ==========
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439026'),
    name: 'Quesadilla de Res',
    description: 'Tortilla con queso y carne de res',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=800',
    category: 'Quesadillas',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439026'),
    name: 'Nachos con Carne',
    description: 'Nachos con carne molida, queso y guacamole',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=800',
    category: 'Entradas',
    available: true,
  },

  // ========== AREPERA LA GUARICHA ==========
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439031'),
    name: 'Arepa Reina Pepiada',
    description: 'Arepa rellena de pollo y aguacate',
    price: 6.99,
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800',
    category: 'Arepas',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439031'),
    name: 'Arepa Pabellón',
    description: 'Carne mechada, caraotas, plátano y queso',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1548340748-6d2b7d7da280?w=800',
    category: 'Arepas',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439031'),
    name: 'Cachapa con Queso',
    description: 'Cachapa dulce con queso de mano',
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800',
    category: 'Cachapas',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439031'),
    name: 'Tequeños',
    description: '10 tequeños de queso',
    price: 5.99,
    image: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa9e83?w=800',
    category: 'Entradas',
    available: true,
  },

  // ========== SABOR CRIOLLO ==========
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439032'),
    name: 'Pabellón Criollo',
    description: 'Carne mechada, arroz, caraotas negras y tajadas',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800',
    category: 'Platos Típicos',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439032'),
    name: 'Asado Negro',
    description: 'Carne en salsa dulce con arroz y ensalada',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
    category: 'Platos Típicos',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439032'),
    name: 'Hallaca Tradicional',
    description: 'Hallaca venezolana con todos los ingredientes',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800',
    category: 'Platos Típicos',
    available: true,
  },

  // ========== CHIFA ORIENTAL ==========
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439041'),
    name: 'Arroz Chaufa',
    description: 'Arroz frito con pollo, vegetales y soya',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800',
    category: 'Arroz',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439041'),
    name: 'Chop Suey de Pollo',
    description: 'Pollo salteado con vegetales mixtos',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800',
    category: 'Salteados',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439041'),
    name: 'Rollitos Primavera',
    description: '4 rollitos crujientes con vegetales',
    price: 6.99,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800',
    category: 'Entradas',
    available: true,
  },

  // ========== WOK EXPRESS ==========
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439042'),
    name: 'Chow Mein de Res',
    description: 'Fideos salteados con res y vegetales',
    price: 10.99,
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800',
    category: 'Fideos',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439042'),
    name: 'Pollo Agridulce',
    description: 'Pollo crujiente con salsa agridulce',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800',
    category: 'Pollo',
    available: true,
  },

  // ========== DULCE TENTACIÓN ==========
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439051'),
    name: 'Torta de Chocolate',
    description: 'Torta húmeda de chocolate con ganache',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800',
    category: 'Tortas',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439051'),
    name: 'Cheesecake de Fresa',
    description: 'Cheesecake cremoso con fresas frescas',
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800',
    category: 'Tortas',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439051'),
    name: 'Brownie con Helado',
    description: 'Brownie caliente con helado de vainilla',
    price: 6.99,
    image: 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=800',
    category: 'Postres',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439051'),
    name: 'Copa de Helado Triple',
    description: 'Tres bolas de helado con toppings',
    price: 5.99,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800',
    category: 'Helados',
    available: true,
  },

  // ========== CAFÉ AROMA ==========
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439052'),
    name: 'Cappuccino',
    description: 'Café espresso con espuma de leche',
    price: 4.99,
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800',
    category: 'Café',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439052'),
    name: 'Croissant de Almendras',
    description: 'Croissant relleno de crema de almendras',
    price: 5.99,
    image: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=800',
    category: 'Repostería',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439052'),
    name: 'Sándwich Club',
    description: 'Pollo, bacon, lechuga, tomate y mayonesa',
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800',
    category: 'Sándwiches',
    available: true,
  },

  // ========== LA PARRILLA CRIOLLA ==========
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439061'),
    name: 'Parrilla Mixta',
    description: 'Carne, chorizo, morcilla y pollo a la parrilla',
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
    category: 'Parrillas',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439061'),
    name: 'Churrasco',
    description: 'Corte premium con chimichurri',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=800',
    category: 'Carnes',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439061'),
    name: 'Chorizo Criollo',
    description: '2 chorizos artesanales a la parrilla',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800',
    category: 'Chorizos',
    available: true,
  },

  // ========== ASADOS DON PEPE ==========
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439062'),
    name: 'Costillas BBQ',
    description: 'Costillas de cerdo con salsa barbacoa',
    price: 17.99,
    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800',
    category: 'Costillas',
    available: true,
  },
  {
    restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439062'),
    name: 'Lomo Asado',
    description: 'Lomo de res jugoso con vegetales',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800',
    category: 'Carnes',
    available: true,
  },
  {
  restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439063'), // ⚠️ Mismo ID del restaurante
  name: 'Nombre del Plato',
  description: 'Descripción del plato',
  price: 12.99,
  image: 'https://images.unsplash.com/photo-XXXXXXX?w=800',
  category: 'Categoría', // Ej: Pizzas, Hamburguesas, etc.
  available: true,
},
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar datos existentes
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    console.log('🗑️  Datos anteriores eliminados');

    // Insertar restaurantes
    await Restaurant.insertMany(sampleRestaurants);
    console.log(`🍽️  ${sampleRestaurants.length} restaurantes insertados`);

    // Insertar items de menú
    await MenuItem.insertMany(sampleMenuItems);
    console.log(`🍕 ${sampleMenuItems.length} items de menú insertados`);

    console.log('\n✅ Seed completado exitosamente');
    console.log(`📊 Total: ${sampleRestaurants.length} restaurantes y ${sampleMenuItems.length} items`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seed();