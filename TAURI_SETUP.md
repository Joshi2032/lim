# Casa Lim - Sistema de Gestión con Tauri

## Instalación y Configuración

### Requisitos Previos

1. **Node.js** (v18 o superior)
2. **Rust** (v1.60 o superior)
   - Descargar desde: https://rustup.rs/
   - En Windows, también necesitarás Visual Studio Build Tools 2019

3. **Tauri CLI**
   ```bash
   npm install -g @tauri-apps/cli@latest
   ```

### Instalación del Proyecto

1. Clonar o descargar el proyecto
2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Instalar dependencias de Rust (si aún no están instaladas):
   ```bash
   rustup update
   ```

## Ejecución

### Modo Desarrollo

**Para ejecutar como aplicación de escritorio:**
```bash
npm run tauri:dev
```

**Para ejecutar solo como web en el navegador:**
```bash
npm run tauri:dev-web
```
O simplemente:
```bash
npm start
```

### Compilación

**Para compilar la aplicación de escritorio:**
```bash
npm run tauri:build
```

Esto creará archivos ejecutables en la carpeta `src-tauri/target/release/bundle/`.

## Estructura del Proyecto

```
lim/
├── src/                          # Código fuente de Angular
│   ├── app/                      # Componentes de la aplicación
│   ├── index.html               # HTML principal
│   └── styles.scss              # Estilos globales
├── src-tauri/                    # Código Rust de Tauri
│   ├── src/
│   │   └── main.rs              # Punto de entrada de Tauri
│   ├── tauri.conf.json          # Configuración de Tauri
│   ├── Cargo.toml               # Dependencias de Rust
│   └── build.rs                 # Script de build
├── angular.json                 # Configuración de Angular
└── package.json                 # Scripts y dependencias
```

## Configuración de Tauri

### Cambiar el nombre de la aplicación

Editar `src-tauri/tauri.conf.json`:
```json
"app": {
  "windows": [
    {
      "title": "Tu Nombre de App"
    }
  ]
}
```

### Cambiar el identificador único

Editar `src-tauri/tauri.conf.json`:
```json
"bundle": {
  "identifier": "com.tu-dominio.app"
}
```

## Distribución

Los ejecutables compilados estarán en:
- **Windows**: `src-tauri/target/release/bundle/msi/`
- **macOS**: `src-tauri/target/release/bundle/macos/`
- **Linux**: `src-tauri/target/release/bundle/deb/` o `rpm/`

## Solución de Problemas

### Error: "Tauri CLI not found"
Instalar Tauri CLI globalmente:
```bash
npm install -g @tauri-apps/cli@latest
```

### Error de compilación en Windows
Asegurate de tener Visual Studio Build Tools 2019 instalado:
https://visualstudio.microsoft.com/downloads/

### Puerto 4200 en uso
Angular usa el puerto 4200 por defecto. Si está en uso:
```bash
ng serve --port 4300
```

Luego actualizar `src-tauri/tauri.conf.json`:
```json
"build": {
  "devPath": "http://localhost:4300"
}
```

## Recursos

- [Documentación de Tauri](https://tauri.app/docs)
- [Documentación de Angular](https://angular.io/docs)
- [API de Tauri para Angular](https://tauri.app/docs/api/js/)

## Desarrollo

Para agregar funcionalidad de escritorio usando la API de Tauri:

```typescript
import { invoke } from '@tauri-apps/api/tauri';

// Invocar comando Rust desde Angular
invoke('greet', { name: 'World' })
  .then((response) => console.log(response))
  .catch((error) => console.error(error));
```
