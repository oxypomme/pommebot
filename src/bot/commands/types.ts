import { CommandInteraction } from "discord.js";

export type Permission = {
  id?: string;
  type: "USER" | "ROLE";
  permission: boolean;
};

export type Command = {
  name: string;
  description: string;
  action?: (interaction: CommandInteraction) => Promise<void>;
  permissions?: Permission[];
  options?: any[];
};
