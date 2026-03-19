import { Product } from '@/types/product'

export const products: Product[] = [
  {
    id: '1',
    name: 'Gecko Mild',
    slug: 'gecko-mild',
    description: 'Naš najblaži sos koji uvodi u svet Smokin\' Hot ukusa. Kombinacija dimljenih paprika, belog luka i mediteranskih začina stvara savršenu bazu za one koji tek počinju putovanje kroz ljutinu. Idealan za svakodnevnu upotrebu.',
    blurb: 'Pitom start sa dimom, belim lukom i karakterom.',
    heatLevel: 'mild',
    heatNumber: 1,
    price: 590,
    images: {
      main: '/images/products/gecko-mild-main.jpg',
      gallery: [
        '/images/products/gecko-mild-1.jpg',
        '/images/products/gecko-mild-2.jpg',
        '/images/products/gecko-mild-bottle.jpg'
      ],
      thumbnail: '/images/products/gecko-mild-thumb.jpg'
    },
    ingredients: [
      'Dimljene paprike',
      'Beli luk', 
      'Sirće',
      'Morska so',
      'Origano',
      'Timijan',
      'Prirodni aromai'
    ],
    volume: '150ml',
    scoville: 1500,
    pairings: ['Burger', 'Sendvič', 'Grilovano povrće', 'Pasta'],
    inStock: true,
    stockCount: 45,
    featured: true,
    category: ['Ljuti sosovi', 'Dimljeni sosovi'],
    nutritionInfo: {
      calories: 5,
      fat: 0,
      carbs: 1,
      protein: 0,
      sodium: 180
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-01')
  },
  {
    id: '2', 
    name: 'Fireant Hot',
    slug: 'fireant-hot',
    description: 'Savršena ravnoteža između ukusa i toplotе. Fireant kombinuje sočne crvene paprike sa notama dima i začina koji dopunjuju, a ne potiskuju hranu. Ovo je sos koji ćete hteti na svakom obroku.',
    blurb: 'Za burgere, krilca i ekipu koja voli da pecka.',
    heatLevel: 'hot',
    heatNumber: 2,
    price: 640,
    originalPrice: 690,
    images: {
      main: '/images/products/fireant-hot-main.jpg',
      gallery: [
        '/images/products/fireant-hot-1.jpg',
        '/images/products/fireant-hot-2.jpg',
        '/images/products/fireant-hot-bottle.jpg',
        '/images/products/fireant-hot-food.jpg'
      ],
      thumbnail: '/images/products/fireant-hot-thumb.jpg'
    },
    ingredients: [
      'Crvene čili paprike',
      'Rajčice',
      'Beli luk',
      'Luk',
      'Jabučno sirće',
      'Med',
      'Kumin',
      'Smoky paprika',
      'Morska so'
    ],
    volume: '150ml',
    scoville: 5500,
    pairings: ['Burger', 'Krilca', 'Pizza', 'Ćevapi', 'Roštilj'],
    inStock: true,
    stockCount: 32,
    featured: true,
    category: ['Ljuti sosovi', 'BBQ sosovi'],
    nutritionInfo: {
      calories: 8,
      fat: 0,
      carbs: 2,
      protein: 0,
      sodium: 200
    },
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-03-05')
  },
  {
    id: '3',
    name: 'Firefly Extra Hot', 
    slug: 'firefly-extra-hot',
    description: 'Ovde se razdvajaju deca od odraslih. Firefly donosi ozbiljnu dozu toplotе uz nevероватnu složenost ukusa. Voćne note mango-a i ananasa ublažavaju intenzitet habanero paprika, praveći sos koji boli, ali na pravi način.',
    blurb: 'Voćna vatra koja udara brzo i ostaje dugo.',
    heatLevel: 'extra-hot',
    heatNumber: 3,
    price: 720,
    images: {
      main: '/images/products/firefly-extra-main.jpg',
      gallery: [
        '/images/products/firefly-extra-1.jpg',
        '/images/products/firefly-extra-2.jpg',
        '/images/products/firefly-extra-bottle.jpg',
        '/images/products/firefly-extra-ingredients.jpg'
      ],
      thumbnail: '/images/products/firefly-extra-thumb.jpg'
    },
    ingredients: [
      'Habanero paprike',
      'Mango',
      'Ananas',
      'Crvene čili paprike',
      'Limettin sok',
      'Beli luk',
      'Đumbir',
      'Jabučno sirće',
      'Agave sirup',
      'Morska so'
    ],
    volume: '150ml',
    scoville: 15000,
    pairings: ['Roštilj', 'Krilca', 'Tortilje', 'Grilovano povrće'],
    inStock: true,
    stockCount: 28,
    featured: true,
    category: ['Ljuti sosovi', 'Voćni sosovi'],
    nutritionInfo: {
      calories: 12,
      fat: 0,
      carbs: 3,
      protein: 1,
      sodium: 190
    },
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-10')
  },
  {
    id: '4',
    name: 'Jackal Smokin\' Hot',
    slug: 'jackal-smokin-hot',
    description: 'Ovo nije sos - ovo je испитивање граница. Jackal je naš najјачи kreacija, napravljena od carolina reaper paprika i ghost pepper-a. Uz duboke note dima i minimalnu količinu đumbira za balans, ovo je sos koji zahteva poštovanje.',
    blurb: 'Brutalan finiš za one koji traže haos, ne sos.',
    heatLevel: 'smokin-hot',
    heatNumber: 4,
    price: 850,
    images: {
      main: '/images/products/jackal-smokin-main.jpg',
      gallery: [
        '/images/products/jackal-smokin-1.jpg',
        '/images/products/jackal-smokin-2.jpg',
        '/images/products/jackal-smokin-bottle.jpg',
        '/images/products/jackal-smokin-warning.jpg'
      ],
      thumbnail: '/images/products/jackal-smokin-thumb.jpg'
    },
    ingredients: [
      'Carolina Reaper paprike',
      'Ghost pepper (Bhut jolokia)',
      'Dimljene paprike',
      'Jabučno sirće',
      'Đumbir',
      'Beli luk',
      'Limettin sok',
      'Morska so',
      '⚠️ Ekstremno ljuto ⚠️'
    ],
    volume: '150ml',
    scoville: 45000,
    pairings: ['Roštilj (oprezno!)', 'Začinjavanje jela', 'Izazov'],
    inStock: true,
    stockCount: 15,
    featured: true,
    category: ['Ljuti sosovi'],
    nutritionInfo: {
      calories: 3,
      fat: 0,
      carbs: 1,
      protein: 0,
      sodium: 160
    },
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-03-12')
  },
  {
    id: '5',
    name: 'Smoke & Mirrors BBQ',
    slug: 'smoke-mirrors-bbq', 
    description: 'Naš jedini ne-ljuti sos koji ipak ima karakter. Kombinacija hickory dima, tamnog šećera i balkanske tradicije u modernom ruhu. Savršen za mariniranje mesa i kao završni dodatak roštilju.',
    blurb: 'Dim bez vatre - ukus bez granica.',
    heatLevel: 'mild',
    heatNumber: 1,
    price: 650,
    images: {
      main: '/images/products/smoke-mirrors-main.jpg',
      gallery: [
        '/images/products/smoke-mirrors-1.jpg',
        '/images/products/smoke-mirrors-2.jpg',
        '/images/products/smoke-mirrors-bottle.jpg'
      ],
      thumbnail: '/images/products/smoke-mirrors-thumb.jpg'
    },
    ingredients: [
      'Dimljene rajčice',
      'Tamni šećer',
      'Balsamico sirće',
      'Worcestershire sos',
      'Beli luk',
      'Crni luk',
      'Parika',
      'Timijan',
      'Lovorov list'
    ],
    volume: '200ml',
    scoville: 50,
    pairings: ['Roštilj', 'Pljeskavica', 'Rebarca', 'Mariniranje'],
    inStock: true,
    stockCount: 38,
    featured: false,
    category: ['BBQ sosovi', 'Marinade', 'Dimljeni sosovi'],
    nutritionInfo: {
      calories: 25,
      fat: 0,
      carbs: 6,
      protein: 1,
      sodium: 220
    },
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-03-08')
  },
  {
    id: '6',
    name: 'Green Fury',
    slug: 'green-fury',
    description: 'Jedini zeleni sos u našoj kolekciji donosi świežест i oštru ljutinu serrano paprika. Kombinovan sa świežим začinskim bilјem i лajmom, pravi je osvежение na roštilјu.',
    blurb: 'Зелена бес са свежim нотама лајма.',
    heatLevel: 'hot',
    heatNumber: 2,
    price: 620,
    images: {
      main: '/images/products/green-fury-main.jpg',
      gallery: [
        '/images/products/green-fury-1.jpg',
        '/images/products/green-fury-2.jpg'
      ],
      thumbnail: '/images/products/green-fury-thumb.jpg'
    },
    ingredients: [
      'Serrano paprike',
      'Jalapeño paprike', 
      'Свеж коријандер',
      'Лајм сок',
      'Бели лук',
      'Лук',
      'Јабучно сирће',
      'Морска со',
      'Кумин'
    ],
    volume: '150ml',
    scoville: 4500,
    pairings: ['Tortilje', 'Tacosi', 'Guacamole', 'Riba', 'Piletina'],
    inStock: true,
    stockCount: 22,
    featured: false,
    category: ['Ljuti sosovi'],
    nutritionInfo: {
      calories: 6,
      fat: 0,
      carbs: 1,
      protein: 0,
      sodium: 170
    },
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-15')
  }
]

// Helper functions
export function getProductBySlug(slug: string): Product | undefined {
  return products.find(product => product.slug === slug)
}

export function getProductsByHeatLevel(heatLevel: string): Product[] {
  return products.filter(product => product.heatLevel === heatLevel)
}

export function getFeaturedProducts(): Product[] {
  return products.filter(product => product.featured)
}

export function getAvailableProducts(): Product[] {
  return products.filter(product => product.inStock && product.stockCount > 0)
}

export function searchProducts(query: string): Product[] {
  const searchTerm = query.toLowerCase()
  return products.filter(product => 
    product.name.toLowerCase().includes(searchTerm) ||
    product.description.toLowerCase().includes(searchTerm) ||
    product.blurb.toLowerCase().includes(searchTerm) ||
    product.ingredients.some(ingredient => 
      ingredient.toLowerCase().includes(searchTerm)
    ) ||
    product.pairings.some(pairing =>
      pairing.toLowerCase().includes(searchTerm)
    )
  )
}