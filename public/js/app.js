// ── SmartSecure React App ───────────────────────
// All React code in one file — Babel Standalone transforms JSX in the browser.
// window.api is provided by api.js loaded before this script.

const { useState, useEffect, useContext, createContext, useCallback, useRef, Fragment } = React;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Simple Hash Router (no external dependency)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const RouterCtx = createContext({ path: '/', navigate: () => {} });

function HashRouter({ children }) {
  const getPath = () => decodeURIComponent(window.location.hash.slice(1)) || '/';
  const [path, setPath] = useState(getPath);

  useEffect(() => {
    if (!window.location.hash) window.location.hash = '/';
    const handler = () => setPath(getPath());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const navigate = useCallback((to) => { window.location.hash = to; }, []);
  return <RouterCtx.Provider value={{ path, navigate }}>{children}</RouterCtx.Provider>;
}

function useNavigate() { return useContext(RouterCtx).navigate; }
function usePath()     { return useContext(RouterCtx).path; }

function NavLink({ to, exact, className, children }) {
  const { path, navigate } = useContext(RouterCtx);
  const active = exact || to === '/' ? path === to : path === to || path.startsWith(to + '/');
  return (
    <a
      href={'#' + to}
      className={(typeof className === 'function' ? className({ isActive: active }) : (className || '')) + (active ? ' active' : '')}
      onClick={(e) => { e.preventDefault(); navigate(to); }}
    >
      {children}
    </a>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Contexts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const AuthCtx  = createContext(null);
const ToastCtx = createContext(null);

function useAuth()  { return useContext(AuthCtx); }
function useToast() { return useContext(ToastCtx); }

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Helpers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const STATUS_CLASS = {
  available: 'badge-success', booked: 'badge-primary', maintenance: 'badge-warning',
  active: 'badge-primary', completed: 'badge-success', cancelled: 'badge-danger',
  paid: 'badge-success', pending: 'badge-warning', refunded: 'badge-gray',
  open: 'badge-danger', in_progress: 'badge-warning', resolved: 'badge-success',
  opened: 'badge-success', closed: 'badge-gray', denied: 'badge-danger',
  customer: 'badge-primary', admin: 'badge-purple', technician: 'badge-cyan',
  booking: 'badge-primary', access: 'badge-cyan', payment: 'badge-success', maintenance_n: 'badge-warning',
  card: 'badge-primary', cash: 'badge-success', wallet: 'badge-purple',
  small: 'badge-gray', medium: 'badge-primary', large: 'badge-purple',
};

function Badge({ value }) {
  if (!value && value !== 0) return <span className="text-muted">—</span>;
  const cls = STATUS_CLASS[value] || 'badge-gray';
  return <span className={'badge ' + cls}>{value}</span>;
}

function fmt(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function fmtDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Shared UI Components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Spinner() {
  return <div className="loading-wrap"><div className="spinner" /><span>Loading…</span></div>;
}

function Empty({ icon, text }) {
  return (
    <div className="state-wrap">
      <div className="state-icon">{icon || '📭'}</div>
      <p>{text || 'No records found'}</p>
    </div>
  );
}

function Toast({ message, type = 'success' }) {
  return (
    <div className={`toast ${type}`}>
      <span style={{ fontSize: 15 }}>
        {type === 'success' ? '✓' : type === 'error' ? '✕' : '⚠'}
      </span>
      {message}
    </div>
  );
}

function Modal({ open, onClose, title, onSubmit, submitLabel = 'Save', saving, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onSubmit} disabled={saving}>
            {saving ? 'Saving…' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Sidebar
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const NAV = [
  { to: '/',              icon: '📊', label: 'Dashboard',     exact: true },
  { to: '/users',         icon: '👥', label: 'Users' },
  { to: '/lockers',       icon: '🔒', label: 'Lockers' },
  { to: '/locations',     icon: '📍', label: 'Locations' },
  { to: '/bookings',      icon: '📅', label: 'Bookings' },
  { to: '/access-logs',   icon: '🔑', label: 'Access Logs' },
  { to: '/payments',      icon: '💳', label: 'Payments' },
  { to: '/maintenance',   icon: '🔧', label: 'Maintenance' },
  { to: '/notifications', icon: '🔔', label: 'Notifications' },
];

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() { logout(); navigate('/login'); }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🔐</div>
        <div className="sidebar-logo-text">
          SmartSecure
          <small>IoT Locker System</small>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-label">Navigation</div>
        {NAV.map(item => (
          <NavLink key={item.to} to={item.to} exact={item.exact} className="nav-item">
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {(user.name || 'U')[0].toUpperCase()}
            </div>
            <div>
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-role">{user.role}</div>
            </div>
          </div>
        )}
        <button className="btn-logout" onClick={handleLogout}>⬅ Logout</button>
      </div>
    </aside>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Login Page
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await window.api.login(email.trim(), password);
      login(res.data);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-glow-1" />
      <div className="login-glow-2" />
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">🔐</div>
          <h1>SmartSecure</h1>
          <p>IoT Locker Management System</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn-login" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Dashboard
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function DashboardPage() {
  const [stats, setStats]   = useState({});
  const [logs, setLogs]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [users, lockers, bookings, payments, maint, accessLogs] = await Promise.all([
          window.api.getUsers(),
          window.api.getLockers(),
          window.api.getBookings({ status: 'active' }),
          window.api.getPayments({ status: 'pending' }),
          window.api.getMaintenance({ status: 'open' }),
          window.api.getAccessLogs(),
        ]);
        const lockerList = lockers.data || [];
        setStats({
          users:     users.count || 0,
          lockers:   lockers.count || 0,
          available: lockerList.filter(l => l.status === 'available').length,
          booked:    lockerList.filter(l => l.status === 'booked').length,
          maint:     lockerList.filter(l => l.status === 'maintenance').length,
          activeBookings:   bookings.count || 0,
          pendingPayments:  payments.count || 0,
          openMaintenance:  maint.count || 0,
        });
        setLogs((accessLogs.data || []).slice(0, 6));
      } catch { /* show what we have */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) return (
    <Fragment>
      <div className="page-header">
        <div><h1 className="page-title">Dashboard</h1><p className="page-subtitle">Overview of the locker system</p></div>
      </div>
      <div className="page-body"><Spinner /></div>
    </Fragment>
  );

  const CARDS = [
    { icon: '👥', label: 'Total Users',       value: stats.users,           sub: 'Registered accounts',    bg: 'rgba(59,130,246,.1)',  color: '#2563eb' },
    { icon: '🔒', label: 'Total Lockers',     value: stats.lockers,         sub: 'Across all locations',   bg: 'rgba(139,92,246,.1)', color: '#7c3aed', locker: true },
    { icon: '📅', label: 'Active Bookings',   value: stats.activeBookings,  sub: 'Currently active',       bg: 'rgba(6,182,212,.1)',  color: '#0891b2' },
    { icon: '💳', label: 'Pending Payments',  value: stats.pendingPayments, sub: 'Awaiting payment',       bg: 'rgba(245,158,11,.1)', color: '#d97706' },
    { icon: '🔧', label: 'Open Maintenance',  value: stats.openMaintenance, sub: 'Tickets open',           bg: 'rgba(239,68,68,.1)',  color: '#dc2626' },
  ];

  return (
    <Fragment>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of the SmartSecure locker system</p>
        </div>
      </div>
      <div className="page-body">
        <div className="stats-grid">
          {CARDS.map((c, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
              <div>
                <div className="stat-label">{c.label}</div>
                <div className="stat-value" style={{ color: c.color }}>{c.value ?? '—'}</div>
                <div className="stat-sub">{c.sub}</div>
                {c.locker && (
                  <div className="breakdown-row">
                    <div className="pill pill-available"><span className="pill-num">{stats.available}</span>Available</div>
                    <div className="pill pill-booked"><span className="pill-num">{stats.booked}</span>Booked</div>
                    <div className="pill pill-maint"><span className="pill-num">{stats.maint}</span>Maint.</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="section-title">Recent Access Logs</div>
        <div className="table-wrap">
          {logs.length === 0 ? <Empty icon="🔑" text="No access logs yet" /> : (
            <table>
              <thead>
                <tr>
                  <th>#</th><th>User ID</th><th>Locker ID</th><th>Action</th><th>Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.log_id}>
                    <td className="text-muted">{l.log_id}</td>
                    <td>{l.user_id}</td>
                    <td>{l.locker_id}</td>
                    <td><Badge value={l.action} /></td>
                    <td className="text-muted">{fmt(l.accessed_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Fragment>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Users Page
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function UsersPage() {
  const { showToast } = useToast();
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal]   = useState(null); // null | {mode:'add'|'edit', data:{}}
  const [form, setForm]     = useState({});
  const [saving, setSaving] = useState(false);

  async function fetch_() {
    setLoading(true); setError('');
    try {
      const res = await window.api.getUsers(search ? { search } : {});
      setItems(res.data || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetch_(); }, []);

  function openAdd()  { setForm({ role: 'customer' }); setModal({ mode: 'add' }); }
  function openEdit(u){ setForm({ name: u.name, email: u.email, phone: u.phone || '', role: u.role }); setModal({ mode: 'edit', id: u.user_id }); }
  function closeModal(){ setModal(null); }

  async function handleSave() {
    setSaving(true);
    try {
      if (modal.mode === 'add') {
        await window.api.createUser(form);
        showToast('User created');
      } else {
        await window.api.updateUser(modal.id, form);
        showToast('User updated');
      }
      closeModal(); fetch_();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(u) {
    if (!confirm(`Delete user "${u.name}"? This cannot be undone.`)) return;
    try {
      await window.api.deleteUser(u.user_id);
      showToast('User deleted');
      fetch_();
    } catch (e) { showToast(e.message, 'error'); }
  }

  const F = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const filtered = items.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Fragment>
      <div className="page-header">
        <div><h1 className="page-title">Users</h1><p className="page-subtitle">Manage system accounts</p></div>
        <button className="btn btn-primary" onClick={openAdd}>＋ Add User</button>
      </div>
      <div className="page-body">
        {error && <div className="error-banner">{error}</div>}
        <div className="toolbar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search name or email…" value={search}
              onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetch_()} />
          </div>
          <button className="btn btn-secondary" onClick={fetch_}>Refresh</button>
        </div>
        <div className="table-wrap">
          {loading ? <Spinner /> : filtered.length === 0 ? <Empty icon="👥" text="No users found" /> : (
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Created</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.user_id}>
                    <td className="text-muted">{u.user_id}</td>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td className="text-muted">{u.phone || '—'}</td>
                    <td><Badge value={u.role} /></td>
                    <td className="text-muted">{fmtDate(u.created_at)}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-sm btn-warning-outline" onClick={() => openEdit(u)}>Edit</button>
                        <button className="btn btn-sm btn-danger-outline" onClick={() => handleDelete(u)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal open={!!modal} onClose={closeModal} title={modal?.mode === 'add' ? 'Add User' : 'Edit User'}
        onSubmit={handleSave} saving={saving}>
        <div className="form-row">
          <div className="form-group">
            <label>Full Name *</label>
            <input className="form-input" value={form.name || ''} onChange={F('name')} placeholder="John Doe" />
          </div>
          <div className="form-group">
            <label>Phone (11 digits)</label>
            <input className="form-input" value={form.phone || ''} onChange={F('phone')} placeholder="01012345678" />
          </div>
        </div>
        <div className="form-group">
          <label>Email *</label>
          <input className="form-input" type="email" value={form.email || ''} onChange={F('email')} placeholder="user@example.com" />
        </div>
        {modal?.mode === 'add' && (
          <div className="form-group">
            <label>Password *</label>
            <input className="form-input" type="password" value={form.password || ''} onChange={F('password')} placeholder="Enter password" />
          </div>
        )}
        <div className="form-group">
          <label>Role</label>
          <select className="form-select" value={form.role || 'customer'} onChange={F('role')}>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
            <option value="technician">Technician</option>
          </select>
        </div>
      </Modal>
    </Fragment>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Locations Page
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function LocationsPage() {
  const { showToast } = useToast();
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState({});
  const [saving, setSaving] = useState(false);

  async function fetch_() {
    setLoading(true); setError('');
    try { const r = await window.api.getLocations(); setItems(r.data || []); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetch_(); }, []);

  function openAdd()   { setForm({}); setModal({ mode: 'add' }); }
  function openEdit(l) { setForm({ name: l.name, address: l.address, city: l.city || '', country: l.country || '' }); setModal({ mode: 'edit', id: l.location_id }); }
  function closeModal(){ setModal(null); }

  async function handleSave() {
    setSaving(true);
    try {
      if (modal.mode === 'add') { await window.api.createLocation(form); showToast('Location added'); }
      else { await window.api.updateLocation(modal.id, form); showToast('Location updated'); }
      closeModal(); fetch_();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(l) {
    if (!confirm(`Delete location "${l.name}"?`)) return;
    try { await window.api.deleteLocation(l.location_id); showToast('Deleted'); fetch_(); }
    catch (e) { showToast(e.message, 'error'); }
  }

  const F = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const filtered = items.filter(l =>
    !search || l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Fragment>
      <div className="page-header">
        <div><h1 className="page-title">Locations</h1><p className="page-subtitle">Where lockers are installed</p></div>
        <button className="btn btn-primary" onClick={openAdd}>＋ Add Location</button>
      </div>
      <div className="page-body">
        {error && <div className="error-banner">{error}</div>}
        <div className="toolbar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search name or city…" value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-secondary" onClick={fetch_}>Refresh</button>
        </div>
        <div className="table-wrap">
          {loading ? <Spinner /> : filtered.length === 0 ? <Empty icon="📍" text="No locations found" /> : (
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Address</th><th>City</th><th>Country</th><th>Created</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.location_id}>
                    <td className="text-muted">{l.location_id}</td>
                    <td><strong>{l.name}</strong></td>
                    <td>{l.address}</td>
                    <td>{l.city || '—'}</td>
                    <td>{l.country || '—'}</td>
                    <td className="text-muted">{fmtDate(l.created_at)}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-sm btn-warning-outline" onClick={() => openEdit(l)}>Edit</button>
                        <button className="btn btn-sm btn-danger-outline" onClick={() => handleDelete(l)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <Modal open={!!modal} onClose={closeModal} title={modal?.mode === 'add' ? 'Add Location' : 'Edit Location'}
        onSubmit={handleSave} saving={saving}>
        <div className="form-group"><label>Name *</label><input className="form-input" value={form.name || ''} onChange={F('name')} placeholder="Main Branch" /></div>
        <div className="form-group"><label>Address *</label><input className="form-input" value={form.address || ''} onChange={F('address')} placeholder="123 Main St" /></div>
        <div className="form-row">
          <div className="form-group"><label>City</label><input className="form-input" value={form.city || ''} onChange={F('city')} placeholder="Cairo" /></div>
          <div className="form-group"><label>Country</label><input className="form-input" value={form.country || ''} onChange={F('country')} placeholder="Egypt" /></div>
        </div>
      </Modal>
    </Fragment>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Lockers Page
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function LockersPage() {
  const { showToast } = useToast();
  const [items, setItems]     = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');
  const [statusF, setStatusF] = useState('');
  const [modal, setModal]     = useState(null);
  const [form, setForm]       = useState({});
  const [saving, setSaving]   = useState(false);

  async function fetch_() {
    setLoading(true); setError('');
    try {
      const params = {};
      if (statusF) params.status = statusF;
      const [r, loc] = await Promise.all([
        window.api.getLockers(params),
        window.api.getLocations()
      ]);
      setItems(r.data || []);
      setLocations(loc.data || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetch_(); }, [statusF]);

  function openAdd()   { setForm({ size: 'medium', status: 'available' }); setModal({ mode: 'add' }); }
  function openEdit(l) { setForm({ locker_code: l.locker_code, size: l.size, status: l.status, location_id: l.location_id || '' }); setModal({ mode: 'edit', id: l.locker_id }); }
  function closeModal(){ setModal(null); }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.location_id) delete payload.location_id;
      if (modal.mode === 'add') { await window.api.createLocker(payload); showToast('Locker created'); }
      else { await window.api.updateLocker(modal.id, payload); showToast('Locker updated'); }
      closeModal(); fetch_();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(l) {
    if (!confirm(`Delete locker "${l.locker_code}"?`)) return;
    try { await window.api.deleteLocker(l.locker_id); showToast('Locker deleted'); fetch_(); }
    catch (e) { showToast(e.message, 'error'); }
  }

  const F = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const filtered = items.filter(l =>
    !search || l.locker_code?.toLowerCase().includes(search.toLowerCase())
  );
  const locMap = Object.fromEntries(locations.map(l => [l.location_id, l.name]));

  return (
    <Fragment>
      <div className="page-header">
        <div><h1 className="page-title">Lockers</h1><p className="page-subtitle">Smart locker inventory</p></div>
        <button className="btn btn-primary" onClick={openAdd}>＋ Add Locker</button>
      </div>
      <div className="page-body">
        {error && <div className="error-banner">{error}</div>}
        <div className="toolbar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search locker code…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={statusF} onChange={e => setStatusF(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="booked">Booked</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <button className="btn btn-secondary" onClick={fetch_}>Refresh</button>
        </div>
        <div className="table-wrap">
          {loading ? <Spinner /> : filtered.length === 0 ? <Empty icon="🔒" text="No lockers found" /> : (
            <table>
              <thead><tr><th>ID</th><th>Code</th><th>Size</th><th>Status</th><th>Location</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.locker_id}>
                    <td className="text-muted">{l.locker_id}</td>
                    <td><strong>{l.locker_code}</strong></td>
                    <td><Badge value={l.size} /></td>
                    <td><Badge value={l.status} /></td>
                    <td>{locMap[l.location_id] || <span className="text-muted">—</span>}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-sm btn-warning-outline" onClick={() => openEdit(l)}>Edit</button>
                        <button className="btn btn-sm btn-danger-outline" onClick={() => handleDelete(l)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <Modal open={!!modal} onClose={closeModal} title={modal?.mode === 'add' ? 'Add Locker' : 'Edit Locker'}
        onSubmit={handleSave} saving={saving}>
        <div className="form-group"><label>Locker Code *</label><input className="form-input" value={form.locker_code || ''} onChange={F('locker_code')} placeholder="LK-001" /></div>
        <div className="form-row">
          <div className="form-group">
            <label>Size *</label>
            <select className="form-select" value={form.size || 'medium'} onChange={F('size')}>
              <option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-select" value={form.status || 'available'} onChange={F('status')}>
              <option value="available">Available</option><option value="booked">Booked</option><option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Location</label>
          <select className="form-select" value={form.location_id || ''} onChange={F('location_id')}>
            <option value="">— No location —</option>
            {locations.map(l => <option key={l.location_id} value={l.location_id}>{l.name}</option>)}
          </select>
        </div>
      </Modal>
    </Fragment>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Bookings Page
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function BookingsPage() {
  const { showToast } = useToast();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [statusF, setStatusF] = useState('');
  const [modal, setModal]     = useState(null);
  const [form, setForm]       = useState({});
  const [saving, setSaving]   = useState(false);

  async function fetch_() {
    setLoading(true); setError('');
    try {
      const params = {};
      if (statusF) params.status = statusF;
      const r = await window.api.getBookings(params);
      setItems(r.data || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetch_(); }, [statusF]);

  function toInputDT(dt) { if (!dt) return ''; return new Date(dt).toISOString().slice(0, 16); }

  function openAdd()   { setForm({ status: 'active' }); setModal({ mode: 'add' }); }
  function openEdit(b) { setForm({ start_time: toInputDT(b.start_time), end_time: toInputDT(b.end_time), status: b.status }); setModal({ mode: 'edit', id: b.booking_id }); }
  function closeModal(){ setModal(null); }

  async function handleSave() {
    setSaving(true);
    try {
      if (modal.mode === 'add') { await window.api.createBooking(form); showToast('Booking created'); }
      else { await window.api.updateBooking(modal.id, { status: form.status, start_time: form.start_time, end_time: form.end_time }); showToast('Booking updated'); }
      closeModal(); fetch_();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(b) {
    if (!confirm(`Delete booking #${b.booking_id}?`)) return;
    try { await window.api.deleteBooking(b.booking_id); showToast('Deleted'); fetch_(); }
    catch (e) { showToast(e.message, 'error'); }
  }

  const F = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <Fragment>
      <div className="page-header">
        <div><h1 className="page-title">Bookings</h1><p className="page-subtitle">Locker reservations</p></div>
        <button className="btn btn-primary" onClick={openAdd}>＋ Add Booking</button>
      </div>
      <div className="page-body">
        {error && <div className="error-banner">{error}</div>}
        <div className="toolbar">
          <select className="filter-select" value={statusF} onChange={e => setStatusF(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="btn btn-secondary" onClick={fetch_}>Refresh</button>
        </div>
        <div className="table-wrap">
          {loading ? <Spinner /> : items.length === 0 ? <Empty icon="📅" text="No bookings found" /> : (
            <table>
              <thead><tr><th>ID</th><th>User ID</th><th>Locker ID</th><th>Start</th><th>End</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {items.map(b => (
                  <tr key={b.booking_id}>
                    <td className="text-muted">{b.booking_id}</td>
                    <td>{b.user_id}</td>
                    <td>{b.locker_id}</td>
                    <td className="text-muted">{fmt(b.start_time)}</td>
                    <td className="text-muted">{fmt(b.end_time)}</td>
                    <td><Badge value={b.status} /></td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-sm btn-warning-outline" onClick={() => openEdit(b)}>Edit</button>
                        <button className="btn btn-sm btn-danger-outline" onClick={() => handleDelete(b)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <Modal open={!!modal} onClose={closeModal} title={modal?.mode === 'add' ? 'Add Booking' : 'Edit Booking'}
        onSubmit={handleSave} saving={saving}>
        {modal?.mode === 'add' && (
          <div className="form-row">
            <div className="form-group"><label>User ID *</label><input className="form-input" type="number" value={form.user_id || ''} onChange={F('user_id')} placeholder="1" /></div>
            <div className="form-group"><label>Locker ID *</label><input className="form-input" type="number" value={form.locker_id || ''} onChange={F('locker_id')} placeholder="1" /></div>
          </div>
        )}
        <div className="form-group"><label>Start Time *</label><input className="form-input" type="datetime-local" value={form.start_time || ''} onChange={F('start_time')} /></div>
        <div className="form-group"><label>End Time *</label><input className="form-input" type="datetime-local" value={form.end_time || ''} onChange={F('end_time')} /></div>
        <div className="form-group">
          <label>Status</label>
          <select className="form-select" value={form.status || 'active'} onChange={F('status')}>
            <option value="active">Active</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
          </select>
        </div>
      </Modal>
    </Fragment>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Access Logs Page
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function AccessLogsPage() {
  const { showToast } = useToast();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [actionF, setActionF] = useState('');
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState({});
  const [saving, setSaving]   = useState(false);

  async function fetch_() {
    setLoading(true); setError('');
    try {
      const params = {};
      if (actionF) params.action = actionF;
      const r = await window.api.getAccessLogs(params);
      setItems(r.data || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetch_(); }, [actionF]);

  async function handleSave() {
    setSaving(true);
    try {
      await window.api.createAccessLog(form);
      showToast('Access log created');
      setModal(false); fetch_();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(l) {
    if (!confirm(`Delete log #${l.log_id}?`)) return;
    try { await window.api.deleteAccessLog(l.log_id); showToast('Deleted'); fetch_(); }
    catch (e) { showToast(e.message, 'error'); }
  }

  const F = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <Fragment>
      <div className="page-header">
        <div><h1 className="page-title">Access Logs</h1><p className="page-subtitle">Locker access history</p></div>
        <button className="btn btn-primary" onClick={() => { setForm({ action: 'opened' }); setModal(true); }}>＋ Add Log</button>
      </div>
      <div className="page-body">
        {error && <div className="error-banner">{error}</div>}
        <div className="toolbar">
          <select className="filter-select" value={actionF} onChange={e => setActionF(e.target.value)}>
            <option value="">All Actions</option>
            <option value="opened">Opened</option>
            <option value="closed">Closed</option>
            <option value="denied">Denied</option>
          </select>
          <button className="btn btn-secondary" onClick={fetch_}>Refresh</button>
        </div>
        <div className="table-wrap">
          {loading ? <Spinner /> : items.length === 0 ? <Empty icon="🔑" text="No access logs" /> : (
            <table>
              <thead><tr><th>ID</th><th>User ID</th><th>Locker ID</th><th>Action</th><th>Accessed At</th><th>Actions</th></tr></thead>
              <tbody>
                {items.map(l => (
                  <tr key={l.log_id}>
                    <td className="text-muted">{l.log_id}</td>
                    <td>{l.user_id}</td>
                    <td>{l.locker_id}</td>
                    <td><Badge value={l.action} /></td>
                    <td className="text-muted">{fmt(l.accessed_at)}</td>
                    <td>
                      <button className="btn btn-sm btn-danger-outline" onClick={() => handleDelete(l)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Add Access Log" onSubmit={handleSave} saving={saving}>
        <div className="form-row">
          <div className="form-group"><label>User ID *</label><input className="form-input" type="number" value={form.user_id || ''} onChange={F('user_id')} placeholder="1" /></div>
          <div className="form-group"><label>Locker ID *</label><input className="form-input" type="number" value={form.locker_id || ''} onChange={F('locker_id')} placeholder="1" /></div>
        </div>
        <div className="form-group">
          <label>Action *</label>
          <select className="form-select" value={form.action || 'opened'} onChange={F('action')}>
            <option value="opened">Opened</option><option value="closed">Closed</option><option value="denied">Denied</option>
          </select>
        </div>
      </Modal>
    </Fragment>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Payments Page
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function PaymentsPage() {
  const { showToast } = useToast();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [statusF, setStatusF] = useState('');
  const [modal, setModal]     = useState(null);
  const [form, setForm]       = useState({});
  const [saving, setSaving]   = useState(false);

  async function fetch_() {
    setLoading(true); setError('');
    try {
      const params = {};
      if (statusF) params.status = statusF;
      const r = await window.api.getPayments(params);
      setItems(r.data || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetch_(); }, [statusF]);

  function openAdd()   { setForm({ method: 'card', status: 'pending' }); setModal({ mode: 'add' }); }
  function openEdit(p) { setForm({ status: p.status, method: p.method, amount: p.amount }); setModal({ mode: 'edit', id: p.payment_id }); }
  function closeModal(){ setModal(null); }

  async function handleSave() {
    setSaving(true);
    try {
      if (modal.mode === 'add') { await window.api.createPayment({ ...form, amount: Number(form.amount) }); showToast('Payment created'); }
      else { await window.api.updatePayment(modal.id, { status: form.status, method: form.method, amount: Number(form.amount) }); showToast('Payment updated'); }
      closeModal(); fetch_();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(p) {
    if (!confirm(`Delete payment #${p.payment_id}?`)) return;
    try { await window.api.deletePayment(p.payment_id); showToast('Deleted'); fetch_(); }
    catch (e) { showToast(e.message, 'error'); }
  }

  const F = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <Fragment>
      <div className="page-header">
        <div><h1 className="page-title">Payments</h1><p className="page-subtitle">Transaction records</p></div>
        <button className="btn btn-primary" onClick={openAdd}>＋ Add Payment</button>
      </div>
      <div className="page-body">
        {error && <div className="error-banner">{error}</div>}
        <div className="toolbar">
          <select className="filter-select" value={statusF} onChange={e => setStatusF(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
          <button className="btn btn-secondary" onClick={fetch_}>Refresh</button>
        </div>
        <div className="table-wrap">
          {loading ? <Spinner /> : items.length === 0 ? <Empty icon="💳" text="No payments found" /> : (
            <table>
              <thead><tr><th>ID</th><th>User ID</th><th>Booking ID</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {items.map(p => (
                  <tr key={p.payment_id}>
                    <td className="text-muted">{p.payment_id}</td>
                    <td>{p.user_id}</td>
                    <td>{p.booking_id}</td>
                    <td><strong>${Number(p.amount).toFixed(2)}</strong></td>
                    <td><Badge value={p.method} /></td>
                    <td><Badge value={p.status} /></td>
                    <td className="text-muted">{fmtDate(p.paid_at)}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-sm btn-warning-outline" onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn btn-sm btn-danger-outline" onClick={() => handleDelete(p)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <Modal open={!!modal} onClose={closeModal} title={modal?.mode === 'add' ? 'Add Payment' : 'Edit Payment'}
        onSubmit={handleSave} saving={saving}>
        {modal?.mode === 'add' && (
          <div className="form-row">
            <div className="form-group"><label>User ID *</label><input className="form-input" type="number" value={form.user_id || ''} onChange={F('user_id')} placeholder="1" /></div>
            <div className="form-group"><label>Booking ID *</label><input className="form-input" type="number" value={form.booking_id || ''} onChange={F('booking_id')} placeholder="1" /></div>
          </div>
        )}
        <div className="form-row">
          <div className="form-group"><label>Amount *</label><input className="form-input" type="number" step="0.01" value={form.amount || ''} onChange={F('amount')} placeholder="25.00" /></div>
          <div className="form-group">
            <label>Method</label>
            <select className="form-select" value={form.method || 'card'} onChange={F('method')}>
              <option value="card">Card</option><option value="cash">Cash</option><option value="wallet">Wallet</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Status</label>
          <select className="form-select" value={form.status || 'pending'} onChange={F('status')}>
            <option value="pending">Pending</option><option value="paid">Paid</option><option value="refunded">Refunded</option>
          </select>
        </div>
      </Modal>
    </Fragment>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Maintenance Page
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function MaintenancePage() {
  const { showToast } = useToast();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [statusF, setStatusF] = useState('');
  const [modal, setModal]     = useState(null);
  const [form, setForm]       = useState({});
  const [saving, setSaving]   = useState(false);

  async function fetch_() {
    setLoading(true); setError('');
    try {
      const params = {};
      if (statusF) params.status = statusF;
      const r = await window.api.getMaintenance(params);
      setItems(r.data || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetch_(); }, [statusF]);

  function openAdd()   { setForm({ status: 'open' }); setModal({ mode: 'add' }); }
  function openEdit(m) { setForm({ description: m.description, status: m.status, resolved_at: m.resolved_at ? m.resolved_at.slice(0,16) : '' }); setModal({ mode: 'edit', id: m.maintenance_id }); }
  function closeModal(){ setModal(null); }

  async function handleSave() {
    setSaving(true);
    try {
      if (modal.mode === 'add') { await window.api.createMaintenance(form); showToast('Ticket created'); }
      else {
        const payload = { status: form.status, description: form.description };
        if (form.resolved_at) payload.resolved_at = form.resolved_at;
        await window.api.updateMaintenance(modal.id, payload);
        showToast('Ticket updated');
      }
      closeModal(); fetch_();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(m) {
    if (!confirm(`Delete maintenance ticket #${m.maintenance_id}?`)) return;
    try { await window.api.deleteMaintenance(m.maintenance_id); showToast('Deleted'); fetch_(); }
    catch (e) { showToast(e.message, 'error'); }
  }

  const F = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <Fragment>
      <div className="page-header">
        <div><h1 className="page-title">Maintenance</h1><p className="page-subtitle">Locker repair tickets</p></div>
        <button className="btn btn-primary" onClick={openAdd}>＋ New Ticket</button>
      </div>
      <div className="page-body">
        {error && <div className="error-banner">{error}</div>}
        <div className="toolbar">
          <select className="filter-select" value={statusF} onChange={e => setStatusF(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <button className="btn btn-secondary" onClick={fetch_}>Refresh</button>
        </div>
        <div className="table-wrap">
          {loading ? <Spinner /> : items.length === 0 ? <Empty icon="🔧" text="No maintenance tickets" /> : (
            <table>
              <thead><tr><th>ID</th><th>Locker ID</th><th>Description</th><th>Reported By</th><th>Status</th><th>Reported At</th><th>Actions</th></tr></thead>
              <tbody>
                {items.map(m => (
                  <tr key={m.maintenance_id}>
                    <td className="text-muted">{m.maintenance_id}</td>
                    <td>{m.locker_id}</td>
                    <td style={{ maxWidth: 200 }}>{m.description}</td>
                    <td className="text-muted">{m.reported_by || '—'}</td>
                    <td><Badge value={m.status} /></td>
                    <td className="text-muted">{fmtDate(m.reported_at)}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-sm btn-warning-outline" onClick={() => openEdit(m)}>Edit</button>
                        <button className="btn btn-sm btn-danger-outline" onClick={() => handleDelete(m)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <Modal open={!!modal} onClose={closeModal} title={modal?.mode === 'add' ? 'New Ticket' : 'Edit Ticket'}
        onSubmit={handleSave} saving={saving}>
        {modal?.mode === 'add' && (
          <div className="form-row">
            <div className="form-group"><label>Locker ID *</label><input className="form-input" type="number" value={form.locker_id || ''} onChange={F('locker_id')} placeholder="1" /></div>
            <div className="form-group"><label>Reported By (User ID)</label><input className="form-input" type="number" value={form.reported_by || ''} onChange={F('reported_by')} placeholder="1" /></div>
          </div>
        )}
        <div className="form-group"><label>Description *</label><textarea className="form-textarea" value={form.description || ''} onChange={F('description')} placeholder="Describe the issue…" /></div>
        <div className="form-row">
          <div className="form-group">
            <label>Status</label>
            <select className="form-select" value={form.status || 'open'} onChange={F('status')}>
              <option value="open">Open</option><option value="in_progress">In Progress</option><option value="resolved">Resolved</option>
            </select>
          </div>
          {modal?.mode === 'edit' && (
            <div className="form-group"><label>Resolved At</label><input className="form-input" type="datetime-local" value={form.resolved_at || ''} onChange={F('resolved_at')} /></div>
          )}
        </div>
      </Modal>
    </Fragment>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Notifications Page
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function NotificationsPage() {
  const { showToast } = useToast();
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [typeF, setTypeF]   = useState('');
  const [readF, setReadF]   = useState('');
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState({});
  const [saving, setSaving] = useState(false);

  async function fetch_() {
    setLoading(true); setError('');
    try {
      const params = {};
      if (typeF) params.type = typeF;
      if (readF !== '') params.is_read = readF;
      const r = await window.api.getNotifications(params);
      setItems(r.data || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetch_(); }, [typeF, readF]);

  function openAdd()   { setForm({ type: 'booking', is_read: 0 }); setModal({ mode: 'add' }); }
  function openEdit(n) { setForm({ type: n.type, message: n.message, is_read: n.is_read }); setModal({ mode: 'edit', id: n.notification_id }); }
  function closeModal(){ setModal(null); }

  async function handleSave() {
    setSaving(true);
    try {
      if (modal.mode === 'add') { await window.api.createNotification(form); showToast('Notification created'); }
      else { await window.api.updateNotification(modal.id, { type: form.type, message: form.message, is_read: Number(form.is_read) }); showToast('Updated'); }
      closeModal(); fetch_();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(n) {
    if (!confirm(`Delete notification #${n.notification_id}?`)) return;
    try { await window.api.deleteNotification(n.notification_id); showToast('Deleted'); fetch_(); }
    catch (e) { showToast(e.message, 'error'); }
  }

  async function markRead(n) {
    try { await window.api.updateNotification(n.notification_id, { is_read: 1 }); fetch_(); }
    catch (e) { showToast(e.message, 'error'); }
  }

  const F = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <Fragment>
      <div className="page-header">
        <div><h1 className="page-title">Notifications</h1><p className="page-subtitle">User alerts and messages</p></div>
        <button className="btn btn-primary" onClick={openAdd}>＋ Add Notification</button>
      </div>
      <div className="page-body">
        {error && <div className="error-banner">{error}</div>}
        <div className="toolbar">
          <select className="filter-select" value={typeF} onChange={e => setTypeF(e.target.value)}>
            <option value="">All Types</option>
            <option value="booking">Booking</option>
            <option value="access">Access</option>
            <option value="payment">Payment</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <select className="filter-select" value={readF} onChange={e => setReadF(e.target.value)}>
            <option value="">All</option>
            <option value="0">Unread</option>
            <option value="1">Read</option>
          </select>
          <button className="btn btn-secondary" onClick={fetch_}>Refresh</button>
        </div>
        <div className="table-wrap">
          {loading ? <Spinner /> : items.length === 0 ? <Empty icon="🔔" text="No notifications" /> : (
            <table>
              <thead><tr><th>ID</th><th>User ID</th><th>Type</th><th>Message</th><th>Read</th><th>Sent At</th><th>Actions</th></tr></thead>
              <tbody>
                {items.map(n => (
                  <tr key={n.notification_id}>
                    <td className="text-muted">{n.notification_id}</td>
                    <td>{n.user_id}</td>
                    <td><Badge value={n.type} /></td>
                    <td style={{ maxWidth: 240 }} className={n.is_read ? 'text-muted' : ''}>{n.message}</td>
                    <td>{n.is_read ? <span className="badge badge-success">Read</span> : <span className="badge badge-warning">Unread</span>}</td>
                    <td className="text-muted">{fmt(n.sent_at)}</td>
                    <td>
                      <div className="table-actions">
                        {!n.is_read && <button className="btn btn-sm btn-warning-outline" onClick={() => markRead(n)}>Mark Read</button>}
                        <button className="btn btn-sm btn-warning-outline" onClick={() => openEdit(n)}>Edit</button>
                        <button className="btn btn-sm btn-danger-outline" onClick={() => handleDelete(n)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <Modal open={!!modal} onClose={closeModal} title={modal?.mode === 'add' ? 'Add Notification' : 'Edit Notification'}
        onSubmit={handleSave} saving={saving}>
        {modal?.mode === 'add' && (
          <div className="form-group"><label>User ID *</label><input className="form-input" type="number" value={form.user_id || ''} onChange={F('user_id')} placeholder="1" /></div>
        )}
        <div className="form-group">
          <label>Type *</label>
          <select className="form-select" value={form.type || 'booking'} onChange={F('type')}>
            <option value="booking">Booking</option>
            <option value="access">Access</option>
            <option value="payment">Payment</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        <div className="form-group"><label>Message *</label><textarea className="form-textarea" value={form.message || ''} onChange={F('message')} placeholder="Notification message…" /></div>
        <div className="form-group">
          <label>Status</label>
          <select className="form-select" value={form.is_read} onChange={e => setForm(f => ({ ...f, is_read: Number(e.target.value) }))}>
            <option value={0}>Unread</option><option value={1}>Read</option>
          </select>
        </div>
      </Modal>
    </Fragment>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// App Root
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ss_user')); } catch { return null; }
  });
  const [toasts, setToasts] = useState([]);

  function login(u)  { setUser(u); localStorage.setItem('ss_user', JSON.stringify(u)); }
  function logout()  { setUser(null); localStorage.removeItem('ss_user'); }

  function showToast(message, type = 'success') {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }

  const path = usePath();

  // Route guard helper
  function guard(Page) {
    if (!user) { return <LoginPage />; }
    return <Layout><Page /></Layout>;
  }

  // Simple route matching
  const routes = {
    '/':              () => guard(DashboardPage),
    '/users':         () => guard(UsersPage),
    '/lockers':       () => guard(LockersPage),
    '/locations':     () => guard(LocationsPage),
    '/bookings':      () => guard(BookingsPage),
    '/access-logs':   () => guard(AccessLogsPage),
    '/payments':      () => guard(PaymentsPage),
    '/maintenance':   () => guard(MaintenancePage),
    '/notifications': () => guard(NotificationsPage),
    '/login':         () => user ? null : <LoginPage />,
  };

  const render = routes[path] ? routes[path]() : (user ? <Layout><DashboardPage /></Layout> : <LoginPage />);
  if (path === '/login' && user) { setTimeout(() => window.location.hash = '/', 0); return null; }

  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      <ToastCtx.Provider value={{ showToast }}>
        {render}
        <div className="toast-container">
          {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} />)}
        </div>
      </ToastCtx.Provider>
    </AuthCtx.Provider>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Mount
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Root() {
  return (
    <HashRouter>
      <App />
    </HashRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
