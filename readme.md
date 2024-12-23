# Tienda Virtual - Proyecto Académico

Este proyecto consiste en una tienda virtual simple con un panel de administración y una interfaz para clientes. El proyecto está dividido en dos partes:

## Tecnologías Utilizadas

### Backend (Panel de Administración)
- Node.js
- Express
- MongoDB
- Pug
- JWT para autenticación

### Frontend (Tienda)
- Go (Golang)
- HTML
- MongoDB (compartida con el backend)

## Requisitos Previos

1. Node.js (versión 14 o superior)
2. Go (versión 1.16 o superior)
3. MongoDB (versión 4.4 o superior)
4. Git

## Configuración del Proyecto

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd <nombre-del-proyecto>
```

### 2. Configurar el Backend

1. Navegar al directorio del backend:
```bash
cd backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear archivo .env en el directorio backend:
```
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=tu_secreto_aqui
PORT=3000
```

4. Crear el usuario administrador inicial:
```bash
node scripts/createAdmin.js
```
Credenciales por defecto:
- Usuario: admin
- Contraseña: admin123

5. Iniciar el servidor backend:
```bash
node server.js
```
El panel de administración estará disponible en: http://localhost:3000

### 3. Configurar el Frontend

1. Navegar al directorio del frontend:
```bash
cd frontend
```

2. Instalar dependencias de Go:
```bash
go mod init frontend
go get go.mongodb.org/mongo-driver/mongo
```

3. Iniciar el servidor frontend:
```bash
go run main.go
```
La tienda estará disponible en: http://localhost:8080

## Uso del Sistema

### Panel de Administración (Backend)
1. Acceder a http://localhost:3000
2. Iniciar sesión con las credenciales de administrador
3. Desde aquí podrás:
   - Agregar, editar y eliminar productos
   - Ver los pedidos realizados por los clientes

### Tienda (Frontend)
1. Acceder a http://localhost:8080
2. Los clientes pueden:
   - Ver productos disponibles
   - Agregar productos al carrito
   - Realizar pedidos proporcionando nombre y dirección

## Notas Importantes
- Todos los pedidos se marcan automáticamente como completados (es un mockup)
- La base de datos MongoDB es compartida entre el backend y frontend
- No se procesan pagos reales
- Las direcciones no son validadas ya que es un proyecto académico

## Estructura del Proyecto
```
proyecto/
├── backend/
│   ├── models/
│   │   ├── admin.js
│   │   ├── product.js
│   │   └── order.js
│   ├── public/
│   │   └── css/
│   │       └── style.css
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   └── orders.js
│   ├── utils/
│   │   └── tokenUtils.js
│   ├── views/
│   │   ├── layout.pug
│   │   ├── login.pug
│   │   ├── products.pug
│   │   ├── products-add.pug
│   │   ├── products-edit.pug
│   │   └── orders.pug
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── main.go
    └── templates/
        ├── index.html
        ├── checkout.html
        └── success.html
```

## Solución de Problemas Comunes

1. Error de conexión a MongoDB:
   - Verificar que MongoDB esté corriendo localmente
   - Verificar la URL de conexión en el archivo .env

2. Error al iniciar el servidor backend:
   - Verificar que el puerto 3000 esté disponible
   - Verificar que todas las dependencias estén instaladas

3. Error al iniciar el servidor frontend:
   - Verificar que el puerto 8080 esté disponible
   - Verificar que Go esté correctamente instalado

## Contribuciones
Este es un proyecto académico, pero las sugerencias son bienvenidas.