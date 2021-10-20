import { readFile } from "fs/promises";
import Logger from "js-logger";
import { join } from "path";
import { app } from "../../../../";
import { basepath, fetchEDT, generateEDT } from "./multi";
import { GraphQLResult } from "./types";

app.get("/edt/:login", async (req, res) => {
  const { login } = req.params;

  let file: string;
  try {
    file = await generateEDT(login);
  } catch (th) {
    const data = th as GraphQLResult;

    if (data.errors) {
      res.status(500).json(data.errors);
    } else {
      Logger.get("module-UL").error(th);
      res.status(500).send(th);
    }
    return;
  }

  res.writeHead(302, {
    location: `/edt/${login}/${file}`,
  });
  res.end();
});

app.get("/edt/:login/json", async (req, res) => {
  const { login } = req.params;
  res.status(200).json(await fetchEDT(login));
});

app.get("/edt/:login/:file", async (req, res) => {
  const { login, file } = req.params;

  const image = await readFile(join(basepath, login, `${file}.jpg`));

  res.writeHead(200, {
    "Content-Type": "image/jpeg",
    "Content-Disposition": `inline; filename="${login}_${new Date().toLocaleDateString()}.jpg"`,
  });
  res.end(image || "Error", "binary");
});
