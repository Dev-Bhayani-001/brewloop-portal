import { createSlice, nanoid } from '@reduxjs/toolkit'

const menuSlice = createSlice({
  name: 'menu',
  initialState: { categories: [], items: [] },
  reducers: {
    categoryAdded: {
      reducer(state, action) {
        state.categories.push(action.payload)
      },
      prepare({ businessId, name }) {
        return { payload: { id: `cat_${nanoid(8)}`, businessId, name, active: true } }
      },
    },
    categoryUpdated(state, action) {
      const category = state.categories.find((entry) => entry.id === action.payload.id)
      if (category) Object.assign(category, action.payload)
    },
    itemSaved: {
      reducer(state, action) {
        const existing = state.items.find((entry) => entry.id === action.payload.id)
        if (existing) Object.assign(existing, action.payload)
        else state.items.push(action.payload)
      },
      prepare(item) {
        return { payload: { active: true, ...item, id: item.id ?? `item_${nanoid(8)}` } }
      },
    },
    // Items can be toggled on/off or deleted from the menu.
    itemToggled(state, action) {
      const item = state.items.find((entry) => entry.id === action.payload)
      if (item) item.active = !item.active
    },
    itemDeleted(state, action) {
      state.items = state.items.filter((entry) => entry.id !== action.payload)
    },
  },
})

export const { categoryAdded, categoryUpdated, itemSaved, itemToggled, itemDeleted } = menuSlice.actions
export default menuSlice.reducer
