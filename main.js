const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
require("dotenv").config();

const token = process.env.token;
const bot = new TelegramBot(token, { polling: true });

function telegram_links(text) {
  let re = /t.me\//;
  return re.test(text);
}
function whatapp_links(text) {
  let re = /Wa.me\/201270189101/;
  return re.test(text);
}
function create_new_line() {
  let data =
    "----------------------------New Message------------------------------------------";
  fs.appendFile("log.log", data, function (err) {
    if (err) throw err;
  });
}
function create_file(text) {
  fs.appendFile("log.log", text, function (err) {
    if (err) throw err;

    create_new_line();
  });
}


bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const M_ID = msg.message_id;
  
  
  bot.getChatMember(msg.chat.id, msg.from.id).then(function(data) {
    if ((data.status == "creator") || (data.status == "administrator")){
        return 
    }else{
        const NumberOfLines = msg.text.split(/\r\n|\r|\n/).length;
        if (NumberOfLines > 50) bot.deleteMessage(chatId, M_ID) && create_file(msg.text);
        if (telegram_links(msg.text)) bot.deleteMessage(chatId, M_ID);
        if (whatapp_links(msg.text)) bot.deleteMessage(chatId, M_ID);
    }
});
    
  
});

bot.onText(/ping kira/, (msg, match) => {
    bot.sendMessage(msg.chat.id,"pong")

});
/*
bot.onText(/ip (.+)/, (msg, match) => {
    const IP = match[1]
    
});
*/
