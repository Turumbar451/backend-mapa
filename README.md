# 🚍 Backend - MiRutaXalapa

Este es el backend del proyecto **MiRutaXalapa**, una aplicación para gestionar rutas, paradas y usuarios, con autenticación mediante JWT y manejo de roles (usuario / admin).  
Está desarrollado con **Node.js**, **Express** y **MongoDB (Mongoose)**.

---

## 📂 Estructura del proyecto

````
backend/
├── controllers/ # Controladores de la lógica de negocio
├── middleware/ # Middlewares (auth, manejo de errores, etc.)
├── models/ # Modelos de Mongoose (Usuario, Ruta, etc.)
├── routes/ # Definición de rutas de la API
├── db.js # Conexión a la base de datos MongoDB
├── server.js # Punto de entrada de la aplicación
└── package.json # Configuración del proyecto
````


---

## ⚙️ Tecnologías

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [JWT (jsonwebtoken)](https://github.com/auth0/node-jsonwebtoken)
- [bcrypt](https://www.npmjs.com/package/bcrypt) para hashear contraseñas
- [dotenv](https://www.npmjs.com/package/dotenv) para gestionar variables de entorno (no se llego a utilizar)
- [cookie-parser](https://www.npmjs.com/package/cookie-parser) para manejar cookies de sesión
- [cors](https://www.npmjs.com/package/cors) para permitir peticiones entre frontend y backend

---

## 🚀 Instalación y uso

1. Clonar el repositorio:

```bash
git clone https://github.com/tuusuario/backend-miruta.git
cd backend
```

2. Instalar dependencias:

```bash
npm install
```

3. Crear un archivo .env en la raíz del backend con las variables necesarias: (no se llego a implementar)

```js
PORT=3000
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/miruta
JWT_SECRET=supersecreto
```

4. Iniciar el servidor en modo desarrollo

```bash
nodemon server.js
```

---

## 🔑 Endpoints Principales

A continuación, se listan los endpoints más importantes de la API.

### **Autenticación y Sesión**

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/signup` | **Crear usuario** (Registro). |
| `POST` | `/api/login` | **Iniciar sesión** (Devuelve un **JWT** en una *cookie*). |
| `GET` | `/api/session` | **Verificar sesión** activa del usuario (Requiere cookie JWT). |


### **Rutas y Paradas**

| Método | Ruta | Descripción | Restricción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/routes` | Obtener el listado de todas las rutas. | Pública |
| `POST` | `/api/routes` | Crear una nueva ruta. | **Admin** |
| `PUT` | `/api/routes/:id` | Editar una ruta existente. | **Admin** |
| `DELETE` | `/api/routes/:id` | Eliminar una ruta. | **Admin** |
| `GET` | `/api/stops` | Obtener el listado de paradas disponibles. | Pública |

---

## Middleware

El directorio `middleware/` contiene funciones esenciales para interceptar y procesar peticiones HTTP.

### 🛡️ `authMiddleware.js` (`verifyToken`)

Este archivo contiene el middleware principal de seguridad, `verifyToken`, que protege las rutas de la API.

| Función | Descripción |
| :--- | :--- |
| **`verifyToken`** | Middleware principal para la autenticación de usuarios. |

**Proceso de Verificación:**

1.  **Extracción del Token**: Busca el **JWT** directamente en la *cookie* llamada `token` de la solicitud (requiere la librería `cookie-parser`).
2.  **Autorización**: Si el token no existe, detiene la solicitud con un código de estado **401 (No Autorizado)**.
3.  **Validación**: Utiliza `jsonwebtoken.verify()` para validar la firma y la fecha de expiración del token.
4.  **Inclusión del Usuario**: Si el token es válido, decodifica el *payload* y lo adjunta a la solicitud como **`req.user`**, haciendo la información del usuario accesible para el controlador.
5.  **Rechazo**: Si el token es inválido o ha expirado, detiene la solicitud con un código **401**.

**Uso de ejemplo en una ruta:**

```javascript
import { verifyToken } from '../middleware/authMiddleware.js';
// ...
router.get('/profile', verifyToken, userController.getProfile); 
// El controlador solo se ejecuta si verifyToken llama a next()
```
---

## 🗄️ Modelos de Base de Datos

Definición de los principales modelos de Mongoose utilizados:

* **`User`**:
    * `username`
    * `password` (almacenada *hasheada*)
    * `role` (e.g., `'user'`, `'admin'`)
* **`Route`**:
    * `nombre` (Nombre de la ruta)
    * `paradas` (Array de referencias a **Stop**)
    * `estado` (e.g., `'activo'`, `'inactivo'`)
* **`Stop`**:
    * `nombre` (Nombre de la parada)
    * `ubicación` (Coordenadas geográficas u otra información de localización)

---

## 🛡️ Seguridad

Las siguientes medidas de seguridad se han implementado en el backend:

* **Contraseñas hasheadas** con `bcrypt` para garantizar que nunca se almacenen en texto plano.
* **Autenticación basada en JWT** (JSON Web Tokens).
* El JWT se guarda en **cookies HttpOnly**, mitigando ataques XSS (Cross-Site Scripting).
* **Configuración estricta de CORS** (`cors`) para permitir solicitudes solo desde el dominio(s) autorizado(s) del frontend.

---

## 📜 Licencia

Este proyecto está bajo la **Licencia ISC**.
