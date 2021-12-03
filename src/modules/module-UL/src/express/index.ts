import { readFile } from "fs/promises";
import Logger from "js-logger";
import { join } from "path";
import { app } from "../../../../";
import { basepath, fetchEDT, generateEDT } from "./multi";

// Example: /edt/sublet1u?resourceId=4496
app.get("/edt/:login", async (req, res) => {
  const { login } = req.params;
  const { resourceId } = req.query;

  let file: string;
  try {
    file = await generateEDT(login, parseInt(resourceId as string));
  } catch (error) {
    Logger.get("module-UL").error(error);
    res.status(500).send(error);
    return;
  }

  res.writeHead(302, {
    location: `/edt/${login}/${file}`,
  });
  res.end();
});

// Example: /edt/sublet1u/json?resourceId=4496
app.get("/edt/:login/json", async (req, res) => {
  const { resourceId } = req.query;
  res.status(200).json(await fetchEDT(parseInt(resourceId as string)));
});

// Example: /edt/sublet1u/aec845c861fb548ed844848fe16393911efca905
app.get("/edt/:login/:file", async (req, res) => {
  const { login, file } = req.params;

  const image = await readFile(join(basepath, login, `${file}.jpg`));

  res.writeHead(200, {
    "Content-Type": "image/jpeg",
    "Content-Disposition": `inline; filename="${login}_${new Date().toLocaleDateString()}.jpg"`,
  });
  res.end(image || "Error", "binary");
});
