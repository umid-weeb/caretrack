(function () {
  // Loads socket.io client if not already present, then connects with auth token.
  function ensureIo(cb) {
    if (window.io) return cb(null, window.io);
    const s = document.createElement('script');
    s.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
    s.onload = () => cb(null, window.io);
    s.onerror = (e) => cb(new Error('Failed to load socket.io client'));
    document.head.appendChild(s);
  }

  function connect() {
    try {
      const token = (typeof getAuthToken === 'function') ? getAuthToken() : null;
      if (!token) return;
      ensureIo((err, ioLib) => {
        if (err) return console.warn(err);
        const socket = ioLib({ auth: { token } });
        socket.on('connect', () => console.log('Socket connected'));
        socket.on('disconnect', () => console.log('Socket disconnected'));
        socket.on('notification', (data) => {
          console.log('Realtime notification:', data);
          if (typeof toast === 'function') toast(data.message || 'New notification', 'success');
        });
        // Expose for debugging
        window.ctSocket = socket;
      });
    } catch (e) {
      console.warn('Socket init error', e);
    }
  }

  // Attempt to connect on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', connect);
  } else {
    connect();
  }
})();
