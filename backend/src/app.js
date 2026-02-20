const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const routes = require('./routes/index');

const app = express();

// ── Middlewares globales ────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Archivos estáticos (fotos de empleados / clientes) ─────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── Rutas de la API ─────────────────────────────────────────────────────────
app.use('/api', routes);

// ── Health check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        app: 'PrimeDeskDB API',
        version: '1.0.0',
    });
});

// ── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada.' });
});

// ── Error handler global ────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({ message: 'Error interno del servidor.' });
});

module.exports = app;
