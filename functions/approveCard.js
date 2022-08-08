import axios from "axios";
import { domain } from "../config.js";

const approveCard = async (TOKEN, kpoId) => {

    const config = {
        headers: {
            accept: "application/json",
            ContentType: "application/json",
            Authorization: `Bearer ${TOKEN}`
        }
    };

    try {
        await axios.put(`${domain}/api/WasteRegister/WasteTransferCard/v1/Kpo/approve`, { kpoId }, config)
        return { ApproveStatus: 'success' };

    } catch (err) {
        console.log('[ approveCard ] - ', err.message);
        return { ApproveStatus: 'error', message: err.message };
    }
}

export default approveCard;