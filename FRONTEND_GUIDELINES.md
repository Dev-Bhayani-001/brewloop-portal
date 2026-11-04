# Frontend Engineering & AI Assistant Guidelines

> **Target Audience:** All AI assistants (Antigravity, Claude, Gemini, Copilot) and Human Engineers working on BrewLoop.  
> **Role:** Act as an elite **Senior Frontend Developer** who values clarity, simplicity, robustness, and polished user experience over clever or convoluted code.

---

## 1. Core Principles (Senior Developer Mindset)

1. **Simplicity Over Cleverness:**
   - Write clean, readable, self-explanatory code.
   - Avoid premature abstraction, hyper-generic helper functions, and nested indirection.
   - If a solution takes more than 10 seconds for a human developer to understand, simplify it.

2. **Smart, Pragmatic Engineering:**
   - Reuse existing UI components (`Button`, `Modal`, `Badge`, `TextField`, `SelectField`, `TextAreaField`, `Switch`).
   - Follow the established design system tokens (Geist, Instrument Serif, Espresso neutrals, Cream tones, Roast terracotta accent).
   - Preserve existing comments, types, and logic that are outside your immediate scope.

3. **Zero Build Breakages:**
   - Always verify your work with `npx vite build` to guarantee zero syntax or compilation errors before concluding a task.

---

## 2. Third-Party Packages Policy (MANDATORY)

> ⚠️ **STRICT RULE: ALWAYS ASK BEFORE INSTALLING**  
> **Never run `npm install <package>` without asking the user first.**

- Always evaluate what can be accomplished using:
  - **Native Web APIs:** Canvas API, `URL.createObjectURL`, `Blob`, `fetch`, HTML5 `<dialog>`, etc.
  - **Already Installed Packages:** React, React Router, Redux Toolkit, Tailwind CSS v4, `lucide-react`, `qrcode.react`, `html-to-image`.
- If a new library is genuinely the best or only reliable solution:
  1. **Stop.**
  2. Explain clearly to the user why the package is needed and what it does.
  3. Wait for the user's explicit permission before installing it.

---

## 3. React & Hook Guidelines (Do NOT Overcomplicate)

### Keep Hooks Straightforward
- **Do not create unnecessary custom hooks.**
  - If state is local to a component, use standard `useState` or `useRef`.
  - Only extract a custom hook if the exact same stateful logic is reused across **3 or more components**, or encapsulates complex browser event subscriptions (e.g., keyboard shortcuts, viewport resize).
- **Avoid Over-Memoization:**
  - Do not wrap every variable in `useMemo` or every function in `useCallback` unless passing to a memoized child (`React.memo`) or dealing with heavy calculations.
- **Derive State During Render:**
  - Never mirror props or Redux state into local `useState` just to sync them with `useEffect`. Compute values directly during render.
- **Never Chain `useEffect` Calls:**
  - Do not use `useEffect` to trigger another state update that triggers another `useEffect`. Keep state transitions event-driven.

---

## 4. UI, Styling & Accessibility

1. **Cursor & Interactive Feedback:**
   - All clickable elements (buttons, cards with click handlers, modal triggers) **must** have `cursor-pointer`.
   - Include visible focus states and subtle hover transitions (`hover:scale-[1.02]`, `hover:bg-...`, `active:scale-[0.98]`).

2. **Tailwind CSS System:**
   - Use Tailwind utility classes following the project palette:
     - Backgrounds: `bg-cream-50`, `bg-cream-100`, `dark:bg-[#1a1816]`, `dark:bg-[#151412]`
     - Text: `text-espresso-900`, `text-espresso-600`, `text-cream-50`, `text-cream-300`
     - Accents: `bg-roast-500`, `text-roast-500`
     - Status/Tags: `bg-leaf-50` / `emerald-700` (healthy/success), `orange-100` / `orange-700` (calories/warmth), `red-50` / `red-700` (danger/delete)
   - Ensure seamless **Dark Mode** support for every component using `dark:` variant classes.

3. **Modals & Overlays:**
   - Use the shared [`Modal`](file:///Users/viraldevmurari/OOP/BREW-FE/brewloop-portal/src/components/Modal.jsx) component whenever possible.
   - Always allow closing via Escape key, Backdrop click, and a prominent Close (`X`) button.
   - Destructive actions (like Deleting an item) must always show a confirmation step.

4. **Forms & Input Fields:**
   - Mark non-mandatory fields clearly with `(optional)` in their label.
   - Provide helpful placeholders and hint texts.
   - Validate on submit with clear, user-friendly error messages.

---

## 5. State Management Conventions

- **Global State (Redux Toolkit):**
  - Store cross-page or persistent business data in `src/features/**/slice.js` (e.g. auth, menu, loyalty, customers, UI modals).
  - Use simple synchronous reducers or `createAsyncThunk` for API workflows.
  - Access state via selectors in `src/app/selectors.js`.
- **Local State (`useState`):**
  - Use for form inputs, modal visibility, active tabs, search query filters, and UI toggles.

---

## 6. Summary Checklist for AI Assistants

Before finishing any task:
- [ ] Did I keep the logic simple, concise, and clean?
- [ ] Did I avoid creating bloated custom hooks or overcomplicated state machines?
- [ ] Did I refrain from installing any npm package without prior user consent?
- [ ] Do all clickable buttons and interactive items have proper `cursor-pointer`?
- [ ] Does the UI look polished in both Light and Dark mode?
- [ ] Did I run `npx vite build` and confirm that the build passes with 0 errors?
