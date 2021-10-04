import dotenv from "dotenv";
import Logger from "js-logger";
import { NodeColors } from "./NodeColors";

dotenv.config();

Logger.useDefaults({
  defaultLevel: process.env.NODE_ENV === "production" ? Logger.INFO : undefined,
  formatter: function (messages, context) {
    let color = NodeColors.Reset;
    switch (context.level.name) {
      case "INFO":
        color = NodeColors.FgBlue;
        context.level.name += " ";
        break;
      case "WARN":
        color = NodeColors.FgYellow;
        context.level.name += " ";
        break;
      case "ERROR":
        color = NodeColors.FgRed;
        break;

      default:
        break;
    }
    messages.unshift(
      color,
      new Date().toISOString(),
      NodeColors.Bright + context.name + NodeColors.Reset + color,
      `${NodeColors.Reverse} ` + context.level.name + ` ${NodeColors.Reset}`,
      color
    );
  },
});
