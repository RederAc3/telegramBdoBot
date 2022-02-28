require("dotenv").config();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
const fs = require("fs");

const { exec } = require("child_process");
const { default: axios } = require("axios");
const { Telegraf } = require("telegraf");

const {
    TELEGRAM_TOKEN,
    SERVER_URL,
    API_URL_LOGIN,
    API_URL_GET_TOKEN,
    CLIENT_ID_KEY,
    CLIENT_SECRET_KEY,
    CARRIER_COMPANY_ID,
    RECIEVER_COMPANY_ID,
    RECIEVER_EUP_ID,
    EUP_ID
} = process.env;
const bot = new Telegraf(TELEGRAM_TOKEN);

let EUP_ID = "";
let COMPANY_ID = "";
let TOKEN;
let TOKEN_TYPE = "Bearer";
let TOKEN_TIME = 0;

const printBdo = (file) => {
    exec(`lp ${file}`, (error, stdout, stderr) => {
        if (error) {
            console.error(error);
            return;
        }

        if (stderr) {
            console.error(stderr);
            return;
        }

        console.log(stdout);
    });
};

let date;
let time;

const saveFile = async (data, name, kpoId, callback) => {
    fs.writeFile("./pdf/BDO.pdf", data, "base64", (error) => {
        if (error) {
            throw error;
        } else {
            console.log("base64 saved!");
            fs.renameSync("./pdf/BDO.pdf", name, (error) => {
                if (error) {
                    throw error;
                } else {
                    console.log("Nazwa zmieniona!");
                }
            });
            callback ? callback(name) : "";
            console.log("Wydrukowano!");
        }
    });
};

bot.command("/create", async (ctx) => {
    let amound, type, vehicleRegNumber;
    if (ctx.message.text == "/create") {
        ctx.reply(
            "Nie podano danych !!! \n /create [ ilość ] [ rodzaj (złom, wióry) ] [ Nr.rej ] [ godzina ] [ data ] "
        );
    } else if (TOKEN) {
        let amound = ctx.message.text.split(" ")[1];
        let type =
            ctx.message.text.split(" ")[2] === "złom"
                ? "854"
                : ctx.message.text.split(" ")[2] === "wióry"
                    ? "647"
                    : "";
        let vehicleRegNumber = ctx.message.text.split(" ")[3];
        time = ctx.message.text.split(" ")[4];
        date = ctx.message.text.split(" ")[5];
        console.log(`Ilość: ${amound}`);
        console.log(`Ilość: ${type === "" ? "błąd" : type}`);
        console.log(`Ilość: ${time}`);
        console.log(`Ilość: ${date}`);
        console.log(ctx.message.text);
        console.log("time " + time);
        console.log("date " + date);
        let config = {
            headers: {
                accept: "application/json",
                ContentType: "application/json",
                Authorization: `${TOKEN_TYPE} ${TOKEN}`,
            },
        };

        let data = {
            carrierCompanyId: CARRIER_COMPANY_ID,
            receiverCompanyId: RECIEVER_COMPANY_ID,
            receiverEupId: RECIEVER_EUP_ID,
            wasteCodeId: parseInt(type),
            vehicleRegNumber: vehicleRegNumber,
            wasteMass: parseFloat(amound),
            plannedTransportTime: `${date}T${time}:00.000Z`, 
            certificateNumberAndBoxNumbers: "", // nie dotyczy
            additionalInfo: "", // nie dotyczny
            wasteCodeExtended: false, //nie dotyczy
            wasteCodeExtendedDescription: "", //nie dotyczy
            hazardousWasteReclassification: false, //nie dotyczy
            hazardousWasteReclassificationDescription: "", //nie dotyczny
            isWasteGenerating: false,
        };

        // PLANOWANA
        await axios.post("https://rejestr-bdo.mos.gov.pl/api/WasteRegister/WasteTransferCard/v1/Kpo/create/plannedcard", data, config)
            .then((res) => {
                ctx.reply(`ZAPLANOWANO KARTĘ o ID: ${res.data.kpoId}`);
                ctx.reply(`${res.data.kpoId}`);
                let kpoID = res.data.kpoId;
                // PLANOWANA > ZATWIERDZONA
                axios.put("https://rejestr-bdo.mos.gov.pl/api/WasteRegister/WasteTransferCard/v1/Kpo/approve", { kpoId: kpoID }, config)
                    .then((res) => {
                        ctx.reply(`ZATWIERDZONO KARTĘ NR: ${kpoID} i nr ${res.data.cardNumber}`);
                        // ZAWTWIERDOZONA > WYGENEROWANO POTWIERDZENIE
                        axios.put("https://rejestr-bdo.mos.gov.pl/api/WasteRegister/WasteTransferCard/v1/Kpo/generateconfirmation", { kpoId: kpoID }, config)
                            .then((res) => {
                                ctx.reply(`WYGENEROWANO POTWIERDZENIE KARTY ID: ${kpoID} i nr ${res.data.cardNumber}`);
                            })
                            .catch((err) => {
                                console.log(err);
                                ctx.reply(`BŁĄD GENEROWANIA POTWIERDZENIA KARTY ID: ${kpoID} i nr ${res.data.cardNumber}`);
                            });
                    })
                    .catch((err) => {
                        ctx.reply(`BŁĄD ZATWIERDZENIA KARTY NR: ${kpoID}`);
                        console.log(err);
                    })
            })
            .catch((err) => {
                let error = JSON.stringify(err);
                ctx.reply(`ERROR PLANNED ${err.message}`);

                console.error(error);
            });
    } else {
        ctx.reply(`Zostałeś wylogowany! \n Aby się zalogować napisz /login`);
    }
});

