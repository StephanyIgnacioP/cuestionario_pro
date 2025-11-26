import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Configurar ruta del .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env") });

const app = express();

// Middlewares
app.use(morgan("dev"));
app.use(express.json());

// Conectar a MongoDB Atlas
connectDB();

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando con MongoDB Atlas 🔥");
});

// Puerto
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});