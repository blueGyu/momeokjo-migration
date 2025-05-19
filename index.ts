import app from "./server";

const port = parseInt(process.env.PORT ?? "8000");
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port: ${port}`);
});
