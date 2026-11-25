import { useState, useEffect } from "react";
import "./App.css";

/* ---------- helpers ---------- */
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function useStored(key, initial) {
  const [v, setV] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? initial; } catch { return initial; }
  });
  useEffect(() => localStorage.setItem(key, JSON.stringify(v)), [key, v]);
  return [v, setV];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const Q = (text, options, answer) => ({ text, options, answer });
const SEED = [
  { id: "s1", title: "General Science", desc: "Challenge yourself with basic science questions.", category: "Science", icon: "🔬", time: 3,
    questions: [
      Q("Which planet is known as the Red Planet?", ["Venus", "Jupiter", "Mars", "Saturn"], 2),
      Q("Which gas do plants absorb from the air?", ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"], 1),
      Q("What is H2O commonly called?", ["Salt", "Water", "Acid", "Oxygen"], 1)] },
  { id: "s2", title: "JavaScript Basics", desc: "Test your knowledge of JavaScript fundamentals.", category: "Programming", icon: "💻", time: 3,
    questions: [
      Q("Which keyword declares a block-scoped variable?", ["var", "let", "def", "int"], 1),
      Q("What does === check?", ["Value only", "Type only", "Value and type", "Reference only"], 2),
      Q("Which method adds an item to the end of an array?", ["push", "pop", "shift", "slice"], 0)] },
  { id: "s3", title: "Computer Fundamentals", desc: "Check your knowledge of computers.", category: "Technology", icon: "🖥️", time: 3,
    questions: [
      Q("What does CPU stand for?", ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Core Processing Unit"], 0),
      Q("Which of these is an input device?", ["Monitor", "Printer", "Keyboard", "Speaker"], 2),
      Q("What does RAM stand for?", ["Read Access Memory", "Random Access Memory", "Run Active Memory", "Rapid Action Memory"], 1)] },
  { id: "s4", title: "Mathematics Challenge", desc: "Solve these interesting mathematics problems.", category: "Mathematics", icon: "➗", time: 3,
    questions: [
      Q("What is 12 × 12?", ["124", "144", "134", "154"], 1),
      Q("What is the square root of 81?", ["7", "8", "9", "10"], 2),
      Q("What is 15% of 200?", ["20", "25", "30", "35"], 2)] },
];

/* ---------- quiz card ---------- */
function QuizCard({ z, attempts, onStart, onEdit, onDelete }) {
  return (
    <div className="card qcard">
      <div className="ico">{z.icon}</div>
      <h3>{z.title}</h3>
      <p>{z.desc}</p>
      <div className="meta">
        <span className="chip">{z.category}</span>
        <span className="chip">{z.questions.length} questions</span>
        <span className="chip">{z.time} min</span>
        {attempts > 0 && <span className="chip">{attempts} plays</span>}
      </div>
      <div className="row-btns">
        <button className="btn sm" disabled={!z.questions.length} onClick={() => onStart(z)}>Start quiz</button>
        {onEdit && <button className="btn ghost sm" onClick={() => onEdit(z)}>Edit</button>}
        {onDelete && <button className="btn danger sm" onClick={() => onDelete(z)}>Delete</button>}
      </div>
    </div>
  );
}

/* ---------- create / edit quiz ---------- */
const emptyQ = { index: null, text: "", options: ["", "", "", ""], answer: 0 };
const emptyQuiz = { id: null, title: "", desc: "", category: "", icon: "📝", time: 5, questions: [] };

function Create({ quiz, onSave }) {
  const [m, setM] = useState(quiz || emptyQuiz);
  const [q, setQ] = useState(emptyQ);

  const addQuestion = (e) => {
    e.preventDefault();
    const item = { text: q.text.trim(), options: q.options.map((o) => o.trim()), answer: q.answer };
    setM({ ...m, questions: q.index === null ? [...m.questions, item] : m.questions.map((x, i) => (i === q.index ? item : x)) });
    setQ(emptyQ);
  };

  const save = () => {
    if (!m.title.trim()) return alert("Please enter a quiz title.");
    if (!m.questions.length) return alert("Add at least one question.");
    onSave({ ...m, id: m.id || uid(), title: m.title.trim(), category: m.category.trim() || "General",
             time: Math.max(1, parseInt(m.time, 10) || 1) });
  };

  return (
    <div className="wrap">
      <h2 className="title">{quiz ? "Edit quiz" : "Create a quiz"}</h2>
      <div className="form card">
        <input placeholder="Quiz title" value={m.title} onChange={(e) => setM({ ...m, title: e.target.value })} />
        <textarea placeholder="Short description" value={m.desc} onChange={(e) => setM({ ...m, desc: e.target.value })} />
        <div className="two">
          <input placeholder="Category (e.g. Science)" value={m.category} onChange={(e) => setM({ ...m, category: e.target.value })} />
          <input placeholder="Icon (an emoji)" value={m.icon} maxLength={4} onChange={(e) => setM({ ...m, icon: e.target.value })} />
        </div>
        <input type="number" min="1" aria-label="Time limit in minutes" placeholder="Time limit (minutes)" value={m.time}
          onChange={(e) => setM({ ...m, time: e.target.value })} />
      </div>

      <h2 className="title" style={{ marginTop: 34 }}>Questions ({m.questions.length})</h2>
      <form className="form card" onSubmit={addQuestion}>
        <textarea required placeholder="Question" value={q.text} onChange={(e) => setQ({ ...q, text: e.target.value })} />
        <span className="muted">Select the radio button next to the correct answer.</span>
        {q.options.map((o, k) => (
          <label className="opt" key={k}>
            <input type="radio" name="correct" checked={q.answer === k} onChange={() => setQ({ ...q, answer: k })} />
            <input required placeholder={`Option ${"ABCD"[k]}`} value={o}
              onChange={(e) => setQ({ ...q, options: q.options.map((x, i) => (i === k ? e.target.value : x)) })} />
          </label>
        ))}
        <div className="row-btns">
          <button className="btn">{q.index === null ? "Add question" : "Update question"}</button>
          {q.index !== null && <button type="button" className="btn ghost" onClick={() => setQ(emptyQ)}>Cancel</button>}
        </div>
      </form>

      <div className="form" style={{ marginTop: 10 }}>
        {m.questions.map((x, i) => (
          <div className="qitem" key={i}>
            <div><strong>{i + 1}. {x.text}</strong><br /><span className="muted">Answer: {x.options[x.answer]}</span></div>
            <div className="row-btns">
              <button className="btn ghost sm" onClick={() => setQ({ index: i, text: x.text, options: [...x.options], answer: x.answer })}>Edit</button>
              <button className="btn danger sm" onClick={() => setM({ ...m, questions: m.questions.filter((_, k) => k !== i) })}>Delete</button>
            </div>
          </div>
        ))}
        <button className="btn" onClick={save}>Save quiz</button>
      </div>
    </div>
  );
}

/* ---------- play ---------- */
function Play({ quiz, onFinish }) {
  const [qs] = useState(() => shuffle(quiz.questions)); // random order
  const [ans, setAns] = useState({});
  const [i, setI] = useState(0);
  const [left, setLeft] = useState(quiz.time * 60);

  const submit = () => onFinish(qs, ans);
  useEffect(() => {
    if (left <= 0) { submit(); return; }
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const q = qs[i];
  const mm = String(Math.floor(left / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");
  return (
    <div className="wrap">
      <div className="card quiz-box">
        <div className="qhead">
          <span>{quiz.icon} {quiz.title} · Question {i + 1} of {qs.length}</span>
          <span className={"timer" + (left <= 30 ? " low" : "")}>⏱ {mm}:{ss}</span>
        </div>
        <div className="bar"><i style={{ width: `${((i + 1) / qs.length) * 100}%` }} /></div>
        <h2>{q.text}</h2>
        {q.options.map((o, k) => (
          <button key={k} className={"choice" + (ans[i] === k ? " sel" : "")} onClick={() => setAns({ ...ans, [i]: k })}>{o}</button>
        ))}
        <div className="nav-btns">
          <button className="btn ghost" disabled={i === 0} onClick={() => setI(i - 1)}>Previous</button>
          {i < qs.length - 1
            ? <button className="btn" onClick={() => setI(i + 1)}>Next</button>
            : <button className="btn" onClick={() => confirm("Submit your answers?") && submit()}>Submit</button>}
        </div>
      </div>
    </div>
  );
}

/* ---------- result ---------- */
function Result({ data, onBack }) {
  const { r, qs, ans } = data;
  const pct = Math.round((r.score / r.total) * 100);
  return (
    <div className="wrap">
      <div className="score-card">
        <div>{r.icon} {r.title}</div>
        <div className="num">{r.score} / {r.total}</div>
        <div>{pct}% · {pct >= 80 ? "Excellent work!" : pct >= 50 ? "Good effort!" : "Keep practising!"}</div>
      </div>
      {qs.map((x, i) => {
        const right = ans[i] === x.answer;
        return (
          <div key={i} className={"card rev" + (right ? " right" : "")}>
            <strong>{i + 1}. {x.text}</strong>
            <p>Your answer: {ans[i] === undefined ? <em>not answered</em> : x.options[ans[i]]}</p>
            {!right && <p>Correct answer: {x.options[x.answer]}</p>}
          </div>
        );
      })}
      <div className="btns" style={{ justifyContent: "center", marginTop: 20 }}>
        <button className="btn" onClick={onBack}>More quizzes</button>
      </div>
    </div>
  );
}

/* ---------- app ---------- */
export default function App() {
  const [theme, setTheme] = useStored("qb_theme", "light");
  const [quizzes, setQuizzes] = useStored("qb_quizzes", SEED);
  const [results, setResults] = useStored("qb_results", []);
  const [user, setUser] = useStored("qb_user", "");
  const [page, setPage] = useState("home");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [playing, setPlaying] = useState(null);
  const [editing, setEditing] = useState(null);
  const [last, setLast] = useState(null);
  const [name, setName] = useState("");

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  const go = (p) => { setPage(p); window.scrollTo(0, 0); };
  const plays = (id) => results.filter((r) => r.quizId === id).length;
  const start = (z) => { setPlaying(z); go("play"); };
  const edit = (z) => { setEditing(z); go("create"); };
  const remove = (z) => confirm(`Delete "${z.title}"?`) && setQuizzes(quizzes.filter((x) => x.id !== z.id));

  const finish = (qs, ans) => {
    const score = qs.filter((x, i) => ans[i] === x.answer).length;
    const r = { id: uid(), quizId: playing.id, title: playing.title, icon: playing.icon,
                user: user || "Guest", score, total: qs.length, date: new Date().toISOString() };
    setResults([r, ...results]);
    setLast({ r, qs, ans });
    setPlaying(null);
    go("result");
  };

  const saveQuiz = (z) => {
    setQuizzes(quizzes.some((x) => x.id === z.id) ? quizzes.map((x) => (x.id === z.id ? z : x)) : [...quizzes, z]);
    setEditing(null); setCat("All"); go("quizzes");
  };

  const categories = [...new Set(quizzes.map((z) => z.category))];
  const shown = quizzes.filter((z) =>
    (cat === "All" || z.category === cat) &&
    (z.title + z.desc + z.category).toLowerCase().includes(query.toLowerCase()));
  const popular = [...quizzes].sort((a, b) => plays(b.id) - plays(a.id)).slice(0, 4);
  const pct = (r) => Math.round((r.score / r.total) * 100);
  const fmt = (d) => new Date(d).toLocaleDateString();

  const tabs = [["home", "Home"], ["quizzes", "Quizzes"], ["categories", "Categories"], ["create", "➕ Create"],
                ["leaderboard", "🏆 Leaderboard"], ["results", "📊 My Results"]];

  return (
    <>
      <nav className="nav">
        <div className="nav-in">
          <button className="logo" onClick={() => go("home")}>🧠 Quiz Builder</button>
          <form className="search" onSubmit={(e) => { e.preventDefault(); setCat("All"); go("quizzes"); }}>
            <input placeholder="Search quizzes..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <button aria-label="Search">🔍</button>
          </form>
          <div className="links">
            {tabs.map(([p, label]) => (
              <button key={p} className={page === p ? "on" : ""}
                onClick={() => { if (p === "create") setEditing(null); if (p === "quizzes") setCat("All"); go(p); }}>{label}</button>
            ))}
            {user ? <button onClick={() => setUser("")}>👤 {user} (Logout)</button> : <button className={page === "login" ? "on" : ""} onClick={() => go("login")}>Login</button>}
            <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>{theme === "light" ? "🌙 Theme" : "☀️ Theme"}</button>
          </div>
        </div>
      </nav>

      {page === "home" && (
        <div className="wrap">
          <section className="hero">
            <div>
              <div className="eyebrow">CREATE • PLAY • LEARN • COMPETE</div>
              <h1>Build. Play. <span>Master.</span></h1>
              <p>Create interactive quizzes, challenge your friends, test your knowledge and track your performance.</p>
              <div className="btns">
                <button className="btn" onClick={() => { setCat("All"); go("quizzes"); }}>Explore Quizzes</button>
                <button className="btn ghost" onClick={() => { setEditing(null); go("create"); }}>Create Quiz</button>
              </div>
            </div>
            <div className="hero-card">
              <div className="big">🧠</div>
              <h3>Quiz Builder</h3>
              <p style={{ color: "#fff", margin: 0 }}>Test your knowledge in a fun way!</p>
            </div>
          </section>
          <h2 className="title">🔥 Popular Quizzes</h2>
          <div className="grid">{popular.map((z) => <QuizCard key={z.id} z={z} attempts={plays(z.id)} onStart={start} />)}</div>
        </div>
      )}

      {page === "quizzes" && (
        <div className="wrap">
          <h2 className="title">All Quizzes</h2>
          <div className="filters">
            {["All", ...categories].map((c) => <button key={c} className={"chip" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>{c}</button>)}
          </div>
          {shown.length === 0 && <p className="muted">No quizzes match your search.</p>}
          <div className="grid">{shown.map((z) => <QuizCard key={z.id} z={z} attempts={plays(z.id)} onStart={start} onEdit={edit} onDelete={remove} />)}</div>
        </div>
      )}

      {page === "categories" && (
        <div className="wrap">
          <h2 className="title">Categories</h2>
          <div className="grid">
            {categories.map((c) => {
              const list = quizzes.filter((z) => z.category === c);
              return (
                <div key={c} className="card catcard" onClick={() => { setCat(c); go("quizzes"); }}>
                  <div className="ico">{list[0].icon}</div>
                  <h3>{c}</h3>
                  <p className="muted">{list.length} quiz{list.length === 1 ? "" : "zes"}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {page === "create" && <Create key={editing ? editing.id : "new"} quiz={editing} onSave={saveQuiz} />}
      {page === "play" && playing && <Play key={playing.id} quiz={playing} onFinish={finish} />}
      {page === "result" && last && <Result data={last} onBack={() => go("quizzes")} />}

      {page === "leaderboard" && (
        <div className="wrap">
          <h2 className="title">🏆 Leaderboard</h2>
          <div className="card scroll">
            {results.length === 0 ? <p className="muted">No attempts yet. Take a quiz to appear here.</p> : (
              <table>
                <thead><tr><th>#</th><th>Player</th><th>Quiz</th><th>Score</th><th>Date</th></tr></thead>
                <tbody>
                  {[...results].sort((a, b) => pct(b) - pct(a)).slice(0, 20).map((r, i) => (
                    <tr key={r.id}><td>{["🥇", "🥈", "🥉"][i] || i + 1}</td><td>{r.user}</td><td>{r.icon} {r.title}</td><td>{r.score}/{r.total} ({pct(r)}%)</td><td>{fmt(r.date)}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {page === "results" && (
        <div className="wrap">
          <h2 className="title">📊 My Results {user ? `(${user})` : "(Guest)"}</h2>
          <div className="card scroll">
            {results.filter((r) => r.user === (user || "Guest")).length === 0 ? <p className="muted">You haven't taken any quizzes yet.</p> : (
              <table>
                <thead><tr><th>Quiz</th><th>Score</th><th>Percent</th><th>Date</th></tr></thead>
                <tbody>
                  {results.filter((r) => r.user === (user || "Guest")).map((r) => (
                    <tr key={r.id}><td>{r.icon} {r.title}</td><td>{r.score}/{r.total}</td><td>{pct(r)}%</td><td>{fmt(r.date)}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {page === "login" && (
        <div className="wrap">
          <h2 className="title">Login</h2>
          <form className="form card" onSubmit={(e) => { e.preventDefault(); if (name.trim()) { setUser(name.trim()); setName(""); go("home"); } }}>
            <p className="muted" style={{ margin: 0 }}>Enter a display name so your results appear on the leaderboard. This is stored only in your browser.</p>
            <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
            <button className="btn">Continue</button>
          </form>
        </div>
      )}
    </>
  );
}