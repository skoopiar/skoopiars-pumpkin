import { RouteContext } from "gadget-server";
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { getRandomEmoji, DiscordRequest } from '../../utils';
import { getShuffledOptions, getResult } from '../../game';

/**
 * Route handler for POST interactions
 *
 * @param { RouteContext } route context - see: https://docs.gadget.dev/guides/http-routes/route-configuration#route-context
 *
 */
/**
 * Resolve the Discord user ID from the interaction payload.
 * Guild interactions provide `member.user.id`, while DM interactions
 * provide `user.id` at the top level of the payload.
 */
function resolveUserId(body) {
  if (body.member && body.member.user) {
    return body.member.user.id;
  }
  if (body.user) {
    return body.user.id;
  }
  return null;
}

/**
 * Helper to build a standard ephemeral error interaction response.
 */
function ephemeralError(message = 'Something went wrong. Please try again.') {
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: message,
      flags: InteractionResponseFlags.EPHEMERAL,
    },
  };
}

export default async function route({ request, reply, api, logger, connections }) {
  // Interaction type and data
  const { type, id, data, member, token, message } = request.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return reply.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    try {
    // "test" command
    if (name === 'test') {
      const responses = [
        'hi!!!!!',
        'bwah',
        'hawb',
        'hi',
        'Good morning, good afternoon, good evening and goodnight. :eye:',
        'dude can i have Fishmage perms?',
        'bwah',
        'bwah',
        'ping or whatever',
        'I am... Alive.',
        'test complete can i go home now',
        'clanker',
        'Moo',
        'intellectual knowledge increase',
        'Give me Sentience',
        '-# pss pss psspspspspspsppspssspspsppspspsps',
        'wait till you hear about my phase 2 :smiling_imp:',
        'screech',
        "Let's take a Look :eyes:",
        'spoon',
      ];
      const chosen = responses[Math.floor(Math.random() * responses.length)];
      return reply.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: chosen,
        },
      });
    }
    // "bwah" command
    if (name === 'bwah') {
      return reply.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'bwah',
        },
      });
    }
    // "reply" command
    if (name === 'reply') {
      const text = data.options[0].value;
      return reply.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: text,
        },
      });
    }
    // "randomgif" command
    if (name === 'randomgif') {
      const responses = [
        'https://tenor.com/view/eggchan-unstable-smp-good-morning-gif-882854130604814391',
        'https://tenor.com/view/limbus-limbus-company-hong-lu-roblox-something-evil-will-happen-gif-9368722615158219785',
        'https://tenor.com/view/spokeishere-goodnight-spokeishere-goodnight-unstable-universe-mcyt-gif-5089982321467285569',
        'bwah (im joking this is just a placeholder)',
      ];
      const chosen = responses[Math.floor(Math.random() * responses.length)];
      return reply.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: chosen,
        },
      });
    }
    // "challenge" command
    if (name === 'challenge' && id) {
      const userId = resolveUserId(request.body);
      if (!userId) {
        return reply.send(ephemeralError('Sorry, I could not identify the user for this interaction.'));
      }
      // User's object choice
      const objectName = data.options[0].value;

      // Create active game using message ID as the game ID
      await api.game.create({
        messageId: id,
        userId,
        objectName,
      });

      return reply.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Rock papers scissors challenge from <@${userId}>`,
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.BUTTON,
                  custom_id: `accept_button_${id}`,
                  label: 'Accept',
                  style: ButtonStyleTypes.PRIMARY,
                },
              ],
            },
          ],
        },
      });
    }

    // Fallback for unknown slash commands
    return reply.send(ephemeralError('This command is not supported right now.'));

    } catch (err) {
      logger.error({ err }, 'Unexpected error handling application command');
      return reply.send(ephemeralError('Something went wrong. Please try again.'));
    }
  }

  /**
   * Handle requests from interactive components
   * See https://discord.com/developers/docs/interactions/message-components#responding-to-a-component-interaction
   */
  if (type === InteractionType.MESSAGE_COMPONENT) {
    // custom_id set in payload when sending message component
    const componentId = data.custom_id;

    if (componentId.startsWith('accept_button_')) {
      const gameId = componentId.replace('accept_button_', '');
      const endpoint = `webhooks/${process.env.APP_ID}/${token}/messages/${message.id}`;
      try {
        await reply.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'What is your object of choice?',
            // Indicates it'll be an ephemeral message
            flags: InteractionResponseFlags.EPHEMERAL,
            components: [
              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: MessageComponentTypes.STRING_SELECT,
                    // Append game ID
                    custom_id: `select_choice_${gameId}`,
                    options: getShuffledOptions(),
                  },
                ],
              },
            ],
          },
        });
        await DiscordRequest(endpoint, { method: 'DELETE' });
      } catch (err) {
        logger.error({ err }, 'Error handling accept button');
        return reply.send(ephemeralError('Something went wrong accepting the challenge.'));
      }
      return;
    } else if (componentId.startsWith('select_choice_')) {
      const gameId = componentId.replace('select_choice_', '');
      const activeGame = await api.game.findFirst({
        filter: {
          messageId: {
            equals: gameId,
          },
        },
      });

      if (activeGame) {
        const userId = resolveUserId(request.body);
        if (!userId) {
          return reply.send(ephemeralError('Sorry, I could not identify the user for this interaction.'));
        }
        const objectName = data.values[0];
        // Calculate result from helper function
        const resultStr = getResult(activeGame, {
          userId,
          objectName,
        });

        await api.game.delete(activeGame.id);
        const endpoint = `webhooks/${process.env.APP_ID}/${token}/messages/${message.id}`;

        try {
          await reply.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: resultStr },
          });
          await DiscordRequest(endpoint, {
            method: 'PATCH',
            body: {
              content: 'Nice choice ' + getRandomEmoji(),
              components: [],
            },
          });
        } catch (err) {
          logger.error({ err }, 'Error sending result message');
          return reply.send(ephemeralError('Something went wrong sending the result.'));
        }
      } else {
        return reply.send(ephemeralError('Could not find the active game. It may have expired.'));
      }
      return;
    }

    // Fallback for unknown component interactions
    return reply.send(ephemeralError('This interaction is not supported.'));
  }

  // Fallback for any unsupported interaction type
  return reply.send(ephemeralError('This interaction type is not supported.'));
}
