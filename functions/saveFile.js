import fs from "fs";

const saveFile = async (data, name, kpoId, callback) => {
    fs.writeFile("./pdf/BDO.pdf", data, "base64", (err) => {
        if (err) {
            console.log('[ saveFile ] - ', err.message);
            throw err;
        }
        
        fs.renameSync("./pdf/BDO.pdf", name, (err) => {
            if (err) {
                console.log('[ renameFile ] - ', err.message);
                throw err;
            }
        });
        callback ? callback(name) : null;

        console.log(`KPO ${kpoId} ZAPISANO JAKO PDF!`);
    });
};

export default saveFile;