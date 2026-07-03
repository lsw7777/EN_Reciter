import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BookOpen, CheckCircle2, Eye, Home, LibraryBig, ListChecks, LogOut, Plus, RotateCcw, UserPlus, XCircle } from 'lucide-react';
import './styles.css';

type Difficulty = 'new' | 'learning' | 'reviewing' | 'ignored';
type Page = 'home' | 'study' | 'books' | 'tasks';

type Word = {
  id: string;
  text: string;
  phonetic: string;
  meanings: string[];
  example: string;
  exampleTranslation: string;
};

type WordBook = {
  id: string;
  name: string;
  category: string;
  description: string;
  estimatedCount: number;
  words: Word[];
};

type User = { username: string; password: string; };

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
    id: 'cet4', name: '四级核心词', category: '大学英语四级', description: 'CET-4 高频基础词汇，适合四级备考与基础巩固', estimatedCount: 2600,
    words: [
      { id: 'cet4-1', text: 'abandon', phonetic: '/əˈbændən/', meanings: ['v. 放弃；抛弃；中止', 'n. 放任；纵情'], example: 'Never abandon your goal because it is difficult.', exampleTranslation: '不要因为目标困难就放弃它。' },
      { id: 'cet4-2', text: 'benefit', phonetic: '/ˈbenɪfɪt/', meanings: ['n. 益处；好处；福利', 'v. 使受益；得益于'], example: 'Regular review will benefit your memory.', exampleTranslation: '定期复习会有益于你的记忆。' },
      { id: 'cet4-3', text: 'complex', phonetic: '/ˈkɒmpleks/', meanings: ['adj. 复杂的；合成的', 'n. 综合体；建筑群；情结'], example: 'The app turns complex learning into small tasks.', exampleTranslation: '这个应用把复杂的学习变成小任务。' },
      { id: 'cet4-4', text: 'efficient', phonetic: '/ɪˈfɪʃnt/', meanings: ['adj. 效率高的；有能力的；生效的'], example: 'An efficient plan saves time every day.', exampleTranslation: '高效的计划每天都能节省时间。' },
      { id: 'cet4-5', text: 'maintain', phonetic: '/meɪnˈteɪn/', meanings: ['v. 维持；保持', 'v. 保养；维修', 'v. 坚称；主张'], example: 'Maintain a habit of reading English cards.', exampleTranslation: '保持阅读英文卡片的习惯。' }
    ]
  },
  {
    id: 'cet6', name: '六级核心词', category: '大学英语六级', description: 'CET-6 阅读、听力和写作常见进阶词汇', estimatedCount: 3200,
    words: [
      { id: 'cet6-1', text: 'adequate', phonetic: '/ˈædɪkwət/', meanings: ['adj. 足够的；充分的', 'adj. 合格的；尚可的'], example: 'The answer gives adequate evidence.', exampleTranslation: '这个答案给出了充分的证据。' },
      { id: 'cet6-2', text: 'coherent', phonetic: '/kəʊˈhɪərənt/', meanings: ['adj. 连贯的；条理清楚的', 'adj. 一致的；协调的'], example: 'A coherent essay is easier to follow.', exampleTranslation: '一篇连贯的文章更容易理解。' },
      { id: 'cet6-3', text: 'derive', phonetic: '/dɪˈraɪv/', meanings: ['v. 获得；取得', 'v. 源自；派生自'], example: 'Many English words derive from Latin.', exampleTranslation: '许多英语单词源自拉丁语。' },
      { id: 'cet6-4', text: 'hypothesis', phonetic: '/haɪˈpɒθəsɪs/', meanings: ['n. 假设；假说', 'n. 前提；猜想'], example: 'Scientists tested the hypothesis carefully.', exampleTranslation: '科学家们仔细验证了这个假设。' },
      { id: 'cet6-5', text: 'significant', phonetic: '/sɪɡˈnɪfɪkənt/', meanings: ['adj. 重要的；有意义的', 'adj. 显著的；相当数量的'], example: 'Vocabulary has a significant effect on reading.', exampleTranslation: '词汇量对阅读有显著影响。' }
    ]
  },
  {
    id: 'ielts', name: '雅思核心词', category: 'IELTS 雅思', description: '雅思阅读、听力、口语和写作高频学术词汇', estimatedCount: 4000,
    words: [
      { id: 'ielts-1', text: 'analyse', phonetic: '/ˈænəlaɪz/', meanings: ['v. 分析；分解；细察'], example: 'Candidates need to analyse charts clearly.', exampleTranslation: '考生需要清晰地分析图表。' },
      { id: 'ielts-2', text: 'criteria', phonetic: '/kraɪˈtɪəriə/', meanings: ['n. 标准；准则；尺度'], example: 'The essay is marked against several criteria.', exampleTranslation: '作文会按照几项标准评分。' },
      { id: 'ielts-3', text: 'fluctuate', phonetic: '/ˈflʌktʃueɪt/', meanings: ['v. 波动；起伏；涨落'], example: 'Oil prices fluctuate throughout the year.', exampleTranslation: '油价全年都在波动。' },
      { id: 'ielts-4', text: 'infrastructure', phonetic: '/ˈɪnfrəstrʌktʃə/', meanings: ['n. 基础设施；基础结构'], example: 'Cities need better transport infrastructure.', exampleTranslation: '城市需要更好的交通基础设施。' },
      { id: 'ielts-5', text: 'sustainable', phonetic: '/səˈsteɪnəbl/', meanings: ['adj. 可持续的；不破坏环境的', 'adj. 可支撑的；可维持的'], example: 'Sustainable development protects future resources.', exampleTranslation: '可持续发展保护未来资源。' }
    ]
  },
  {
    id: 'toefl', name: '托福核心词', category: 'TOEFL 托福', description: '托福学术阅读、听力和综合写作常用词汇', estimatedCount: 4500,
    words: [
      { id: 'toefl-1', text: 'archaeology', phonetic: '/ˌɑːkiˈɒlədʒi/', meanings: ['n. 考古学；古迹研究'], example: 'Archaeology helps us understand ancient societies.', exampleTranslation: '考古学帮助我们了解古代社会。' },
      { id: 'toefl-2', text: 'biodiversity', phonetic: '/ˌbaɪəʊdaɪˈvɜːsəti/', meanings: ['n. 生物多样性'], example: 'Rainforests contain rich biodiversity.', exampleTranslation: '雨林拥有丰富的生物多样性。' },
      { id: 'toefl-3', text: 'migrate', phonetic: '/maɪˈɡreɪt/', meanings: ['v. 迁徙；移居', 'v. 转移；迁移数据'], example: 'Some birds migrate long distances every year.', exampleTranslation: '一些鸟类每年都会长距离迁徙。' },
      { id: 'toefl-4', text: 'phenomenon', phonetic: '/fəˈnɒmɪnən/', meanings: ['n. 现象；非凡的人或事物'], example: 'The professor explained the natural phenomenon.', exampleTranslation: '教授解释了这种自然现象。' },
      { id: 'toefl-5', text: 'theory', phonetic: '/ˈθɪəri/', meanings: ['n. 理论；学说', 'n. 看法；推测'], example: 'The theory is supported by recent evidence.', exampleTranslation: '这个理论得到了近期证据的支持。' }
    ]
  },
  {
    id: 'postgraduate', name: '考研核心词', category: '考研英语', description: '考研英语阅读、翻译和写作高频词汇', estimatedCount: 5500,
    words: [
      { id: 'pg-1', text: 'contradict', phonetic: '/ˌkɒntrəˈdɪkt/', meanings: ['v. 反驳；否认', 'v. 与……矛盾；相抵触'], example: 'The data contradict the original claim.', exampleTranslation: '这些数据与最初的说法相矛盾。' },
      { id: 'pg-2', text: 'elaborate', phonetic: '/ɪˈlæbərət/', meanings: ['adj. 复杂的；详尽的', 'v. 详述；详细说明'], example: 'Please elaborate on your argument.', exampleTranslation: '请详细说明你的论点。' },
      { id: 'pg-3', text: 'inevitable', phonetic: '/ɪnˈevɪtəbl/', meanings: ['adj. 不可避免的；必然发生的', 'n. 必然发生的事'], example: 'Forgetting is inevitable without review.', exampleTranslation: '如果不复习，遗忘是不可避免的。' },
      { id: 'pg-4', text: 'perspective', phonetic: '/pəˈspektɪv/', meanings: ['n. 观点；视角', 'n. 透视法；远景'], example: 'The article offers a new perspective.', exampleTranslation: '这篇文章提供了一个新的视角。' },
      { id: 'pg-5', text: 'substantial', phonetic: '/səbˈstænʃl/', meanings: ['adj. 大量的；可观的', 'adj. 实质的；真实的', 'adj. 牢固的；结实的'], example: 'A substantial vocabulary improves confidence.', exampleTranslation: '可观的词汇量会提升信心。' }
    ]
  }
];

