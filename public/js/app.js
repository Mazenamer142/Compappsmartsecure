// ── SmartSecure – Role-based React App ─────────────
// Customer: booking-app experience (top nav, explore, book, pay)
// Admin:    data management dashboard (sidebar, full CRUD)

const { useState, useEffect, useContext, createContext, useCallback, Fragment } = React;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Hash Router
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const RouterCtx = createContext({ path: '/', navigate: () => {} });

function HashRouter({ children }) {
  const get = () => decodeURIComponent(window.location.hash.slice(1)) || '/';
  const [path, setPath] = useState(get);
  const navigate = useCallback((to) => { window.location.hash = to; }, []);
  useEffect(() => {
    if (!window.location.hash) window.location.hash = '/';
    const h = () => setPath(get());
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);
  return <RouterCtx.Provider value={{ path, navigate }}>{children}</RouterCtx.Provider>;
}

function useNavigate() { return useContext(RouterCtx).navigate; }
function usePath()     { return useContext(RouterCtx).path; }

function NavLink({ to, exact, className, children }) {
  const { path, navigate } = useContext(RouterCtx);
  const active = (exact || to === '/') ? path === to : path === to || path.startsWith(to + '/');
  const cls = (className || '') + (active ? ' active' : '');
  return (
    <a href={'#' + to} className={cls} onClick={e => { e.preventDefault(); navigate(to); }}>
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
const BADGE_MAP = {
  available:'badge-success', booked:'badge-primary', maintenance:'badge-warning',
  active:'badge-primary', completed:'badge-success', cancelled:'badge-danger',
  paid:'badge-success', pending:'badge-warning', refunded:'badge-gray',
  open:'badge-danger', in_progress:'badge-warning', resolved:'badge-success',
  opened:'badge-success', closed:'badge-gray', denied:'badge-danger',
  customer:'badge-primary', admin:'badge-purple', technician:'badge-cyan',
  booking:'badge-primary', access:'badge-cyan', payment:'badge-success',
  card:'badge-primary', cash:'badge-success', wallet:'badge-purple',
  small:'badge-gray', medium:'badge-primary', large:'badge-purple',
};
function Badge({ value }) {
  if (!value && value !== 0) return <span className="text-muted">—</span>;
  return <span className={'badge ' + (BADGE_MAP[value] || 'badge-gray')}>{value}</span>;
}
function fmt(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' });
}
function fmtDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}
const PRICE = { small: 5, medium: 10, large: 15 };
function calcCost(size, start, end) {
  if (!start || !end) return 0;
  const h = Math.max(1, Math.ceil((new Date(end) - new Date(start)) / 3600000));
  return (h * (PRICE[size] || 10)).toFixed(2);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Shared UI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Spinner() {
  return <div className="loading-wrap"><div className="spinner" /><span>Loading…</span></div>;
}
function Empty({ icon, text }) {
  return <div className="state-wrap"><div className="state-icon">{icon || '📭'}</div><p>{text || 'No records found'}</p></div>;
}
function Toast({ message, type = 'success' }) {
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : '⚠';
  return <div className={`toast ${type}`}><span>{icon}</span>{message}</div>;
}
function Modal({ open, onClose, title, onSubmit, submitLabel = 'Save', saving, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
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
// Auth Pages
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await window.api.login(email.trim(), password);
      login(res.data); navigate('/');
    } catch (err) { setError(err.message || 'Login failed'); }
    finally { setLoading(false); }
  }

  return (
    <div className="auth-page">
      <div className="auth-glow-1" /><div className="auth-glow-2" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🔐</div>
          <h1>SmartSecure</h1>
          <p>Sign in to your account</p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label>Email Address</label>
            <input className="form-input" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label>Password</label>
            <input className="form-input" type="password" placeholder="Your password"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="btn-auth" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="auth-switch">
          New here?{' '}
          <a href="#/signup" onClick={e => { e.preventDefault(); navigate('/signup'); }}>Create a free account</a>
        </p>
      </div>
    </div>
  );
}

function SignUpPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({});
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const F = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await window.api.createUser({ ...form, role: 'customer' });
      const res = await window.api.login(form.email.trim(), form.password);
      login(res.data); navigate('/');
    } catch (err) { setError(err.message || 'Registration failed'); }
    finally { setLoading(false); }
  }

  return (
    <div className="auth-page">
      <div className="auth-glow-1" /><div className="auth-glow-2" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">✨</div>
          <h1>Create Account</h1>
          <p>Start booking lockers today</p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label>Full Name *</label>
            <input className="form-input" placeholder="John Doe" value={form.name || ''} onChange={F('name')} required />
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label>Email Address *</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={form.email || ''} onChange={F('email')} required />
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label>Password *</label>
            <input className="form-input" type="password" placeholder="Choose a strong password" value={form.password || ''} onChange={F('password')} required />
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label>Phone <span style={{ fontWeight:400, textTransform:'none', fontSize:11 }}>(optional)</span></label>
            <input className="form-input" placeholder="01012345678" value={form.phone || ''} onChange={F('phone')} />
          </div>
          <button className="btn-auth" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account?{' '}
          <a href="#/login" onClick={e => { e.preventDefault(); navigate('/login'); }}>Sign in</a>
        </p>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CUSTOMER – Top Nav + Layout
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CUSTOMER_NAV = [
  { to: '/',               label: '🔍 Explore',      exact: true },
  { to: '/my-bookings',    label: '📅 My Bookings' },
  { to: '/payment',        label: '💳 Payment' },
  { to: '/notifications',  label: '🔔 Notifications' },
];

function CustomerTopNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <nav className="top-nav">
      <div className="top-nav-inner">
        <div className="top-nav-logo">
          <div className="top-nav-logo-icon">🔐</div>
          SmartSecure
        </div>
        <div className="top-nav-links">
          {CUSTOMER_NAV.map(n => (
            <NavLink key={n.to} to={n.to} exact={n.exact} className="top-nav-link">{n.label}</NavLink>
          ))}
        </div>
        <div className="top-nav-right">
          <span className="top-nav-username">{user?.name?.split(' ')[0]}</span>
          <div className="top-nav-avatar" title={user?.name}>{(user?.name || 'U')[0].toUpperCase()}</div>
          <button className="top-nav-logout" onClick={() => { logout(); navigate('/login'); }}>Logout</button>
        </div>
      </div>
    </nav>
  );
}

