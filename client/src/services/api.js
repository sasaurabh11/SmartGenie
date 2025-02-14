import axios from 'axios';

const url = import.meta.env.VITE_BACKEND_URL;

export const loginUser = async (data) => {
    try {
        const response = await axios.post(`${url}/api/v1/user/login`, data);
        return response.data;
    } catch (error) {
        console.error('error in addUser API', error.message)
        return error.response.data;
    }
}

export const signupUser = async (data) => {
    try {
        const response = await axios.post(`${url}/api/v1/user/register`, data);
        console.log('response', response)
        return response.data;
    } catch (error) {
        console.error('error in addUser API', error.message)
        return error.response.data;
    }
}

export const loadCreditsData = async (token) => {
    try {
        console.log('token', token)
        const response = await axios.get(`${url}/api/v1/user/credits`, {
            headers: {
                token
            }
        });

        return response.data

    } catch (error) {
        console.error('error in loadCreditsData API', error.message)
    }
}

export const generateImageApi = async (prompt, token) => {
    try {
        const response = await axios.post(`${url}/api/v1/image/generate-image`, { prompt }, {
            headers: {
                token
            }
        });
        console.log('response', response.data)
        return response.data;
    } catch (error) {
        console.error('error in generateImage API', error.message)
        return error.response.data;
    }
}

export const paymentGateway = async (planId, token) => {
    try {
        
        const response = await axios.post(`${url}/api/v1/user/pay-razor`, {planId}, {headers: {token}});
        return response.data;

    } catch (error) {
        console.error('error in payment API', error.message)
        return error.response.data;
    }
}

export const verifyRazor = async (data, token) => {
    try {

        const response = await axios.post(`${url}/api/v1/user/verify-razor`, data, {headers: {token}});
        return response.data;
        
    } catch (error) {
        console.error('error in verifyRazor API', error.message)
        return error.response.data
    }
}

export const generateAssestsForVideo = async (URI) => {
    try {
        const response = await axios.post(`${url}/api/v1/website/summarize?url=${URI}`);
        return response.data
    } catch (error) {
        console.error('error in assestsGeneration API', error.message)
        return error.response.data
    }
}

export const prepareVideo = async (path) => {
    try {
        console.log("path", path)
        const encodedPath = encodeURIComponent(path.storiesDir);
        console.log(`${url}/api/v1/website/build-video/?dir=${encodedPath}`)
        const response = await axios.get(`${url}/api/v1/website/build-video/?dir=${encodedPath}`);

        return response.data
    } catch (error) {
        console.error('error in videoGeneration API', error.message)
        return error.response.data
    }
}