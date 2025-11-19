import dotenv from "dotenv";
import http from "http";

dotenv.config();

const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  //  console.log(req);
  const { headers, method, url } = req;
  console.log("HEADERS>\n", headers);
  console.log("METHOD> ", method);
  console.log("URL> ", url);

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
      console.log("BODY -> ", body);
    });

  // no response
  res.end("done!");
});

server.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`);
});
