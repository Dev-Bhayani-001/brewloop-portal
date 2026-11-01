import { CakeSlice, Coffee, CupSoda, Croissant, GlassWater, Leaf, Salad, Sandwich, UtensilsCrossed } from 'lucide-react'

const ICON_BY_KEYWORD = [
  [/coffee|espresso|brew/i, Coffee],
  [/tea|chai|matcha/i, Leaf],
  [/shake|smoothie|frappe/i, CupSoda],
  [/bake|bread|pastr|croissant/i, Croissant],
  [/sandwich|toast|burger/i, Sandwich],
  [/bowl|salad/i, Salad],
  [/dessert|cake|sweet/i, CakeSlice],
  [/beverage|drink|juice|soda|water/i, GlassWater],
]

/** Line icon for a menu category name (decorative). */
export const categoryIcon = (name = '') =>
  ICON_BY_KEYWORD.find(([pattern]) => pattern.test(name))?.[1] ?? UtensilsCrossed
