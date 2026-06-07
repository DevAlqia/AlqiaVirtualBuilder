import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { X, Plus, Trash2, Save, Box } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { GlassPanel } from '@/components/glass/GlassPanel'
import { catalogService } from '@/services'
import { assetService } from '@/services'
import type { Product, Asset3D } from '@/types'
import { cn } from '@/utils/cn'

// ─── Schema de validación ──────────────────────────────────────────────────────

const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nombre requerido'),
  sku: z.string().min(1, 'SKU requerido'),
  width: z.coerce.number().min(0.01, 'Ancho requerido'),
  depth: z.coerce.number().min(0.01, 'Profundidad requerida'),
  height: z.coerce.number().min(0.01, 'Alto requerido'),
  color: z.string().optional(),
  price_delta: z.coerce.number().optional(),
})

const productSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  sku: z.string().min(2, 'SKU requerido'),
  description: z.string().optional(),
  category_id: z.string().min(1, 'Selecciona una categoría'),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo').optional(),
  width: z.coerce.number().min(0.01, 'Ancho requerido'),
  depth: z.coerce.number().min(0.01, 'Profundidad requerida'),
  height: z.coerce.number().min(0.01, 'Alto requerido'),
  asset_3d_id: z.string().optional(),
  status: z.enum(['active', 'inactive', 'draft']),
  variants: z.array(variantSchema),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  product?: Product
  open: boolean
  onClose: () => void
}

