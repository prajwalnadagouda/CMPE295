require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const connection = require("./db");
const userRoutes = require("./routes_new/users");
const authRoutes = require("./routes_new/auth");
// const vehicleRoutes = require("./routes/vehicles");
const shuttles = require("./routes_new/shuttle");
const routes = require("./routes_new/route");
// const companyRoutes = require("./routes/company");

connection();
app.use(express.json());

const corsOptions = {
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,
    optionSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
// app.use("/api/vehicles", vehicleRoutes);
app.use("/api/shuttle", shuttles);
app.use("/api/routes", routes);
// app.use("/api/company", companyRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

const port = process.env.PORT || 8080;
app.listen(port, console.log(`Listening on port ${port}...`));