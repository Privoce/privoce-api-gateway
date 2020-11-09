require("dotenv").config();
const express = require("express");

const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");

const routes = require("./routes");
const mongooseService = require("./app/services/mongoose");

const app = express();
const port = process.env.PORT;

app.use(compression());
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use(routes);

mongooseService();

app.listen(port, () => {
  console.log(`running on port ${port}`);
});
