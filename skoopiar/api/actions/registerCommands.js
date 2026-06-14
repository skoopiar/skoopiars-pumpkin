import { getRPSChoices } from '../../game';
import { capitalize, InstallGlobalCommands, DiscordRequest } from '../../utils';

/** @type { ActionRun } */
export async function run({ params, logger, api, connections }) {
  // Fetch existing global commands from Discord
  const existingRes = await DiscordRequest(`applications/${process.env.APP_ID}/commands`, { method: 'GET' });
  const existingCommands = await existingRes.json();

  // Preserve any Entry Point commands (type 4) from the existing commands
  const entryPointCommands = existingCommands.filter((cmd) => cmd.type === 4);

  // Build the combined payload: preserved entry point commands + local command definitions
  const localCommandNames = ALL_COMMANDS.map((cmd) => cmd.name);
  const combinedPayload = [...entryPointCommands.filter((cmd) => !localCommandNames.includes(cmd.name)), ...ALL_COMMANDS];

  const commandNames = combinedPayload.map((cmd) => cmd.name);
  const bwahInPayload = commandNames.includes('bwah');
  const randomgifInPayload = commandNames.includes('randomgif');
  logger.info({ commandNames, commandCount: combinedPayload.length, bwahIncluded: bwahInPayload, randomgifIncluded: randomgifInPayload }, "Registering Discord commands (bwah in payload: " + bwahInPayload + ", randomgif in payload: " + randomgifInPayload + ")");

  let registeredCommands;
  try {
    registeredCommands = await InstallGlobalCommands(process.env.APP_ID, combinedPayload);
  } catch (error) {
    logger.error({ error, commandNames, appId: process.env.APP_ID }, "Failed to register Discord commands");
    throw error;
  }

  const registeredNames = Array.isArray(registeredCommands)
    ? registeredCommands.map((cmd) => cmd.name)
    : [];
  const bwahRegistered = registeredNames.includes('bwah');
  const randomgifRegistered = registeredNames.includes('randomgif');
  logger.info({ registeredNames, registeredCount: registeredNames.length, bwahRegistered, randomgifRegistered }, "Successfully registered Discord commands (bwah registered: " + bwahRegistered + ", randomgif registered: " + randomgifRegistered + ")");

  // Verify the final command state by fetching commands back from Discord
  let verifiedCommands;
  try {
    const verifyRes = await DiscordRequest(`applications/${process.env.APP_ID}/commands`, { method: 'GET' });
    verifiedCommands = await verifyRes.json();
  } catch (error) {
    logger.error({ error, appId: process.env.APP_ID }, "Failed to fetch commands from Discord after registration");
    throw error;
  }

  const verifiedNames = Array.isArray(verifiedCommands)
    ? verifiedCommands.map((cmd) => cmd.name)
    : [];
  const bwahVerified = verifiedNames.includes('bwah');
  const randomgifVerified = verifiedNames.includes('randomgif');
  logger.info({ verifiedNames, verifiedCount: verifiedNames.length, bwahVerified, randomgifVerified }, "Post-registration command verification from Discord (bwah verified: " + bwahVerified + ", randomgif verified: " + randomgifVerified + ")");

  return {
    success: true,
    commandCount: combinedPayload.length,
    commands: commandNames,
    bwahIncludedInPayload: bwahInPayload,
    bwahRegisteredByResponse: bwahRegistered,
    bwahVerifiedByDiscord: bwahVerified,
    randomgifIncludedInPayload: randomgifInPayload,
    randomgifRegisteredByResponse: randomgifRegistered,
    randomgifVerifiedByDiscord: randomgifVerified,
    verifiedCommands: verifiedNames,
  };
}

function createCommandChoices() {
  const choices = getRPSChoices();
  const commandChoices = [];

  for (let choice of choices) {
    commandChoices.push({
      name: capitalize(choice),
      value: choice.toLowerCase(),
    });
  }

  return commandChoices;
}

// Simple test command
export const TEST_COMMAND = {
  name: 'test',
  description: 'say hello to my cutesy little skoopiar',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

// Command containing options
export const CHALLENGE_COMMAND = {
  name: 'challenge',
  description: 'Challenge to a match of rock paper scissors',
  options: [
    {
      type: 3,
      name: 'object',
      description: 'Pick your object',
      required: true,
      choices: createCommandChoices(),
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

// Command to make Skoopiar say something nice
export const REPLY_COMMAND = {
  name: 'reply',
  description: 'make skoopiar say nice things :heart:',
  options: [
    {
      type: 3,
      name: 'message',
      description: 'istg if you say Anything bad.',
      required: true,
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

// Simple bwah command
export const BWAH_COMMAND = {
  name: 'bwah',
  description: 'bwah',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

// Random gif command
export const RANDOMGIF_COMMAND = {
  name: 'randomgif',
  description: 'have gifs that i own in the basement',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const ALL_COMMANDS = [TEST_COMMAND, CHALLENGE_COMMAND, REPLY_COMMAND, BWAH_COMMAND, RANDOMGIF_COMMAND];


export const options = { triggers: { api: true } }