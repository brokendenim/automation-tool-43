const config = {
    apiUrl: 'https://api.example.com',
    timeout: 5000,
    retries: 3,
};

const getConfig = (key) => {
    if (!key || typeof key !== 'string') {
        throw new Error('Invalid config key provided');
    }
    if (!(key in config)) {
        throw new Error('Config key does not exist');
    }
    return config[key];
};

const updateConfig = (updates) => {
    if (typeof updates !== 'object' || updates === null) {
        throw new Error('Updates must be an object');
    }
    Object.entries(updates).forEach(([key, value]) => {
        if (!(key in config)) {
            throw new Error(`Cannot update unknown config key: ${key}`);
        }
        config[key] = value;
    });
};

module.exports = { getConfig, updateConfig };