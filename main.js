const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
require("dotenv").config();
const http = require('http');
const fetch = require('node-fetch');
const token = process.env.token;
const bot = new TelegramBot(token, { polling: true });
const path = require('path');
const request = require("request")
const hashFile = require('hash-file-cli')
const lineByLine = require('n-readlines');

function telegram_links(text) {
  let re = /t.me\//i;
  return re.test(text);
}
function whatapp_links(text) {
  let re = /Wa.me\//i;
  if(re.test(text)) return re.test(text);
  re = /api.whatsapp.com/i
  if(re.test(text)) return re.test(text);
  
}

function phone_numbers(text){
  let re = /05[0-9]{8}/;
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

function count_lines(text){
  try{
  const NumberOfLines = text.split(/\r\n|\r|\n/).length;
  return NumberOfLines
}catch(e){
  return
}
}

function insert_black_list(file,hash){
  fs.appendFile(file, `${hash}\n`, function (err) {
    
    
  })
}

const search_account = async (text)=>{
  return new Promise((resolve, reject) => {
  const data = fs.readFileSync('./account_blacklist.txt', 'UTF-8');
  const lines = data.split(/\r?\n/);
  
  lines.forEach((line) => {
    
    line = "@" + line ;
    if (line.length <= 1) return;  
    if(text.includes(line)) return result = resolve(true);  
})
return false
})
}

const download_images = async (msg,fileId) => {

  try{
    const download = async (url, path, callback) => {
        request.head(url, (err, res, body) => {
            request(url).pipe(fs.createWriteStream(path)).on('close', callback);
        });
    };
    
    const res = await fetch(
        `https://api.telegram.org/bot${process.env.token}/getFile?file_id=${fileId}`
    );
  
    const res2 = await res.json();
    const filePath = res2.result.file_path;
    const downloadURL = await `https://api.telegram.org/file/bot${process.env.token}/${filePath}`;
    await download(downloadURL, path.join(__dirname, `/images/${fileId}`), async function (){
      
      hashFile(path.join(__dirname, `/images/${fileId}`), function (err, hash) {
        insert_black_list('blacklist.txt',hash)
    })
    } 
    

  );

  }
  catch(e){
    
  }
}

const  search_in_file = async (file,hash)=>{
  return new Promise((resolve, reject) => {
  const data = fs.readFileSync('./blacklist.txt', 'UTF-8');
  const lines = data.split(/\r?\n/);
  lines.forEach((line) => {
    
    if(line == hash) return result = resolve(true);  
})
return false
})
}
const check_image = async (msg) => {
  
  try{
    const download = async (url, path, callback) => {
        request.head(url, (err, res, body) => {
            request(url).pipe(fs.createWriteStream(path)).on('close', callback);
        });
    };
    const fileId = msg.photo[0].file_id;
    const res = await fetch(
        `https://api.telegram.org/bot${process.env.token}/getFile?file_id=${fileId}`
    );
  
    const res2 = await res.json();
    const filePath = res2.result.file_path;
    const downloadURL = await `https://api.telegram.org/file/bot${process.env.token}/${filePath}`;
    await download(downloadURL, path.join(__dirname, `./test_images/${fileId}`), async function (){
      
      hashFile(path.join(__dirname, `./test_images/${fileId}`), function (err, hash) {
        const chatId = msg.chat.id;
        const M_ID = msg.message_id;
        search_in_file('blacklist.txt',hash).then(result =>{
          if(result) bot.deleteMessage(chatId, M_ID);
        })
        
    })
    } 
    

  );

  }
  catch(e){
    
  }
}

//send message
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const M_ID = msg.message_id;
  
  
  bot.getChatMember(msg.chat.id, msg.from.id).then(function(data) {
    if ((data.status == "creator") || (data.status == "administrator")){
       return 
    }else{
      const NumberOfLines = count_lines(msg.text)
        if (NumberOfLines > 50) bot.deleteMessage(chatId, M_ID) && create_file(msg.text) && bot.sendMessage(chatId,"message was deleted");
        if (telegram_links(msg.text)) bot.deleteMessage(chatId, M_ID) && bot.sendMessage(chatId,"message was deleted");
        if (whatapp_links(msg.text)) bot.deleteMessage(chatId, M_ID) && bot.sendMessage(chatId,"message was deleted");
        if (phone_numbers(msg.text)) bot.deleteMessage(chatId, M_ID) && bot.sendMessage(chatId,"message was deleted");
        if(search_account(msg.text).then(result =>{if(result) bot.deleteMessage(chatId,M_ID) && bot.sendMessage(chatId,"message was deleted")}));
    }
});
    
  
});

