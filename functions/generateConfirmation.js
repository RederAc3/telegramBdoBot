import axios from "axios";
import { domain } from "../config.js";

const generateConfirmation = async (TOKEN, kpoId) => {

    const config = {
        headers: {
            accept: "application/json",
            ContentType: "application/json",
            Authorization: `Bearer ${TOKEN}`,
        },
    };

    try {
        await axios.put(`${domain}/api/WasteRegister/WasteTransferCard/v1/Kpo/generateconfirmation`, { kpoId }, config)
        return { generateConfirmationStatus: 'success' };

    } catch (err) {
        console.log('[ generateConfirmation ] - ', err.message);
        return { generateConfirmationStatus: 'error', message: err.message };
    }
}

export default generateConfirmation;