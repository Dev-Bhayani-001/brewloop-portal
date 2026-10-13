# BrewLoop Portal — Project Rules

## Tech Stack

- **Framework:** React (via Vite)
- **Language:** JavaScript / JSX (TypeScript may be adopted later if needed)
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Styling:** Tailwind CSS
- **Routing:** React Router (`react-router-dom`)
- **Build Tool:** Vite

## Code Style & Conventions

### React Components
- Use **functional components** exclusively — no class components.
- Prefer basic React hooks (`useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`, `useContext`) before reaching for third-party solutions.
- Keep components small and focused — extract logic into custom hooks when a component grows complex.
- Name component files in **PascalCase** (e.g., `DashboardPage.jsx`).
- Co-locate component-specific styles, tests, and helpers alongside the component.

### State Management
- Use **Redux Toolkit** for global / shared state.
- Organize Redux logic with the **slice pattern** (`createSlice`).
- Use `createAsyncThunk` for async operations (API calls, etc.).
- Keep local UI-only state in component-level `useState` — don't put everything in Redux.
- Use RTK Query for data fetching when appropriate.

### Styling
- Use **Tailwind CSS** utility classes as the primary styling approach.
- Avoid inline `style` props unless absolutely necessary.
- Extract repeated utility patterns into Tailwind `@apply` classes or shared component abstractions.

### Clean Logic Principles
- Separate **business logic** from **presentation**: custom hooks for logic, components for rendering.
- Prefer **pure functions** — keep side effects in hooks or thunks.
- Use **early returns** to reduce nesting.
- Name functions and variables descriptively — clarity over brevity.
- Avoid deeply nested ternaries; extract conditional rendering into helper functions or sub-components.

### File & Folder Structure
```
src/
├── app/              # Redux store setup, root providers
├── assets/           # Static assets (images, fonts, etc.)
├── components/       # Shared / reusable UI components
├── features/         # Feature-based modules (each with components, hooks, slices)
├── hooks/            # Shared custom hooks
├── layouts/          # Layout wrappers (Sidebar, Navbar, etc.)
├── pages/            # Route-level page components
├── services/         # API service layers / RTK Query APIs
├── utils/            # Pure utility functions
└── main.jsx          # App entry point
```

### General
- Keep imports organized: React/library imports → absolute project imports → relative imports.
- Add brief JSDoc comments for non-obvious functions and hooks.
- Additional libraries may be added as needed — prefer well-maintained, lightweight packages.
