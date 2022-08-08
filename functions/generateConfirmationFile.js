import axios from "axios";
import { domain } from "../config.js";

const generateConfirmationFile = async (TOKEN, kpoId) => { 

    let config = {
        headers: {
            accept: "application/json",
            ContentType: "application/json",
            Authorization: `Bearer ${TOKEN}`,
        },
    };

    try {
        const response = await axios.get(`${domain}/api/WasteRegister/DocumentService/v1/kpo/confirmation?KpoId=${kpoId}`, config);
        return response;
        
    } catch (err) {
        console.log('[ generateConfirmationFile ] - ', err.message);
        return err;
    }
}; 

export default generateConfirmationFile;