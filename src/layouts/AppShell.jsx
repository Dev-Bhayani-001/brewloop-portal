import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Command, LogOut, Menu as MenuIcon, Pencil, RotateCcw, Search, X } from 'lucide-react'

import Avatar from '../components/Avatar'
import BrandMark from '../components/BrandMark'
import CommandPalette from '../components/CommandPalette'
import LegalFooter from '../components/LegalFooter'
import ThemeToggle from '../components/ThemeToggle'
import Toaster from '../components/Toaster'
import { resetDemoData } from '../app/store'
import { selectCurrentUser } from '../app/selectors'
import { loggedOut } from '../features/auth/authSlice'
import EditProfileModal from '../features/auth/EditProfileModal'
import { ROLE_LABELS } from '../utils/permissions'

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

function NavItem({ item, onNavigate }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] font-medium transition ${
          isActive
            ? 'bg-white/10 text-cream-50 before:absolute before:top-2 before:bottom-2 before:-left-3 before:w-0.5 before:rounded-full before:bg-roast-400'
            : 'text-cream-300/80 hover:bg-white/5 hover:text-cream-50'
        }`
      }
    >
      <item.icon className="size-[18px] transition-transform duration-200 group-hover:scale-110" strokeWidth={1.75} />
      <span className="flex-1">{item.label}</span>
      {item.badge > 0 && (
        <span className="tabular flex h-5 min-w-5 items-center justify-center rounded-full bg-roast-400 px-1.5 text-[11px] font-semibold text-espresso-950">
          {item.badge}
          {item.badgeLabel && <span className="sr-only"> {item.badgeLabel}</span>}
        </span>
      )}
      {item.locked && (
        <span className="rounded-full px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-cream-300 uppercase ring-1 ring-white/15">
          Gold
        </span>
      )}
    </NavLink>
  )
}

function SidebarContent({ navigation, header, onNavigate, onOpenPalette, minimalChrome }) {
  const user = useSelector(selectCurrentUser)
  const dispatch = useDispatch()
  const [editingProfile, setEditingProfile] = useState(false)

  return (
    <div className="flex h-full flex-col rounded-3xl bg-espresso-900 px-3 py-5">
      <div className="px-3">
        <BrandMark inverted />
      </div>
      {header && <div className="mt-6">{typeof header === 'function' ? header({ onNavigate }) : header}</div>}

      {!minimalChrome && <button
        type="button"
        onClick={onOpenPalette}
        className="mx-1 mt-4 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-cream-300 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-cream-50"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search</span>
        <kbd className="kbd">{isMac ? '⌘' : 'Ctrl'}</kbd>
        <kbd className="kbd">K</kbd>
      </button>}

      <nav className="mt-5 flex-1 space-y-5 overflow-y-auto">
        {navigation.map((section) => (
          <div key={section.title ?? 'main'}>
            {section.title && (
              <p className="mb-1.5 px-3 text-[10px] font-medium tracking-[0.16em] text-espresso-400 uppercase">{section.title}</p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem key={item.to} item={item} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-4 px-1">
        <p className="mb-1.5 text-[10px] font-medium tracking-[0.16em] text-espresso-400 uppercase">Appearance</p>
        <ThemeToggle variant="sidebar" className="w-full" />
      </div>

      <div className="mt-3 rounded-2xl bg-white/5 p-2 ring-1 ring-white/10">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setEditingProfile(true)}
            className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 text-left transition hover:bg-white/10"
            aria-label={`Edit profile: ${user?.name}`}
            title="Edit profile"
          >
            <Avatar name={user?.name} src={user?.avatar} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-cream-50">{user?.name}</span>
              <span className="block text-xs text-cream-300">{ROLE_LABELS[user?.role]}</span>
            </span>
            <Pencil className="size-3.5 shrink-0 text-cream-300/60 transition group-hover:text-cream-50" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => dispatch(loggedOut())}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-cream-300 transition hover:bg-white/10 hover:text-cream-50"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={resetDemoData}
        className="mt-2 flex items-center justify-center gap-1.5 rounded-full py-1 text-[11px] text-espresso-400 hover:text-cream-300"
      >
        <RotateCcw className="size-3" /> Reset demo data
      </button>
      {editingProfile && <EditProfileModal onClose={() => setEditingProfile(false)} />}
    </div>
  )
}

/**
 * Responsive shell: floating dark sidebar on desktop, slide-over drawer on mobile,
 * an optional floating tab bar for the counter flow, and a global ⌘K palette.
 */
export default function AppShell({ navigation, header, mobileTabs, commands, searchPeople, peopleLabel, minimalChrome = false }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="min-h-screen overflow-x-clip lg:pl-[17.5rem]">
      <aside className="fixed inset-y-3 left-3 z-30 hidden w-64 lg:block">
        <SidebarContent navigation={navigation} header={header} minimalChrome={minimalChrome} onOpenPalette={() => setPaletteOpen(true)} />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-espresso-900/5 bg-cream-100/80 px-4 backdrop-blur-xl dark:border-white/10 dark:bg-[#121110]/80 lg:hidden">
        <BrandMark />
        <div className="flex items-center gap-2">
          {!minimalChrome && (
            <>
              <ThemeToggle compact />
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                className="flex size-9 items-center justify-center rounded-full text-espresso-800 hover:bg-cream-200 dark:text-cream-200 dark:hover:bg-white/10"
                aria-label="Search"
              >
                <Command className="size-4" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex size-9 items-center justify-center rounded-full bg-white text-espresso-900 shadow-card dark:bg-[#1e1b18] dark:text-cream-50"
            aria-label="Open menu"
          >
            <MenuIcon className="size-4" />
          </button>
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-espresso-950/50 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-2 left-2 w-72 animate-pop-in">
            <SidebarContent
              navigation={navigation}
              header={header}
              minimalChrome={minimalChrome}
              onNavigate={() => setDrawerOpen(false)}
              onOpenPalette={() => {
                setDrawerOpen(false)
                setPaletteOpen(true)
              }}
            />
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="absolute top-4 right-3 flex size-9 items-center justify-center rounded-full bg-white/10 text-cream-50"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}

      {/* Desktop top header with prominent Theme Switcher */}
      {!minimalChrome && (
        <div className="hidden lg:flex items-center justify-end px-8 pt-5 pb-0">
          <div className="flex items-center gap-2.5 rounded-2xl bg-cream-200/50 p-1.5 ring-1 ring-espresso-900/5 dark:bg-[#1a1815] dark:ring-white/10">
            <span className="pl-2 text-[11px] font-semibold tracking-wider text-espresso-500 uppercase dark:text-cream-300/70">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      )}

      <main key={location.pathname} className={`mx-auto max-w-7xl animate-pop-in px-4 pt-4 pb-32 sm:px-6 lg:px-8 lg:pb-12 ${minimalChrome ? 'lg:pt-3' : 'lg:pt-6'}`}>
        <Outlet />
        <LegalFooter className="mt-10" />
      </main>

      {mobileTabs && (
        <nav
          aria-label="Quick navigation"
          className="fixed inset-x-3 bottom-3 z-20 flex items-center justify-around rounded-full bg-white/90 px-2 py-1.5 shadow-pop ring-1 ring-espresso-900/5 backdrop-blur-xl dark:bg-[#1a1815]/95 dark:ring-white/10 lg:hidden"
        >
          {mobileTabs.map((tab) =>
            tab.action === 'palette' ? (
              <button
                key="palette"
                type="button"
                onClick={() => setPaletteOpen(true)}
                className="flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 text-[11px] font-medium text-espresso-500"
              >
                <tab.icon className="size-5" strokeWidth={1.75} />
                {tab.label}
              </button>
            ) : tab.primary ? (
              <NavLink
                key={tab.to}
                to={tab.to}
                aria-label={tab.label}
                className="flex size-12 items-center justify-center rounded-full bg-espresso-900 text-cream-50 shadow-soft transition active:scale-95"
              >
                <tab.icon className="size-5" strokeWidth={2} />
              </NavLink>
            ) : (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
                    isActive ? 'text-espresso-900' : 'text-espresso-400'
                  }`
                }
              >
                <tab.icon className="size-5" strokeWidth={1.75} />
                {tab.label}
              </NavLink>
            ),
          )}
        </nav>
      )}

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        commands={commands}
        searchPeople={searchPeople}
        peopleLabel={peopleLabel}
      />
      <Toaster />
    </div>
  )
}