export function ProductForm({ product, open, onClose }: ProductFormProps) {
  const qc = useQueryClient()
  const [assetPickerOpen, setAssetPickerOpen] = useState(false)
  const isEdit = !!product

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogService.getCategories(),
    enabled: open,
  })

  const { data: assets = [] } = useQuery<Asset3D[]>({
    queryKey: ['assets-optimized'],
    queryFn: async () => {
      const all = await assetService.getAssets()
      return all.filter((a) => a.asset_type === 'model' && (a.status === 'active' || a.status === 'optimized'))
    },
    enabled: assetPickerOpen,
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? '',
      sku: product?.sku ?? '',
      description: product?.description_short ?? '',
      category_id: product?.category_id ?? '',
      price: product?.price ?? undefined,
      width: product?.width ?? 1,
      depth: product?.depth ?? 1,
      height: product?.height ?? 1,
      asset_3d_id: product?.default_model_asset_id ?? undefined,
      status: product?.status ?? 'draft',
      variants: [],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'variants' })
  const selectedAssetId = watch('asset_3d_id')
  const selectedAsset = assets.find((a) => a.id === selectedAssetId)

  const onSubmit = async (_values: ProductFormValues) => {
    await new Promise((r) => setTimeout(r, 600))
    qc.invalidateQueries({ queryKey: ['products'] })
    onClose()
  }

  const fieldClass = (hasError: boolean) =>
    cn(
      'w-full px-3 py-1.5 rounded-lg bg-white/[0.06] border text-white text-sm placeholder:text-content-muted focus:outline-none focus:ring-1 transition-all',
      hasError
        ? 'border-status-danger/50 focus:ring-status-danger/30'
        : 'border-white/[0.08] focus:ring-alqia-orange/40'
    )

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06] flex-shrink-0">
          <h2 className="text-white text-base font-questrial font-semibold">
            {isEdit ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button type="button" onClick={onClose} className="text-content-muted hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Datos básicos */}
          <section className="space-y-3">
            <p className="text-content-secondary text-[10px] uppercase tracking-wider">Datos del producto</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-content-secondary text-xs mb-1 block">Nombre *</label>
                <input {...register('name')} placeholder="Estantería modular 3m" className={fieldClass(!!errors.name)} />
                {errors.name && <p className="text-status-danger text-[10px] mt-0.5">{errors.name.message}</p>}
              </div>
              <div>
                <label className="text-content-secondary text-xs mb-1 block">SKU *</label>
                <input {...register('sku')} placeholder="EST-001" className={fieldClass(!!errors.sku)} />
                {errors.sku && <p className="text-status-danger text-[10px] mt-0.5">{errors.sku.message}</p>}
              </div>
              <div>
                <label className="text-content-secondary text-xs mb-1 block">Estado</label>
                <select {...register('status')} className={fieldClass(!!errors.status)}>
                  <option value="draft">Borrador</option>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-content-secondary text-xs mb-1 block">Categoría *</label>
                <select {...register('category_id')} className={fieldClass(!!errors.category_id)}>
                  <option value="">Selecciona una categoría</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.category_id && <p className="text-status-danger text-[10px] mt-0.5">{errors.category_id.message}</p>}
              </div>
              <div className="col-span-2">
                <label className="text-content-secondary text-xs mb-1 block">Descripción</label>
                <textarea
                  {...register('description')}
                  rows={2}
                  placeholder="Describe el producto..."
                  className={cn(fieldClass(false), 'resize-none')}
                />
              </div>
              <div>
                <label className="text-content-secondary text-xs mb-1 block">Precio base (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('price')}
                  placeholder="0.00"
                  className={fieldClass(!!errors.price)}
                />
              </div>
            </div>
          </section>

          {/* Dimensiones */}
          <section className="space-y-3">
            <p className="text-content-secondary text-[10px] uppercase tracking-wider">Dimensiones base (m)</p>
            <div className="grid grid-cols-3 gap-3">
              {(['width', 'depth', 'height'] as const).map((dim) => (
                <div key={dim}>
                  <label className="text-content-secondary text-xs mb-1 block capitalize">
                    {dim === 'width' ? 'Ancho' : dim === 'depth' ? 'Profundidad' : 'Alto'} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register(dim)}
                    placeholder="1.00"
                    className={fieldClass(!!errors[dim])}
                  />
                  {errors[dim] && <p className="text-status-danger text-[10px] mt-0.5">{errors[dim]?.message}</p>}
                </div>
              ))}
            </div>
          </section>

          {/* Asset 3D */}
          <section className="space-y-3">
            <p className="text-content-secondary text-[10px] uppercase tracking-wider">Modelo 3D</p>
            {selectedAsset ? (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-alqia-orange/20 bg-alqia-orange/5">
                <div className="w-10 h-10 rounded-lg bg-alqia-blue/40 flex items-center justify-center flex-shrink-0">
                  <Box className="w-5 h-5 text-white/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{selectedAsset.name}</p>
                  <p className="text-content-muted text-[10px]">{selectedAsset.file_format?.toUpperCase()}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setValue('asset_3d_id', undefined)}
                  className="text-content-muted hover:text-status-danger transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAssetPickerOpen(true)}
                className="w-full flex items-center gap-2 p-3 rounded-lg border border-dashed border-white/20 text-content-secondary hover:text-white hover:border-white/40 transition-all text-sm"
              >
                <Box className="w-4 h-4" />
                Seleccionar modelo 3D
              </button>
            )}
          </section>

          {/* Variantes */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-content-secondary text-[10px] uppercase tracking-wider">Variantes</p>
              <button
                type="button"
                onClick={() => append({ name: '', sku: '', width: 1, depth: 1, height: 1 })}
                className="flex items-center gap-1 text-alqia-orange text-xs hover:text-alqia-orange/80 transition-colors"
              >
                <Plus className="w-3 h-3" /> Agregar variante
              </button>
            </div>
            {fields.length === 0 ? (
              <p className="text-content-muted text-xs">Sin variantes. El producto se usa en su forma base.</p>
            ) : (
              <div className="space-y-3">
                {fields.map((field, idx) => (
                  <GlassPanel key={field.id} className="p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-white text-xs font-medium">Variante {idx + 1}</p>
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="text-content-muted hover:text-status-danger transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        {...register(`variants.${idx}.name`)}
                        placeholder="Nombre variante"
                        className={fieldClass(!!errors.variants?.[idx]?.name)}
                      />
                      <input
                        {...register(`variants.${idx}.sku`)}
                        placeholder="SKU variante"
                        className={fieldClass(!!errors.variants?.[idx]?.sku)}
                      />
                      <input
                        type="number"
                        step="0.01"
                        {...register(`variants.${idx}.width`)}
                        placeholder="Ancho"
                        className={fieldClass(false)}
                      />
                      <input
                        type="number"
                        step="0.01"
                        {...register(`variants.${idx}.depth`)}
                        placeholder="Profundidad"
                        className={fieldClass(false)}
                      />
                      <input
                        type="number"
                        step="0.01"
                        {...register(`variants.${idx}.height`)}
                        placeholder="Alto"
                        className={fieldClass(false)}
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          {...register(`variants.${idx}.color`)}
                          className="w-7 h-7 rounded border border-white/[0.10] bg-transparent cursor-pointer"
                        />
                        <input
                          type="number"
                          step="0.01"
                          {...register(`variants.${idx}.price_delta`)}
                          placeholder="Dif. precio"
                          className={cn(fieldClass(false), 'flex-1')}
                        />
                      </div>
                    </div>
                  </GlassPanel>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-5 border-t border-white/[0.06] flex-shrink-0">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={<Save className="w-3.5 h-3.5" />}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </div>
      </form>

      {/* Modal selector de asset 3D */}
      <Modal open={assetPickerOpen} onClose={() => setAssetPickerOpen(false)} size="md">
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white text-sm font-medium">Seleccionar modelo 3D</h3>
            <button onClick={() => setAssetPickerOpen(false)} className="text-content-muted hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          {assets.length === 0 ? (
            <p className="text-content-muted text-sm text-center py-8">No hay modelos 3D disponibles.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => {
                    setValue('asset_3d_id', asset.id)
                    setAssetPickerOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left',
                    selectedAssetId === asset.id
                      ? 'border-alqia-orange/40 bg-alqia-orange/10'
                      : 'border-white/[0.06] hover:border-white/20 hover:bg-white/[0.04]'
                  )}
                >
                  <div className="w-9 h-9 rounded-lg bg-alqia-blue/40 flex items-center justify-center flex-shrink-0">
                    <Box className="w-4 h-4 text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{asset.name}</p>
                    <p className="text-content-muted text-[10px]">{asset.file_format?.toUpperCase()}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </Modal>
  )
}
