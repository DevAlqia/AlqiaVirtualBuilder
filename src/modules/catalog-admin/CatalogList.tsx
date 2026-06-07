import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Pencil } from 'lucide-react'
import { GlassPanel } from '@/components/glass/GlassPanel'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { catalogService } from '@/services'
import { ProductForm } from './ProductForm'
import type { Product, ProductCategory } from '@/types'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/format'

export function CatalogList() {
  const [search, setSearch] = useState('')
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | undefined>(undefined)

  const { data: categories = [] } = useQuery<ProductCategory[]>({
    queryKey: ['categories'],
    queryFn: () => catalogService.getCategories(),
  })

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products', activeCategoryId],
    queryFn: () => catalogService.getProducts(activeCategoryId ?? undefined),
  })

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <>
    <div className="p-6 space-y-4 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-white text-xl font-questrial font-semibold">Catálogo de productos</h1>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => { setEditProduct(undefined); setFormOpen(true) }}
        >
          Agregar producto
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="pl-8 pr-3 py-1.5 bg-white/[0.06] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-content-muted focus:outline-none focus:ring-1 focus:ring-alqia-orange/40 w-52 transition-all"
          />
        </div>
        <button
          onClick={() => setActiveCategoryId(null)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
            activeCategoryId === null
              ? 'bg-alqia-orange/10 text-alqia-orange border border-alqia-orange/20'
              : 'text-content-secondary hover:text-white hover:bg-white/[0.06]'
          )}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategoryId(cat.id)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              activeCategoryId === cat.id
                ? 'bg-alqia-orange/10 text-alqia-orange border border-alqia-orange/20'
                : 'text-content-secondary hover:text-white hover:bg-white/[0.06]'
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid de productos */}
      {filtered.length === 0 ? (
        <GlassPanel className="p-8 text-center">
          <p className="text-content-muted text-sm">No se encontraron productos.</p>
        </GlassPanel>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((product: Product) => (
            <GlassPanel
              key={product.id}
              className="overflow-hidden cursor-pointer hover:bg-white/[0.08] transition-all group"
            >
              <div className="h-28 bg-gradient-to-br from-alqia-blue/40 to-bg-dark flex items-center justify-center relative">
                <span className="text-white/10 text-4xl font-questrial font-bold select-none">
                  {product.sku?.slice(0, 3)}
                </span>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditProduct(product); setFormOpen(true) }}
                    className="p-1.5 rounded-lg bg-bg-dark/80 text-content-secondary hover:text-white transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-white text-xs font-medium truncate">{product.name}</p>
                <p className="text-content-muted text-xs mt-0.5">{product.sku}</p>
                {product.price != null && (
                  <p className="text-alqia-orange text-xs font-medium mt-1">
                    {formatCurrency(product.price)}
                  </p>
                )}
                <div className="mt-2">
                  <Badge variant={product.status === 'active' ? 'success' : product.status === 'draft' ? 'warning' : 'default'}>
                    {product.status === 'active' ? 'Activo' : product.status === 'draft' ? 'Borrador' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
            </GlassPanel>
          ))}
        </div>
      )}
    </div>

    <ProductForm
      open={formOpen}
      product={editProduct}
      onClose={() => { setFormOpen(false); setEditProduct(undefined) }}
    />
  </>
  )
}
