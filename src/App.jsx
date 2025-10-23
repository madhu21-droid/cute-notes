import { useEffect, useMemo, useState } from "react";

const COLORS = [
  { key: "sakura", name: "Sakura", dot: "#ff7eb9" },
  { key: "mint", name: "Mint", dot: "#94f2d6" },
  { key: "sky", name: "Sky", dot: "#a2d2ff" },
  { key: "sun", name: "Sun", dot: "#ffe066" }
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function App() {
  const [notes, setNotes] = useState(() =>
    JSON.parse(localStorage.getItem("cute-notes") || "[]")
  );
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ title: "", body: "", color: "sakura" });

  useEffect(
    () => localStorage.setItem("cute-notes", JSON.stringify(notes)),
    [notes]
  );

  const filtered = useMemo(() => {
    let list = notes;
    if (filter !== "all") list = list.filter((n) => n.color === filter);
    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(t) ||
          n.body.toLowerCase().includes(t)
      );
    }
    return list;
  }, [notes, q, filter]);

  function addNote(e) {
    e.preventDefault();
    if (!form.title.trim() && !form.body.trim()) return;
    const n = { id: uid(), ...form, done: false, createdAt: Date.now() };
    setNotes((prev) => [n, ...prev]);
    setForm({ title: "", body: "", color: form.color });
  }

  function toggleDone(id) {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, done: !n.done } : n))
    );
  }

  function remove(id) {
    if (!confirm("Delete this note?")) return;
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  function startEdit(n) {
    const title = prompt("Edit title", n.title ?? "");
    if (title === null) return;
    const body = prompt("Edit body", n.body ?? "");
    if (body === null) return;
    setNotes((prev) =>
      prev.map((x) => (x.id === n.id ? { ...x, title, body } : x))
    );
  }

  return (
    <div className="container">
      <div className="header">
        <div className="h-title">
          <div className="logo">🌸</div>
          <div>
            <div className="app-title">Cute Sakura Notes</div>
            <div className="subtitle">soft · pastel · offline</div>
          </div>
        </div>
        <div className="actions">
          <button
            className="btn ghost"
            onClick={() => {
              localStorage.removeItem("cute-notes");
              setNotes([]);
            }}
          >
            Clear All
          </button>
        </div>
      </div>

      <form className="note-form" onSubmit={addNote}>
        <div className="row">
          <input
            className="input"
            placeholder="Title (e.g., Study plan ✨)"
            value={form.title}
            onChange={(e) =>
              setForm((f) => ({ ...f, title: e.target.value }))
            }
          />
          <select
            className="select"
            value={form.color}
            onChange={(e) =>
              setForm((f) => ({ ...f, color: e.target.value }))
            }
          >
            {COLORS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <textarea
          className="input"
          placeholder="Write your note…"
          value={form.body}
          onChange={(e) =>
            setForm((f) => ({ ...f, body: e.target.value }))
          }
        />
        <div className="row">
          <button className="btn" type="submit">
            ➕ Add
          </button>
          <input
            className="input"
            placeholder="🔍 Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            {COLORS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </form>

      {filtered.length === 0 ? (
        <div className="empty">No Sakura notes yet 💗</div>
      ) : (
        <div className="grid">
          {filtered.map((n) => (
            <NoteCard
              key={n.id}
              note={n}
              onToggle={toggleDone}
              onEdit={startEdit}
              onDel={remove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NoteCard({ note, onToggle, onEdit, onDel }) {
  const classes = "badge " + (note.color || "sakura");
  const tag = COLORS.find((c) => c.key === note.color) || COLORS[0];

  return (
    <article className="card">
      <header>
        <span className={classes}>
          <span
            className="tag-dot"
            style={{ background: tag.dot }}
          ></span>
          {tag.name}
        </span>
        <span className="date">
          {new Date(note.createdAt).toLocaleString()}
        </span>
      </header>

      <h3 onClick={() => onEdit(note)}>
        {note.done ? "✅ " : "🌸 "}{" "}
        {note.title || <em>(no title)</em>}
      </h3>
      {note.body && <p>{note.body}</p>}

      <div className="row card-actions">
        <label>
          <input
            type="checkbox"
            checked={note.done}
            onChange={() => onToggle(note.id)}
          />
          Done
        </label>
        <div className="btn-row">
          <button className="btn ghost" onClick={() => onEdit(note)}>
            Edit
          </button>
          <button className="btn" onClick={() => onDel(note.id)}>
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}