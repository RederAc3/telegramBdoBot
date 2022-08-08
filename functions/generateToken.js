import axios from "axios";
import { domain } from "../config.js";
import getEupId from './getEupId.js';
import 'dotenv/config';

const { CLIENT_ID_KEY, CLIENT_SECRET_KEY } = process.env;

const generateToken = async () => {
    
    try {
        let config = {
            accept: "application/json",
            ContentType: "application/json"
        };
        
        let data = {
            eupId: await getEupId(CLIENT_ID_KEY, CLIENT_SECRET_KEY),
            clientId: CLIENT_ID_KEY,
            clientSecret: CLIENT_SECRET_KEY
        };
        
        const response = await axios.post(`${domain}/api/WasteRegister/v1/Auth/generateEupAccessToken`, data, config);
        return response.data;
        
    } catch (err) {
        console.log("[ generateToken ] - ", err.message);
        throw err;
    };
}

export default generateToken;