bot.onText(/ping kira/, (msg, match) => {
    bot.sendMessage(msg.chat.id,"pong")
    
});



bot.on('message', async(msg) => {
 
 
//msg.reply_to_message.photo[0].file_id
 const chatId = msg.chat.id;
 const M_ID = msg.message_id;
  

    
    bot.getChatMember(msg.chat.id, msg.from.id).then(function(data) {
      if ((data.status == "creator") || (data.status == "administrator")){
        return 
      }else{
        check_image(msg)
        
      }
  });

});

bot.onText(/\/(addi|ADDI)/, (msg, match) => {
  bot.getChatMember(msg.chat.id, msg.from.id).then(function(data) {
    if ((data.status == "creator") || (data.status == "administrator")){
      

  const chatId = msg.chat.id;
  const resp = match[1]; 
  const fileId = msg.reply_to_message.photo[0].file_id
  download_images(msg,fileId)
  bot.sendMessage(chatId,"added successfully")
}
});
});

bot.onText(/\/(addc|ADDC) (.+)/, (msg, match) => {
  const chatId = msg.chat.id;

  let account = match[2];

  
  bot.getChatMember(msg.chat.id, msg.from.id).then(function(data) {
    if ((data.status == "creator") || (data.status == "administrator")){
      account = account.toString().replace('@','')
      bot.sendMessage(chatId,`${account} was added to blacklist`) 
      
      insert_black_list('account_blacklist.txt',account)
    }
});
});


bot.onText(/\/(helpk|HELPK)/, (msg, match) => {
  const chatId = msg.chat.id;
  let fet = `المميزرات:\n`
  fet+= ` -حذف الرسائل التي تحتوي على روابط محموجوعات واتس اب او تيليقرام\n` 
  fet+= `-حذف الرسائل التي تحتوي على اكثر من 50 سطر\n`
  fet+=`-كل المميزات  لا تعمل مع المشرفين\n`
  fet+= `-حذف الصور التي في القائمة السوداء\n`
  let work = `طريقة الاستعمال:\n`
  let add_photo = `/addi لإضافة صورة الى القائمة السوداء \n`
  let add_account = `/addc اضافه حساب الى القائمة السدواء بحيث اي رسالة تحتوي على هذا الحساب يتم حذفها\n`
  let last = fet + work + add_photo + add_account
  bot.sendMessage(chatId,last)
  });

bot.onText(/kira start/, (msg, match) => {
  const chatId = msg.chat.id;
  let message = `
  -اول شي اذا جيت تبدأ بمجال اكتشاف الثغرات يفضل يكون عندك انقليزي اذا ماعندك ماعندك مشكله بس ممكن تواجهه مشاكل 

-في البدايه حاول تتعلم المواقع كيف تشتغل كيف الريقويست يصير و كيف تقدر تحدد ان اللي قدامك ثغرة او لا عدد الثغرات كثير جدا ماتقدر تحصيها كلها بس تقدر تعرف الاشهر 


-تعلم لغة برمجة الشبكات قواعد البيانات هذي كلها راح تفيدك بس ماهي مشروطة مقولة (المبرمج هكر و الهكر مبرمج) غير صحيحة تماما لأن بتلاقي هكرز كثير مايعرفون برمجة و لو المبرمج يعرف يخترق كان ما بيكون فيه ثغرات


-كيفية التعلم حاول كل يوم على الاقل تتعلم شي جديد لا تدخل على اكتشاف الثغرات علطول و ماعندك فهم كامل عشان ما تضيع وقتك و ممكن معنوياتك تطيح ف انصح قبل ما تدخل تجرب على لابات

1-portswigger

2.vulnweb.com

3.tryhackme 

فيه شي حلو دايم اسويه اني اشوف تقارير غيري و تقدر تشوفها من هذا الرابط

https://hackerone.com/hacktivity


الكتب اللي انصح فيها:
-real world bug hunter

بعض قنوات اللي انصح فيها

-stock

-Farah Hawa

-InsiderPhD

-Nahamsec

-Bugcrowd

-ابراهيم الحجازي

-cyber guy
بعد ما تخلص تقدر تبدأ تجرب تكتشف ثغرات و هذي بعض المنصات

-hackerone

-bugcrowd
  `
  
  // bugbounty -1001238149877

  if(chatId == -1001238149877){
  bot.sendMessage(chatId,message)
  }
});


