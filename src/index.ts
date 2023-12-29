import express from "express";
import dotenv from "dotenv";
import filterRouter from "./routes/filterRoutes";
import cors from "cors";

const options: cors.CorsOptions = {
  origin: process.env.ORIGIN || "http://localhost:5173",
  methods: "GET",
};

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(cors(options));
app.use(express.json());

// Routes
app.use("/api", filterRouter);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
