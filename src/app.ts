import express, { type Application } from "express";
import { userRoute } from "./modules/user/user.route";
import { authRoute } from "./modules/auth/auth.route";
import logger from "./middleware/logger";

const app: Application = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

//app.use(logger);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "DevPulse is Cooking",
  });
});
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);

export default app;
