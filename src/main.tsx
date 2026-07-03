import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BookOpen, CheckCircle2, Eye, LogOut, Plus, RotateCcw, UserPlus, XCircle } from 'lucide-react';
import './styles.css';

type Difficulty = 'new' | 'learning' | 'reviewing' | 'ignored';

type Word = {
  id: string;
  text: string;
  phonetic: string;
  translation: string;
  example: string;
};

type WordBook = {
  id: string;
  name: string;
  description: string;
  words: Word[];
};

type User = {
  username: string;
  password: string;
};

type StudyRecord = {
  wordId: string;
  status: Difficulty;
  wrongCount: number;
  nextReviewAt: string | null;
};

type AppState = {
  users: User[];
  activeUser: string | null;
  addedBookIds: string[];
  dailyNew: number;
  dailyReview: number;
  records: Record<string, StudyRecord>;
};

const wordBooks: WordBook[] = [
  {
    id: 'cet46',
    name: '四六级核心词',
    description: '大学英语考试高频基础词汇',
    words: [
      { id: 'cet46-1', text: 'abandon', phonetic: '/əˈbændən/', translation: '放弃；抛弃', example: 'Never abandon your goal because it is difficult.' },
      { id: 'cet46-2', text: 'benefit', phonetic: '/ˈbenɪfɪt/', translation: '益处；使受益', example: 'Regular review will benefit your memory.' },
      { id: 'cet46-3', text: 'complex', phonetic: '/ˈkɒmpleks/', translation: '复杂的；综合体', example: 'The app turns complex learning into small tasks.' },
      { id: 'cet46-4', text: 'efficient', phonetic: '/ɪˈfɪʃnt/', translation: '高效的', example: 'An efficient plan saves time every day.' },
      { id: 'cet46-5', text: 'maintain', phonetic: '/meɪnˈteɪn/', translation: '维持；保养', example: 'Maintain a habit of reading English cards.' }
    ]
  },
  {
    id: 'ielts-toefl',
    name: '雅思托福词汇',
    description: '留学考试阅读和写作常用词',
    words: [
      { id: 'it-1', text: 'adequate', phonetic: '/ˈædɪkwət/', translation: '足够的；合格的', example: 'The answer gives adequate evidence.' },
      { id: 'it-2', text: 'coherent', phonetic: '/kəʊˈhɪərənt/', translation: '连贯的；一致的', example: 'A coherent essay is easier to follow.' },
      { id: 'it-3', text: 'derive', phonetic: '/dɪˈraɪv/', translation: '获得；源自', example: 'Many English words derive from Latin.' },
      { id: 'it-4', text: 'hypothesis', phonetic: '/haɪˈpɒθəsɪs/', translation: '假设', example: 'Scientists tested the hypothesis carefully.' },
      { id: 'it-5', text: 'significant', phonetic: '/sɪɡˈnɪfɪkənt/', translation: '重要的；显著的', example: 'Vocabulary has a significant effect on reading.' }
    ]
  },
  {
    id: 'postgraduate',
    name: '考研核心词',
    description: '考研英语阅读高频词汇',
    words: [
      { id: 'pg-1', text: 'contradict', phonetic: '/ˌkɒntrəˈdɪkt/', translation: '反驳；矛盾', example: 'The data contradict the original claim.' },
      { id: 'pg-2', text: 'elaborate', phonetic: '/ɪˈlæbərət/', translation: '复杂的；详述', example: 'Please elaborate on your argument.' },
      { id: 'pg-3', text: 'inevitable', phonetic: '/ɪnˈevɪtəbl/', translation: '不可避免的', example: 'Forgetting is inevitable without review.' },
      { id: 'pg-4', text: 'perspective', phonetic: '/pəˈspektɪv/', translation: '观点；视角', example: 'The article offers a new perspective.' },
      { id: 'pg-5', text: 'substantial', phonetic: '/səbˈstænʃl/', translation: '大量的；实质的', example: 'A substantial vocabulary improves confidence.' }
    ]
  }
];

const storageKey = 'en-reciter-state';

const initialState: AppState = {
  users: [],
  activeUser: null,
  addedBookIds: [],
  dailyNew: 20,
  dailyReview: 30,
  records: {}
};

function loadState(): AppState {
  const cached = localStorage.getItem(storageKey);
  return cached ? { ...initialState, ...JSON.parse(cached) } : initialState;
}

