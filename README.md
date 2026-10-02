# Trabajo práctico 05

## Descripción

Este proyecto implementa un sistema de reservas de salas desarrollado con Node.js, Express y EJS.

La aplicación permite consultar las reservas existentes, visualizar el detalle de una reserva y registrar nuevas reservas.

Las reservas iniciales se encuentran definidas en memoria dentro de `src/index.js`. Las nuevas reservas también se almacenan únicamente en memoria durante la ejecución del servidor.

El proyecto utiliza middleware global, middleware propio del router de reservas y middleware específico de determinadas rutas.

---

## Instalación

Para instalar las dependencias del proyecto, ejecutar:

```bash
npm install

Las principales dependencias utilizadas son:

Express
EJS
express-ejs-layouts
Morgan
