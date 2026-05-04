// ── SmartSecure API Client ──────────────────────
// Plain JS (no build step). Sets window.api used by React app.

(function () {
  const BASE = '/api';

  async function req(path, opts = {}) {
    const { body, method = body ? 'POST' : 'GET', ...rest } = opts;
    const res = await fetch(BASE + path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...rest
    });
    const data = await res.json();
    if (!res.ok) {
      const msg =
        data.message ||
        (Array.isArray(data.errors) ? data.errors.join(', ') : null) ||
        'Request failed';
      throw new Error(msg);
    }
    return data;
  }

  window.api = {
    // Auth
    login: (email, password) =>
      req('/auth/login', { method: 'POST', body: { email, password } }),

    // Users
    getUsers:   (p = {}) => req('/users?' + new URLSearchParams(p)),
    createUser: (d)      => req('/users', { body: d }),
    updateUser: (id, d)  => req('/users/' + id, { method: 'PUT', body: d }),
    deleteUser: (id)     => req('/users/' + id, { method: 'DELETE' }),

    // Lockers
    getLockers:   (p = {}) => req('/lockers?' + new URLSearchParams(p)),
    createLocker: (d)      => req('/lockers', { body: d }),
    updateLocker: (id, d)  => req('/lockers/' + id, { method: 'PUT', body: d }),
    deleteLocker: (id)     => req('/lockers/' + id, { method: 'DELETE' }),

    // Locations
    getLocations:   (p = {}) => req('/locations?' + new URLSearchParams(p)),
    createLocation: (d)      => req('/locations', { body: d }),
    updateLocation: (id, d)  => req('/locations/' + id, { method: 'PUT', body: d }),
    deleteLocation: (id)     => req('/locations/' + id, { method: 'DELETE' }),

    // Bookings
    getBookings:   (p = {}) => req('/bookings?' + new URLSearchParams(p)),
    createBooking: (d)      => req('/bookings', { body: d }),
    updateBooking: (id, d)  => req('/bookings/' + id, { method: 'PUT', body: d }),
    deleteBooking: (id)     => req('/bookings/' + id, { method: 'DELETE' }),

    // Access Logs
    getAccessLogs:   (p = {}) => req('/access-logs?' + new URLSearchParams(p)),
    createAccessLog: (d)      => req('/access-logs', { body: d }),
    deleteAccessLog: (id)     => req('/access-logs/' + id, { method: 'DELETE' }),

    // Payments
    getPayments:   (p = {}) => req('/payments?' + new URLSearchParams(p)),
    createPayment: (d)      => req('/payments', { body: d }),
    updatePayment: (id, d)  => req('/payments/' + id, { method: 'PUT', body: d }),
    deletePayment: (id)     => req('/payments/' + id, { method: 'DELETE' }),

    // Maintenance
    getMaintenance:   (p = {}) => req('/maintenance?' + new URLSearchParams(p)),
    createMaintenance:(d)      => req('/maintenance', { body: d }),
    updateMaintenance:(id, d)  => req('/maintenance/' + id, { method: 'PUT', body: d }),
    deleteMaintenance:(id)     => req('/maintenance/' + id, { method: 'DELETE' }),

    // Notifications
    getNotifications:   (p = {}) => req('/notifications?' + new URLSearchParams(p)),
    createNotification: (d)      => req('/notifications', { body: d }),
    updateNotification: (id, d)  => req('/notifications/' + id, { method: 'PUT', body: d }),
    deleteNotification: (id)     => req('/notifications/' + id, { method: 'DELETE' })
  };
})();
