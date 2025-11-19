import dotenv from "dotenv";
import http from "http";

dotenv.config();

const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  const { headers, method, url } = req;
  let body = [];
  req
    .on("error", (err) => {
      console.error(err);
    })
    .on("data", (chunk) => {
      body.push(chunk);
    })
    .on("end", () => {
      body = Buffer.concat(body).toString();

      res.on("error", (err) => {
        console.error(err);
      });

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");

      const responseBody = { headers, method, url, body };

      res.write(JSON.stringify(responseBody));

      console.log(res);
      
      res.end();
    });
});

server.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`);
});
