import { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Coffee, FolderPlus, ImagePlus, Pencil, Plus } from 'lucide-react'

import Badge from '../../components/Badge'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import { SelectField, TextField } from '../../components/Field'
import ImageCropModal from '../../components/ImageCropModal'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import Switch from '../../components/Switch'
import { selectCategories, selectCurrentBusiness, selectItems } from '../../app/selectors'
import { categoryAdded, itemSaved, itemToggled } from '../../features/menu/menuSlice'
import { toastShown } from '../../features/ui/uiSlice'
import { formatCurrency } from '../../utils/format'
import { categoryIcon } from '../../utils/categoryIcon'
import { IMAGE_TYPES, imageFileError } from '../../utils/image'

// Menu cards show images large, so they need more pixels than a small avatar.
const MENU_IMAGE_SIDE = 480

function MenuItemCard({ item, icon: Icon, onEdit, onToggle }) {
  return (
    <li className="card group relative overflow-hidden">
      <button type="button" onClick={onEdit} className="block w-full text-left" aria-label={`Edit ${item.name}`}>
        <span
          className={`flex aspect-square items-center justify-center bg-cream-100 text-espresso-400 dark:bg-white/5 dark:text-cream-300/60 ${
            item.active ? '' : 'opacity-50'
          }`}
        >
          {item.image ? (
            <img src={item.image} alt="" className="size-full object-cover" />
          ) : (
            <Icon className="size-6" strokeWidth={1.5} aria-hidden="true" />
          )}
        </span>
        <span
          className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-espresso-700 opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-[#1a1816]/90 dark:text-cream-100"
          aria-hidden="true"
        >
          <Pencil className="size-3.5" />
        </span>
        <span className={`block truncate px-3 pt-2.5 text-sm font-medium ${item.active ? '' : 'opacity-50'}`}>
          {item.name}
        </span>
      </button>
      {!item.active && (
        <span className="pointer-events-none absolute top-2 left-2">
          <Badge>Hidden</Badge>
        </span>
      )}
      <div className="flex items-center justify-between gap-2 px-3 pt-0.5 pb-3">
        <span
          className={`tabular text-[13px] text-espresso-500 dark:text-cream-300/80 ${item.active ? '' : 'opacity-50'}`}
        >
          {formatCurrency(item.price)}
        </span>
        <Switch size="sm" checked={item.active} onChange={onToggle} label={`${item.name} on sale`} />
      </div>
    </li>
  )
}

function ItemModal({ item, categories, defaultCategoryId, onClose }) {
  const dispatch = useDispatch()
  const business = useSelector(selectCurrentBusiness)
  const imageInputRef = useRef(null)
  const [form, setForm] = useState({
    name: item?.name ?? '',
    price: item?.price ?? '',
    categoryId: item?.categoryId ?? defaultCategoryId ?? categories[0]?.id,
    image: item?.image ?? null,
  })

  const items = useSelector(selectItems)
  const [errors, setErrors] = useState({})
  const [cropFile, setCropFile] = useState(null)

  const chooseImage = (event) => {
    const file = event.target.files?.[0]
    event.target.value = '' // Lets the same file be picked again after removing it.
    if (!file) return
    const image = imageFileError(file) ?? undefined
    setErrors((current) => ({ ...current, image }))
    if (!image) setCropFile(file)
  }

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
        image: form.image,
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
        <div>
          <p className="field-label">Image (optional)</p>
          <div className="flex items-center gap-3">
            <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-cream-300 bg-cream-50 text-espresso-400 dark:border-white/15 dark:bg-white/5">
              {form.image ? (
                <img src={form.image} alt="Item preview" className="size-full object-cover" />
              ) : (
                <ImagePlus className="size-5" strokeWidth={1.75} aria-hidden="true" />
              )}
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept={IMAGE_TYPES.join(',')}
              className="hidden"
              onChange={chooseImage}
            />
            <Button variant="secondary" size="sm" onClick={() => imageInputRef.current?.click()}>
              {form.image ? 'Replace' : 'Upload image'}
            </Button>
            {form.image && (
              <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, image: null })}>
                Remove
              </Button>
            )}
          </div>
          {errors.image ? (
            <p role="alert" className="mt-1.5 text-[13px] font-medium text-red-700 dark:text-red-400">
              {errors.image}
            </p>
          ) : (
            <p className="mt-1.5 text-[13px] text-espresso-500">PNG, JPG or WebP, up to 10 MB.</p>
          )}
        </div>
      </form>
      {cropFile && (
        <ImageCropModal
          file={cropFile}
          shape="square"
          outputSide={MENU_IMAGE_SIDE}
          onCancel={() => setCropFile(null)}
          onCrop={(image) => {
            setForm((current) => ({ ...current, image }))
            setCropFile(null)
          }}
        />
      )}
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
        <div className="space-y-7">
          {categories.map((category) => {
            const categoryItems = items.filter((item) => item.categoryId === category.id)
            return (
              <section key={category.id}>
                <header className="mb-2.5 flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <h2 className="display-title text-[24px] leading-tight">{category.name}</h2>
                    <span className="text-sm text-espresso-500 dark:text-cream-300/80">{categoryItems.length}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Plus}
                    onClick={() => setEditing({ categoryId: category.id })}
                    aria-label={`Add item to ${category.name}`}
                  />
                </header>
                {categoryItems.length ? (
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {categoryItems.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        icon={categoryIcon(category.name)}
                        onEdit={() => setEditing({ item })}
                        onToggle={() => dispatch(itemToggled(item.id))}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-espresso-500 dark:text-cream-300/80">No items yet.</p>
                )}
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