function saveState(state: AppState) {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function nextDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function getWords(bookIds: string[]) {
  return wordBooks.filter((book) => bookIds.includes(book.id)).flatMap((book) => book.words.map((word) => ({ ...word, bookName: book.name })));
}

function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('123456');
  const [showTranslation, setShowTranslation] = useState(false);
  const [message, setMessage] = useState('');

  const updateState = (next: AppState) => {
    setState(next);
    saveState(next);
  };

  const activeWords = useMemo(() => getWords(state.addedBookIds), [state.addedBookIds]);
  const dueWords = useMemo(() => {
    const today = todayIso();
    const records = state.records;
    const review = activeWords.filter((word) => {
      const record = records[word.id];
      return record && record.status !== 'ignored' && record.nextReviewAt && record.nextReviewAt <= today;
    }).slice(0, state.dailyReview);
    const fresh = activeWords.filter((word) => !records[word.id]).slice(0, state.dailyNew);
    return [...review, ...fresh];
  }, [activeWords, state.records, state.dailyNew, state.dailyReview]);

  const currentWord = dueWords[0];
  const unknownWords = activeWords.filter((word) => state.records[word.id]?.status === 'learning');
  const doneCount = activeWords.filter((word) => state.records[word.id]?.status === 'ignored').length;

  const submitAuth = () => {
    if (!username.trim() || password.length < 4) {
      setMessage('请输入用户名，密码至少 4 位。');
      return;
    }
    if (authMode === 'register') {
      if (state.users.some((user) => user.username === username.trim())) {
        setMessage('用户已存在，请直接登录。');
        return;
      }
      updateState({ ...state, users: [...state.users, { username: username.trim(), password }], activeUser: username.trim() });
      setMessage('注册成功，已登录。');
      return;
    }
    const user = state.users.find((item) => item.username === username.trim() && item.password === password);
    if (!user) {
      setMessage('用户名或密码错误。');
      return;
    }
    updateState({ ...state, activeUser: user.username });
    setMessage('登录成功。');
  };

  const addBook = (bookId: string) => {
    if (state.addedBookIds.includes(bookId)) return;
    updateState({ ...state, addedBookIds: [...state.addedBookIds, bookId] });
  };

  const markWord = (status: Difficulty) => {
    if (!currentWord) return;
    const existing = state.records[currentWord.id];
    const record: StudyRecord = {
      wordId: currentWord.id,
      status,
      wrongCount: status === 'learning' ? (existing?.wrongCount ?? 0) + 1 : existing?.wrongCount ?? 0,
      nextReviewAt: status === 'ignored' ? null : nextDate(status === 'learning' ? 1 : 3)
    };
    updateState({ ...state, records: { ...state.records, [currentWord.id]: record } });
    setShowTranslation(false);
  };

  if (!state.activeUser) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <div className="brand"><BookOpen /> EN Reciter</div>
          <h1>注册 / 登录后开始背单词</h1>
          <p>本 MVP 使用浏览器本地存储保存用户、任务、生词本和复习记录，后续可替换为云端账号系统。</p>
          <div className="tabs">
            <button className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>注册</button>
            <button className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>登录</button>
          </div>
          <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="用户名" />
          <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="密码" type="password" />
          <button className="primary" onClick={submitAuth}><UserPlus size={18} /> {authMode === 'register' ? '创建账号' : '登录'}</button>
          {message && <p className="notice">{message}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <div className="brand"><BookOpen /> EN Reciter</div>
          <span>你好，{state.activeUser}</span>
        </div>
        <button className="ghost" onClick={() => updateState({ ...state, activeUser: null })}><LogOut size={16} /> 退出</button>
      </header>

      <section className="dashboard">
        <article><strong>{activeWords.length}</strong><span>已添加词汇</span></article>
        <article><strong>{unknownWords.length}</strong><span>生词本</span></article>
        <article><strong>{doneCount}</strong><span>已完成/跳过</span></article>
      </section>

      <section className="panel">
        <h2>每日任务</h2>
        <div className="task-grid">
          <label>每天新词<input type="number" min="1" value={state.dailyNew} onChange={(event) => updateState({ ...state, dailyNew: Number(event.target.value) })} /></label>
          <label>每天复习<input type="number" min="1" value={state.dailyReview} onChange={(event) => updateState({ ...state, dailyReview: Number(event.target.value) })} /></label>
        </div>
      </section>

      <section className="panel">
        <h2>单词书</h2>
        <div className="book-grid">
          {wordBooks.map((book) => (
            <article className="book-card" key={book.id}>
              <h3>{book.name}</h3>
              <p>{book.description}</p>
              <span>{book.words.length} 个示例词，可扩展到数千词</span>
              <button onClick={() => addBook(book.id)} disabled={state.addedBookIds.includes(book.id)}><Plus size={16} /> {state.addedBookIds.includes(book.id) ? '已添加' : '添加单词书'}</button>
            </article>
          ))}
        </div>
      </section>

      <section className="study-layout">
        <article className="word-card">
          <span className="badge">今日待学 {dueWords.length}</span>
          {currentWord ? (
            <>
              <h1>{currentWord.text}</h1>
              <p className="phonetic">{currentWord.phonetic}</p>
              <p className="example">{currentWord.example}</p>
              {showTranslation ? <p className="translation">{currentWord.translation}</p> : <p className="hidden-tip">汉译已隐藏，点击按钮查看</p>}
              <button className="primary" onClick={() => setShowTranslation(true)}><Eye size={18} /> 显示汉译</button>
              <div className="actions">
                <button className="success" onClick={() => markWord('ignored')}><CheckCircle2 size={16} /> 不需要再看了</button>
                <button className="neutral" onClick={() => markWord('reviewing')}><RotateCcw size={16} /> 一般</button>
                <button className="danger" onClick={() => markWord('learning')}><XCircle size={16} /> 不认识</button>
              </div>
            </>
          ) : (
            <div className="empty-state">今日任务完成，或请先添加单词书。</div>
          )}
        </article>

        <aside className="notebook">
          <h2>生词本</h2>
          {unknownWords.length === 0 ? <p>暂无生词。选择“不认识”后会自动加入。</p> : unknownWords.map((word) => <div className="unknown" key={word.id}><strong>{word.text}</strong><span>{word.translation}</span></div>)}
        </aside>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);