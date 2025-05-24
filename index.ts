import env from "./config/env";
import app from "./server";

const port = parseInt(env.PORT);
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port: ${port}`);
});
