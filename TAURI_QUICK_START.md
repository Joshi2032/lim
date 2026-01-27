# Guía Rápida: Sakura como Aplicación de Escritorio

## Inicio Rápido

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Ejecutar en Modo Desarrollo (Escritorio)
```bash
npm run tauri:dev
```

Esto abrirá la aplicación en una ventana de escritorio nativa.

### 3. Ejecutar en Modo Web
```bash
npm start
```

Esto abrirá la aplicación en el navegador en http://localhost:4200

### 4. Compilar para Distribución
```bash
npm run tauri:build
```

Los instaladores estarán en `src-tauri/target/release/bundle/`

## Ventajas de Tauri vs Electron

✅ Archivo ejecutable mucho más pequeño (~5MB vs ~150MB con Electron)
✅ Menor consumo de memoria
✅ Integración nativa del SO
✅ Mejor rendimiento
✅ Código Rust más seguro que Node.js
✅ Acceso a APIs nativas del sistema operativo

## Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `npm run tauri:dev` | Ejecutar en modo desarrollo (escritorio) |
| `npm start` | Ejecutar servidor web (navegador) |
| `npm run build` | Compilar Angular |
| `npm run tauri:build` | Compilar aplicación de escritorio |
| `npm test` | Ejecutar pruebas unitarias |

## Requisitos Iniciales

- ✅ Node.js 18+
- ✅ Rust 1.60+
- ✅ En Windows: Visual Studio Build Tools 2019

## Soporte Multiplataforma

Tauri permite compilar para:
- 🪟 Windows (EXE, MSI)
- 🍎 macOS (DMG, App)
- 🐧 Linux (AppImage, DEB, RPM)

Desde una sola línea de código.

## Próximos Pasos

1. Ejecutar `npm install` para instalar dependencias
2. Ejecutar `npm run tauri:dev` para probar la aplicación de escritorio
3. Ver la guía completa en `TAURI_SETUP.md`
