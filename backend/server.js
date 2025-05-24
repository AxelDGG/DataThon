require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    await sql.connect(dbConfig);
    const request = new sql.Request();
    request.input('Email', sql.NVarChar(255), email);
    request.input('Password', sql.NVarChar(100), password);
    const result = await request.execute('usp_Login');
    const record = result.recordset[0];

    if (!record || !record.Id) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const user = {
      id: record.Id,
      username: record.Username,
      email: record.Email
    };

    return res.json({ message: 'Login exitoso', user });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error en el login' });
    }
  }
});

app.post('/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    await sql.connect(dbConfig);
    const request = new sql.Request();
    request.input('Username', sql.NVarChar(50), username);
    request.input('Email', sql.NVarChar(255), email);
    request.input('Password', sql.NVarChar(100), password);
    await request.execute('usp_RegistrarUsuario');

    return res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error en el registro' });
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
