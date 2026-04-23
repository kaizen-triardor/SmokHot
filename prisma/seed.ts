import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌶️ Seeding SmokHot database...\n')

  // ============ ADMIN USER ============
  const adminPassword = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD || 'Barajevo1389', 12)

  const admin = await prisma.admin.upsert({
    where: { email: process.env.DEFAULT_ADMIN_EMAIL || 'smokinhotcollective@gmail.com' },
    update: {},
    create: {
      email: process.env.DEFAULT_ADMIN_EMAIL || 'smokinhotcollective@gmail.com',
      name: 'SmokHot Admin',
      password: adminPassword,
      role: 'super_admin',
      active: true,
    }
  })
  console.log(`✅ Admin user: ${admin.email}`)

  // ============ PRODUCTS ============
  const productsData = [
    {
      name: 'Gecko Mild',
      slug: 'gecko-mild',
      mainImage: '/uploads/products/gecko-mild.webp',
      description: 'Naš najblaži sos koji uvodi u svet Smokin\' Hot ukusa. Kombinacija dimljenih paprika, belog luka i mediteranskih začina stvara savršenu bazu za one koji tek počinju putovanje kroz ljutinu.',
      blurb: 'Pitom start sa dimom, belim lukom i karakterom.',
      heatLevel: 'mild',
      heatNumber: 1,
      price: 590,
      ingredients: JSON.stringify(['Dimljene paprike', 'Beli luk', 'Sirće', 'Morska so', 'Origano', 'Timijan', 'Prirodni aromai']),
      volume: '150ml',
      scoville: 1500,
      pairings: JSON.stringify(['Burger', 'Sendvič', 'Grilovano povrće', 'Pasta']),
      inStock: true,
      stockCount: 45,
      featured: true,
      categories: JSON.stringify(['Ljuti sosovi', 'Dimljeni sosovi']),
      calories: 5, fat: 0, carbs: 1, protein: 0, sodium: 180,
    },
    {
      name: 'Fireant Hot',
      slug: 'fireant-hot',
      mainImage: '/uploads/products/fireant-hot.webp',
      description: 'Savršena ravnoteža između ukusa i toplote. Fireant kombinuje sočne crvene paprike sa notama dima i začina koji dopunjuju, a ne potiskuju hranu.',
      blurb: 'Za burgere, krilca i ekipu koja voli da pecka.',
      heatLevel: 'hot',
      heatNumber: 2,
      price: 640,
      originalPrice: 690,
      ingredients: JSON.stringify(['Crvene čili paprike', 'Rajčice', 'Beli luk', 'Luk', 'Jabučno sirće', 'Med', 'Kumin', 'Smoky paprika', 'Morska so']),
      volume: '150ml',
      scoville: 5500,
      pairings: JSON.stringify(['Burger', 'Krilca', 'Pizza', 'Ćevapi', 'Roštilj']),
      inStock: true,
      stockCount: 32,
      featured: true,
      categories: JSON.stringify(['Ljuti sosovi', 'BBQ sosovi']),
      calories: 8, fat: 0, carbs: 2, protein: 0, sodium: 200,
    },
    {
      name: 'Firefly Extra Hot',
      slug: 'firefly-extra-hot',
      mainImage: '/uploads/products/firefly-extra-hot.webp',
      description: 'Ovde se razdvajaju deca od odraslih. Firefly donosi ozbiljnu dozu toplote uz neverovatnu složenost ukusa. Voćne note mangoa i ananasa ublažavaju intenzitet habanero paprika.',
      blurb: 'Voćna vatra koja udara brzo i ostaje dugo.',
      heatLevel: 'extra-hot',
      heatNumber: 3,
      price: 720,
      ingredients: JSON.stringify(['Habanero paprike', 'Mango', 'Ananas', 'Crvene čili paprike', 'Limettin sok', 'Beli luk', 'Đumbir', 'Jabučno sirće', 'Agave sirup', 'Morska so']),
      volume: '150ml',
      scoville: 15000,
      pairings: JSON.stringify(['Roštilj', 'Krilca', 'Tortilje', 'Grilovano povrće']),
      inStock: true,
      stockCount: 28,
      featured: true,
      categories: JSON.stringify(['Ljuti sosovi', 'Voćni sosovi']),
      calories: 12, fat: 0, carbs: 3, protein: 1, sodium: 190,
    },
    {
      name: 'Jackal Smokin\' Hot',
      slug: 'jackal-smokin-hot',
      mainImage: '/uploads/products/jackal-smokin-hot.webp',
      description: 'Ovo nije sos - ovo je ispitivanje granica. Jackal je naša najjača kreacija, napravljena od Carolina Reaper paprika i Ghost peppera. Sos koji zahteva poštovanje.',
      blurb: 'Brutalan finiš za one koji traže haos, ne sos.',
      heatLevel: 'smokin-hot',
      heatNumber: 4,
      price: 850,
      ingredients: JSON.stringify(['Carolina Reaper paprike', 'Ghost pepper (Bhut jolokia)', 'Dimljene paprike', 'Jabučno sirće', 'Đumbir', 'Beli luk', 'Limettin sok', 'Morska so']),
      volume: '150ml',
      scoville: 45000,
      pairings: JSON.stringify(['Roštilj (oprezno!)', 'Začinjavanje jela', 'Izazov']),
      inStock: true,
      stockCount: 15,
      featured: true,
      categories: JSON.stringify(['Ljuti sosovi']),
      calories: 3, fat: 0, carbs: 1, protein: 0, sodium: 160,
    },
    {
      name: 'Smoke & Mirrors BBQ',
      slug: 'smoke-mirrors-bbq',
      mainImage: '/uploads/products/smoke-mirrors-bbq.webp',
      description: 'Naš jedini ne-ljuti sos koji ipak ima karakter. Kombinacija hickory dima, tamnog šećera i balkanske tradicije u modernom ruhu. Savršen za mariniranje mesa.',
      blurb: 'Dim bez vatre - ukus bez granica.',
      heatLevel: 'mild',
      heatNumber: 1,
      price: 650,
      ingredients: JSON.stringify(['Dimljene rajčice', 'Tamni šećer', 'Balsamico sirće', 'Worcestershire sos', 'Beli luk', 'Crni luk', 'Paprika', 'Timijan', 'Lovorov list']),
      volume: '200ml',
      scoville: 50,
      pairings: JSON.stringify(['Roštilj', 'Pljeskavica', 'Rebarca', 'Mariniranje']),
      inStock: true,
      stockCount: 38,
      featured: false,
      categories: JSON.stringify(['BBQ sosovi', 'Marinade', 'Dimljeni sosovi']),
      calories: 25, fat: 0, carbs: 6, protein: 1, sodium: 220,
    },
    {
      name: 'Green Fury',
      slug: 'green-fury',
      mainImage: '/uploads/products/green-fury.webp',
      description: 'Jedini zeleni sos u našoj kolekciji donosi svežest i oštru ljutinu serrano paprika. Kombinovan sa svežim začinskim biljem i lajmom.',
      blurb: 'Zelena bes sa svežim notama lajma.',
      heatLevel: 'hot',
      heatNumber: 2,
      price: 620,
      ingredients: JSON.stringify(['Serrano paprike', 'Jalapeño paprike', 'Svež korijandar', 'Lajm sok', 'Beli luk', 'Luk', 'Jabučno sirće', 'Morska so', 'Kumin']),
      volume: '150ml',
      scoville: 4500,
      pairings: JSON.stringify(['Tortilje', 'Tacosi', 'Guacamole', 'Riba', 'Piletina']),
      inStock: true,
      stockCount: 22,
      featured: false,
      categories: JSON.stringify(['Ljuti sosovi']),
      calories: 6, fat: 0, carbs: 1, protein: 0, sodium: 170,
    },
  ]

  for (const product of productsData) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    })
  }
  console.log(`✅ ${productsData.length} products seeded`)

  // ============ SETTINGS ============
  const settingsData = [
    { key: 'delivery_cost', value: '500' },
    { key: 'free_delivery_threshold', value: '3000' },
    { key: 'shop_status', value: 'active' },
    { key: 'payment_cod', value: 'true' },
    { key: 'currency', value: 'RSD' },
    { key: 'min_order_amount', value: '0' },
    { key: 'low_stock_alert', value: '5' },
  ]

  for (const setting of settingsData) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
  }
  console.log(`✅ ${settingsData.length} settings seeded`)

  console.log('\n🔥 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
