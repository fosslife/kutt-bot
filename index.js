const { Composer, session, Markup, Extra } = require('micro-bot');

const axios = require('axios')
const { getUrls, postUrl } = require('./api')

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
    const url = ctx.update.message.text
    const apikey = ctx.session.apikey
    ctx.reply('fetching API please wait...')
    if (apikey) {
        try {
            const shortened = await axios(postUrl(apikey, url))
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
    const newkey = ctx.update.message.text.split(' ')[1];
    if(newkey){
        ctx.reply('overriding old API key if present.')
        ctx.session.apikey = ctx.update.message.text.split(' ')[1]
        ctx.reply('new api key is set 👍')
    } else {
        ctx.reply('Send the key with format /setkey {new-api-key}')
    }
})

/**
 * Get request for fetch all the URLs. Accepts query params
 * count: int <10>
 * page: int <1>
 * search: string <search string>
 */

bot.command('getlist', async ctx => {
    const apikey = ctx.session.apikey
    ctx.session.currentPage = 1
    if (apikey) {
        try {
            const list = await axios(getUrls(apikey, 10, ctx.session.currentPage))
            // console.log("LIST", list.data.list)
            const message = list.data.list.map(d =>  `${d.shortUrl} - [Original](${d.target})\n`)
            ctx.reply('Total links found:' + list.data.countAll)
            const reply = message.join('\n')
            ctx.replyWithMarkdown(reply, Extra
                // .load({ caption: reply})
                .markdown()
                .markup(m => 
                    m.inlineKeyboard([
                        m.callbackButton('← Prev 10', 'prev'),
                        m.callbackButton('Next 10 →', 'next')
                    ])
                    )
                )
        } catch (e) {
            console.error(e)
            ctx.reply(e.response.statusText)
        }
    } else {
        ctx.reply('API key is not set, please set one with /setkey command')
    }
})

bot.action('next', ctx => {
    ctx.answerCbQuery(`getting 10 next`)
})


bot.action('prev', ctx => {
    ctx.answerCbQuery(`getting 10 prev`)
})


module.exports = bot