function CustomerLayout({ children }) {
  return (
    <div className="customer-layout">
      <CustomerTopNav />
      <div style={{ marginTop: 'var(--nav-h)', flex: 1 }}>{children}</div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CUSTOMER – Explore (Browse & Book Lockers)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SIZE_COLORS = {
  small:  { bg: 'linear-gradient(135deg, #14b8a6, #0891b2)', label: 'Small Locker' },
  medium: { bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', label: 'Medium Locker' },
  large:  { bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', label: 'Large Locker' },
};

function LockerCard({ locker, locationName, onBook }) {
  const { bg, label } = SIZE_COLORS[locker.size] || SIZE_COLORS.medium;
  return (
    <div className="locker-card">
      <div className="locker-card-banner" style={{ background: bg }}>
        <div className="locker-card-banner-icon">🔒</div>
        <div className="locker-card-code">{locker.locker_code}</div>
      </div>
      <div className="locker-card-body">
        <div className="locker-card-size">{label}</div>
        <div className="locker-card-location">
          <span>📍</span>
          {locationName || <span style={{ fontStyle:'italic', opacity:.6 }}>No location</span>}
        </div>
        <div className="locker-card-status">
          <div className="status-dot" />
          Available
        </div>
        <div style={{ fontSize:12, color:'#64748b', marginBottom:12 }}>
          From ${PRICE[locker.size]}/hr
        </div>
        <button className="btn-book-now" onClick={onBook}>Book Now</button>
      </div>
    </div>
  );
}

function CustomerExplorePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [lockers, setLockers]     = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [locationF, setLocationF] = useState('');
  const [sizeF, setSizeF]         = useState('');
  const [booking, setBooking]     = useState(null); // locker being booked
  const [bookForm, setBookForm]   = useState({});
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [l, loc] = await Promise.all([
          window.api.getLockers({ status: 'available' }),
          window.api.getLocations()
        ]);
        setLockers(l.data || []);
        setLocations(loc.data || []);
      } catch (e) { showToast(e.message, 'error'); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const locMap = Object.fromEntries(locations.map(l => [l.location_id, l.name]));

  const filtered = lockers.filter(l => {
    if (locationF && String(l.location_id) !== locationF) return false;
    if (sizeF && l.size !== sizeF) return false;
    return true;
  });

  async function handleBook() {
    if (!bookForm.start_time || !bookForm.end_time) { showToast('Please set start and end time', 'error'); return; }
    if (new Date(bookForm.end_time) <= new Date(bookForm.start_time)) { showToast('End time must be after start time', 'error'); return; }
    setSaving(true);
    try {
      const res = await window.api.createBooking({
        user_id:    user.user_id,
        locker_id:  booking.locker_id,
        start_time: bookForm.start_time,
        end_time:   bookForm.end_time,
      });
      // Create a pending payment automatically
      const cost = calcCost(booking.size, bookForm.start_time, bookForm.end_time);
      const bookingId = res.data?.booking_id || res.booking_id;
      if (bookingId) {
        await window.api.createPayment({
          user_id:    user.user_id,
          booking_id: bookingId,
          amount:     parseFloat(cost),
          method:     'card',
          status:     'pending',
        });
      }
      showToast('Locker booked! Check My Bookings.');
      setBooking(null);
      setBookForm({});
      // Refresh lockers
      const r = await window.api.getLockers({ status: 'available' });
      setLockers(r.data || []);
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  const cost = booking ? calcCost(booking.size, bookForm.start_time, bookForm.end_time) : 0;

  return (
    <div>
      {/* Hero */}
      <div className="explore-hero">
        <div className="explore-hero-inner">
          <h1>Find Your Perfect Locker</h1>
          <p>Secure, convenient lockers available near you</p>
          <div className="explore-filters">
            <select
              className="filter-select-styled"
              value={locationF}
              onChange={e => setLocationF(e.target.value)}
            >
              <option value="">📍 All Locations</option>
              {locations.map(l => <option key={l.location_id} value={l.location_id}>{l.name}{l.city ? `, ${l.city}` : ''}</option>)}
            </select>
            <div className="size-pills">
              {['', 'small', 'medium', 'large'].map(s => (
                <button key={s} className={'size-pill' + (sizeF === s ? ' active' : '')} onClick={() => setSizeF(s)}>
                  {s === '' ? 'All Sizes' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="customer-content">
        {loading ? <Spinner /> : filtered.length === 0 ? (
          <Empty icon="🔒" text="No available lockers match your filters" />
        ) : (
          <Fragment>
            <div style={{ marginBottom:16, color:'#64748b', fontSize:13 }}>
              {filtered.length} locker{filtered.length !== 1 ? 's' : ''} available
            </div>
            <div className="lockers-grid">
              {filtered.map(l => (
                <LockerCard
                  key={l.locker_id}
                  locker={l}
                  locationName={locMap[l.location_id]}
                  onBook={() => { setBooking(l); setBookForm({}); }}
                />
              ))}
            </div>
          </Fragment>
        )}
      </div>

      {/* Booking Modal */}
      <Modal
        open={!!booking}
        onClose={() => setBooking(null)}
        title="Book Locker"
        onSubmit={handleBook}
        submitLabel="Confirm Booking"
        saving={saving}
      >
        {booking && (
          <Fragment>
            <div className="booking-locker-info">
              <div className="booking-locker-icon" style={{ background: SIZE_COLORS[booking.size]?.bg || '#e2e8f0' }}>
                🔒
              </div>
              <div>
                <div className="booking-locker-name">{booking.locker_code}</div>
                <div className="booking-locker-sub">
                  {booking.size?.charAt(0).toUpperCase() + booking.size?.slice(1)} · {locMap[booking.location_id] || 'No location'} · ${PRICE[booking.size]}/hr
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Start Date & Time *</label>
              <input className="form-input" type="datetime-local"
                value={bookForm.start_time || ''}
                onChange={e => setBookForm(f => ({ ...f, start_time: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>End Date & Time *</label>
              <input className="form-input" type="datetime-local"
                value={bookForm.end_time || ''}
                onChange={e => setBookForm(f => ({ ...f, end_time: e.target.value }))} />
            </div>
            {bookForm.start_time && bookForm.end_time && (
              <div className="booking-cost-estimate">
                <div>
                  <div className="cost-label">Estimated Total</div>
                  <div style={{ fontSize:11, color:'#94a3b8', marginTop:1 }}>Payment due after booking</div>
                </div>
                <div className="cost-value">${cost}</div>
              </div>
            )}
          </Fragment>
        )}
      </Modal>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CUSTOMER – My Bookings
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function CustomerBookingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [statusF, setStatusF]   = useState('');

  async function load() {
    setLoading(true);
    try {
      const params = { user_id: user.user_id };
      if (statusF) params.status = statusF;
      const r = await window.api.getBookings(params);
      setBookings(r.data || []);
    } catch (e) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [statusF]);

  async function cancelBooking(b) {
    if (!confirm('Cancel this booking?')) return;
    try {
      await window.api.updateBooking(b.booking_id, { status: 'cancelled' });
      showToast('Booking cancelled');
      load();
    } catch (e) { showToast(e.message, 'error'); }
  }

  const STATUS_ICON = { active: '🔵', completed: '✅', cancelled: '❌' };

  return (
    <div className="customer-content">
      <div className="section-title">My Bookings</div>
      <div className="section-subtitle">Track and manage your locker reservations</div>

      <div className="toolbar">
        <select className="filter-select" value={statusF} onChange={e => setStatusF(e.target.value)}>
          <option value="">All Bookings</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button className="btn btn-secondary" onClick={load}>Refresh</button>
      </div>

      {loading ? <Spinner /> : bookings.length === 0 ? (
        <Empty icon="📅" text="No bookings yet — go explore and book a locker!" />
      ) : (
        <div className="bookings-list">
          {bookings.map(b => (
            <div key={b.booking_id} className="booking-item">
              <div className="booking-item-icon"
                style={{ background: b.status === 'active' ? '#dbeafe' : b.status === 'completed' ? '#dcfce7' : '#fee2e2' }}>
                {STATUS_ICON[b.status] || '📅'}
              </div>
              <div className="booking-item-body">
                <div className="booking-item-title">Locker #{b.locker_id}</div>
                <div className="booking-item-sub">Booking #{b.booking_id}</div>
                <div className="booking-item-dates">
                  {fmt(b.start_time)} → {fmt(b.end_time)}
                </div>
              </div>
              <div className="booking-item-actions">
                <Badge value={b.status} />
                {b.status === 'active' && (
                  <button className="btn btn-sm btn-danger-outline" onClick={() => cancelBooking(b)}>Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CUSTOMER – Payment
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const METHODS = [
  { key: 'card',   icon: '💳', label: 'Credit / Debit Card' },
  { key: 'cash',   icon: '💵', label: 'Cash on Site' },
  { key: 'wallet', icon: '📱', label: 'Digital Wallet' },
];

function CustomerPaymentPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [payments, setPayments]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [preferred, setPreferred] = useState('card');
  const [paying, setPaying]       = useState(null); // payment being paid

  async function load() {
    setLoading(true);
    try {
      const r = await window.api.getPayments({ user_id: user.user_id });
      setPayments(r.data || []);
    } catch (e) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function payNow(p) {
    try {
      await window.api.updatePayment(p.payment_id, { status: 'paid', method: preferred });
      showToast('Payment confirmed!');
      load();
    } catch (e) { showToast(e.message, 'error'); }
  }

  const pending = payments.filter(p => p.status === 'pending');
  const history = payments.filter(p => p.status !== 'pending');

  return (
    <div className="customer-content">
      {/* Payment Method */}
      <div className="payment-method-title">Preferred Payment Method</div>
      <div className="method-cards">
        {METHODS.map(m => (
          <div
            key={m.key}
            className={'method-card' + (preferred === m.key ? ' selected' : '')}
            onClick={() => setPreferred(m.key)}
          >
            <div className="method-card-icon">{m.icon}</div>
            <div className="method-card-label">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Pending payments */}
      {loading ? <Spinner /> : (
        <Fragment>
          {pending.length > 0 && (
            <Fragment>
              <div className="section-title" style={{ fontSize:15 }}>
                Pending Payments
                <span className="badge badge-warning" style={{ marginLeft:8, fontSize:11 }}>{pending.length}</span>
              </div>
              <div className="bookings-list" style={{ marginBottom:24 }}>
                {pending.map(p => (
                  <div key={p.payment_id} className="booking-item">
                    <div className="booking-item-icon" style={{ background:'#fef3c7' }}>💳</div>
                    <div className="booking-item-body">
                      <div className="booking-item-title">Booking #{p.booking_id}</div>
                      <div className="booking-item-sub">Payment #{p.payment_id}</div>
                      <div className="booking-item-dates">Due: ${Number(p.amount).toFixed(2)}</div>
                    </div>
                    <div className="booking-item-actions">
                      <Badge value="pending" />
                      <button className="btn btn-sm btn-success-outline" onClick={() => payNow(p)}>
                        Pay ${Number(p.amount).toFixed(2)}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Fragment>
          )}

          <hr className="section-divider" />
          <div className="section-title" style={{ fontSize:15 }}>Payment History</div>
          {history.length === 0 ? (
            <Empty icon="💳" text="No payment history yet" />
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>#</th><th>Booking</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {history.map(p => (
                    <tr key={p.payment_id}>
                      <td className="text-muted">{p.payment_id}</td>
                      <td>Booking #{p.booking_id}</td>
                      <td><strong>${Number(p.amount).toFixed(2)}</strong></td>
                      <td><Badge value={p.method} /></td>
                      <td><Badge value={p.status} /></td>
                      <td className="text-muted">{fmtDate(p.paid_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Fragment>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CUSTOMER – Notifications
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const NOTIF_ICON = { booking:'📅', access:'🔑', payment:'💳', maintenance:'🔧' };

function CustomerNotificationsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notifs, setNotifs]   = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await window.api.getNotifications({ user_id: user.user_id });
      setNotifs(r.data || []);
    } catch (e) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function markRead(n) {
    try {
      await window.api.updateNotification(n.notification_id, { is_read: 1 });
      setNotifs(prev => prev.map(x => x.notification_id === n.notification_id ? { ...x, is_read: 1 } : x));
    } catch (e) { showToast(e.message, 'error'); }
  }

  const unread = notifs.filter(n => !n.is_read).length;

  return (
    <div className="customer-content">
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
        <div className="section-title" style={{ marginBottom:0 }}>Notifications</div>
        {unread > 0 && <span className="badge badge-warning">{unread} unread</span>}
      </div>
      <div className="section-subtitle">Your alerts and updates</div>

      {loading ? <Spinner /> : notifs.length === 0 ? (
        <Empty icon="🔔" text="No notifications yet" />
      ) : (
        <div className="notif-list">
          {notifs.map(n => (
            <div
              key={n.notification_id}
              className={'notif-item' + (!n.is_read ? ' unread' : '')}
              onClick={() => !n.is_read && markRead(n)}
            >
              <div className="notif-item-icon">{NOTIF_ICON[n.type] || '🔔'}</div>
              <div className="notif-item-body">
                <div className="notif-item-message">{n.message}</div>
                <div className="notif-item-time">{fmt(n.sent_at)} · <Badge value={n.type} /></div>
              </div>
              {!n.is_read && <span className="badge badge-primary" style={{ fontSize:10 }}>NEW</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADMIN – Sidebar + Layout
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ADMIN_NAV = [
  { to:'/',              icon:'📊', label:'Dashboard',     exact:true },
  { to:'/users',         icon:'👥', label:'Users' },
  { to:'/lockers',       icon:'🔒', label:'Lockers' },
  { to:'/locations',     icon:'📍', label:'Locations' },
  { to:'/bookings',      icon:'📅', label:'Bookings' },
  { to:'/access-logs',   icon:'🔑', label:'Access Logs' },
  { to:'/payments',      icon:'💳', label:'Payments' },
  { to:'/maintenance',   icon:'🔧', label:'Maintenance' },
  { to:'/notifications', icon:'🔔', label:'Notifications' },
];

function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🔐</div>
        <div className="sidebar-logo-text">SmartSecure<small>Admin Panel</small></div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-label">Management</div>
        {ADMIN_NAV.map(n => (
          <NavLink key={n.to} to={n.to} exact={n.exact} className="nav-item">
            <span className="nav-icon">{n.icon}</span>{n.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user">
            <div className="sidebar-avatar">{(user.name||'A')[0].toUpperCase()}</div>
            <div><div className="sidebar-user-name">{user.name}</div><div className="sidebar-user-role">{user.role}</div></div>
          </div>
        )}
        <button className="btn-logout" onClick={() => { logout(); navigate('/login'); }}>⬅ Logout</button>
      </div>
    </aside>
  );
}

function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">{children}</main>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADMIN – Dashboard
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function AdminDashboard() {
  const [stats, setStats]   = useState({});
  const [logs, setLogs]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [users, lockers, bookings, payments, maint, accessLogs] = await Promise.all([
          window.api.getUsers(), window.api.getLockers(),
          window.api.getBookings({ status:'active' }),
          window.api.getPayments({ status:'pending' }),
          window.api.getMaintenance({ status:'open' }),
          window.api.getAccessLogs(),
        ]);
        const ll = lockers.data || [];
        setStats({
          users: users.count || 0, lockers: lockers.count || 0,
          available: ll.filter(l => l.status === 'available').length,
          booked: ll.filter(l => l.status === 'booked').length,
          maint: ll.filter(l => l.status === 'maintenance').length,
          activeBookings: bookings.count || 0,
          pendingPayments: payments.count || 0,
          openMaintenance: maint.count || 0,
        });
        setLogs((accessLogs.data || []).slice(0, 6));
      } catch {}
      finally { setLoading(false); }
    }
    load();
  }, []);

  const CARDS = [
    { icon:'👥', label:'Total Users',      value:stats.users,           sub:'Registered accounts',  bg:'rgba(37,99,235,.1)',   color:'#2563eb' },
    { icon:'🔒', label:'Total Lockers',    value:stats.lockers,         sub:'Across all locations', bg:'rgba(139,92,246,.1)', color:'#7c3aed', locker:true },
    { icon:'📅', label:'Active Bookings',  value:stats.activeBookings,  sub:'Currently active',     bg:'rgba(6,182,212,.1)',  color:'#0891b2' },
    { icon:'💳', label:'Pending Payments', value:stats.pendingPayments, sub:'Awaiting payment',     bg:'rgba(245,158,11,.1)', color:'#d97706' },
    { icon:'🔧', label:'Open Tickets',     value:stats.openMaintenance, sub:'Maintenance open',     bg:'rgba(239,68,68,.1)',  color:'#dc2626' },
  ];

  return (
    <Fragment>
      <div className="page-header">
        <div><h1 className="page-title">Dashboard</h1><p className="page-subtitle">System overview</p></div>
      </div>
      <div className="page-body">
        {loading ? <Spinner /> : (
          <Fragment>
            <div className="stats-grid">
              {CARDS.map((c, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-icon" style={{ background:c.bg, color:c.color }}>{c.icon}</div>
                  <div>
                    <div className="stat-label">{c.label}</div>
                    <div className="stat-value" style={{ color:c.color }}>{c.value ?? '—'}</div>
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
            <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>Recent Access Logs</div>
            <div className="table-wrap">
              {logs.length === 0 ? <Empty icon="🔑" text="No access logs yet" /> : (
                <table>
                  <thead><tr><th>#</th><th>User</th><th>Locker</th><th>Action</th><th>Time</th></tr></thead>
                  <tbody>
                    {logs.map(l => (
                      <tr key={l.log_id}>
                        <td className="text-muted">{l.log_id}</td>
                        <td>{l.user_id}</td><td>{l.locker_id}</td>
                        <td><Badge value={l.action} /></td>
                        <td className="text-muted">{fmt(l.accessed_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Fragment>
        )}
      </div>
    </Fragment>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADMIN – Reusable CRUD page factory
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Each admin page is standard: fetch, search/filter, table, modal CRUD.

function AdminUsersPage() {
  const { showToast } = useToast();
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState({});
  const [saving, setSaving] = useState(false);
  const F = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function load() {
    setLoading(true); setError('');
    try { const r = await window.api.getUsers(); setItems(r.data || []); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    try {
      if (modal.mode === 'add') { await window.api.createUser(form); showToast('User created'); }
      else { await window.api.updateUser(modal.id, form); showToast('User updated'); }
      setModal(null); load();
    } catch (e) { showToast(e.message, 'error'); } finally { setSaving(false); }
  }
  async function del(u) {
    if (!confirm(`Delete user "${u.name}"?`)) return;
    try { await window.api.deleteUser(u.user_id); showToast('Deleted'); load(); }
    catch (e) { showToast(e.message, 'error'); }
  }

  const rows = items.filter(u => !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <Fragment>
      <div className="page-header">
        <div><h1 className="page-title">Users</h1><p className="page-subtitle">Manage accounts</p></div>
        <button className="btn btn-primary" onClick={() => { setForm({ role:'customer' }); setModal({ mode:'add' }); }}>＋ Add User</button>
      </div>
      <div className="page-body">
        {error && <div className="error-banner">{error}</div>}
        <div className="toolbar">
          <div className="search-wrap"><span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-secondary" onClick={load}>Refresh</button>
        </div>
        <div className="table-wrap">
          {loading ? <Spinner /> : rows.length === 0 ? <Empty icon="👥" /> : (
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Created</th><th>Actions</th></tr></thead>
              <tbody>{rows.map(u => (
                <tr key={u.user_id}>
                  <td className="text-muted">{u.user_id}</td>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td className="text-muted">{u.phone || '—'}</td>
                  <td><Badge value={u.role} /></td>
                  <td className="text-muted">{fmtDate(u.created_at)}</td>
                  <td><div className="table-actions">
                    <button className="btn btn-sm btn-warning-outline" onClick={() => { setForm({ name:u.name, email:u.email, phone:u.phone||'', role:u.role }); setModal({ mode:'edit', id:u.user_id }); }}>Edit</button>
                    <button className="btn btn-sm btn-danger-outline" onClick={() => del(u)}>Delete</button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'add' ? 'Add User' : 'Edit User'} onSubmit={save} saving={saving}>
        <div className="form-row">
          <div className="form-group"><label>Name *</label><input className="form-input" value={form.name||''} onChange={F('name')} /></div>
          <div className="form-group"><label>Phone</label><input className="form-input" value={form.phone||''} onChange={F('phone')} placeholder="01012345678" /></div>
        </div>
        <div className="form-group"><label>Email *</label><input className="form-input" type="email" value={form.email||''} onChange={F('email')} /></div>
        {modal?.mode === 'add' && <div className="form-group"><label>Password *</label><input className="form-input" type="password" value={form.password||''} onChange={F('password')} /></div>}
        <div className="form-group"><label>Role</label>
          <select className="form-select" value={form.role||'customer'} onChange={F('role')}>
            <option value="customer">Customer</option><option value="admin">Admin</option><option value="technician">Technician</option>
          </select>
        </div>
      </Modal>
    </Fragment>
  );
}

function AdminLockersPage() {
  const { showToast } = useToast();
  const [items, setItems]       = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [statusF, setStatusF]   = useState('');
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState({});
  const [saving, setSaving]     = useState(false);
  const F = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function load() {
    setLoading(true); setError('');
    try {
      const params = {}; if (statusF) params.status = statusF;
      const [r, loc] = await Promise.all([window.api.getLockers(params), window.api.getLocations()]);
      setItems(r.data || []); setLocations(loc.data || []);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [statusF]);

  async function save() {
    setSaving(true);
    try {
      const p = { ...form }; if (!p.location_id) delete p.location_id;
      if (modal.mode === 'add') { await window.api.createLocker(p); showToast('Locker created'); }
      else { await window.api.updateLocker(modal.id, p); showToast('Updated'); }
      setModal(null); load();
    } catch (e) { showToast(e.message, 'error'); } finally { setSaving(false); }
  }
  async function del(l) {
    if (!confirm(`Delete locker "${l.locker_code}"?`)) return;
    try { await window.api.deleteLocker(l.locker_id); showToast('Deleted'); load(); }
    catch (e) { showToast(e.message, 'error'); }
  }
  const locMap = Object.fromEntries(locations.map(l => [l.location_id, l.name]));
  const rows = items.filter(l => !search || l.locker_code?.toLowerCase().includes(search.toLowerCase()));

  return (
    <Fragment>
      <div className="page-header">
        <div><h1 className="page-title">Lockers</h1><p className="page-subtitle">Inventory management</p></div>
        <button className="btn btn-primary" onClick={() => { setForm({ size:'medium', status:'available' }); setModal({ mode:'add' }); }}>＋ Add Locker</button>
      </div>
      <div className="page-body">
        {error && <div className="error-banner">{error}</div>}
        <div className="toolbar">
          <div className="search-wrap"><span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search code…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={statusF} onChange={e => setStatusF(e.target.value)}>
            <option value="">All</option><option value="available">Available</option>
            <option value="booked">Booked</option><option value="maintenance">Maintenance</option>
          </select>
          <button className="btn btn-secondary" onClick={load}>Refresh</button>
        </div>
        <div className="table-wrap">
          {loading ? <Spinner /> : rows.length === 0 ? <Empty icon="🔒" /> : (
            <table>
              <thead><tr><th>ID</th><th>Code</th><th>Size</th><th>Status</th><th>Location</th><th>Actions</th></tr></thead>
              <tbody>{rows.map(l => (
                <tr key={l.locker_id}>
                  <td className="text-muted">{l.locker_id}</td>
                  <td><strong>{l.locker_code}</strong></td>
                  <td><Badge value={l.size} /></td>
                  <td><Badge value={l.status} /></td>
                  <td>{locMap[l.location_id] || <span className="text-muted">—</span>}</td>
                  <td><div className="table-actions">
                    <button className="btn btn-sm btn-warning-outline" onClick={() => { setForm({ locker_code:l.locker_code, size:l.size, status:l.status, location_id:l.location_id||'' }); setModal({ mode:'edit', id:l.locker_id }); }}>Edit</button>
                    <button className="btn btn-sm btn-danger-outline" onClick={() => del(l)}>Delete</button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'add' ? 'Add Locker' : 'Edit Locker'} onSubmit={save} saving={saving}>
        <div className="form-group"><label>Code *</label><input className="form-input" value={form.locker_code||''} onChange={F('locker_code')} placeholder="LK-001" /></div>
        <div className="form-row">
          <div className="form-group"><label>Size *</label>
            <select className="form-select" value={form.size||'medium'} onChange={F('size')}>
              <option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option>
            </select>
          </div>
          <div className="form-group"><label>Status</label>
            <select className="form-select" value={form.status||'available'} onChange={F('status')}>
              <option value="available">Available</option><option value="booked">Booked</option><option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
        <div className="form-group"><label>Location</label>
          <select className="form-select" value={form.location_id||''} onChange={F('location_id')}>
            <option value="">— None —</option>
            {locations.map(l => <option key={l.location_id} value={l.location_id}>{l.name}</option>)}
          </select>
        </div>
      </Modal>
    </Fragment>
  );
}

function AdminLocationsPage() {
  const { showToast } = useToast();
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState({});
  const [saving, setSaving] = useState(false);
  const F = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function load() {
    setLoading(true); setError('');
    try { const r = await window.api.getLocations(); setItems(r.data || []); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    try {
      if (modal.mode === 'add') { await window.api.createLocation(form); showToast('Location added'); }
      else { await window.api.updateLocation(modal.id, form); showToast('Updated'); }
      setModal(null); load();
    } catch (e) { showToast(e.message, 'error'); } finally { setSaving(false); }
  }
  async function del(l) {
    if (!confirm(`Delete "${l.name}"?`)) return;
    try { await window.api.deleteLocation(l.location_id); showToast('Deleted'); load(); }
    catch (e) { showToast(e.message, 'error'); }
  }
  const rows = items.filter(l => !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.city?.toLowerCase().includes(search.toLowerCase()));

  return (
    <Fragment>
      <div className="page-header">
        <div><h1 className="page-title">Locations</h1><p className="page-subtitle">Where lockers are installed</p></div>
        <button className="btn btn-primary" onClick={() => { setForm({}); setModal({ mode:'add' }); }}>＋ Add Location</button>
      </div>
      <div className="page-body">
        {error && <div className="error-banner">{error}</div>}
        <div className="toolbar">
          <div className="search-wrap"><span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-secondary" onClick={load}>Refresh</button>
        </div>
        <div className="table-wrap">
          {loading ? <Spinner /> : rows.length === 0 ? <Empty icon="📍" /> : (
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Address</th><th>City</th><th>Country</th><th>Actions</th></tr></thead>
              <tbody>{rows.map(l => (
                <tr key={l.location_id}>
                  <td className="text-muted">{l.location_id}</td>
                  <td><strong>{l.name}</strong></td>
                  <td>{l.address}</td><td>{l.city||'—'}</td><td>{l.country||'—'}</td>
                  <td><div className="table-actions">
                    <button className="btn btn-sm btn-warning-outline" onClick={() => { setForm({ name:l.name, address:l.address, city:l.city||'', country:l.country||'' }); setModal({ mode:'edit', id:l.location_id }); }}>Edit</button>
                    <button className="btn btn-sm btn-danger-outline" onClick={() => del(l)}>Delete</button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'add' ? 'Add Location' : 'Edit Location'} onSubmit={save} saving={saving}>
        <div className="form-group"><label>Name *</label><input className="form-input" value={form.name||''} onChange={F('name')} /></div>
        <div className="form-group"><label>Address *</label><input className="form-input" value={form.address||''} onChange={F('address')} /></div>
        <div className="form-row">
          <div className="form-group"><label>City</label><input className="form-input" value={form.city||''} onChange={F('city')} /></div>
          <div className="form-group"><label>Country</label><input className="form-input" value={form.country||''} onChange={F('country')} /></div>
        </div>
      </Modal>
    </Fragment>
  );
}

function AdminBookingsPage() {
  const { showToast } = useToast();
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [statusF, setStatusF] = useState('');
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState({});
  const [saving, setSaving] = useState(false);
  const F = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const toDT = dt => dt ? new Date(dt).toISOString().slice(0,16) : '';

  async function load() {
    setLoading(true); setError('');
    try { const p = {}; if (statusF) p.status = statusF; const r = await window.api.getBookings(p); setItems(r.data || []); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [statusF]);

  async function save() {
    setSaving(true);
    try {
      if (modal.mode === 'add') { await window.api.createBooking(form); showToast('Booking created'); }
      else { await window.api.updateBooking(modal.id, { status:form.status, start_time:form.start_time, end_time:form.end_time }); showToast('Updated'); }
      setModal(null); load();
    } catch (e) { showToast(e.message, 'error'); } finally { setSaving(false); }
  }
  async function del(b) {
    if (!confirm(`Delete booking #${b.booking_id}?`)) return;
    try { await window.api.deleteBooking(b.booking_id); showToast('Deleted'); load(); }
    catch (e) { showToast(e.message, 'error'); }
  }

  return (
    <Fragment>
      <div className="page-header">
        <div><h1 className="page-title">Bookings</h1><p className="page-subtitle">All reservations</p></div>
        <button className="btn btn-primary" onClick={() => { setForm({ status:'active' }); setModal({ mode:'add' }); }}>＋ Add</button>
      </div>
      <div className="page-body">
        {error && <div className="error-banner">{error}</div>}
        <div className="toolbar">
          <select className="filter-select" value={statusF} onChange={e => setStatusF(e.target.value)}>
            <option value="">All</option><option value="active">Active</option>
            <option value="completed">Completed</option><option value="cancelled">Cancelled</option>
          </select>
          <button className="btn btn-secondary" onClick={load}>Refresh</button>
        </div>
        <div className="table-wrap">
          {loading ? <Spinner /> : items.length === 0 ? <Empty icon="📅" /> : (
            <table>
              <thead><tr><th>ID</th><th>User</th><th>Locker</th><th>Start</th><th>End</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{items.map(b => (
                <tr key={b.booking_id}>
                  <td className="text-muted">{b.booking_id}</td>
                  <td>{b.user_id}</td><td>{b.locker_id}</td>
                  <td className="text-muted">{fmt(b.start_time)}</td>
                  <td className="text-muted">{fmt(b.end_time)}</td>
                  <td><Badge value={b.status} /></td>
                  <td><div className="table-actions">
                    <button className="btn btn-sm btn-warning-outline" onClick={() => { setForm({ start_time:toDT(b.start_time), end_time:toDT(b.end_time), status:b.status }); setModal({ mode:'edit', id:b.booking_id }); }}>Edit</button>
                    <button className="btn btn-sm btn-danger-outline" onClick={() => del(b)}>Delete</button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'add' ? 'Add Booking' : 'Edit Booking'} onSubmit={save} saving={saving}>
        {modal?.mode === 'add' && <div className="form-row">
          <div className="form-group"><label>User ID *</label><input className="form-input" type="number" value={form.user_id||''} onChange={F('user_id')} /></div>
          <div className="form-group"><label>Locker ID *</label><input className="form-input" type="number" value={form.locker_id||''} onChange={F('locker_id')} /></div>
        </div>}
        <div className="form-group"><label>Start *</label><input className="form-input" type="datetime-local" value={form.start_time||''} onChange={F('start_time')} /></div>
        <div className="form-group"><label>End *</label><input className="form-input" type="datetime-local" value={form.end_time||''} onChange={F('end_time')} /></div>
        <div className="form-group"><label>Status</label>
          <select className="form-select" value={form.status||'active'} onChange={F('status')}>
            <option value="active">Active</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
          </select>
        </div>
      </Modal>
    </Fragment>
  );
}

function AdminAccessLogsPage() {
  const { showToast } = useToast();
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [actionF, setActionF] = useState('');
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState({});
  const [saving, setSaving] = useState(false);
  const F = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function load() {
    setLoading(true); setError('');
    try { const p = {}; if (actionF) p.action = actionF; const r = await window.api.getAccessLogs(p); setItems(r.data || []); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [actionF]);

  async function save() {
    setSaving(true);
    try { await window.api.createAccessLog(form); showToast('Log created'); setModal(false); load(); }
    catch (e) { showToast(e.message, 'error'); } finally { setSaving(false); }
  }
  async function del(l) {
    if (!confirm(`Delete log #${l.log_id}?`)) return;
    try { await window.api.deleteAccessLog(l.log_id); showToast('Deleted'); load(); }
    catch (e) { showToast(e.message, 'error'); }
  }

  return (
    <Fragment>
      <div className="page-header">
        <div><h1 className="page-title">Access Logs</h1><p className="page-subtitle">All locker access events</p></div>
        <button className="btn btn-primary" onClick={() => { setForm({ action:'opened' }); setModal(true); }}>＋ Add Log</button>
      </div>
      <div className="page-body">
        {error && <div className="error-banner">{error}</div>}
        <div className="toolbar">
          <select className="filter-select" value={actionF} onChange={e => setActionF(e.target.value)}>
            <option value="">All</option><option value="opened">Opened</option>
            <option value="closed">Closed</option><option value="denied">Denied</option>
          </select>
          <button className="btn btn-secondary" onClick={load}>Refresh</button>
        </div>
        <div className="table-wrap">
          {loading ? <Spinner /> : items.length === 0 ? <Empty icon="🔑" /> : (
            <table>
              <thead><tr><th>ID</th><th>User</th><th>Locker</th><th>Action</th><th>Time</th><th>Actions</th></tr></thead>
              <tbody>{items.map(l => (
                <tr key={l.log_id}>
                  <td className="text-muted">{l.log_id}</td>
                  <td>{l.user_id}</td><td>{l.locker_id}</td>
                  <td><Badge value={l.action} /></td>
                  <td className="text-muted">{fmt(l.accessed_at)}</td>
                  <td><button className="btn btn-sm btn-danger-outline" onClick={() => del(l)}>Delete</button></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Add Access Log" onSubmit={save} saving={saving}>
        <div className="form-row">
          <div className="form-group"><label>User ID *</label><input className="form-input" type="number" value={form.user_id||''} onChange={F('user_id')} /></div>
          <div className="form-group"><label>Locker ID *</label><input className="form-input" type="number" value={form.locker_id||''} onChange={F('locker_id')} /></div>
        </div>
        <div className="form-group"><label>Action *</label>
          <select className="form-select" value={form.action||'opened'} onChange={F('action')}>
            <option value="opened">Opened</option><option value="closed">Closed</option><option value="denied">Denied</option>
          </select>
        </div>
      </Modal>
    </Fragment>
  );
}

function AdminPaymentsPage() {
  const { showToast } = useToast();
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [statusF, setStatusF] = useState('');
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState({});
  const [saving, setSaving] = useState(false);
  const F = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function load() {
    setLoading(true); setError('');
    try { const p = {}; if (statusF) p.status = statusF; const r = await window.api.getPayments(p); setItems(r.data || []); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [statusF]);

  async function save() {
    setSaving(true);
    try {
      if (modal.mode === 'add') { await window.api.createPayment({ ...form, amount:Number(form.amount) }); showToast('Created'); }
      else { await window.api.updatePayment(modal.id, { status:form.status, method:form.method, amount:Number(form.amount) }); showToast('Updated'); }
      setModal(null); load();
    } catch (e) { showToast(e.message, 'error'); } finally { setSaving(false); }
  }
  async function del(p) {
    if (!confirm(`Delete payment #${p.payment_id}?`)) return;
    try { await window.api.deletePayment(p.payment_id); showToast('Deleted'); load(); }
    catch (e) { showToast(e.message, 'error'); }
  }

  return (
    <Fragment>
      <div className="page-header">
        <div><h1 className="page-title">Payments</h1><p className="page-subtitle">All transactions</p></div>
        <button className="btn btn-primary" onClick={() => { setForm({ method:'card', status:'pending' }); setModal({ mode:'add' }); }}>＋ Add</button>
      </div>
      <div className="page-body">
        {error && <div className="error-banner">{error}</div>}
        <div className="toolbar">
          <select className="filter-select" value={statusF} onChange={e => setStatusF(e.target.value)}>
            <option value="">All</option><option value="pending">Pending</option>
            <option value="paid">Paid</option><option value="refunded">Refunded</option>
          </select>
          <button className="btn btn-secondary" onClick={load}>Refresh</button>
        </div>
        <div className="table-wrap">
          {loading ? <Spinner /> : items.length === 0 ? <Empty icon="💳" /> : (
            <table>
              <thead><tr><th>ID</th><th>User</th><th>Booking</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>{items.map(p => (
                <tr key={p.payment_id}>
                  <td className="text-muted">{p.payment_id}</td>
                  <td>{p.user_id}</td><td>{p.booking_id}</td>
                  <td><strong>${Number(p.amount).toFixed(2)}</strong></td>
                  <td><Badge value={p.method} /></td>
                  <td><Badge value={p.status} /></td>
                  <td className="text-muted">{fmtDate(p.paid_at)}</td>
                  <td><div className="table-actions">
                    <button className="btn btn-sm btn-warning-outline" onClick={() => { setForm({ status:p.status, method:p.method, amount:p.amount }); setModal({ mode:'edit', id:p.payment_id }); }}>Edit</button>
                    <button className="btn btn-sm btn-danger-outline" onClick={() => del(p)}>Delete</button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'add' ? 'Add Payment' : 'Edit Payment'} onSubmit={save} saving={saving}>
        {modal?.mode === 'add' && <div className="form-row">
          <div className="form-group"><label>User ID *</label><input className="form-input" type="number" value={form.user_id||''} onChange={F('user_id')} /></div>
          <div className="form-group"><label>Booking ID *</label><input className="form-input" type="number" value={form.booking_id||''} onChange={F('booking_id')} /></div>
        </div>}
        <div className="form-row">
          <div className="form-group"><label>Amount *</label><input className="form-input" type="number" step="0.01" value={form.amount||''} onChange={F('amount')} /></div>
          <div className="form-group"><label>Method</label>
            <select className="form-select" value={form.method||'card'} onChange={F('method')}>
              <option value="card">Card</option><option value="cash">Cash</option><option value="wallet">Wallet</option>
            </select>
          </div>
        </div>
        <div className="form-group"><label>Status</label>
          <select className="form-select" value={form.status||'pending'} onChange={F('status')}>
            <option value="pending">Pending</option><option value="paid">Paid</option><option value="refunded">Refunded</option>
          </select>
        </div>
      </Modal>
    </Fragment>
  );
}

function AdminMaintenancePage() {
  const { showToast } = useToast();
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [statusF, setStatusF] = useState('');
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState({});
  const [saving, setSaving] = useState(false);
  const F = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function load() {
    setLoading(true); setError('');
    try { const p = {}; if (statusF) p.status = statusF; const r = await window.api.getMaintenance(p); setItems(r.data || []); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [statusF]);

  async function save() {
    setSaving(true);
    try {
      if (modal.mode === 'add') { await window.api.createMaintenance(form); showToast('Ticket created'); }
      else {
        const p = { status:form.status, description:form.description };
        if (form.resolved_at) p.resolved_at = form.resolved_at;
        await window.api.updateMaintenance(modal.id, p); showToast('Updated');
      }
      setModal(null); load();
    } catch (e) { showToast(e.message, 'error'); } finally { setSaving(false); }
  }
  async function del(m) {
    if (!confirm(`Delete ticket #${m.maintenance_id}?`)) return;
    try { await window.api.deleteMaintenance(m.maintenance_id); showToast('Deleted'); load(); }
    catch (e) { showToast(e.message, 'error'); }
  }

  return (
    <Fragment>
      <div className="page-header">
        <div><h1 className="page-title">Maintenance</h1><p className="page-subtitle">Locker repair tickets</p></div>
        <button className="btn btn-primary" onClick={() => { setForm({ status:'open' }); setModal({ mode:'add' }); }}>＋ New Ticket</button>
      </div>
      <div className="page-body">
        {error && <div className="error-banner">{error}</div>}
        <div className="toolbar">
          <select className="filter-select" value={statusF} onChange={e => setStatusF(e.target.value)}>
            <option value="">All</option><option value="open">Open</option>
            <option value="in_progress">In Progress</option><option value="resolved">Resolved</option>
          </select>
          <button className="btn btn-secondary" onClick={load}>Refresh</button>
        </div>
        <div className="table-wrap">
          {loading ? <Spinner /> : items.length === 0 ? <Empty icon="🔧" /> : (
            <table>
              <thead><tr><th>ID</th><th>Locker</th><th>Description</th><th>Status</th><th>Reported</th><th>Actions</th></tr></thead>
              <tbody>{items.map(m => (
                <tr key={m.maintenance_id}>
                  <td className="text-muted">{m.maintenance_id}</td>
                  <td>{m.locker_id}</td>
                  <td style={{ maxWidth:200 }}>{m.description}</td>
                  <td><Badge value={m.status} /></td>
                  <td className="text-muted">{fmtDate(m.reported_at)}</td>
                  <td><div className="table-actions">
                    <button className="btn btn-sm btn-warning-outline" onClick={() => { setForm({ description:m.description, status:m.status, resolved_at:m.resolved_at?m.resolved_at.slice(0,16):'' }); setModal({ mode:'edit', id:m.maintenance_id }); }}>Edit</button>
                    <button className="btn btn-sm btn-danger-outline" onClick={() => del(m)}>Delete</button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'add' ? 'New Ticket' : 'Edit Ticket'} onSubmit={save} saving={saving}>
        {modal?.mode === 'add' && <div className="form-row">
          <div className="form-group"><label>Locker ID *</label><input className="form-input" type="number" value={form.locker_id||''} onChange={F('locker_id')} /></div>
          <div className="form-group"><label>Reported By</label><input className="form-input" type="number" value={form.reported_by||''} onChange={F('reported_by')} /></div>
        </div>}
        <div className="form-group"><label>Description *</label><textarea className="form-textarea" value={form.description||''} onChange={F('description')} /></div>
        <div className="form-row">
          <div className="form-group"><label>Status</label>
            <select className="form-select" value={form.status||'open'} onChange={F('status')}>
              <option value="open">Open</option><option value="in_progress">In Progress</option><option value="resolved">Resolved</option>
            </select>
          </div>
          {modal?.mode === 'edit' && <div className="form-group"><label>Resolved At</label><input className="form-input" type="datetime-local" value={form.resolved_at||''} onChange={F('resolved_at')} /></div>}
        </div>
      </Modal>
    </Fragment>
  );
}

function AdminNotificationsPage() {
  const { showToast } = useToast();
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [typeF, setTypeF]   = useState('');
  const [readF, setReadF]   = useState('');
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState({});
  const [saving, setSaving] = useState(false);
  const F = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function load() {
    setLoading(true); setError('');
    try {
      const p = {}; if (typeF) p.type = typeF; if (readF !== '') p.is_read = readF;
      const r = await window.api.getNotifications(p); setItems(r.data || []);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [typeF, readF]);

  async function save() {
    setSaving(true);
    try {
      if (modal.mode === 'add') { await window.api.createNotification(form); showToast('Created'); }
      else { await window.api.updateNotification(modal.id, { type:form.type, message:form.message, is_read:Number(form.is_read) }); showToast('Updated'); }
      setModal(null); load();
    } catch (e) { showToast(e.message, 'error'); } finally { setSaving(false); }
  }
  async function del(n) {
    if (!confirm(`Delete?`)) return;
    try { await window.api.deleteNotification(n.notification_id); showToast('Deleted'); load(); }
    catch (e) { showToast(e.message, 'error'); }
  }

  return (
    <Fragment>
      <div className="page-header">
        <div><h1 className="page-title">Notifications</h1><p className="page-subtitle">All user alerts</p></div>
        <button className="btn btn-primary" onClick={() => { setForm({ type:'booking', is_read:0 }); setModal({ mode:'add' }); }}>＋ Add</button>
      </div>
      <div className="page-body">
        {error && <div className="error-banner">{error}</div>}
        <div className="toolbar">
          <select className="filter-select" value={typeF} onChange={e => setTypeF(e.target.value)}>
            <option value="">All Types</option><option value="booking">Booking</option>
            <option value="access">Access</option><option value="payment">Payment</option><option value="maintenance">Maintenance</option>
          </select>
          <select className="filter-select" value={readF} onChange={e => setReadF(e.target.value)}>
            <option value="">All</option><option value="0">Unread</option><option value="1">Read</option>
          </select>
          <button className="btn btn-secondary" onClick={load}>Refresh</button>
        </div>
        <div className="table-wrap">
          {loading ? <Spinner /> : items.length === 0 ? <Empty icon="🔔" /> : (
            <table>
              <thead><tr><th>ID</th><th>User</th><th>Type</th><th>Message</th><th>Read</th><th>Sent</th><th>Actions</th></tr></thead>
              <tbody>{items.map(n => (
                <tr key={n.notification_id}>
                  <td className="text-muted">{n.notification_id}</td>
                  <td>{n.user_id}</td><td><Badge value={n.type} /></td>
                  <td style={{ maxWidth:200 }}>{n.message}</td>
                  <td>{n.is_read ? <span className="badge badge-success">Read</span> : <span className="badge badge-warning">Unread</span>}</td>
                  <td className="text-muted">{fmt(n.sent_at)}</td>
                  <td><div className="table-actions">
                    <button className="btn btn-sm btn-warning-outline" onClick={() => { setForm({ type:n.type, message:n.message, is_read:n.is_read }); setModal({ mode:'edit', id:n.notification_id }); }}>Edit</button>
                    <button className="btn btn-sm btn-danger-outline" onClick={() => del(n)}>Delete</button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'add' ? 'Add Notification' : 'Edit Notification'} onSubmit={save} saving={saving}>
        {modal?.mode === 'add' && <div className="form-group"><label>User ID *</label><input className="form-input" type="number" value={form.user_id||''} onChange={F('user_id')} /></div>}
        <div className="form-group"><label>Type *</label>
          <select className="form-select" value={form.type||'booking'} onChange={F('type')}>
            <option value="booking">Booking</option><option value="access">Access</option>
            <option value="payment">Payment</option><option value="maintenance">Maintenance</option>
          </select>
        </div>
        <div className="form-group"><label>Message *</label><textarea className="form-textarea" value={form.message||''} onChange={F('message')} /></div>
        <div className="form-group"><label>Status</label>
          <select className="form-select" value={form.is_read} onChange={e => setForm(f => ({ ...f, is_read:Number(e.target.value) }))}>
            <option value={0}>Unread</option><option value={1}>Read</option>
          </select>
        </div>
      </Modal>
    </Fragment>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// App Root – Role-based routing
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ss_user')); } catch { return null; }
  });
  const [toasts, setToasts] = useState([]);

  function login(u)   { setUser(u); localStorage.setItem('ss_user', JSON.stringify(u)); }
  function logout()   { setUser(null); localStorage.removeItem('ss_user'); }
  function showToast(msg, type = 'success') {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }

  const path = usePath();
  const navigate = useNavigate();

  // Redirect logged-in users away from auth pages
  useEffect(() => {
    if (user && (path === '/login' || path === '/signup')) navigate('/');
  }, [path, user]);

  // Public routes
  if (!user) {
    if (path === '/signup') return (
      <AuthCtx.Provider value={{ user, login, logout }}>
        <ToastCtx.Provider value={{ showToast }}>
          <SignUpPage />
          <div className="toast-container">{toasts.map(t => <Toast key={t.id} message={t.msg} type={t.type} />)}</div>
        </ToastCtx.Provider>
      </AuthCtx.Provider>
    );
    return (
      <AuthCtx.Provider value={{ user, login, logout }}>
        <ToastCtx.Provider value={{ showToast }}>
          <LoginPage />
          <div className="toast-container">{toasts.map(t => <Toast key={t.id} message={t.msg} type={t.type} />)}</div>
        </ToastCtx.Provider>
      </AuthCtx.Provider>
    );
  }

  const isAdmin = user.role === 'admin' || user.role === 'technician';

  // Admin routing
  const ADMIN_PAGES = {
    '/': AdminDashboard,
    '/users': AdminUsersPage,
    '/lockers': AdminLockersPage,
    '/locations': AdminLocationsPage,
    '/bookings': AdminBookingsPage,
    '/access-logs': AdminAccessLogsPage,
    '/payments': AdminPaymentsPage,
    '/maintenance': AdminMaintenancePage,
    '/notifications': AdminNotificationsPage,
  };

  // Customer routing
  const CUSTOMER_PAGES = {
    '/': CustomerExplorePage,
    '/my-bookings': CustomerBookingsPage,
    '/payment': CustomerPaymentPage,
    '/notifications': CustomerNotificationsPage,
  };

  const PageMap = isAdmin ? ADMIN_PAGES : CUSTOMER_PAGES;
  const Page = PageMap[path] || (isAdmin ? AdminDashboard : CustomerExplorePage);
  const LayoutComp = isAdmin ? AdminLayout : CustomerLayout;

  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      <ToastCtx.Provider value={{ showToast }}>
        <LayoutComp><Page /></LayoutComp>
        <div className="toast-container">{toasts.map(t => <Toast key={t.id} message={t.msg} type={t.type} />)}</div>
      </ToastCtx.Provider>
    </AuthCtx.Provider>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Mount
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Root() {
  return <HashRouter><App /></HashRouter>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
