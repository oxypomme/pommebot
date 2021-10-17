import Logger from "js-logger";
import { app } from "../../../../";
import { fetchEDT, generateEDT } from "./multi";
import { GraphQLResult } from "./types";

app.get("/edt/:login", async (req, res) => {
  const { login } = req.params;

  let image: any;
  try {
    image = await generateEDT(login);
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

  res.writeHead(200, {
    "Content-Type": "image/png",
    "Content-Disposition": `inline; filename="${login}_${new Date().toLocaleDateString()}.jpg"`,
  });
  res.end(image || "Error", "binary");
});

app.get("/edt/:login/json", async (req, res) => {
  const { login } = req.params;
  res.status(200).json(await fetchEDT(login));
});
