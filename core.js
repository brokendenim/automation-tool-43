(async function fetchWithRetry(url, options = {}, retries = 3, backoff = 300) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (err) {
        if (retries > 1) {
            console.warn(`Retrying... Attempts left: ${retries - 1}`);
            await new Promise(res => setTimeout(res, backoff));
            return fetchWithRetry(url, options, retries - 1, backoff * 2);
        } else {
            console.error('Max retries reached.');
            throw err;
        }
    }
})()