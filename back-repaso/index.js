const express = require("express");
const pdfParse = require("pdf-parse");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar multer para manejar archivos subidos
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos PDF"));
    }
  },
});

// Middleware para parsear JSON
app.use(express.json({ limit: "10mb" })); // Aumentar límite para base64 grande

// Endpoint para procesar PDFs
app.post("/api/extract-pdf", upload.single("file"), async (req, res) => {
  console.log("ENTROOO")
  try {
    let buffer;

    // Si se envió como archivo multipart
    if (req.file) {
      buffer = req.file.buffer;
    }
    // Si se envió como base64 en el cuerpo JSON
    else if (req.body.file && typeof req.body.file === "string") {
      buffer = Buffer.from(req.body.file, "base64");
    } else {
      return res.status(400).json({ error: "No se proporcionó un archivo PDF válido" });
    }

    // Extraer texto del PDF
    const data = await pdfParse(buffer);
    const extractedText = data.text;

    res.json({ text: extractedText });
  } catch (error) {
    console.error("Error procesando el PDF:", error);
    res.status(500).json({ error: "Error al procesar el PDF" });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});