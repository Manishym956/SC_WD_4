import { useEffect, useMemo, useState } from 'react'
import './App.css'

// Types
// List: { id: string, name: string }
// Task: { id: string, title: string, done: boolean, due: string | null, listId: string }

const STORAGE_KEY = 'todo_app_state_v1'

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

function App() {
  const [lists, setLists] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return parsed.lists || []
      } catch (_) {}
    }
    return [
      { id: 'inbox', name: 'Inbox' }
    ]
  })

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return parsed.tasks || []
      } catch (_) {}
    }
    return []
  })

  const [activeListId, setActiveListId] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return parsed.activeListId || 'inbox'
      } catch (_) {}
    }
    return 'inbox'
  })

  // Persist
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ lists, tasks, activeListId })
    )
  }, [lists, tasks, activeListId])

  const activeList = useMemo(
    () => lists.find(l => l.id === activeListId) || lists[0],
    [lists, activeListId]
  )

  const tasksInActiveList = useMemo(
    () => tasks.filter(t => t.listId === activeList?.id),
    [tasks, activeList]
  )

  function addList(name) {
    const newList = { id: generateId(), name: name.trim() || 'Untitled' }
    setLists(prev => [...prev, newList])
    setActiveListId(newList.id)
  }

  function renameList(id, name) {
    setLists(prev => prev.map(l => (l.id === id ? { ...l, name } : l)))
  }

  function deleteList(id) {
    if (id === 'inbox') return
    setLists(prev => prev.filter(l => l.id !== id))
    setTasks(prev => prev.filter(t => t.listId !== id))
    if (activeListId === id) setActiveListId('inbox')
  }

  function addTask(title, due) {
    const newTask = {
      id: generateId(),
      title: title.trim(),
      done: false,
      due: due || null,
      listId: activeList?.id || 'inbox'
    }
    if (!newTask.title) return
    setTasks(prev => [newTask, ...prev])
  }

  function toggleTask(id) {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  function editTask(id, updates) {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)))
  }

  const sortedTasks = useMemo(() => {
    const copy = [...tasksInActiveList]
    copy.sort((a, b) => {
      // 1) incomplete first
      if (a.done !== b.done) return a.done ? 1 : -1
      // 2) by due datetime (nulls last)
      const aDue = a.due ? new Date(a.due).getTime() : Infinity
      const bDue = b.due ? new Date(b.due).getTime() : Infinity
      if (aDue !== bDue) return aDue - bDue
      // 3) by title
      return a.title.localeCompare(b.title)
    })
    return copy
  }, [tasksInActiveList])

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Lists</h2>
          <NewListForm onAdd={addList} />
        </div>
        <ul className="list-list">
          {lists.map(list => (
            <li key={list.id} className={list.id === activeList?.id ? 'active' : ''}>
              <button className="list-item" onClick={() => setActiveListId(list.id)}>
                {list.name}
              </button>
              {list.id !== 'inbox' && (
                <div className="list-actions">
                  <InlineEdit
                    value={list.name}
                    onChange={name => renameList(list.id, name)}
                  />
                  <button className="danger" onClick={() => deleteList(list.id)} title="Delete list">✕</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </aside>

      <main className="content">
        <header className="content-header">
          <h1>{activeList?.name || 'Inbox'}</h1>
          <TaskForm onAdd={addTask} />
        </header>

        {sortedTasks.length === 0 ? (
          <p className="empty">No tasks yet. Add your first task above.</p>
        ) : (
          <ul className="task-list">
            {sortedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => toggleTask(task.id)}
                onDelete={() => deleteTask(task.id)}
                onEdit={updates => editTask(task.id, updates)}
              />)
            )}
          </ul>
        )}
      </main>
    </div>
  )
}

function NewListForm({ onAdd }) {
  const [name, setName] = useState('')
  function submit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(name)
    setName('')
  }
  return (
    <form className="new-list" onSubmit={submit}>
      <input
        type="text"
        placeholder="New list"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <button type="submit">Add</button>
    </form>
  )
}

function TaskForm({ onAdd }) {
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd(title, due || null)
    setTitle('')
    setDue('')
  }
  return (
    <form className="task-form" onSubmit={submit}>
      <input
        type="text"
        placeholder="Add task"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <input
        type="datetime-local"
        value={due}
        onChange={e => setDue(e.target.value)}
      />
      <button type="submit">Add</button>
    </form>
  )
}

function InlineEdit({ value, onChange }) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState(value)
  useEffect(() => setLocal(value), [value])

  function submit() {
    const v = local.trim()
    if (v && v !== value) onChange(v)
    setEditing(false)
  }

  if (!editing) {
    return (
      <button className="link" onClick={() => setEditing(true)} title="Rename list">✎</button>
    )
  }
  return (
    <span className="inline-edit">
      <input value={local} onChange={e => setLocal(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
      <button onClick={submit}>Save</button>
    </span>
  )
}

function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [localTitle, setLocalTitle] = useState(task.title)
  const [localDue, setLocalDue] = useState(task.due || '')

  useEffect(() => {
    setLocalTitle(task.title)
    setLocalDue(task.due || '')
  }, [task.title, task.due])

  function save() {
    const updates = {}
    const trimmed = localTitle.trim()
    if (trimmed && trimmed !== task.title) updates.title = trimmed
    if ((localDue || null) !== (task.due || null)) updates.due = localDue || null
    if (Object.keys(updates).length) onEdit(updates)
    setEditingTitle(false)
  }

  return (
    <li className={`task ${task.done ? 'done' : ''}`}>
      <label className="checkbox">
        <input type="checkbox" checked={task.done} onChange={onToggle} />
        <span />
      </label>
      <div className="task-main">
        {editingTitle ? (
          <input
            className="title-input"
            value={localTitle}
            onChange={e => setLocalTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && save()}
            autoFocus
          />
        ) : (
          <span className="title" onDoubleClick={() => setEditingTitle(true)}>{task.title}</span>
        )}
        <div className="meta">
          <input
            type="datetime-local"
            value={localDue}
            onChange={e => setLocalDue(e.target.value)}
            onBlur={save}
          />
          {task.due && (
            <span className="due-label">{formatDue(task.due)}</span>
          )}
        </div>
      </div>
      <div className="task-actions">
        {editingTitle ? (
          <button onClick={save}>Save</button>
        ) : (
          <button onClick={() => setEditingTitle(true)}>Edit</button>
        )}
        <button className="danger" onClick={onDelete}>Delete</button>
      </div>
    </li>
  )
}

function formatDue(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  const opts = { hour: '2-digit', minute: '2-digit' }
  const time = new Intl.DateTimeFormat(undefined, opts).format(d)
  const date = sameDay ? 'Today' : d.toLocaleDateString()
  return `${date} ${time}`
}

export default App
