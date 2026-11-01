export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {Icon && (
        <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-cream-100 text-espresso-500 ring-1 ring-espresso-900/5">
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
      )}
      <p className="display-title text-2xl">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-espresso-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
