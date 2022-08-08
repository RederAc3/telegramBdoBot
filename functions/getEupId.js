import axios from 'axios';
import { domain } from '../config.js'

const getEupId = async ( ClientId, ClientSecret ) => {

    let config = {
        headers: {
            accept: "application/json",
            ContentType: "application/json",
        }
    }
    const data = {
        ClientId,
        ClientSecret,
        PaginationParameters: {
            Order: {
                IsAscending: true,
            },
            Page: {
                Index: 0,
                Size: 50
            }
        }
    }
// console.log(data)
    try {
        const response = await axios.post(`${domain}/api/WasteRegister/v1/Auth/getEupList`, data, config)
        const { eupId } = response.data.items[0]
        return eupId

    } catch (err) {
        console.log(`[ getEupId ] - ${err.message}`)
        throw new Error('Błędne klucze API lub domena w config.js')
    }
}

export default getEupId;