-- ══════════════════════════════════════════
-- SCHEMA v3 — Fase 3: Catálogo de Productos
-- Ejecutar:
-- wrangler d1 execute apple-db --remote --command "CREATE TABLE IF NOT EXISTS productos (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT NOT NULL, descripcion TEXT, precio TEXT NOT NULL, categoria TEXT NOT NULL, imagen_url TEXT, imagen_public_id TEXT, disponible INTEGER DEFAULT 1, destacado INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);"
-- ══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS productos (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre           TEXT    NOT NULL,
  descripcion      TEXT,
  precio           TEXT    NOT NULL,
  categoria        TEXT    NOT NULL,       -- 'iphone','mac','ipad','watch','airpods','accesorios'
  imagen_url       TEXT,                   -- URL pública de Cloudinary
  imagen_public_id TEXT,                   -- ID en Cloudinary (para borrar)
  disponible       INTEGER DEFAULT 1,      -- 1=activo, 0=oculto
  destacado        INTEGER DEFAULT 0,      -- 1=aparece en hero
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Productos de ejemplo (correr después de crear la tabla)
-- INSERT INTO productos (nombre, descripcion, precio, categoria, disponible, destacado) VALUES
-- ('iPhone 16 Pro', 'Chip A18 Pro, cámara 48MP, Apple Intelligence', '$1,199', 'iphone', 1, 1),
-- ('MacBook Pro M4', 'Chip M4 Pro, 14 pulgadas, pantalla Liquid Retina XDR', '$1,999', 'mac', 1, 1),
-- ('iPad Pro M4', 'OLED Ultra Retina XDR, chip M4, Apple Pencil Pro', '$1,299', 'ipad', 1, 0),
-- ('Apple Watch Series 10', 'Diseño ultradelgado, salud avanzada', '$399', 'watch', 1, 0),
-- ('AirPods Pro 2', 'Cancelación de ruido, audio espacial', '$1,099', 'airpods', 1, 0),
-- ('Mac mini M4', 'El escritorio más compacto, chip M4', '$699', 'mac', 1, 0);