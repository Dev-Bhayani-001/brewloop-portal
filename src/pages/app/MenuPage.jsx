import { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Check, Coffee, Flame, FolderPlus, ImagePlus, Leaf, Pencil, Plus, Trash2 } from 'lucide-react'

import Badge from '../../components/Badge'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import { SelectField, TextAreaField, TextField } from '../../components/Field'
import ImageCropModal from '../../components/ImageCropModal'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import Switch from '../../components/Switch'
import { selectCategories, selectCurrentBusiness, selectItems } from '../../app/selectors'
import { categoryAdded, itemDeleted, itemSaved, itemToggled } from '../../features/menu/menuSlice'
import { toastShown } from '../../features/ui/uiSlice'
import { formatCurrency } from '../../utils/format'
import { categoryIcon } from '../../utils/categoryIcon'
import { IMAGE_TYPES, imageFileError } from '../../utils/image'

// Menu cards show images large, so they need more pixels than a small avatar.
const MENU_IMAGE_SIDE = 480

const DIETARY_OPTIONS = [
  'Healthy',
  'Vegan',
  'Vegetarian',
  'Gluten-Free',
  'Sugar-Free',
  'High Protein',
  'Keto',
  'Organic',
]

function MenuItemCard({ item, icon: Icon, onEdit, onToggle, onDelete }) {
  const visibleDietary = item.dietary?.filter((tag) => tag !== 'Healthy') ?? []

  return (
    <li className="card group relative flex flex-col justify-between overflow-hidden">
      <div className="relative">
        <button
          type="button"
          onClick={onEdit}
          className="block w-full cursor-pointer text-left"
          aria-label={`Edit ${item.name}`}
        >
          <span
            className={`relative flex aspect-square items-center justify-center bg-cream-100 text-espresso-400 dark:bg-white/5 dark:text-cream-300/60 ${
              item.active ? '' : 'opacity-50'
            }`}
          >
            {item.image ? (
              <img src={item.image} alt="" className="size-full object-cover" />
            ) : (
              <Icon className="size-6" strokeWidth={1.5} aria-hidden="true" />
            )}
            {item.healthy && item.active && (
              <span
                className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-emerald-700/90 px-2 py-0.5 text-[10px] font-medium text-white shadow-xs backdrop-blur-xs"
                title="Healthy choice"
              >
                <Leaf className="size-2.5" /> Healthy
              </span>
            )}
          </span>
        </button>

        {/* Quick action buttons on top right */}
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            onClick={onEdit}
            className="flex size-7.5 cursor-pointer items-center justify-center rounded-full bg-white/95 text-espresso-700 shadow-md transition hover:scale-105 hover:bg-white hover:text-espresso-950 dark:bg-[#1a1816]/95 dark:text-cream-100 dark:hover:bg-[#25221e]"
            title={`Edit ${item.name}`}
            aria-label={`Edit ${item.name}`}
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="flex size-7.5 cursor-pointer items-center justify-center rounded-full bg-white/95 text-red-600 shadow-md transition hover:scale-105 hover:bg-red-50 hover:text-red-700 dark:bg-[#1a1816]/95 dark:text-red-400 dark:hover:bg-red-950/60"
            title={`Delete ${item.name}`}
            aria-label={`Delete ${item.name}`}
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>

        {!item.active && (
          <span className="pointer-events-none absolute top-2 left-2">
            <Badge>Hidden</Badge>
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onEdit}
        className="block w-full cursor-pointer px-3 pt-2.5 text-left"
        aria-label={`Edit ${item.name}`}
      >
        <span className={`block truncate text-sm font-medium ${item.active ? '' : 'opacity-50'}`}>
          {item.name}
        </span>
        {item.description && (
          <p className={`mt-0.5 line-clamp-2 text-xs text-espresso-500 dark:text-cream-300/70 ${item.active ? '' : 'opacity-50'}`}>
            {item.description}
          </p>
        )}
        {(item.calories != null || visibleDietary.length > 0) && (
          <div className={`mt-2 flex flex-wrap items-center gap-1 ${item.active ? '' : 'opacity-50'}`}>
            {item.calories != null && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-100/70 px-1.5 py-0.5 text-[10px] font-medium text-orange-800 dark:bg-orange-950/60 dark:text-orange-300">
                <Flame className="size-2.5" /> {item.calories} kcal
              </span>
            )}
            {visibleDietary.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-cream-200/60 px-1.5 py-0.5 text-[10px] font-medium text-espresso-600 dark:bg-white/10 dark:text-cream-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </button>

      <div className="flex items-center justify-between gap-2 px-3 pt-2 pb-3">
        <span
          className={`tabular text-[13px] font-medium text-espresso-600 dark:text-cream-200 ${item.active ? '' : 'opacity-50'}`}
        >
          {formatCurrency(item.price)}
        </span>
        <Switch size="sm" checked={item.active} onChange={onToggle} label={`${item.name} on sale`} />
      </div>
    </li>
  )
}

function ItemModal({ item, categories, defaultCategoryId, onClose, onDelete }) {
  const dispatch = useDispatch()
  const business = useSelector(selectCurrentBusiness)
  const imageInputRef = useRef(null)
  const [form, setForm] = useState({
    name: item?.name ?? '',
    price: item?.price ?? '',
    categoryId: item?.categoryId ?? defaultCategoryId ?? categories[0]?.id,
    image: item?.image ?? null,
    description: item?.description ?? '',
    calories: item?.calories ?? '',
    healthy: item?.healthy ?? false,
    dietary: item?.dietary ?? [],
  })

  const items = useSelector(selectItems)
  const [errors, setErrors] = useState({})
  const [cropFile, setCropFile] = useState(null)

  const toggleDietaryTag = (tag) => {
    setForm((current) => {
      const exists = current.dietary.includes(tag)
      const nextDietary = exists
        ? current.dietary.filter((t) => t !== tag)
        : [...current.dietary, tag]
      return {
        ...current,
        dietary: nextDietary,
        healthy: tag === 'Healthy' ? !exists : current.healthy,
      }
    })
  }

  const toggleHealthy = (checked) => {
    setForm((current) => ({
      ...current,
      healthy: checked,
      dietary: checked
        ? (current.dietary.includes('Healthy') ? current.dietary : [...current.dietary, 'Healthy'])
        : current.dietary.filter((t) => t !== 'Healthy'),
    }))
  }

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

    const caloriesNum = form.calories === '' ? null : Number(form.calories)
    if (form.calories !== '' && (!Number.isFinite(caloriesNum) || caloriesNum < 0 || caloriesNum > 5000)) {
      nextErrors.calories = 'Enter valid calories between 0 and 5000 kcal.'
    }

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
        description: form.description.trim() || null,
        calories: caloriesNum,
        healthy: Boolean(form.healthy),
        dietary: form.dietary,
      }),
    )
    dispatch(toastShown(item ? 'Item updated' : 'Item added to menu'))
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="md"
      title={item ? 'Edit item' : 'Add item'}
      description={item ? 'Price changes only affect new bills — past bills keep the old price.' : undefined}
      footer={
        <div className="flex w-full items-center justify-between gap-2">
          {item ? (
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => {
                onClose()
                onDelete(item)
              }}
            >
              Delete item
            </Button>
          ) : <span />}
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" form="item-form">
              Save
            </Button>
          </div>
        </div>
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="Calories (optional)"
            placeholder="e.g. 140"
            suffix="kcal"
            type="number"
            min="0"
            max="5000"
            inputMode="numeric"
            value={form.calories}
            onChange={(event) => setForm({ ...form, calories: event.target.value })}
            error={errors.calories}
            hint="Approximate kcal per serving"
          />
          <div className="flex flex-col justify-end">
            <div className="flex h-11 items-center justify-between rounded-xl border border-cream-300 bg-cream-50/50 px-3.5 dark:border-white/15 dark:bg-white/5">
              <span className="flex items-center gap-2 text-sm font-medium text-espresso-800 dark:text-cream-100">
                <Leaf className="size-4 text-emerald-600 dark:text-emerald-400" />
                Healthy choice
              </span>
              <Switch
                size="sm"
                checked={form.healthy}
                onChange={toggleHealthy}
                label="Healthy choice"
              />
            </div>
          </div>
        </div>

        <div>
          <p className="field-label">Dietary & lifestyle tags (optional)</p>
          <div className="flex flex-wrap gap-1.5">
            {DIETARY_OPTIONS.map((tag) => {
              const active = form.dietary.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleDietaryTag(tag)}
                  className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition active:scale-95 ${
                    active
                      ? 'bg-espresso-900 text-cream-50 shadow-xs dark:bg-cream-100 dark:text-espresso-950'
                      : 'bg-cream-100 text-espresso-700 hover:bg-cream-200 dark:bg-white/10 dark:text-cream-300 dark:hover:bg-white/15'
                  }`}
                >
                  {active ? <Check className="size-3" strokeWidth={2.5} /> : <Plus className="size-3" />}
                  {tag}
                </button>
              )
            })}
          </div>
        </div>

        <TextAreaField
          label="Description (optional)"
          placeholder="e.g. Brewed for 16 hours for a smooth profile with dark chocolate undertones."
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          maxLength={250}
          rows={2}
          hint="Ingredients, taste profile, or allergen information"
        />

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

function DeleteConfirmModal({ item, onConfirm, onCancel }) {
  if (!item) return null
  return (
    <Modal
      open
      onClose={onCancel}
      size="sm"
      title={`Delete ${item.name}?`}
      description="This will permanently remove the item from your menu."
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" icon={Trash2} onClick={onConfirm}>
            Delete item
          </Button>
        </>
      }
    >
      <p className="text-sm text-espresso-600 dark:text-cream-200">
        Are you sure you want to delete <strong className="text-espresso-900 dark:text-cream-50">{item.name}</strong>? Past bills and loyalty history will remain safe.
      </p>
    </Modal>
  )
}

export default function MenuPage() {
  const dispatch = useDispatch()
  const categories = useSelector(selectCategories)
  const items = useSelector(selectItems)
  const [editing, setEditing] = useState(null) // { item?, categoryId? }
  const [addingCategory, setAddingCategory] = useState(false)
  const [deletingItem, setDeletingItem] = useState(null)

  const activeCount = items.filter((item) => item.active).length

  const confirmDelete = () => {
    if (deletingItem) {
      dispatch(itemDeleted(deletingItem.id))
      dispatch(toastShown(`Deleted "${deletingItem.name}"`))
      setDeletingItem(null)
    }
  }

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
                        onDelete={() => setDeletingItem(item)}
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
        You can hide items from billing using the toggle switch, or delete them permanently using the delete button.
      </p>

      {editing && (
        <ItemModal
          item={editing.item}
          defaultCategoryId={editing.categoryId}
          categories={categories}
          onClose={() => setEditing(null)}
          onDelete={(itemToDelete) => setDeletingItem(itemToDelete)}
        />
      )}
      {addingCategory && <CategoryModal onClose={() => setAddingCategory(false)} />}
      {deletingItem && (
        <DeleteConfirmModal
          item={deletingItem}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingItem(null)}
        />
      )}
    </>
  )
}
