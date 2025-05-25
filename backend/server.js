require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Asegurar que la carpeta uploads exista
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'perfil-' + uniqueSuffix + extension);
  }
});
const upload = multer({ storage });

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
      email: record.Email,
      fotoPerfil: record.FotoPerfil || null
    };

    return res.json({ message: 'Login exitoso', user });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error en el login' });
    }
  }
});

app.post('/auth/register', upload.single('fotoPerfil'), async (req, res) => {
  const { username, email, password } = req.body;
  const fotoPerfil = req.file ? `/uploads/${req.file.filename}` : null;

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

app.post('/auth/upload-foto', upload.single('foto'), async (req, res) => {
  const { userId } = req.body;
  const filename = req.file.filename;

  try {
    await sql.connect(dbConfig);
    const request = new sql.Request();
    request.input('UserId', sql.Int, userId);
    request.input('FotoPerfil', sql.NVarChar(255), `/uploads/${filename}`);
    await request.execute('usp_ActualizarFotoPerfil');

    res.status(200).json({ message: 'Foto actualizada correctamente', path: `/uploads/${filename}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al guardar la foto' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
