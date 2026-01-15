# WorkingHoursControl

Breve instrucciones para levantar la API (backend) y servir el sitio estático.

Requisitos
- Node.js (>=16) y npm

Levantar la API (desarrollo)
1. Abrir terminal en la carpeta `backend`.
2. Instalar dependencias:

```bash
npm install
```

3. Iniciar en modo desarrollo (hot-reload):

```bash
npm run start:dev
```

La API se expondrá en `http://localhost:3000/api` por defecto.

Servir el sitio (frontend estático)
- El sitio estático está en la carpeta `backend/public` y el servidor Nest ya está configurado para servirla como assets estáticos.
- Con la API levantada (pasos anteriores) abre en el navegador:

```
http://localhost:3000/
```
