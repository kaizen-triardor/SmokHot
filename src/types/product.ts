// Smokin' Hot Product Types
export type HeatLevel = 'mild' | 'hot' | 'extra-hot' | 'smokin-hot'

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  blurb: string // Short marketing description
  heatLevel: HeatLevel
  heatNumber: number // 1-4 scale
  price: number // In RSD
  originalPrice?: number // For sale pricing
  images: {
    main: string
    gallery: string[]
    thumbnail: string
  }
  ingredients: string[]
  volume: string // e.g., "150ml"
  scoville?: number // Heat units
  pairings: string[] // Food recommendations
  inStock: boolean
  stockCount: number
  featured: boolean
  category: string[]
  nutritionInfo?: {
    calories: number
    fat: number
    carbs: number
    protein: number
    sodium: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface ProductFilter {
  heatLevels?: HeatLevel[]
  priceRange?: [number, number]
  inStockOnly?: boolean
  categories?: string[]
  sortBy?: 'name' | 'price' | 'heat' | 'featured' | 'newest'
  sortOrder?: 'asc' | 'desc'
}

export interface CartItem {
  product: Product
  quantity: number
  selectedVolume?: string // For multi-volume products
}

export interface Cart {
  items: CartItem[]
  total: number
  itemCount: number
  updatedAt: Date
}

// Heat level display configuration
export const HEAT_CONFIG = {
  mild: {
    label: 'Blago',
    color: 'mild',
    gradient: 'from-mild-400 to-mild-600',
    description: 'Pitom start sa dimom i karakterom',
    icon: '🌿',
    scoville: '500-2,500'
  },
  hot: {
    label: 'Ljuto',
    color: 'ember', 
    gradient: 'from-ember-400 to-ember-600',
    description: 'Za one koji vole da osete vatru',
    icon: '🔥',
    scoville: '2,500-8,000'
  },
  'extra-hot': {
    label: 'Extra Ljuto',
    color: 'fire',
    gradient: 'from-fire-400 to-fire-600', 
    description: 'Ozbiljan izazov za iskusne',
    icon: '🌶️',
    scoville: '8,000-25,000'
  },
  'smokin-hot': {
    label: 'Smokin\' Hot',
    color: 'red',
    gradient: 'from-amber-700 to-red-900',
    description: 'Za one koji traže haos, ne sos',
    icon: '💀',
    scoville: '25,000+'
  }
} as const

// Product categories
export const CATEGORIES = [
  'Ljuti sosovi',
  'Dimljeni sosovi', 
  'Voćni sosovi',
  'BBQ sosovi',
  'Marinade',
  'Začini'
] as const

// Food pairing options
export const FOOD_PAIRINGS = [
  'Burger',
  'Roštilj', 
  'Pizza',
  'Krilca',
  'Tortilje',
  'Pasulj',
  'Ćevapi',
  'Pljeskavica',
  'Grilovano povrće',
  'Pasta',
  'Sendvič',
  'Pita'
] as const