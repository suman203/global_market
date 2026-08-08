import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useAllProducts, useDeleteProduct } from '../hooks/useAdmin'
import { useToast } from '../components/Toast'
import ConfirmModal from '../components/ConfirmModal'
import { countryInfo } from '../lib/country'
import { formatPrice } from '../lib/format'
import type { Product } from '../types/api'

export default function AdminDashboard() {
  const { data: products, isLoading, isError, error } = useAllProducts()
  const deleteProduct = useDeleteProduct()
  const { toast } = useToast()
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null)

  const handleDelete = () => {
    if (!pendingDelete) return
    deleteProduct.mutate(pendingDelete.id, {
      onSuccess: () => {
        toast(`${pendingDelete.name} deleted`)
        setPendingDelete(null)
      },
      onError: (err) => toast(err.message, 'error'),
    })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-cream">Admin dashboard</h1>
          <p className="mt-1 text-sm text-mist">Manage the collection of souvenirs.</p>
        </div>
        <Link to="/admin/product/new" className="btn-gold">
          <Plus className="h-4 w-4" /> New product
        </Link>
      </div>

      <div className="card mt-8 overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex animate-pulse items-center gap-4 rounded-lg bg-white/5 p-3">
                <div className="h-12 w-12 rounded-lg bg-white/5" />
                <div className="h-4 flex-1 rounded bg-white/5" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-cream">Couldn&apos;t load products</p>
            <p className="mt-1 text-sm text-mist">{error?.message}</p>
          </div>
        ) : products?.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-display text-lg text-cream">No products yet</p>
            <Link to="/admin/product/new" className="btn-gold mt-4">
              Add your first product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs uppercase tracking-widest text-mist">
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Country</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products?.map((product) => {
                  const country = countryInfo(product.category?.name)
                  return (
                    <tr key={product.id} className="transition-colors hover:bg-white/[0.03]">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            loading="lazy"
                            onError={(e) => {
                              ;(e.currentTarget as HTMLImageElement).src =
                                'https://placehold.co/600x400/png?text=Global+Market'
                            }}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <span className="max-w-56 truncate font-medium text-cream">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                          style={{ backgroundColor: country.accent }}
                        >
                          {country.emoji} {product.category?.name ?? 'World'}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-medium text-gold-400">{formatPrice(product.price)}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/product/${product.id}/edit`}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-mist transition-colors hover:bg-white/5 hover:text-gold-300"
                            title={`Edit ${product.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => setPendingDelete(product)}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-mist transition-colors hover:bg-white/5 hover:text-danger"
                            title={`Delete ${product.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        open={pendingDelete !== null}
        title="Delete product"
        confirmLabel="Delete"
        busy={deleteProduct.isPending}
        onConfirm={handleDelete}
        onClose={() => setPendingDelete(null)}
      >
        Are you sure you want to delete{' '}
        <span className="font-medium text-cream">{pendingDelete?.name}</span>? This action can&apos;t be
        undone.
      </ConfirmModal>
    </div>
  )
}
