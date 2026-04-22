'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface ProductData {
  id: string
  name: string
  slug: string
  blurb: string
  description: string
  heatLevel: string
  heatNumber: number
  price: number
  originalPrice?: number | null
  volume: string
  scoville?: number | null
  ingredients: string[]
  pairings: string[]
  categories: string[]
  mainImage: string | null
  featured: boolean
  inStock: boolean
  stockCount: number
}

export default function ProductsAdmin() {
  const [products, setProducts] = useState<ProductData[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [saving, setSaving] = useState(false)

  const getToken = () => localStorage.getItem('admin-token') || ''

  // Fetch products from database
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products?_start=0&_end=100&_sort=heatNumber&_order=ASC', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (product: ProductData) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovaj proizvod?')) return

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      if (res.ok) {
        await fetchProducts()
      } else {
        alert('Greška pri brisanju proizvoda')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Greška pri brisanju proizvoda')
    }
  }

  const handleSave = async (productData: Record<string, unknown>) => {
    setSaving(true)
    try {
      if (editingProduct) {
        // Update existing
        const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(productData)
        })
        if (!res.ok) {
          alert('Greška pri čuvanju izmena')
          return
        }
      } else {
        // Create new
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(productData)
        })
        if (!res.ok) {
          alert('Greška pri dodavanju proizvoda')
          return
        }
      }

      await fetchProducts()
      setEditingProduct(null)
      setShowForm(false)
    } catch (error) {
      console.error('Save error:', error)
      alert('Greška pri čuvanju')
    } finally {
      setSaving(false)
    }
  }

  const ProductForm = ({ product, onSave, onCancel }: {
    product?: ProductData | null,
    onSave: (data: Record<string, unknown>) => void,
    onCancel: () => void
  }) => {
    const [formData, setFormData] = useState({
      name: product?.name || '',
      blurb: product?.blurb || '',
      description: product?.description || '',
      heatNumber: product?.heatNumber || 1,
      price: product?.price || 590,
      originalPrice: product?.originalPrice || undefined as number | undefined,
      volume: product?.volume || '150ml',
      scoville: product?.scoville || undefined as number | undefined,
      mainImage: product?.mainImage || '',
      ingredients: product?.ingredients?.join(', ') || '',
      pairings: product?.pairings?.join(', ') || '',
      featured: product?.featured || false,
      inStock: product?.inStock !== false,
      stockCount: product?.stockCount || 0,
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()

      const processedData = {
        name: formData.name,
        slug: product?.slug || formData.name.toLowerCase().replace(/[^a-z0-9šđčćž]+/g, '-').replace(/-+$/, ''),
        blurb: formData.blurb,
        description: formData.description,
        heatNumber: formData.heatNumber,
        heatLevel: ['mild', 'hot', 'extra-hot', 'smokin-hot'][formData.heatNumber - 1] || 'mild',
        price: formData.price,
        originalPrice: formData.originalPrice || null,
        volume: formData.volume,
        scoville: formData.scoville || null,
        mainImage: formData.mainImage || null,
        ingredients: formData.ingredients.split(',').map(s => s.trim()).filter(Boolean),
        pairings: formData.pairings.split(',').map(s => s.trim()).filter(Boolean),
        featured: formData.featured,
        inStock: formData.inStock,
        stockCount: formData.stockCount,
        categories: product?.categories || ['Ljuti sosovi'],
      }

      onSave(processedData)
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-surface rounded-2xl border border-white/10 p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-white mb-6">
            {product ? 'Uredi proizvod' : 'Dodaj novi proizvod'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Naziv *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none"
                  placeholder="Gecko Mild"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Ljutina (1-4)</label>
                <select
                  value={formData.heatNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, heatNumber: parseInt(e.target.value) }))}
                  className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white focus:border-ember-500 focus:outline-none"
                >
                  <option value={1}>1 - Blago</option>
                  <option value={2}>2 - Ljuto</option>
                  <option value={3}>3 - Jako ljuto</option>
                  <option value={4}>4 - Pakleno</option>
                </select>
              </div>
            </div>

            {/* Product Image */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">Slika proizvoda (URL ili putanja)</label>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={formData.mainImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, mainImage: e.target.value }))}
                  className="flex-1 rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none"
                  placeholder="/uploads/products/ime-proizvoda.jpg"
                />
                {formData.mainImage && (
                  <div className="h-12 w-12 rounded-lg border border-white/20 overflow-hidden flex-shrink-0">
                    <img src={formData.mainImage} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-white/40">Lokalna putanja (npr. /uploads/products/gecko-mild.jpg) ili URL slike</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">Kratki opis *</label>
              <input
                type="text"
                value={formData.blurb}
                onChange={(e) => setFormData(prev => ({ ...prev, blurb: e.target.value }))}
                required
                className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none"
                placeholder="Za one koji vole da živnu..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">Potpun opis *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                rows={3}
                className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none"
                placeholder="Detaljan opis proizvoda..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Cena (RSD) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                  required
                  className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white focus:border-ember-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Stara cena</label>
                <input
                  type="number"
                  value={formData.originalPrice || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value ? parseInt(e.target.value) : undefined }))}
                  className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white focus:border-ember-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Zapremina</label>
                <input
                  type="text"
                  value={formData.volume}
                  onChange={(e) => setFormData(prev => ({ ...prev, volume: e.target.value }))}
                  className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white focus:border-ember-500 focus:outline-none"
                  placeholder="150ml"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Scoville jedinice</label>
                <input
                  type="number"
                  value={formData.scoville || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, scoville: e.target.value ? parseInt(e.target.value) : undefined }))}
                  className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white focus:border-ember-500 focus:outline-none"
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Komada na stanju</label>
                <input
                  type="number"
                  value={formData.stockCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, stockCount: parseInt(e.target.value) || 0 }))}
                  className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white focus:border-ember-500 focus:outline-none"
                  placeholder="50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">Sastojci (odvojeni zarezom)</label>
              <textarea
                value={formData.ingredients}
                onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
                rows={2}
                className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none"
                placeholder="Paprika, voda, sirće, so, začini..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">Ide uz (odvojeni zarezom)</label>
              <textarea
                value={formData.pairings}
                onChange={(e) => setFormData(prev => ({ ...prev, pairings: e.target.value }))}
                rows={2}
                className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none"
                placeholder="Pizza, gril, burgeri..."
              />
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="rounded border-white/20 bg-primary-950/50 focus:ring-ember-500"
                />
                Istakni na početnoj
              </label>
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.inStock}
                  onChange={(e) => setFormData(prev => ({ ...prev, inStock: e.target.checked }))}
                  className="rounded border-white/20 bg-primary-950/50 focus:ring-ember-500"
                />
                Na stanju
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-xl border-2 border-ember-500 bg-ember-500 py-3 font-bold uppercase tracking-[0.15em] text-white transition hover:-translate-y-1 disabled:opacity-50"
              >
                {saving ? 'Čuva se...' : product ? 'Sačuvaj izmene' : 'Dodaj proizvod'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 rounded-xl border-2 border-white/20 py-3 font-bold uppercase tracking-[0.15em] text-white transition hover:bg-white/5"
              >
                Otkaži
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-ember-500" />
          <p className="text-white/60">Učitavanje proizvoda...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Upravljanje proizvodima</h1>
          <p className="mt-2 text-white/70">Dodaj, uredi i obriši proizvode u shop-u</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null)
            setShowForm(true)
          }}
          className="flex items-center gap-2 rounded-xl border-2 border-ember-500 bg-ember-500 px-6 py-3 font-bold uppercase tracking-[0.15em] text-white transition hover:-translate-y-1"
        >
          <PlusIcon className="h-5 w-5" />
          Dodaj proizvod
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Pretraži proizvode..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md rounded-xl border border-white/20 bg-surface/50 px-4 py-3 text-white placeholder-white/50 focus:border-ember-500 focus:outline-none"
        />
      </div>

      {/* Products Table */}
      <div className="rounded-2xl border border-white/10 bg-surface/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20 border-b border-white/10">
              <tr>
                <th className="text-left p-4 text-sm font-bold text-white/80">Proizvod</th>
                <th className="text-left p-4 text-sm font-bold text-white/80">Ljutina</th>
                <th className="text-left p-4 text-sm font-bold text-white/80">Cena</th>
                <th className="text-left p-4 text-sm font-bold text-white/80">Stanje</th>
                <th className="text-left p-4 text-sm font-bold text-white/80">Status</th>
                <th className="text-right p-4 text-sm font-bold text-white/80">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {product.mainImage ? (
                        <div className="h-12 w-12 rounded-lg border border-white/10 overflow-hidden flex-shrink-0">
                          <img src={product.mainImage} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center flex-shrink-0">
                          <span className="text-white/30 text-xs">Nema</span>
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-white">{product.name}</div>
                        <div className="text-sm text-white/60">{product.blurb}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-ember-500"></div>
                      <span className="text-white/70">{product.heatNumber}/4</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-white font-bold">{product.price} RSD</div>
                    {product.originalPrice && (
                      <div className="text-sm text-white/50 line-through">{product.originalPrice} RSD</div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="text-white/70">{product.stockCount} kom</span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className={`text-xs px-2 py-1 rounded-full w-fit ${product.inStock ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {product.inStock ? 'Na stanju' : 'Nema'}
                      </span>
                      {product.featured && (
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 w-fit">
                          Istaknuto
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 rounded-lg bg-ember-500/20 text-ember-400 hover:bg-ember-500 hover:text-white transition"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/50">Nema proizvoda koji odgovaraju pretrazi</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingProduct(null)
          }}
        />
      )}
    </div>
  )
}
