## To-Do Web App

A simple, fast React app for managing tasks in multiple lists. You can add, edit, complete, and delete tasks, set due date and time, and your data persists locally in the browser.

### Features
- **Multiple lists**: Create, rename, delete lists; built‑in `Inbox` list can’t be deleted.
- **Tasks**: Add tasks with a title and optional due date/time.
- **Edit inline**: Double‑click a task title to edit; change due date/time in place.
- **Complete**: Toggle done via the checkbox.
- **Delete**: Remove tasks or custom lists.
- **Sorting**: Incomplete first, then by due date/time, then by title.
- **Persistence**: Stored in `localStorage`; reload-safe.

### Tech Stack
- React 18 + Vite
- Vanilla CSS

### Requirements
- Node.js 18+ (Recommended LTS)
- npm 9+

### Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
   Open the printed local URL in your browser.

### Build & Preview
- Build for production:
  ```bash
  npm run build
  ```
- Preview the production build locally:
  ```bash
  npm run preview
  ```

### Usage Tips
- Create lists from the left sidebar. Click a list to focus it.
- Add a task using the “Add task” field; optionally set a due date/time.
- Double‑click a task title to edit. Blur or press Enter to save.
- Change due date/time via the datetime input; it saves on blur.
- Use the checkbox to mark tasks as completed.

### Project Structure
```text
To-Do/
  src/
    App.jsx        # App logic (lists, tasks, persistence)
    App.css        # App styles
    main.jsx       # React entry
    index.css      # Base Vite styles (left as-is)
```

### Data Storage
State is saved to `localStorage` under the key `todo_app_state_v1`.

### License
MIT


