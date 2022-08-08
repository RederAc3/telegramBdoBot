import axios from "axios";
import { domain } from "../config.js";
import 'dotenv/config'

const {
    CARRIER_COMPANY_ID,
    RECIEVER_COMPANY_ID,
    RECIEVER_EUP_ID,
} = process.env;

const plannedCard = async (TOKEN, type, vehicleRegNumber, amound, date, time) => {

    const config = {
        headers: {
            accept: "application/json",
            ContentType: "application/json",
            Authorization: `Bearer ${TOKEN}`,
        },
    };

    let data = {
        CarrierCompanyId: CARRIER_COMPANY_ID,
        ReceiverCompanyId: RECIEVER_COMPANY_ID,
        ReceiverEupId: RECIEVER_EUP_ID,
        WasteCodeId: type,
        VehicleRegNumber: vehicleRegNumber,
        WasteMass: parseFloat(amound),
        PlannedTransportTime: `${date}T${time}:00.000Z`,
        WasteCodeExtended: false,
        HazardousWasteReclassification: false,
        IsWasteGenerating: false
    };

    try {
        const response = await axios.post(`${domain}/api/WasteRegister/WasteTransferCard/v1/Kpo/create/plannedcard`, data, config);
        return response.data;

    } catch (err) {
        console.log('[ plannedCard ] - ', err.message);
        return { status: 'error', message: err.message };
    }
}

export default plannedCard;