const storageKey = 'en-reciter-state';
const newTaskOptions = [30, 50, 80, 100, 150, 200, 300];
const reviewTaskOptions = [30, 60, 100, 150, 200, 300, 450, 600];
const initialState: AppState = { users: [], activeUser: null, addedBookIds: [], dailyNew: 30, dailyReview: 60, records: {} };

function loadState(): AppState {
  const cached = localStorage.getItem(storageKey);
  return cached ? { ...initialState, ...JSON.parse(cached) } : initialState;
}

function saveState(state: AppState) { localStorage.setItem(storageKey, JSON.stringify(state)); }
function todayIso() { return new Date().toISOString().slice(0, 10); }
function nextDate(days: number) { const date = new Date(); date.setDate(date.getDate() + days); return date.toISOString().slice(0, 10); }
function getWords(bookIds: string[]) { return wordBooks.filter((book) => bookIds.includes(book.id)).flatMap((book) => book.words.map((word) => ({ ...word, bookName: book.name }))); }

function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [page, setPage] = useState<Page>('home');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('123456');
  const [showTranslation, setShowTranslation] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [message, setMessage] = useState('');

  const updateState = (next: AppState) => { setState(next); saveState(next); };
  const activeWords = useMemo(() => getWords(state.addedBookIds), [state.addedBookIds]);
  const dueWords = useMemo(() => {
    const today = todayIso();
    const review = activeWords.filter((word) => {
      const record = state.records[word.id];
      return record && record.status !== 'ignored' && record.nextReviewAt && record.nextReviewAt <= today;
    }).slice(0, state.dailyReview);
    const fresh = activeWords.filter((word) => !state.records[word.id]).slice(0, state.dailyNew);
    return [...review, ...fresh];
  }, [activeWords, state.records, state.dailyNew, state.dailyReview]);

  const currentWord = dueWords[0];
  const unknownWords = activeWords.filter((word) => state.records[word.id]?.status === 'learning');
  const doneCount = activeWords.filter((word) => state.records[word.id]?.status === 'ignored').length;

  const submitAuth = () => {
    if (!username.trim() || password.length < 4) { setMessage('请输入用户名，密码至少 4 位。'); return; }
    if (authMode === 'register') {
      if (state.users.some((user) => user.username === username.trim())) { setMessage('用户已存在，请直接登录。'); return; }
      updateState({ ...state, users: [...state.users, { username: username.trim(), password }], activeUser: username.trim() });
      setMessage('注册成功，已登录。');
      return;
    }
    const user = state.users.find((item) => item.username === username.trim() && item.password === password);
    if (!user) { setMessage('用户名或密码错误。'); return; }
    updateState({ ...state, activeUser: user.username });
    setMessage('登录成功。');
  };

  const addBook = (bookId: string) => { if (!state.addedBookIds.includes(bookId)) updateState({ ...state, addedBookIds: [...state.addedBookIds, bookId] }); };
  const removeBook = (bookId: string) => updateState({ ...state, addedBookIds: state.addedBookIds.filter((id) => id !== bookId) });
  const revealTranslation = () => { setShowTranslation(true); setShowExample(true); };
  const resetCard = () => { setShowTranslation(false); setShowExample(false); };
  const markWord = (status: Difficulty) => {
    if (!currentWord) return;
    const existing = state.records[currentWord.id];
    const record: StudyRecord = { wordId: currentWord.id, status, wrongCount: status === 'learning' ? (existing?.wrongCount ?? 0) + 1 : existing?.wrongCount ?? 0, nextReviewAt: status === 'ignored' ? null : nextDate(status === 'learning' ? 1 : 3) };
    updateState({ ...state, records: { ...state.records, [currentWord.id]: record } });
    resetCard();
  };

  if (!state.activeUser) {
    return <main className="auth-shell"><section className="auth-card"><div className="brand"><BookOpen /> EN Reciter</div><h1>注册 / 登录后开始背单词</h1><p>本 MVP 使用浏览器本地存储保存用户、任务、生词本和复习记录，后续可替换为云端账号系统。</p><div className="tabs"><button className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>注册</button><button className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>登录</button></div><input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="用户名" /><input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="密码" type="password" /><button className="primary" onClick={submitAuth}><UserPlus size={18} /> {authMode === 'register' ? '创建账号' : '登录'}</button>{message && <p className="notice">{message}</p>}</section></main>;
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div><div className="brand"><BookOpen /> EN Reciter</div><span>你好，{state.activeUser}</span></div>
        <nav className="nav-actions">
          <button className={page === 'home' ? 'nav-active' : 'ghost'} onClick={() => setPage('home')}><Home size={16} /> 主页面</button>
          <button className={page === 'study' ? 'nav-active' : 'ghost'} onClick={() => setPage('study')}><BookOpen size={16} /> 背单词</button>
          <button className={page === 'books' ? 'nav-active' : 'ghost'} onClick={() => setPage('books')}><LibraryBig size={16} /> 单词书</button>
          <button className={page === 'tasks' ? 'nav-active' : 'ghost'} onClick={() => setPage('tasks')}><ListChecks size={16} /> 每日任务</button>
          <button className="ghost" onClick={() => updateState({ ...state, activeUser: null })}><LogOut size={16} /> 退出</button>
        </nav>
      </header>

      {page === 'home' && <section className="home-page"><div className="hero-card"><span className="badge">今日待学 {dueWords.length}</span><h1>把背单词变成每天可完成的小任务</h1><p>先选单词书，再设置每日新词和复习量，最后进入专注背诵页完成单词卡片。</p><div className="hero-actions"><button className="primary" onClick={() => setPage('study')}>开始背单词</button><button className="ghost" onClick={() => setPage('books')}>选择单词书</button><button className="ghost" onClick={() => setPage('tasks')}>设置每日任务</button></div></div><section className="dashboard compact-dashboard"><article><strong>{activeWords.length}</strong><span>已添加词汇</span></article><article><strong>{state.dailyNew}/{state.dailyReview}</strong><span>新词 / 复习</span></article><article><strong>{unknownWords.length}</strong><span>生词本</span></article><article><strong>{doneCount}</strong><span>已跳过</span></article></section></section>}

      {page === 'study' && <section className="study-layout focus-layout"><article className="word-card focus-card"><span className="badge">今日待学 {dueWords.length}</span>{currentWord ? <><h1>{currentWord.text}</h1><p className="phonetic">{currentWord.phonetic}</p><div className="card-tools"><button className="primary" onClick={revealTranslation}><Eye size={18} /> 显示汉译</button><button className="ghost" onClick={() => setShowExample(true)}>显示例句</button></div>{showTranslation ? <ul className="meaning-list">{currentWord.meanings.map((meaning) => <li key={meaning}>{meaning}</li>)}</ul> : <p className="hidden-tip">汉译已隐藏，点击按钮查看完整词性和释义</p>}{showExample ? <div className="example-box"><p className="example">{currentWord.example}</p>{showTranslation && <p className="example-translation">{currentWord.exampleTranslation}</p>}</div> : <p className="hidden-tip">例句默认隐藏，可单独显示。</p>}<div className="actions big-actions"><button className="success" onClick={() => markWord('ignored')}><CheckCircle2 size={18} /> 不需要再看了</button><button className="neutral" onClick={() => markWord('reviewing')}><RotateCcw size={18} /> 一般</button><button className="danger" onClick={() => markWord('learning')}><XCircle size={18} /> 不认识</button></div></> : <div className="empty-state">今日任务完成，或请先去“单词书”添加词库。</div>}</article><aside className="notebook compact-side"><h2>生词本</h2>{unknownWords.length === 0 ? <p>暂无生词。选择“不认识”后会自动加入。</p> : unknownWords.slice(0, 6).map((word) => <div className="unknown" key={word.id}><strong>{word.text}</strong><span>{word.meanings[0]}</span></div>)}</aside></section>}

      {page === 'books' && <section className="book-page"><div className="page-title"><span className="badge">单词书中心</span><h1>选择适合你的单词书</h1><p>四级、六级、雅思、托福和考研词库相互独立，可按当前目标自由添加或移除。</p></div><div className="book-grid book-grid-large">{wordBooks.map((book) => { const isAdded = state.addedBookIds.includes(book.id); return <article className={`book-card ${isAdded ? 'selected-book' : ''}`} key={book.id}><span className="book-category">{book.category}</span><h3>{book.name}</h3><p>{book.description}</p><span>预计 {book.estimatedCount.toLocaleString()} 词，当前内置 {book.words.length} 个示例词</span><button className={isAdded ? 'danger-light' : ''} onClick={() => isAdded ? removeBook(book.id) : addBook(book.id)}><Plus size={16} /> {isAdded ? '移除单词书' : '添加单词书'}</button></article>; })}</div></section>}

      {page === 'tasks' && <section className="task-page"><div className="page-title task-title"><span className="badge">每日任务</span><h1>设置每天要完成的背诵量</h1><p>新词建议 30–300，复习词建议 30–600。选择固定档位能让移动端操作更轻量。</p></div><div className="task-panels"><article className="panel"><h2>每天新词</h2><div className="option-grid">{newTaskOptions.map((count) => <button key={count} className={state.dailyNew === count ? 'option-active' : 'ghost'} onClick={() => updateState({ ...state, dailyNew: count })}>{count} 个</button>)}</div></article><article className="panel"><h2>每天复习</h2><div className="option-grid">{reviewTaskOptions.map((count) => <button key={count} className={state.dailyReview === count ? 'option-active' : 'ghost'} onClick={() => updateState({ ...state, dailyReview: count })}>{count} 个</button>)}</div></article></div></section>}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);