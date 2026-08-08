import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ImageIcon, Save } from 'lucide-react'
import { productSchema, FALLBACK_IMAGE, type ProductFormValues } from '../lib/schemas'
import { useCategories, useProduct } from '../hooks/useCatalog'
import { useCreateProduct, useUpdateProduct } from '../hooks/useAdmin'
import { useToast } from '../components/Toast'
import { HttpError } from '../api/client'
import NotFound from './NotFound'

interface FormDefaults {
  name: string
  description: string
  imageUrl: string
  price: number
  categoryId: number
}

function ProductForm({
  editing,
  productId,
  initial,
}: {
  editing: boolean
  productId?: number
  initial?: FormDefaults
}) {
  const { data: categories } = useCategories()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const navigate = useNavigate()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      imageUrl: initial?.imageUrl ?? '',
      price: initial?.price ?? undefined,
      categoryId: initial?.categoryId ?? undefined,
    },
  })

  const imageUrl = watch('imageUrl')

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      description: values.description,
      imageUrl: values.imageUrl || FALLBACK_IMAGE,
      price: values.price,
      categoryId: values.categoryId,
    }
    try {
      if (editing && productId !== undefined) {
        await updateProduct.mutateAsync({ id: productId, payload })
      } else {
        await createProduct.mutateAsync(payload)
      }
      toast(editing ? 'Product updated' : 'Product created')
      navigate('/admin')
    } catch (error) {
      if (error instanceof HttpError && error.fieldErrors) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof ProductFormValues, { message })
        }
      } else {
        toast(error instanceof Error ? error.message : 'Save failed', 'error')
      }
    }
  })

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-3" noValidate>
      <div className="space-y-4 lg:col-span-2">
        <div>
          <label htmlFor="p-name" className="mb-1.5 block text-sm text-cream">
            Name
          </label>
          <input
            id="p-name"
            className="input"
            placeholder="2–32 characters"
            {...register('name')}
          />
          {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="p-description" className="mb-1.5 block text-sm text-cream">
            Description
          </label>
          <textarea
            id="p-description"
            rows={4}
            className="input resize-none"
            placeholder="Tell the story of this souvenir…"
            {...register('description')}
          />
          {errors.description && <p className="mt-1 text-xs text-danger">{errors.description.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="p-price" className="mb-1.5 block text-sm text-cream">
              Price (USD)
            </label>
            <input
              id="p-price"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              className="input"
              placeholder="0.00"
              {...register('price')}
            />
            {errors.price && <p className="mt-1 text-xs text-danger">{errors.price.message}</p>}
          </div>

          <div>
            <label htmlFor="p-category" className="mb-1.5 block text-sm text-cream">
              Country
            </label>
            <select id="p-category" className="input" {...register('categoryId')}>
              <option value="">Select a country…</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="mt-1 text-xs text-danger">{errors.categoryId.message}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="p-image" className="mb-1.5 block text-sm text-cream">
            Image URL
          </label>
          <input
            id="p-image"
            type="url"
            className="input"
            placeholder="https://…"
            {...register('imageUrl')}
          />
          {errors.imageUrl && <p className="mt-1 text-xs text-danger">{errors.imageUrl.message}</p>}
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-ink-950">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Preview"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE
              }}
              className="aspect-[3/2] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[3/2] flex-col items-center justify-center gap-2 text-mist">
              <ImageIcon className="h-8 w-8" />
              <span className="text-xs">Image preview</span>
            </div>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-gold w-full py-3">
          <Save className="h-4 w-4" />
          {isSubmitting ? 'Saving…' : editing ? 'Save changes' : 'Create product'}
        </button>
      </div>
    </form>
  )
}

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const editing = Boolean(id)
  const productId = Number(id)
  const { data: product, isLoading, isError } = useProduct(editing ? productId : undefined)

  const pageTitle = editing ? 'Edit product' : 'New product'

  if (editing && isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="h-8 w-40 animate-pulse rounded bg-white/5" />
        <div className="mt-8 h-72 animate-pulse rounded-2xl bg-white/5" />
      </div>
    )
  }

  if (editing && (isError || !product)) {
    return <NotFound />
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-mist transition-colors hover:text-gold-300">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </button>
      <h1 className="mt-3 font-display text-3xl font-semibold text-cream">{pageTitle}</h1>
      <ProductForm
        editing={editing}
        productId={editing ? productId : undefined}
        initial={
          editing && product
            ? {
                name: product.name,
                description: product.description,
                imageUrl: product.imageUrl,
                price: product.price,
                categoryId: product.category?.id ?? 0,
              }
            : undefined
        }
      />
    </div>
  )
}
