const { exec } = require("child_process");

const print = (file) => {
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

module.exports = { print }