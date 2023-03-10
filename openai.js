const { BufferJSON, WA_DEFAULT_EPHEMERAL, downloadMediaMessage, generateWAMessageFromContent, proto, generateWAMessageContent, generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType } = require('@adiwajshing/baileys')
const fs = require('fs')
const util = require('util')
const chalk = require('chalk')
const { Configuration, OpenAIApi } = require("openai")
let setting = require('./key.json')
const { default: pino } = require('pino')
const logger = pino();
const { writeExifImg } = require("./lib/exif.js");
const { downloader } = require("./lib");
const { query } = require('express')
const fetch = require('node-fetch')

module.exports = sansekai = async (client, m, chatUpdate, store) => {
    try {
        var body = (m.mtype === 'conversation') ? m.message.conversation : (m.mtype == 'imageMessage') ? m.message.imageMessage.caption : (m.mtype == 'videoMessage') ? m.message.videoMessage.caption : (m.mtype == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (m.mtype == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (m.mtype == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.mtype == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (m.mtype === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : ''
        var budy = (typeof m.text == 'string' ? m.text : '')
        // var prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "/"
        var prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "/"
        const isCmd2 = body.startsWith(prefix)
        const command = body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase()
        const args = body.trim().split(/ +/).slice(1)
        const pushname = m.pushName || "No Name"
        const botNumber = await client.decodeJid(client.user.id)
        const itsMe = m.sender == botNumber ? true : false
        let text = q = args.join(" ")
        const arg = budy.trim().substring(budy.indexOf(' ') + 1)
        const arg1 = arg.trim().substring(arg.indexOf(' ') + 1)
        const url = args.length !== 0 ? args[0] : ''

        const from = m.chat
        const reply = m.reply
        const sender = m.sender
        const mek = chatUpdate.messages[0]

        const color = (text, color) => {
            return !color ? chalk.green(text) : chalk.keyword(color)(text)
        }

        // Group
        const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat).catch(e => { }) : ''
        const groupName = m.isGroup ? groupMetadata.subject : ''

        // Push Message To Console
        let argsLog = (budy.length > 30) ? `${q.substring(0, 30)}...` : budy

        if (setting.autoAI) {
            // Push Message To Console && Auto Read
            if (argsLog && !m.isGroup) {
                // client.sendReadReceipt(m.chat, m.sender, [m.key.id])
                console.log(chalk.black(chalk.bgWhite('[ LOGS ]')), color(argsLog, 'turquoise'), chalk.magenta('From'), chalk.green(pushname), chalk.yellow(`[ ${m.sender.replace('@s.whatsapp.net', '')} ]`))
            } else if (argsLog && m.isGroup) {
                // client.sendReadReceipt(m.chat, m.sender, [m.key.id])
                console.log(chalk.black(chalk.bgWhite('[ LOGS ]')), color(argsLog, 'turquoise'), chalk.magenta('From'), chalk.green(pushname), chalk.yellow(`[ ${m.sender.replace('@s.whatsapp.net', '')} ]`), chalk.blueBright('IN'), chalk.green(groupName))
            }
        } else if (!setting.autoAI) {
            if (isCmd2 && !m.isGroup) {
                console.log(chalk.black(chalk.bgWhite('[ LOGS ]')), color(argsLog, 'turquoise'), chalk.magenta('From'), chalk.green(pushname), chalk.yellow(`[ ${m.sender.replace('@s.whatsapp.net', '')} ]`))
            } else if (isCmd2 && m.isGroup) {
                console.log(chalk.black(chalk.bgWhite('[ LOGS ]')), color(argsLog, 'turquoise'), chalk.magenta('From'), chalk.green(pushname), chalk.yellow(`[ ${m.sender.replace('@s.whatsapp.net', '')} ]`), chalk.blueBright('IN'), chalk.green(groupName))
            }
        }

        if (setting.autoAI) {
            if (budy) {
                try {
                    if (setting.keyopenai === 'ISI_APIKEY_OPENAI_DISINI') return reply('Apikey belum diisi\n\nSilahkan isi terlebih dahulu apikeynya di file key.json\n\nApikeynya bisa dibuat di website: https://beta.openai.com/account/api-keys')
                    const configuration = new Configuration({
                        apiKey: setting.keyopenai,
                    });
                    const openai = new OpenAIApi(configuration);

                    const response = await openai.createCompletion({
                        model: "text-davinci-003",
                        prompt: budy,
                        temperature: 0.3,
                        max_tokens: 3000,
                        top_p: 1.0,
                        frequency_penalty: 0.0,
                        presence_penalty: 0.0,
                    });
                    m.reply(`${response.data.choices[0].text}\n\n`)
                } catch (err) {
                    console.log(err)
                    m.reply('Maaf, sepertinya ada yang error')
                }
            }
        }

        if (isCmd2 === '.sticker') {
            m.reply(msg.key.remoteJid, { sticker: { url: buffer } });
        }

        if (!setting.autoAI) {
            if (isCmd2) {
                switch (command) {
                    case 'ai':
                        try {
                            if (setting.keyopenai === 'ISI_APIKEY_OPENAI_DISINI') return reply('Apikey belum diisi\n\nSilahkan isi terlebih dahulu apikeynya di file key.json\n\nApikeynya bisa dibuat di website: https://beta.openai.com/account/api-keys')
                            if (!text) return reply(`Chat dengan AI.\n\nContoh:\n${prefix}${command} Apa itu resesi`)
                            const configuration = new Configuration({
                                apiKey: setting.keyopenai,
                            });
                            const openai = new OpenAIApi(configuration);

                            const response = await openai.createCompletion({
                                model: "text-davinci-003",
                                prompt: text,
                                temperature: 0.3,
                                max_tokens: 3000,
                                top_p: 1.0,
                                frequency_penalty: 0.0,
                                presence_penalty: 0.0,
                            });
                            m.reply(`${response.data.choices[0].text}\n\n`)
                        } catch (err) {
                            console.log(err)
                            m.reply('Maaf, sepertinya ada yang error')
                        }
                        break
                    case 'sticker':
                        await m.reply('Mohon tunggu ~ ...')
                        try {
                            let buffer = await downloadMediaMessage(m, "buffer", {}, { logger });
                            buffer = await writeExifImg(buffer, { packname: "Sticker", author: "@hendy29_" });
                            client.sendMessage(m.chat, { sticker: { url: buffer } });
                            console.log('Success create sticker!')
                        } catch (err) {
                            console.log(err)
                            m.reply('Maaf, sepertinya ada yang error')
                        }
                        break
                    case 'ytmp3':
                        await m.reply('Mohon tunggu ~ ...')
                        downloader.ytdl(url)
                            .then(async ({ result }) => {
                                if (Number(result.size.split(' MB')[0]) >= 50) {
                                    await m.reply('Ukuran Music Terlalu Besar!')
                                } else {
                                    await client.sendMessage(m.chat, { audio: { url: result.UrlMp3 }, mimetype: 'audio/mp4', ptt: true }, { url: `${result.UrlMp3}` })
                                    console.log('Success sending YouTube Audio!')
                                }
                            })
                            .catch(async (err) => {
                                console.error(err)
                                await m.reply('Maaf, sepertinya ada yang error!')
                            })
                        break
                    case 'ytdl':
                        await m.reply('Mohon tunggu ~ ...')
                        downloader.ytdl(url)
                            .then(async ({ result }) => {
                                if (Number(result.size.split(' MB')[0]) >= 50) {
                                    await m.reply('Ukuran Music Terlalu Besar!')
                                } else {
                                    const responses = await fetch(result.UrlVideo)
                                    const buffer = await responses.buffer()
                                    fs.writeFileSync(`./temp/${m.chat}_yt.mp4`, buffer)
                                    await client.sendMessage(m.chat, {
                                        video: fs.readFileSync(`./temp/${m.chat}_yt.mp4`),
                                        caption: result.title,
                                        gifPlayback: true
                                    })
                                    console.log('Success sending YouTube Video!')
                                }
                            })
                            .catch(async (err) => {
                                console.error(err)
                                await m.reply('Maaf, sepertinya ada yang error!')
                            })
                        break
                    case 'ttdl':
                        await m.reply('Mohon tunggu ~ ...')
                        downloader.ttdl(url)
                            .then(async ({ result }) => {
                                if (Number(result.size.split(' MB')[0]) >= 50) {
                                    await m.reply('Ukuran Music Terlalu Besar!')
                                } else {
                                    const responses = await fetch(result.video)
                                    const buffer = await responses.buffer()
                                    fs.writeFileSync(`./temp/${m.sender}-tiktokdl.mp4`, buffer)
                                    await client.sendMessage(m.chat, {
                                        video: fs.readFileSync(`./temp/${m.sender}-tiktokdl.mp4`),
                                        caption: 'Nih Bossku ~...',
                                    })
                                    console.log('Success sending Tiktok Video!')
                                }
                            })
                            .catch(async (err) => {
                                console.error(err)
                                await m.reply('Maaf, sepertinya ada yang error!')
                            })
                        break
                    case 'play':
                        await m.reply('Mohon tunggu, sedang mencari lagu ~ ...')
                        downloader.ytSearch(q)
                            .then(async ({ result }) => {
                                if (Number(result.size.split(' MB')[0]) >= 50) {
                                    await m.reply('Ukuran Music Terlalu Besar!')
                                } else {
                                    await client.sendMessage(m.chat, { audio: { url: result.mp3 }, mimetype: 'audio/mp4' }, { url: `${result.mp3}` })
                                    console.log('Success sending YouTube Audio!')
                                }
                            })
                            .catch(async (err) => {
                                console.error(err)
                                await m.reply('Maaf, sepertinya ada yang error!')
                            })
                        break
                    case 'listsurah':
                        await m.reply('Mohon tunggu ~ ...')
                        downloader.listSurah()
                            .then(async ({ result }) => {
                                let list = '*?????? ??? AL-QUR\'AN ??? ??????*\n\n'
                                for (let i = 0; i < result.list.length; i++) {
                                    list += `${result.list[i]}\n\n`
                                }
                                await m.reply(list)
                                console.log('Success sending Al-Qur\'an list!')
                            })
                            .catch(async (err) => {
                                console.error(err)
                                await m.reply('Maaf, sepertinya ada yang error!')
                            })
                        break
                    case 'chord':
                        await m.reply('Mohon tunggu ~ ...')
                        downloader.chord(q)
                            .then(async ({ result }) => {
                                const pesan = `Chord Guitar ${q}!\n\n`
                                const pesan1 = result.result
                                await m.reply(pesan1)
                                console.log(`Success sending Chord Guitar ${q}!`)
                            })
                            .catch(async (err) => {
                                console.error(err)
                                await m.reply('Maaf, sepertinya ada yang error!')
                            })
                        break
                    default: {

                        if (isCmd2 && budy.toLowerCase() != undefined) {
                            if (m.chat.endsWith('broadcast')) return
                            if (m.isBaileys) return
                            if (!(budy.toLowerCase())) return
                            if (argsLog || isCmd2 && !m.isGroup) {
                                // client.sendReadReceipt(m.chat, m.sender, [m.key.id])
                                console.log(chalk.black(chalk.bgRed('[ ERROR ]')), color('command', 'turquoise'), color(argsLog, 'turquoise'), color('tidak tersedia', 'turquoise'))
                            } else if (argsLog || isCmd2 && m.isGroup) {
                                // client.sendReadReceipt(m.chat, m.sender, [m.key.id])
                                console.log(chalk.black(chalk.bgRed('[ ERROR ]')), color('command', 'turquoise'), color(argsLog, 'turquoise'), color('tidak tersedia', 'turquoise'))
                            }
                        }
                    }
                }

            }
        }

    } catch (err) {
        m.reply(util.format(err))
    }
}


let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
})
