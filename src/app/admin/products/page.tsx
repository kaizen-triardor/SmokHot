'use client'

import { useState, useEffect } from 'react'
import { products as initialProducts } from '@/data/products'
import { Product } from '@/types/product'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleDelete = (productId: string) => {
    if (confirm('Da li ste sigurni da želite da obrišete ovaj proizvod?')) {
      setProducts(prev => prev.filter(p => p.id !== productId))
    }
  }

  const handleSave = (productData: Partial<Product>) => {
    if (editingProduct) {
      // Update existing
      setProducts(prev => prev.map(p => 
        p.id === editingProduct.id ? { ...p, ...productData } : p
      ))
    } else {
      // Create new
      const newProduct: Product = {
        id: Date.now().toString(),
        slug: productData.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || '',
        inStock: true,
        featured: false,
        stockCount: 100,
        images: {
          main: '/images/products/default-product.jpg',
          gallery: ['/images/products/default-product.jpg'],
          thumbnail: '/images/products/default-product.jpg'
        },
        nutritionInfo: {
          calories: 5,
          fat: 0,
          carbs: 1,
          protein: 0,
          sodium: 150
        },
        category: ['Ljuti sosovi'],
        ...productData,
      } as Product
      
      setProducts(prev => [...prev, newProduct])
    }
    
    setEditingProduct(null)
    setShowForm(false)
  }

  const ProductForm = ({ product, onSave, onCancel }: {
    product?: Product | null,
    onSave: (data: Partial<Product>) => void,
    onCancel: () => void
  }) => {
    const [formData, setFormData] = useState({
      name: product?.name || '',
      blurb: product?.blurb || '',
      description: product?.description || '',
      heatNumber: product?.heatNumber || 1,
      price: product?.price || 590,
      originalPrice: product?.originalPrice || undefined,
      volume: product?.volume || '150ml',
      scoville: product?.scoville || undefined,
      ingredients: product?.ingredients?.join(', ') || '',
      pairings: product?.pairings?.join(', ') || '',
      featured: product?.featured || false,
      inStock: product?.inStock !== false,
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      
      const processedData = {
        ...formData,
        ingredients: formData.ingredients.split(',').map(s => s.trim()).filter(Boolean),
        pairings: formData.pairings.split(',').map(s => s.trim()).filter(Boolean),
        heatLevel: (['mild', 'hot', 'extra-hot', 'smokin-hot'][formData.heatNumber - 1] || 'mild') as any
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
            {/* Basic Info */}
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
                <label className="block text-sm font-bold text-white mb-2">Ljutina (1-6)</label>
                <select
                  value={formData.heatNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, heatNumber: parseInt(e.target.value) }))}
                  className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white focus:border-ember-500 focus:outline-none"
                >
                  <option value={1}>1 - Blago</option>
                  <option value={2}>2 - Ljuto</option>
                  <option value={3}>3 - Jako ljuto</option>
                  <option value={4}>4 - Pakleno</option>
                  <option value={5}>5 - Ekstremno</option>
                  <option value={6}>6 - Smrtonosno</option>
                </select>
              </div>
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

            {/* Price & Details */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Cena (RSD) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) }))}
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
                <label className="block text-sm font-bold text-white mb-2">Količina</label>
                <input
                  type="text"
                  value={formData.volume}
                  onChange={(e) => setFormData(prev => ({ ...prev, volume: e.target.value }))}
                  className="w-full rounded-xl border border-white/20 bg-primary-950/50 px-4 py-3 text-white focus:border-ember-500 focus:outline-none"
                  placeholder="150ml"
                />
              </div>
            </div>

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

            {/* Checkboxes */}
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="rounded border-white/20 bg-primary-950/50 focus:ring-ember-500"
                />
                Istakni na početnoj
              </label>
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={formData.inStock}
                  onChange={(e) => setFormData(prev => ({ ...prev, inStock: e.target.checked }))}
                  className="rounded border-white/20 bg-primary-950/50 focus:ring-ember-500"
                />
                Na stanju
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 rounded-xl border-2 border-ember-500 bg-ember-500 py-3 font-bold uppercase tracking-[0.15em] text-white transition hover:-translate-y-1"
              >
                {product ? 'Sačuvaj izmene' : 'Dodaj proizvod'}
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
                <th className="text-left p-4 text-sm font-bold text-white/80">Status</th>
                <th className="text-right p-4 text-sm font-bold text-white/80">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div>
                      <div className="font-bold text-white">{product.name}</div>
                      <div className="text-sm text-white/60">{product.blurb}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-ember-500"></div>
                      <span className="text-white/70">{product.heatNumber}/6</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-white font-bold">{product.price} RSD</div>
                    {product.originalPrice && (
                      <div className="text-sm text-white/50 line-through">{product.originalPrice} RSD</div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${product.inStock ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {product.inStock ? 'Na stanju' : 'Nema na stanju'}
                      </span>
                      {product.featured && (
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
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