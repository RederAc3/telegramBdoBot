import { Telegraf } from 'telegraf';

import saveFile from './functions/saveFile.js';
import print from './functions/print.js';
import approveCard from './functions/approveCard.js';
import plannedCard from './functions/plannedCard.js';
import generateConfirmation from './functions/generateConfirmation.js';
import generateToken from './functions/generateToken.js';
import generateConfirmationFile from './functions/generateConfirmationFile.js';

import 'dotenv/config';

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

const { TELEGRAM_TOKEN } = process.env;
const bot = new Telegraf(TELEGRAM_TOKEN);

let TOKEN, TOKEN_EXPIRY_TIME = 0, date, time;

bot.command("/create", async (ctx) => {
    const message = ctx.message.text;
    const args = message.split(" ");

    if (!TOKEN) {
        ctx.reply(`Zostałeś wylogowany! \n Aby się zalogować wyślij komendę /login`);
        return;
    }

    if (message === "/create") {
        ctx.reply("Nie podano danych !!! \n /create [ ilość ] [ rodzaj (złom, wióry) ] [ Nr.rej ] [ godzina ] [ data ] ");
        return;
    }

    let amound = args[1];
    let type = 0;
    let vehicleRegNumber = args[3];

    time = args[4];
    date = args[5];

    if (args[2] === "złom") type = 854;
    if (args[2] === "wióry") type = 647;

    console.log('=======-NOWA KARTA-=======');
    console.log(`Ilość: ${amound}`);
    console.log(`Kod odpadu: ${type === 0 ? "błąd" : type}`);
    console.log(`Godzina: ${time}`);
    console.log(`Data: ${date}`);
    console.log(`Nr.rej: ${vehicleRegNumber}`);
    console.log('==========================');

    const { kpoId } = await plannedCard(TOKEN, type, vehicleRegNumber, amound, date, time);
    if (!kpoId) {
        ctx.reply(`Błąd tworzenia karty`);
        return;
    }
    await ctx.reply(`ZAPLANOWANO KARTĘ o ID: \n${kpoId}`);

    const { ApproveStatus } = await approveCard(TOKEN, kpoId);
    if (ApproveStatus === 'error') {
        ctx.reply(`Błąd zatwierdzania karty`);
        return;
    }
    ctx.reply(`ZATWIERDZONO KARTĘ NR: \n${kpoId}`);

    const { generateConfirmationStatus } = await generateConfirmation(TOKEN, kpoId);
    if (generateConfirmationStatus === 'error') {
        ctx.reply(`Błąd generowania potwierdzenia`);
        return;
    }
    ctx.reply(`WYGENEROWANO POTWIERDZENIE KARTY ID: \n${kpoId}`);
    
    ctx.reply(`Aby wydrukować kartę:`);
    ctx.reply(`/print ${kpoId}`);
});

bot.command("/login", async (ctx) => {
    if (TOKEN_EXPIRY_TIME > Date.now()) {
        ctx.reply(`ZALOGOWANO!!! \n \nNowa karta - /create [ ilość ] [ rodzaj (złom, wióry) ] [ Nr.rej ] [ godzina ] [ data ] `);
        return;
    }

    try {
        const { AccessToken, ExpiresIn } = await generateToken();

        TOKEN = AccessToken;
        TOKEN_EXPIRY_TIME = ExpiresIn + Date.now();

        ctx.reply(`Zalogowano pomyślnie! \n \nNowa karta - /create [ ilość ] [ rodzaj (złom, wióry) ] [ Nr.rej ] [ godzina ] [ data ] `)

    } catch (err) {
        console.log('[ login ] - ', err.message);
        ctx.reply(`BŁĄD LOGOWANIA:\n${err.message}`);
    }
});

bot.command("/print", async (ctx) => {
    const message = ctx.message.text;
    const args = message.split(" ");

    if (!TOKEN) {
        ctx.reply(`Zostałeś wylogowany! \n Aby się zalogować napisz /login`);
        return;
    }

    let kpoId = args[1];
    
    ctx.reply(`Generowanie wydruku dla ID: ${kpoId}`);

    try {
        const { data } = await generateConfirmationFile(TOKEN, kpoId)
        let timeSave = '';
        if (time) {
            timeSave = `${time.split(":")[0]}-${time.split(":")[1]}`;
        }

        saveFile(
            data,
            `./pdf/BDO-${date || ''}-${timeSave || ''}_${kpoId}.pdf`,
            kpoId,
            print
        );
        ctx.reply(`Wydruk został zapisany w katalogu pdf i wysłany do drukarki`);

    } catch (err) {
        console.log('Błąd wydruku', err.message);
        ctx.reply(`Błąd wydruku: ${err.message}`);
    }
});

bot.start((ctx) => {
    ctx.reply("Witaj w BDO! \n \n Aby zalogować się wyślij komendę /login");
});

bot.launch();