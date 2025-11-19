import dotenv from "dotenv";
import http from "http";

dotenv.config();

const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  req.on("error", (err) => {
    console.error(err);
    res.statusCode = 400;
    res.end();
  });

  res.on("error", (err) => {
    console.error(err);
  });

  if (req.method === "GET" && req.url === "/echo") {
    let body = [];
    req
      .on("data", (chunk) => {
        body.push(chunk);
      })
      .on("end", () => {
        body = "Para echo usa el metodo post";
        res.end(body);
      });
  } else   
  if (req.method === "POST" && req.url === "/echo") {
    let body = [];
    req
      .on("data", (chunk) => {
        body.push(chunk);
      })
      .on("end", () => {
        body = Buffer.concat(body).toString();
        res.end(body);
      });
  } else {
    res.statusCode = 404;
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`);
});
