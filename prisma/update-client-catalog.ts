/**
 * One-off: update product catalog to match client's Data Request (2026-04-22).
 * Run once: `npx tsx prisma/update-client-catalog.ts`
 *
 * - Removes 3 products not in client's list (smoke-mirrors-bbq, green-fury, stepski-vuk)
 * - Updates 4 existing products (price 700 RSD, volume 106ml, scoville null)
 * - Creates 3 new products (meerkat-mild-hot, black-queen-honey-extra-hot, plumen-jam-pickant)
 * - Updates settings (delivery threshold kept, currency kept)
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const VOLUME = '106ml'
const PRICE = 700

const catalog = [
  {
    name: 'Gecko Mild',
    slug: 'gecko-mild',
    heatLevel: 'mild',
    heatNumber: 1,
    mainImage: '/uploads/products/gecko-mild.jpg',
    description:
      "Naš najblaži sos koji uvodi u svet Smokin' Hot ukusa. Kombinacija dimljenih paprika, belog luka i mediteranskih začina stvara savršenu bazu za one koji tek počinju putovanje kroz ljutinu.",
    blurb: 'Pitom start sa dimom, belim lukom i karakterom.',
    ingredients: JSON.stringify(['Dimljene paprike', 'Beli luk', 'Sirće', 'Morska so', 'Origano', 'Timijan']),
    pairings: JSON.stringify(['Burger', 'Sendvič', 'Grilovano povrće', 'Pasta']),
    categories: JSON.stringify(['Ljuti sosovi', 'Dimljeni sosovi']),
    featured: true,
  },
  {
    name: 'Fireant Hot',
    slug: 'fireant-hot',
    heatLevel: 'hot',
    heatNumber: 2,
    mainImage: '/uploads/products/fireant-hot.jpg',
    description:
      'Savršena ravnoteža između ukusa i toplote. Fireant kombinuje sočne crvene paprike sa notama dima i začina koji dopunjuju, a ne potiskuju hranu.',
    blurb: 'Za burgere, krilca i ekipu koja voli da pecka.',
    ingredients: JSON.stringify(['Crvene čili paprike', 'Rajčice', 'Beli luk', 'Luk', 'Jabučno sirće', 'Med', 'Kumin', 'Morska so']),
    pairings: JSON.stringify(['Burger', 'Krilca', 'Pizza', 'Ćevapi', 'Roštilj']),
    categories: JSON.stringify(['Ljuti sosovi', 'BBQ sosovi']),
    featured: true,
  },
  {
    name: 'Firefly Extra Hot',
    slug: 'firefly-extra-hot',
    heatLevel: 'extra-hot',
    heatNumber: 3,
    mainImage: '/uploads/products/firefly-extra-hot.jpg',
    description:
      'Ovde se razdvajaju deca od odraslih. Firefly donosi ozbiljnu dozu toplote uz neverovatnu složenost ukusa. Voćne note mangoa i ananasa ublažavaju intenzitet habanero paprika.',
    blurb: 'Voćna vatra koja udara brzo i ostaje dugo.',
    ingredients: JSON.stringify(['Habanero paprike', 'Mango', 'Ananas', 'Crvene čili paprike', 'Limettin sok', 'Beli luk', 'Đumbir', 'Jabučno sirće', 'Morska so']),
    pairings: JSON.stringify(['Roštilj', 'Krilca', 'Tortilje', 'Grilovano povrće']),
    categories: JSON.stringify(['Ljuti sosovi', 'Voćni sosovi']),
    featured: true,
  },
  {
    name: "Jackal Smokin' Hot",
    slug: 'jackal-smokin-hot',
    heatLevel: 'smokin-hot',
    heatNumber: 4,
    mainImage: '/uploads/products/jackal-smokin-hot.jpg',
    description:
      'Ovo nije sos - ovo je ispitivanje granica. Jackal je naša najjača kreacija, napravljena od Carolina Reaper paprika i Ghost peppera. Sos koji zahteva poštovanje.',
    blurb: 'Brutalan finiš za one koji traže haos, ne sos.',
    ingredients: JSON.stringify(['Carolina Reaper paprike', 'Ghost pepper', 'Dimljene paprike', 'Jabučno sirće', 'Đumbir', 'Beli luk', 'Morska so']),
    pairings: JSON.stringify(['Roštilj (oprezno!)', 'Začinjavanje jela', 'Izazov']),
    categories: JSON.stringify(['Ljuti sosovi']),
    featured: true,
  },
  {
    name: 'Meerkat Mild/Hot',
    slug: 'meerkat-mild-hot',
    heatLevel: 'hot',
    heatNumber: 2,
    mainImage: null,
    description:
      'Srednja ljutina sa karakterom. Meerkat je idealan za one koji žele više od blagog, ali još nisu spremni za pravu vatru. Balans između ukusa i toplote.',
    blurb: 'Srednji put - ukus bez kompromisa.',
    ingredients: JSON.stringify(['Paprika srednje ljutine', 'Crvene paprike', 'Beli luk', 'Jabučno sirće', 'Začinsko bilje', 'Morska so']),
    pairings: JSON.stringify(['Pljeskavica', 'Pileća krilca', 'Sendvič', 'Tortilja']),
    categories: JSON.stringify(['Ljuti sosovi']),
    featured: false,
  },
  {
    // NOTE: client 2026-04-22 — Black Queen Honey Extra Hot je u pripremi, nije u prodaji.
    // Ostaje na sajtu kao "Nema na stanju" dok se ne proizvede.
    name: 'Black Queen Honey Extra Hot',
    slug: 'black-queen-honey-extra-hot',
    heatLevel: 'extra-hot',
    heatNumber: 3,
    mainImage: null,
    description:
      'Kraljica u crnom: sladak med i tamna ljutina u istoj flaši. Black Queen kombinuje habanero intenzitet sa medenom zaokruženošću — luksuz za nepce koje voli izazov. Trenutno u pripremi.',
    blurb: 'Med i vatra — ljutina koju želiš da liznes. (Uskoro)',
    ingredients: JSON.stringify(['Habanero paprike', 'Med', 'Crne paprike', 'Beli luk', 'Jabučno sirće', 'Začini', 'Morska so']),
    pairings: JSON.stringify(['Roštilj', 'Piletina', 'Sir', 'Marinade']),
    categories: JSON.stringify(['Ljuti sosovi', 'Medeni sosovi']),
    featured: false,
    inStock: false,
    stockCount: 0,
  },
  {
    name: 'Plumen Jam Pickant',
    slug: 'plumen-jam-pickant',
    heatLevel: 'hot',
    heatNumber: 2,
    mainImage: null,
    description:
      'Pickant-ljuti džem sa šljivama i dimom. Neočekivana kombinacija koja menja pravila — dobro se slaže sa sirom, mesom i slanim pekarskim proizvodima.',
    blurb: 'Slatko-ljuti džem sa karakterom.',
    ingredients: JSON.stringify(['Šljive', 'Crvene paprike', 'Šećer od trske', 'Jabučno sirće', 'Začini', 'Morska so']),
    pairings: JSON.stringify(['Sir', 'Peciva', 'Prosciutto', 'Meso sa roštilja']),
    categories: JSON.stringify(['Ljuti sosovi', 'Džemovi']),
    featured: true,
  },
]

async function main() {
  console.log('🌶️ Updating SmokHot catalog to client 2026-04-22 spec...\n')

  // 1. Remove products no longer in catalog
  const toRemove = ['smoke-mirrors-bbq', 'green-fury', 'stepski-vuk']
  for (const slug of toRemove) {
    const result = await prisma.product.deleteMany({ where: { slug } })
    if (result.count) console.log(`  ❌ Removed ${slug}`)
  }

  // 2. Upsert the 7 current products
  for (const p of catalog) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        blurb: p.blurb,
        heatLevel: p.heatLevel,
        heatNumber: p.heatNumber,
        price: PRICE,
        originalPrice: null,
        mainImage: p.mainImage,
        ingredients: p.ingredients,
        volume: VOLUME,
        scoville: null,
        pairings: p.pairings,
        inStock: (p as any).inStock ?? true,
        stockCount: (p as any).stockCount ?? 20,
        featured: p.featured,
        categories: p.categories,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        blurb: p.blurb,
        heatLevel: p.heatLevel,
        heatNumber: p.heatNumber,
        price: PRICE,
        mainImage: p.mainImage,
        ingredients: p.ingredients,
        volume: VOLUME,
        scoville: null,
        pairings: p.pairings,
        inStock: (p as any).inStock ?? true,
        stockCount: (p as any).stockCount ?? 20,
        featured: p.featured,
        categories: p.categories,
      },
    })
    console.log(`  ✅ ${p.name} (${p.slug}) — ${PRICE} RSD / ${VOLUME} / heat ${p.heatNumber}`)
  }

  // 3. Update contact content entries (if schema has a Content table)
  const contacts = [
    { key: 'contact_company_name', value: 'SmokinHot Collective', section: 'global', type: 'text', title: 'Firm legal name' },
    { key: 'contact_phone', value: '+381 63 644 599', section: 'contact', type: 'text', title: 'Phone' },
    { key: 'contact_email', value: 'smokinhotcollective@gmail.com', section: 'contact', type: 'text', title: 'Email' },
    { key: 'contact_address', value: 'Srednjokrajska 23D, Barajevo', section: 'contact', type: 'text', title: 'Address' },
    { key: 'contact_city', value: 'Beograd 11000', section: 'contact', type: 'text', title: 'City + postal' },
    { key: 'contact_hours', value: '24 / 7', section: 'contact', type: 'text', title: 'Working hours' },
    { key: 'social_instagram', value: 'https://www.instagram.com/smokhot/', section: 'global', type: 'text', title: 'Instagram' },
    { key: 'social_facebook', value: 'https://www.facebook.com/smokhot/', section: 'global', type: 'text', title: 'Facebook' },
    { key: 'social_tiktok', value: 'https://www.tiktok.com/@smokhot011', section: 'global', type: 'text', title: 'TikTok' },
    { key: 'social_linkedin', value: 'https://www.linkedin.com/company/71262668', section: 'global', type: 'text', title: 'LinkedIn' },
  ]

  for (const c of contacts) {
    await prisma.content.upsert({
      where: { key: c.key },
      update: { content: c.value, section: c.section, type: c.type, title: c.title },
      create: { key: c.key, content: c.value, section: c.section, type: c.type, title: c.title },
    })
  }
  console.log(`\n✅ ${contacts.length} contact/brand entries upserted`)

  console.log('\n🎉 Catalog + contact update complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
