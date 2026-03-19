// Centralized Content Management System
// This file provides the foundation for modular, CMS-driven content

import { Product } from '@/types/product'

// =================== CONTENT TYPES ===================

export interface HomePage {
  hero: {
    title: string
    subtitle: string
    description: string
    cta: {
      primary: string
      secondary: string
    }
    badges: {
      left: string
      right: string
    }
  }
  brandStory: {
    subtitle: string
    title: string
    description: string
    perks: Array<{
      title: string
      text: string
    }>
  }
  heatScale: {
    subtitle: string
    title: string
    description: string
    cta: string
  }
  featuredProducts: {
    subtitle: string
    title: string
    description: string
  }
  foodPairing: {
    subtitle: string
    title: string
    description: string
    pairings: Array<{
      food: string
      sauce: string
      description: string
    }>
  }
  tourEvents: {
    subtitle: string
    title: string
    description: string
    upcomingTitle: string
    pastTitle: string
    cta: string
    stats: {
      events: number
      bottles: number
      cities: number
    }
  }
  contact: {
    subtitle: string
    title: string
    description: string
    socials: Array<{
      name: string
      handle: string
      url: string
      icon: string
    }>
  }
}

export interface SiteSettings {
  brand: {
    name: string
    tagline: string
    logo: string
    colors: {
      primary: string
      secondary: string
      accent: string
    }
  }
  contact: {
    email: string
    phone: string
    address: string
    city: string
    postalCode: string
  }
  shipping: {
    codAvailable: boolean
    deliveryTime: string
    shippingCost: number
    freeShippingThreshold: number
  }
  seo: {
    title: string
    description: string
    keywords: string[]
    ogImage: string
  }
  analytics: {
    googleAnalytics?: string
    facebookPixel?: string
  }
}

export interface TourEvent {
  id: string
  date: string
  event: string
  location: string
  time?: string
  highlight?: string
  status: 'upcoming' | 'past'
  description?: string
  createdAt: Date
  updatedAt: Date
}

// =================== CMS DATA STORE ===================

// This would normally come from a database or CMS
const CMS_DATA = {
  homepage: {
    hero: {
      title: "Ljuti sos koji zvuči kao rif",
      subtitle: "Srpski hot sauce collective",
      description: "Od blagog dima do brutalnog napada na nepce. Napravljeno u Srbiji, testirano na najhrabrijnima.",
      cta: {
        primary: "ISTRAŽI SKALU LJUTINE",
        secondary: "SHOP SOSOVE"
      },
      badges: {
        left: "Made in Serbia",
        right: "Small batch fire"
      }
    },
    brandStory: {
      subtitle: "Nismo za svakoga",
      title: "Domaći sos. Prljav karakter. Čist ukus.",
      description: "Smokin' Hot nije još jedan generičan food shop. Brend treba da deluje kao spoj garažnog benda, male craft radionice i ozbiljne ljubavi prema paprici. Vizuelno je glasan, ali UX mora da ostane čist, jasan i prodajan.",
      perks: [
        {
          title: "Pouzeće u Srbiji",
          text: "Naruči online, plati kada paket stigne. Bez komplikacije, bez čekanja kartica."
        },
        {
          title: "Mala domaća proizvodnja", 
          text: "Ručno birane paprike, mali batch, fokus na ukus, dim i ozbiljan karakter."
        },
        {
          title: "Od blagih do brutalnih",
          text: "Skala ljutine jasno vodi kupca od pitomog dima do čistog napada na nepce."
        }
      ]
    },
    heatScale: {
      subtitle: "Skala ljutine",
      title: "Tvoja putanja kroz vatru",
      description: "Svaki sos ima svoju priču. Klikni i saznaj koja paprika, koliko Scoville jedinica i zašto baš taj ukus.",
      cta: "DODAJ U KORPU"
    },
    featuredProducts: {
      subtitle: "Izdvajamo",
      title: "Sosovi koji definišu nas",
      description: "Naša četiri najbolja sosa koje morate probati."
    },
    foodPairing: {
      subtitle: "Sta ide uz šta",
      title: "Food pairing vodič",
      description: "Svaki sos ima svoju ulogu. Evo kako da maksimalno iskoristiš ukuse."
    },
    tourEvents: {
      subtitle: "Na putu kroz Srbiju",
      title: "Turneja",
      description: "Pratite našu turneju kroz Srbiju - gde smo palili nepca i gde ćemo sledeće zapaliti!",
      upcomingTitle: "Naredni događaji",
      pastTitle: "Gde smo palili",
      cta: "Pozovi nas za svoj događaj",
      stats: {
        events: 15,
        bottles: 500,
        cities: 8
      }
    },
    contact: {
      subtitle: "Ostani u kontaktu",
      title: "Daj nam fire",
      description: "Pitanja, predlozi, ili samo hoćeš da kažeš zdravo?",
      socials: [
        {
          name: "Instagram",
          handle: "@smokinhot.rs", 
          url: "https://instagram.com/smokinhot.rs",
          icon: "📷"
        },
        {
          name: "TikTok",
          handle: "@smokinhot.collective",
          url: "https://tiktok.com/@smokinhot.collective", 
          icon: "🎵"
        },
        {
          name: "Email",
          handle: "info@smokinhot.rs",
          url: "mailto:info@smokinhot.rs",
          icon: "📧"
        }
      ]
    }
  } as HomePage,

  siteSettings: {
    brand: {
      name: "SMOKIN' HOT",
      tagline: "COLLECTIVE",
      logo: "/SmokHotLogo.png",
      colors: {
        primary: "#e52421",
        secondary: "#ff6a00", 
        accent: "#ffd400"
      }
    },
    contact: {
      email: "info@smokinhot.rs",
      phone: "+381 60 123 4567",
      address: "Bulevar Oslobođenja 123",
      city: "Beograd",
      postalCode: "11000"
    },
    shipping: {
      codAvailable: true,
      deliveryTime: "1-3 radna dana",
      shippingCost: 0,
      freeShippingThreshold: 0
    },
    seo: {
      title: "Smokin' Hot Collective - Srpski Hot Sauce",
      description: "Domaći ljuti sosovi napravljeni u Srbiji. Od blagih do brutalnih - plaćanje pouzećem, dostava širom zemlje.",
      keywords: ["ljuti sos", "hot sauce", "srpski sos", "paprike", "roštilj", "COD"],
      ogImage: "/og-image.jpg"
    },
    analytics: {
      googleAnalytics: "",
      facebookPixel: ""
    }
  } as SiteSettings
}

