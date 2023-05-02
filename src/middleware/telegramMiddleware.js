import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(async (ctx, next) => {
  console.time(`Processing update ${ctx.update.update_id}`);
  await next() // runs next middleware
  // runs after next middleware finishes
  console.timeEnd(`Processing update ${ctx.update.update_id}`);
})

bot.on(message('text'), (ctx) => ctx.reply('Hello World'));
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));