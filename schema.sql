-- Tabla: Lista de espera MacBook Neo
CREATE TABLE IF NOT EXISTS waitlist (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT    NOT NULL UNIQUE,
  producto   TEXT    NOT NULL DEFAULT 'MacBook Neo',
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Tabla: Registro de clics en botones (analytics)
CREATE TABLE IF NOT EXISTS button_clicks (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  seccion    TEXT    NOT NULL,   -- 'iphone', 'macbook', 'ipad', 'watch', etc.
  accion     TEXT    NOT NULL,   -- 'mas_info', 'comprar', 'waitlist'
  ip_hash    TEXT,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Tabla: Mensajes de contacto
CREATE TABLE IF NOT EXISTS contacto (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre     TEXT    NOT NULL,
  email      TEXT    NOT NULL,
  mensaje    TEXT    NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);