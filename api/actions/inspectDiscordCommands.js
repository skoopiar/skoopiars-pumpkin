import { DiscordRequest } from "../../utils.js";

/** @type { ActionRun } */
export const run = async ({ params, logger, api, connections }) => {
  const appId = process.env.APP_ID;

  const response = await DiscordRequest(`applications/${appId}/commands`, {
    method: "GET",
  });

  const commands = await response.json();

  const commandNames = commands.map((cmd) => cmd.name);

  const testCommand = commands.find((cmd) => cmd.name === "test") || null;
  const bwahCommand = commands.find((cmd) => cmd.name === "bwah") || null;
  const randomgifCommand = commands.find((cmd) => cmd.name === "randomgif") || null;

  const summary = {
    testFound: !!testCommand,
    bwahFound: !!bwahCommand,
    randomgifFound: !!randomgifCommand,
  };

  logger.info({ commandNames, summary }, "Fetched Discord application commands (tracking: test, bwah, randomgif)");

  return {
    commandNames,
    testCommand,
    bwahCommand,
    randomgifCommand,
    summary,
  };
};
