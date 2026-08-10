// Improved performance by batching requests
const axios = require('axios');

class RequestHandler {
    constructor(urls) {
        this.urls = urls;
    }

    async fetchDataInBatches(batchSize) {
        const result = [];
        for (let i = 0; i < this.urls.length; i += batchSize) {
            const batch = this.urls.slice(i, i + batchSize);
            const responses = await Promise.all(batch.map(url => this.makeRequest(url)));
            result.push(...responses);
        }
        return result;
    }

    async makeRequest(url) {
        try {
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error(`Error fetching ${url}:`, error);
            return null;
        }
    }
}

module.exports = RequestHandler;
