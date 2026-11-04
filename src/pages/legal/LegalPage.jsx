import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import BrandMark from '../../components/BrandMark'
import LegalFooter from '../../components/LegalFooter'
import { LEGAL } from './legalDetails'

function Block({ block }) {
  if (typeof block === 'string') return <p>{block}</p>
  return (
    <ul className="list-disc space-y-2 pl-5">
      {block.list.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

/** Shared layout for the Privacy Policy and Terms: title, contents, numbered sections. */
export default function LegalPage({ title, intro, sections }) {
  useEffect(() => {
    document.title = `${title} · Brewloop`
    window.scrollTo(0, 0)
  }, [title])

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
      <header className="flex items-center justify-between gap-4">
        <Link to="/" aria-label="Brewloop home">
          <BrandMark />
        </Link>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-espresso-600 hover:text-espresso-900 dark:text-cream-200 dark:hover:text-cream-50">
          <ArrowLeft className="size-4" /> Back to Brewloop
        </Link>
      </header>

      <main className="mt-12">
        <h1 className="display-title text-[44px] leading-tight sm:text-[56px]">{title}</h1>
        <p className="mt-3 text-lg text-espresso-600 dark:text-cream-200">{intro}</p>
        <p className="mt-3 text-sm text-espresso-500 dark:text-cream-300/80">Last updated: {LEGAL.effectiveDate}</p>

        <nav aria-label="Contents" className="mt-8 rounded-2xl bg-white p-5 shadow-card dark:bg-[#1a1816] dark:shadow-none dark:ring-1 dark:ring-white/10">
          <p className="eyebrow">Contents</p>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm sm:columns-2">
            {sections.map((section, index) => (
              <li key={section.title} className="text-espresso-500 dark:text-cream-300/80">
                <a href={`#section-${index + 1}`} className="text-espresso-800 underline-offset-4 hover:underline dark:text-cream-100">
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 space-y-9">
          {sections.map((section, index) => (
            <section key={section.title} id={`section-${index + 1}`} className="scroll-mt-6">
              <h2 className="display-title text-[26px] leading-tight">
                {index + 1}. {section.title}
              </h2>
              <div className="mt-3 space-y-3 leading-relaxed text-espresso-700 dark:text-cream-200">
                {section.body.map((block, blockIndex) => (
                  <Block key={blockIndex} block={block} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <LegalFooter className="mt-14" />
    </div>
  )
}
