const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const materialRoutes = require("./routes/materialRoutes");
const examRoutes = require("./routes/examRoute");
const resultRoutes = require("./routes/resultRoute");
const uploadRoutes = require("./routes/uploadRoute");

dotenv.config();
connectDB();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

app.use("/api/materials", materialRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/result", resultRoutes);
app.use("/api/upload", uploadRoutes);
