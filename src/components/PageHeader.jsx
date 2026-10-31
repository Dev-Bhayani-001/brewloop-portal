export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-8 flex animate-fade-up flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="display-title text-[40px] leading-[1.05] sm:text-[48px]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[15px] text-espresso-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
