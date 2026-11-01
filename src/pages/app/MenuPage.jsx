import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Coffee, FolderPlus, Pencil, Plus } from 'lucide-react'

import Badge from '../../components/Badge'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import { SelectField, TextField } from '../../components/Field'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import Switch from '../../components/Switch'
import { selectCategories, selectCurrentBusiness, selectItems } from '../../app/selectors'
import { categoryAdded, itemSaved, itemToggled } from '../../features/menu/menuSlice'
import { toastShown } from '../../features/ui/uiSlice'
import { formatCurrency } from '../../utils/format'

function ItemModal({ item, categories, defaultCategoryId, onClose }) {
  const dispatch = useDispatch()
  const business = useSelector(selectCurrentBusiness)
  const [form, setForm] = useState({
    name: item?.name ?? '',
    price: item?.price ?? '',
    categoryId: item?.categoryId ?? defaultCategoryId ?? categories[0]?.id,
  })

  const items = useSelector(selectItems)
  const [errors, setErrors] = useState({})

  const submit = (event) => {
    event.preventDefault()
    const name = form.name.trim().replace(/\s+/g, ' ')
    const price = Number(form.price)
    const nextErrors = {}
    if (!name) nextErrors.name = 'Enter an item name.'
    else if (
      items.some((entry) => entry.id !== item?.id && entry.name.toLowerCase() === name.toLowerCase())
    ) {
      nextErrors.name = 'An item with this name already exists.'
    }
    if (form.price === '' || !Number.isFinite(price)) nextErrors.price = 'Enter a price.'
    else if (price <= 0) nextErrors.price = 'Price must be more than ₹0.'
    else if (price > 100000) nextErrors.price = 'That price looks too high.'
    if (!form.categoryId) nextErrors.categoryId = 'Choose a category.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    dispatch(
      itemSaved({
        ...item,
        businessId: business.id,
        name,
        price: Math.round(price * 100) / 100,
        categoryId: form.categoryId,
      }),
    )
    dispatch(toastShown(item ? 'Item updated' : 'Item added to menu'))
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title={item ? 'Edit item' : 'Add item'}
      description={item ? 'Price changes only affect new bills — past bills keep the old price.' : undefined}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="item-form">
            Save
          </Button>
        </>
      }
    >
      <form id="item-form" onSubmit={submit} className="space-y-4" noValidate>
        <TextField
          label="Item name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          error={errors.name}
          maxLength={50}
          autoFocus
        />
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Price"
            prefix="₹"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={form.price}
            onChange={(event) => setForm({ ...form, price: event.target.value })}
            error={errors.price}
          />
          <SelectField
            label="Category"
            value={form.categoryId}
            onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
            options={categories.map((category) => ({ value: category.id, label: category.name }))}
          />
        </div>
      </form>
    </Modal>
  )
}

function CategoryModal({ onClose }) {
  const dispatch = useDispatch()
  const business = useSelector(selectCurrentBusiness)
  const categories = useSelector(selectCategories)
  const [name, setName] = useState('')
  const [error, setError] = useState(null)

  const submit = (event) => {
    event.preventDefault()
    const trimmed = name.trim().replace(/\s+/g, ' ')
    if (!trimmed) return setError('Enter a category name.')
    if (categories.some((category) => category.name.toLowerCase() === trimmed.toLowerCase())) {
      return setError('This category already exists.')
    }
    dispatch(categoryAdded({ businessId: business.id, name: trimmed }))
    dispatch(toastShown('Category added'))
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title="New category"
      footer={
        <Button type="submit" form="category-form">
          Add category
        </Button>
      }
    >
      <form id="category-form" onSubmit={submit} noValidate>
        <TextField
          label="Name"
          placeholder="e.g. Coffee, Snacks"
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            setError(null)
          }}
          error={error}
          maxLength={30}
          autoFocus
        />
      </form>
    </Modal>
  )
}

export default function MenuPage() {
  const dispatch = useDispatch()
  const categories = useSelector(selectCategories)
  const items = useSelector(selectItems)
  const [editing, setEditing] = useState(null) // { item?, categoryId? }
  const [addingCategory, setAddingCategory] = useState(false)

  const activeCount = items.filter((item) => item.active).length

  return (
    <>
      <PageHeader
        eyebrow="Manage"
        title="Menu"
        description={`${activeCount} items on sale across ${categories.length} categories. Offers can target an item or a whole category.`}
        actions={
          <>
            <Button variant="secondary" icon={FolderPlus} onClick={() => setAddingCategory(true)}>
              Category
            </Button>
            <Button icon={Plus} onClick={() => setEditing({})} disabled={!categories.length}>
              Item
            </Button>
          </>
        }
      />

      {categories.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => {
            const categoryItems = items.filter((item) => item.categoryId === category.id)
            return (
              <section key={category.id} className="card flex flex-col">
                <header className="flex items-center justify-between border-b border-cream-200 px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <h2 className="display-title text-[22px] leading-tight">{category.name}</h2>
                    <span className="text-sm text-espresso-400">{categoryItems.length}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Plus}
                    onClick={() => setEditing({ categoryId: category.id })}
                    aria-label={`Add item to ${category.name}`}
                  />
                </header>
                <ul className="flex-1 divide-y divide-cream-200">
                  {categoryItems.map((item) => (
                    <li key={item.id} className="group flex items-center gap-3 px-5 py-2.5">
                      <div className={`min-w-0 flex-1 ${item.active ? '' : 'opacity-50'}`}>
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <p className="tabular text-[13px] text-espresso-500">{formatCurrency(item.price)}</p>
                      </div>
                      {!item.active && <Badge>Hidden</Badge>}
                      <button
                        type="button"
                        onClick={() => setEditing({ item })}
                        className="rounded-md p-1.5 text-espresso-400 opacity-0 transition group-hover:opacity-100 hover:bg-cream-100 hover:text-espresso-700 focus:opacity-100"
                        aria-label={`Edit ${item.name}`}
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <Switch
                        checked={item.active}
                        onChange={() => dispatch(itemToggled(item.id))}
                        label={`${item.name} on sale`}
                      />
                    </li>
                  ))}
                  {!categoryItems.length && <li className="px-5 py-4 text-sm text-espresso-500">No items yet.</li>}
                </ul>
              </section>
            )
          })}
        </div>
      ) : (
        <div className="card">
          <EmptyState
            icon={Coffee}
            title="Build your menu"
            description="Start with categories like Coffee, Tea or Snacks. Offers need a menu to point at."
            action={
              <Button icon={FolderPlus} onClick={() => setAddingCategory(true)}>
                Add a category
              </Button>
            }
          />
        </div>
      )}

      <p className="mt-6 text-[13px] text-espresso-500">
        Items are never deleted — switch them off to hide them from billing. Past bills and analytics stay intact.
      </p>

      {editing && (
        <ItemModal
          item={editing.item}
          defaultCategoryId={editing.categoryId}
          categories={categories}
          onClose={() => setEditing(null)}
        />
      )}
      {addingCategory && <CategoryModal onClose={() => setAddingCategory(false)} />}
    </>
  )
}
