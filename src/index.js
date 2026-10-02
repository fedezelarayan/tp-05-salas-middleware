const express = require("express");
const ejsLayouts = require("express-ejs-layouts");
const morgan = require("morgan");

const app = express();

const reservasRouter = express.Router();

const reservas = [
    {
        id: 1,
        estudiante: "Federico Zelarayan",
        email: "federico@gmail.com",
        sala: "Sala Norte",
        fecha: "2026-09-24",
        turno: "Mañana",
        personas: 2
    },
    {
        id: 2,
        estudiante: "Juan Pérez",
        email: "juan@gmail.com",
        sala: "Sala Sur",
        fecha: "2026-09-24",
        turno: "Tarde",
        personas: 4
    },
    {
        id: 3,
        estudiante: "María González",
        email: "maria@gmail.com",
        sala: "Sala Multimedia",
        fecha: "2026-09-25",
        turno: "Noche",
        personas: 3
    },
    {
        id: 4,
        estudiante: "Lucía Fernández",
        email: "lucia@gmail.com",
        sala: "Sala Norte",
        fecha: "2026-09-26",
        turno: "Tarde",
        personas: 5
    }
];

/* =========================middlewares globales========================= */

app.use(morgan("dev"));

let solicitudId = 0;

function identificarSolicitud(req, res, next) {
    solicitudId++;

    const idFormateado = `BIB-${String(solicitudId).padStart(4, "0")}`;

    res.locals.solicitudId = idFormateado;

    next();
}

function medirDuracion(req, res, next) {
    const inicio = Date.now();

    res.on("finish", () => {
        const duracion = Date.now() - inicio;

        console.log(
            `[${res.locals.solicitudId}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duracion}ms`
        );
    });

    next();
}

app.use(identificarSolicitud);
app.use(medirDuracion);

/* =========================configuración========================= */

app.set("view engine", "ejs");
app.set("views", "views");

app.set("layout", "layouts/main");

app.use(ejsLayouts);

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* =========================rutas generales========================= */

app.get("/", (req, res) => {
    res.render("inicio");
});

app.get("/estado", (req, res) => {
    res.json({
        servicio: "activo",
        reservas: reservas.length,
        solicitudId: res.locals.solicitudId
    });
});

/* =========================validaciones========================= */

const salasPermitidas = [
    "Sala Norte",
    "Sala Sur",
    "Sala Multimedia"
];

const turnosPermitidos = [
    "Mañana",
    "Tarde",
    "Noche"
];

function validarReserva(req, res, next) {
    const estudiante = (req.body.estudiante || "").trim();
    const email = (req.body.email || "").trim();
    const sala = (req.body.sala || "").trim();
    const fecha = (req.body.fecha || "").trim();
    const turno = (req.body.turno || "").trim();
    const personas = Number(req.body.personas);

    const errores = [];

    if (!estudiante) {
        errores.push("El estudiante es obligatorio.");
    }

    if (!email) {
        errores.push("El email es obligatorio.");
    } else if (!email.includes("@")) {
        errores.push("El email debe contener @.");
    }

    if (!sala) {
        errores.push("La sala es obligatoria.");
    } else if (!salasPermitidas.includes(sala)) {
        errores.push("La sala seleccionada no es válida.");
    }

    if (!fecha) {
        errores.push("La fecha es obligatoria.");
    }

    if (!turno) {
        errores.push("El turno es obligatorio.");
    } else if (!turnosPermitidos.includes(turno)) {
        errores.push("El turno seleccionado no es válido.");
    }

    if (!Number.isInteger(personas) || personas < 1 || personas > 6) {
        errores.push(
            "La cantidad de personas debe ser un número entero entre 1 y 6."
        );
    }

    if (errores.length > 0) {
        return res.status(400).render("reservas/nueva", {
            errores,
            datos: {
                estudiante,
                email,
                sala,
                fecha,
                turno,
                personas: req.body.personas || ""
            }
        });
    }

    req.reservaValidada = {
        estudiante,
        email,
        sala,
        fecha,
        turno,
        personas
    };

    next();
}

function crearReserva(req, res) {
    const nuevoId =
        reservas.length > 0
            ? Math.max(...reservas.map((reserva) => reserva.id)) + 1
            : 1;

    const nuevaReserva = {
        id: nuevoId,
        ...req.reservaValidada
    };

    reservas.push(nuevaReserva);

    res.redirect("/reservas");
}

/* =========================router de reservas========================= */

function prepararAreaReservas(req, res, next) {
  res.locals.seccion = "Reservas de salas";

  next();
}

reservasRouter.use(prepararAreaReservas);

reservasRouter.get("/", (req, res) => {
    res.render("reservas/lista", {
        reservas
    });
});

reservasRouter.get("/nueva", (req, res) => {
    res.render("reservas/nueva", {
        errores: [],
        datos: {}
    });
});

reservasRouter.get("/:id", (req, res) => {
    const id = Number(req.params.id);

    const reserva = reservas.find((reserva) => reserva.id === id);

    if (!reserva) {
        return res.status(404).render("no-encontrado");
    }

    res.render("reservas/detalle", {
        reserva
    });
});

reservasRouter.post("/", validarReserva, crearReserva);

app.use("/reservas", reservasRouter);

/* =========================404========================= */

app.use((req, res) => {
    res.status(404).render("no-encontrado");
});

/* =========================servidor========================= */

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

/* 
src/index.js
│
├── imports
│
├── app = express()
│
├── reservasRouter
│
├── array reservas
│
├── middlewares globales
│   ├── Morgan
│   ├── identificarSolicitud
│   └── medirDuracion
│
├── configuración EJS / static / parsers
│
├── rutas generales
│   ├── /
│   └── /estado
│
├── validación
│   ├── salasPermitidas
│   ├── turnosPermitidos
│   ├── validarReserva
│   └── crearReserva
│
├── reservasRouter
│   ├── middleware seccion
│   ├── GET /
│   ├── GET /nueva
│   ├── GET /:id
│   └── POST /
│
├── montaje del router
│
├── 404
│
└── app.listen()
*/