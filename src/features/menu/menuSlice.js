import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import { menuApi } from '../../services/apiClient'

export const fetchMenu = createAsyncThunk(
  'menu/fetchMenu',
  async (_, { rejectWithValue }) => {
    try {
      const [categories, items] = await Promise.all([
        menuApi.getCategories(),
        menuApi.getItems(),
      ])
      const mappedItems = (items || []).map((i) => ({
        ...i,
        healthy: i.isHealthy ?? i.healthy,
      }))
      return { categories, items: mappedItems }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const createCategoryThunk = createAsyncThunk(
  'menu/createCategory',
  async ({ name, sortOrder = 0 }, { rejectWithValue }) => {
    try {
      return await menuApi.createCategory({ name, sortOrder })
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const updateCategoryThunk = createAsyncThunk(
  'menu/updateCategory',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await menuApi.updateCategory(id, data)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const saveItemThunk = createAsyncThunk(
  'menu/saveItem',
  async (item, { rejectWithValue }) => {
    try {
      const payload = {
        name: item.name,
        categoryId: item.categoryId,
        price: item.price,
        description: item.description,
        calories: item.calories,
        isHealthy: Boolean(item.healthy ?? item.isHealthy),
        dietary: item.dietary || [],
      }
      let res
      if (item.id && !item.id.startsWith('item_')) {
        res = await menuApi.updateItem(item.id, payload)
      } else {
        res = await menuApi.createItem(payload)
      }
      return { ...res, healthy: res.isHealthy }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const toggleItemThunk = createAsyncThunk(
  'menu/toggleItem',
  async ({ id, active }, { rejectWithValue }) => {
    try {
      const res = await menuApi.updateItem(id, { active })
      return { ...res, healthy: res.isHealthy }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const deleteItemThunk = createAsyncThunk(
  'menu/deleteItem',
  async (id, { rejectWithValue }) => {
    try {
      await menuApi.deleteItem(id)
      return id
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

const menuSlice = createSlice({
  name: 'menu',
  initialState: { categories: [], items: [], loading: false, error: null },
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
    itemToggled(state, action) {
      const item = state.items.find((entry) => entry.id === action.payload)
      if (item) item.active = !item.active
    },
    itemDeleted(state, action) {
      state.items = state.items.filter((entry) => entry.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenu.fulfilled, (state, action) => {
        state.categories = action.payload.categories
        state.items = action.payload.items
      })
      .addCase(createCategoryThunk.fulfilled, (state, action) => {
        state.categories.push(action.payload)
      })
      .addCase(updateCategoryThunk.fulfilled, (state, action) => {
        const cat = state.categories.find((c) => c.id === action.payload.id)
        if (cat) Object.assign(cat, action.payload)
      })
      .addCase(saveItemThunk.fulfilled, (state, action) => {
        const index = state.items.findIndex((i) => i.id === action.payload.id)
        if (index >= 0) state.items[index] = action.payload
        else state.items.push(action.payload)
      })
      .addCase(toggleItemThunk.fulfilled, (state, action) => {
        const item = state.items.find((i) => i.id === action.payload.id)
        if (item) item.active = action.payload.active
      })
      .addCase(deleteItemThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i !== action.payload)
      })
  },
})

export const { categoryAdded, categoryUpdated, itemSaved, itemToggled, itemDeleted } = menuSlice.actions
export default menuSlice.reducer
