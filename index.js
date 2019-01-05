const { Composer, session } = require('micro-bot');

const axios = require('axios')


const bot = new Composer()
bot.use(session())

bot.start(ctx => {
    ctx.replyWithMarkdown(`Please send your API key to start.
Be sure to use the following syntax:
    \`apikey - {your-key}\`
[This key will be cached in session]`)
})

bot.hears(/^apikey/, ctx => {
    ctx.session.apikey = ctx.update.message.text.split('-')[1].trim();
    ctx.replyWithMarkdown(`Thanks. From now on you can just send me the link directly and I will shorten it for you.
If you want to change/update the apikey just type /setkey command.`)
})

bot.help(ctx => {
    ctx.replyWithMarkdown(`Use /setkey command to set/update api key again.
if you don't have it, get it from \`https://kutt.it/\`
Then just send any valid http url to shorten the links`)
})

bot.hears(/^(http|https):\/\//, async (ctx) => {
    const url = ctx.update.message.text;
    ctx.reply('fetching API please wait...')
    if (ctx.session.apikey) {
        try {
            const shortened = await axios({
                method: 'POST',
                url: 'https://kutt.it/api/url/submit',
                headers: {
                    'x-api-key': ctx.session.apikey
                },
                data: {
                    target: url
                }
            })
            ctx.reply(shortened.data.shortUrl);
        } catch (e) {
            console.log(e)
            ctx.reply(e.response.statusText)
        }
    } else {
        ctx.reply('API key is not set, please set one with /setkey command')
    }
})

bot.command('setkey', ctx => {
    ctx.reply('overriding old API key if present.')
    ctx.session.apikey = ctx.update.message.text.split(' ')[1]
    ctx.reply('new api key is set 👍')
})
module.exports = bot
