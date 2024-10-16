const telegramApi = require('node-telegram-bot-api');
const { gameOptions, againOptions } = require('./options');
const token = '7674830754:AAGxewoakagt3WeN5-kfAuav-3gGx7eVOaQ';
const bot = new telegramApi(token, {polling: true})

const chats = {};
const msgPlayers = {};

bot.setMyCommands([
    {command: '/start', description: 'Начальное приветствие'},
    {command: '/info', description: 'Узнать информацию о себе'},
    {command: '/game', description: 'Сыграть в игру отгадай число'}
])
async function startGame(chatId) {
    await bot.sendMessage(chatId, 'Сейчас я загадаю цифру от 0 до 9, а ты должен ее отгадать');
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    return bot.sendMessage(chatId, 'Отгадывай число', gameOptions);
}
function start(){
    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
        
        if(text === "/start"){
            await bot.sendMessage(chatId, 'Привет бро');
            return bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/be1/98c/be198cd5-121f-4f41-9cc0-e246df7c210d/40.webp') 
        }
        if(text === "/info"){
            let lastName;
            if(msg.from.last_name == null)
                lastName = '';
            else
                lastName = msg.from.last_name;

            return bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name} ${lastName}`);
        }
        if(text === '/game'){
            msgPlayers[chatId] = msg.message_id;
            return startGame(chatId);
        }
        return bot.sendMessage(chatId, 'Команда не найдена');
        
    })
    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if(data == chats[chatId]){
            bot.deleteMessage(chatId, msg.message.message_id);
            return bot.sendMessage(chatId, `Ты отгадал цифру: ${chats[chatId]}`, againOptions);
        }
        if(data === '/again'){
            await bot.deleteMessage(chatId, msg.message.message_id);
            await bot.deleteMessage(chatId, msg.message.message_id - 2);
            return startGame(chatId);
        }
        if(data === '/stopGame'){
            await bot.deleteMessage(chatId, msg.message.message_id);
            await bot.deleteMessage(chatId, msg.message.message_id - 2);
            return bot.deleteMessage(chatId, msgPlayers[chatId]);
        }
        else{
            bot.deleteMessage(chatId, msg.message.message_id);
            return bot.sendMessage(chatId, `Ты не отгадал, бот загадал: ${chats[chatId]}`, againOptions);
        }
    })
}
start();