// =================== CMS API FUNCTIONS ===================

export class CMSService {
  // Homepage Content
  static getHomepage(): HomePage {
    return CMS_DATA.homepage
  }

  static updateHomepage(data: Partial<HomePage>): void {
    CMS_DATA.homepage = { ...CMS_DATA.homepage, ...data }
    // In production, this would save to database
    console.log('Homepage updated:', data)
  }

  // Site Settings
  static getSiteSettings(): SiteSettings {
    return CMS_DATA.siteSettings
  }

  static updateSiteSettings(data: Partial<SiteSettings>): void {
    CMS_DATA.siteSettings = { ...CMS_DATA.siteSettings, ...data }
    // In production, this would save to database
    console.log('Site settings updated:', data)
  }

  // Tour Events (placeholder - would be database-driven)
  static getTourEvents(): TourEvent[] {
    // This would normally fetch from database
    return []
  }

  static createTourEvent(event: Omit<TourEvent, 'id' | 'createdAt' | 'updatedAt'>): TourEvent {
    const newEvent: TourEvent = {
      ...event,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    // In production, this would save to database
    return newEvent
  }

  static updateTourEvent(id: string, data: Partial<TourEvent>): TourEvent | null {
    // In production, this would update in database
    console.log('Tour event updated:', { id, data })
    return null
  }

  static deleteTourEvent(id: string): boolean {
    // In production, this would delete from database
    console.log('Tour event deleted:', id)
    return true
  }
}

// =================== CONTENT HOOKS ===================

// These hooks provide reactive content that updates across the site

export function useHomepage() {
  // In production, this would be a real hook that subscribes to changes
  return CMS_DATA.homepage
}

export function useSiteSettings() {
  // In production, this would be a real hook that subscribes to changes
  return CMS_DATA.siteSettings
}

export function useBrandInfo() {
  const settings = useSiteSettings()
  return {
    name: settings.brand.name,
    tagline: settings.brand.tagline,
    logo: settings.brand.logo,
    colors: settings.brand.colors
  }
}

// =================== CONTENT VALIDATION ===================

export function validateProduct(product: Partial<Product>): string[] {
  const errors: string[] = []
  
  if (!product.name) errors.push('Name is required')
  if (!product.slug) errors.push('Slug is required')
  if (!product.description) errors.push('Description is required')
  if (!product.price || product.price <= 0) errors.push('Valid price is required')
  if (!product.heatLevel) errors.push('Heat level is required')
  if (!product.ingredients || product.ingredients.length === 0) errors.push('Ingredients are required')
  
  return errors
}

export function validateTourEvent(event: Partial<TourEvent>): string[] {
  const errors: string[] = []
  
  if (!event.date) errors.push('Date is required')
  if (!event.event) errors.push('Event name is required')
  if (!event.location) errors.push('Location is required')
  if (!event.status) errors.push('Status is required')
  
  return errors
}

// =================== CONTENT SYNC ===================

export class ContentSync {
  // In production, this would handle syncing with external CMS
  
  static async syncFromStrapi(): Promise<void> {
    // Fetch from Strapi and update local state
    console.log('Syncing content from Strapi...')
  }
  
  static async pushToStrapi(): Promise<void> {
    // Push local changes to Strapi
    console.log('Pushing content to Strapi...')
  }
  
  static async syncProducts(): Promise<Product[]> {
    // Sync products with external inventory system
    console.log('Syncing products...')
    return []
  }
}