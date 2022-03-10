const fs = require("fs");

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

module.exports = { saveFile };