bot.command("/login", (ctx) => {
    let config = {
        accept: "application/json",
        ContentType: "application/json",
    };

    if (TOKEN_TIME < Date.now()) {
        axios.post( API_URL_GET_TOKEN,
                {
                    eupId: EUP_ID,
                    clientId: CLIENT_ID_KEY,
                    clientSecret: CLIENT_SECRET_KEY,
                },
                config
            )
            .then((res) => {
                console.log(res.data.AccessToken);
                TOKEN = res.data.AccessToken;
                TOKEN_TYPE = res.data.TokenType;
                TOKEN_TIME = res.data.ExpiresIn + Date.now();
                console.log(
                    `teraz: ${Date.now()} \n koniec: ${res.data.ExpiresIn + Date.now()}`
                );
            })
            .then(ctx.reply(`ZALOGOWANO !!! \n \n Nowa karta - /createBdo`));
    } else if (TOKEN_TIME > Date.now()) {
        ctx.reply(`ZALOGOWANO!!! \n \n Nowa karta - /createBdo`);
    }
});

bot.command("/print", (ctx) => {
    if (TOKEN) {
        let kpoId = ctx.message.text.split(" ")[1];
        let config = {
            headers: {
                accept: "application/json",
                ContentType: "application/json",
                Authorization: `${TOKEN_TYPE} ${TOKEN}`,
            },
        };

        console.log("Generowanie wydruku dla ID: " + kpoId);
        axios
            .get(
                `https://rejestr-bdo.mos.gov.pl/api/WasteRegister/DocumentService/v1/kpo/confirmation?KpoId=${kpoId}`,
                config
            )
            .then((res) => {

                // ZAPISYWANIE BDO DO PLIKU
                console.log("time2 " + time);
                console.log("date2 " + date);
                let timeSave = `${time.split(":")[0]}-${time.split(":")[1]}`;
                saveFile(
                    res.data,
                    `./pdf/BDO-${date}-${timeSave}_${kpoId}.pdf`,
                    kpoId,
                    printBdo
                );
            })
            .catch((err) => {
                let error = JSON.stringify(err);
                ctx.reply(`ERROR: ${error}`);
                console.error(err);
            });
    } else {
        ctx.reply(`Zostałeś wylogowany! \n Aby się zalogować napisz /login`);
    }
});

bot.start((ctx) => {
    throw new Error("ERROR START");
});

bot.launch();
