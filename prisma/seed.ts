import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Smokin\' Hot database...')

  // Create default admin user
  const hashedPassword = await bcrypt.hash('SmokinHot2024!', 12)
  
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@smokhot.rs' },
    update: {},
    create: {
      email: 'admin@smokhot.rs',
      name: 'Admin',
      password: hashedPassword,
      role: 'super_admin'
    }
  })

  console.log('👤 Created admin:', { email: admin.email, name: admin.name })

  // Create products
  const products = [
    {
      name: 'Gecko Mild',
      slug: 'gecko-mild',
      description: 'Naš najblaži sos koji uvodi u svet Smokin\' Hot ukusa. Kombinacija dimljenih paprika, belog luka i mediteranskih začina stvara savršenu bazu za one koji tek počinju putovanje kroz ljutinu. Idealan za svakodnevnu upotrebu.',
      blurb: 'Pitom start sa dimom, belim lukom i karakterom.',
      heatLevel: 'mild',
      heatNumber: 1,
      price: 59000, // 590 RSD in cents
      ingredients: JSON.stringify(['Dimljene paprike', 'Beli luk', 'Sirće', 'Morska so', 'Origano', 'Timijan', 'Prirodni aromai']),
      volume: '150ml',
      scoville: 1500,
      pairings: JSON.stringify(['Burger', 'Sendvič', 'Grilovano povrće', 'Pasta']),
      inStock: true,
      stockCount: 45,
      featured: true,
      categories: JSON.stringify(['Ljuti sosovi', 'Dimljeni sosovi']),
      calories: 5,
      fat: 0,
      carbs: 1,
      protein: 0,
      sodium: 180
    },
    {
      name: 'Fireant Hot',
      slug: 'fireant-hot',
      description: 'Savršena ravnoteža između ukusa i topote. Fireant kombinuje sočne crvene paprike sa notama dima i začina koji dopunjuju, a ne potiskuju hranu. Ovo je sos koji ćete hteti na svakom obroku.',
      blurb: 'Za burgere, krilca i ekipu koja voli da pecka.',
      heatLevel: 'hot',
      heatNumber: 2,
      price: 64000, // 640 RSD
      originalPrice: 69000, // 690 RSD
      ingredients: JSON.stringify(['Crvene čili paprike', 'Rajčice', 'Beli luk', 'Luk', 'Jabučno sirće', 'Med', 'Kumin', 'Smoky paprika', 'Morska so']),
      volume: '150ml',
      scoville: 5500,
      pairings: JSON.stringify(['Burger', 'Krilca', 'Pizza', 'Ćevapi', 'Roštilj']),
      inStock: true,
      stockCount: 32,
      featured: true,
      categories: JSON.stringify(['Ljuti sosovi', 'BBQ sosovi']),
      calories: 8,
      fat: 0,
      carbs: 2,
      protein: 0,
      sodium: 200
    },
    {
      name: 'Firefly Extra Hot',
      slug: 'firefly-extra-hot',
      description: 'Ovde se razdvajaju deca od odraslih. Firefly donosi ozbiljnu dozu topote uz neverovatnu složenost ukusa. Voćne note mango-a i ananasa ublažavaju intenzitet habanero paprika, praveći sos koji boli, ali na pravi način.',
      blurb: 'Voćna vatra koja udara brzo i ostaje dugo.',
      heatLevel: 'extra-hot',
      heatNumber: 3,
      price: 72000, // 720 RSD
      ingredients: JSON.stringify(['Habanero paprike', 'Mango', 'Ananas', 'Crvene čili paprike', 'Limettin sok', 'Beli luk', 'Đumbir', 'Jabučno sirće', 'Agave sirup', 'Morska so']),
      volume: '150ml',
      scoville: 15000,
      pairings: JSON.stringify(['Roštilj', 'Krilca', 'Tortilje', 'Grilovano povrće']),
      inStock: true,
      stockCount: 28,
      featured: true,
      categories: JSON.stringify(['Ljuti sosovi', 'Voćni sosovi']),
      calories: 12,
      fat: 0,
      carbs: 3,
      protein: 1,
      sodium: 190
    },
    {
      name: 'Jackal Smokin\' Hot',
      slug: 'jackal-smokin-hot',
      description: 'Ovo nije sos - ovo je ispitivanje granica. Jackal je naša najjača kreacija, napravljena od carolina reaper paprika i ghost pepper-a. Uz duboke note dima i minimalnu količinu đumbira za balans, ovo je sos koji zahteva poštovanje.',
      blurb: 'Brutalan finiš za one koji traže haos, ne sos.',
      heatLevel: 'smokin-hot',
      heatNumber: 4,
      price: 85000, // 850 RSD
      ingredients: JSON.stringify(['Carolina Reaper paprike', 'Ghost pepper (Bhut jolokia)', 'Dimljene paprike', 'Jabučno sirće', 'Đumbir', 'Beli luk', 'Limettin sok', 'Morska so', '⚠️ Ekstremno ljuto ⚠️']),
      volume: '150ml',
      scoville: 45000,
      pairings: JSON.stringify(['Roštilj (oprezno!)', 'Začinjavanje jela', 'Izazov']),
      inStock: true,
      stockCount: 15,
      featured: true,
      categories: JSON.stringify(['Ljuti sosovi']),
      calories: 3,
      fat: 0,
      carbs: 1,
      protein: 0,
      sodium: 160
    },
    {
      name: 'Smoke & Mirrors BBQ',
      slug: 'smoke-mirrors-bbq',
      description: 'Naš jedini ne-ljuti sos koji ipak ima karakter. Kombinacija hickory dima, tamnog šećera i balkanske tradicije u modernom ruhu. Savršen za mariniranje mesa i kao završni dodatak roštilju.',
      blurb: 'Dim bez vatre - ukus bez granica.',
      heatLevel: 'mild',
      heatNumber: 1,
      price: 65000, // 650 RSD
      ingredients: JSON.stringify(['Dimljene rajčice', 'Tamni šećer', 'Balsamico sirće', 'Worcestershire sos', 'Beli luk', 'Crni luk', 'Parika', 'Timijan', 'Lovorov list']),
      volume: '200ml',
      scoville: 50,
      pairings: JSON.stringify(['Roštilj', 'Pljeskavica', 'Rebarca', 'Mariniranje']),
      inStock: true,
      stockCount: 38,
      featured: false,
      categories: JSON.stringify(['BBQ sosovi', 'Marinade', 'Dimljeni sosovi']),
      calories: 25,
      fat: 0,
      carbs: 6,
      protein: 1,
      sodium: 220
    },
    {
      name: 'Green Fury',
      slug: 'green-fury',
      description: 'Jedini zeleni sos u našoj kolekciji donosi svežest i oštru ljutinu serrano paprika. Kombinovan sa svežim začinskim biljem i lajmom, pravi je osveženje na roštilju.',
      blurb: 'Zelena bes sa svežim notama lajma.',
      heatLevel: 'hot',
      heatNumber: 2,
      price: 62000, // 620 RSD
      ingredients: JSON.stringify(['Serrano paprike', 'Jalapeño paprike', 'Svež korijander', 'Lajm sok', 'Beli luk', 'Luk', 'Jabučno sirće', 'Morska so', 'Kumin']),
      volume: '150ml',
      scoville: 4500,
      pairings: JSON.stringify(['Tortilje', 'Tacosi', 'Guacamole', 'Riba', 'Piletina']),
      inStock: true,
      stockCount: 22,
      featured: false,
      categories: JSON.stringify(['Ljuti sosovi']),
      calories: 6,
      fat: 0,
      carbs: 1,
      protein: 0,
      sodium: 170
    }
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product
    })
  }

  console.log('🌶️ Created/updated', products.length, 'products')

  // Create initial content
  const contents = [
    {
      key: 'hero_title',
      title: 'Hero Headline',
      content: 'Ljuti sos koji zvuči kao rif.',
      type: 'text',
      section: 'hero'
    },
    {
      key: 'hero_subtitle',
      title: 'Hero Subtitle',
      content: 'Premium srpski hot sauce brend. Od pitomog dima do totalnog haosa. Mala proizvodnja, veliki karakter, pouzeće bez komplikacija.',
      type: 'text',
      section: 'hero'
    },
    {
      key: 'brand_headline',
      title: 'Brand Story Headline',
      content: 'Domaći sos. Prljav karakter. Čist ukus.',
      type: 'text',
      section: 'about'
    },
    {
      key: 'brand_story',
      title: 'Brand Story Text',
      content: 'Smokin\' Hot nije još jedan generičan food brand. Spajamo garažnu energiju, craft kvalitet i ozbiljnu ljubav prema paprici. Vizuelno smo glasni, ali ukus mora da govori najglasnije.',
      type: 'text',
      section: 'about'
    },
    {
      key: 'contact_info',
      title: 'Contact Information',
      content: JSON.stringify({
        phone: '+381 60 123 4567',
        email: 'info@smokhot.rs',
        address: 'Beograd, Srbija',
        instagram: '@smokhot',
        facebook: 'SmokinHotSrbija'
      }),
      type: 'json',
      section: 'contact'
    }
  ]

  for (const content of contents) {
    await prisma.content.upsert({
      where: { key: content.key },
      update: content,
      create: content
    })
  }

  console.log('📝 Created/updated', contents.length, 'content items')

  // Create initial settings
  const settings = [
    {
      key: 'site_settings',
      value: JSON.stringify({
        siteName: 'Smokin\' Hot',
        tagline: 'Rock \'n\' Roll Hot Sauces',
        currency: 'RSD',
        shippingCost: 300,
        freeShippingThreshold: 3000,
        orderPrefix: 'SH-'
      })
    },
    {
      key: 'delivery_settings',
      value: JSON.stringify({
        enabled: true,
        deliveryDays: '1-3 radna dana',
        regions: ['Beograd', 'Novi Sad', 'Niš', 'Kragujevac', 'Ostale opštine'],
        codOnly: true
      })
    }
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: setting,
      create: setting
    })
  }

  console.log('⚙️ Created/updated', settings.length, 'settings')

  console.log('🔥 Smokin\' Hot database seeded successfully!')
  console.log('👤 Admin login: admin@smokhot.rs / SmokinHot2024!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })