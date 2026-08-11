function generateRandomString(length) {
    return Array.from({ length }, () => Math.floor(Math.random() * 36).toString(36)).join('');
}

function debounce(fn, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
    };
}

function throttle(fn, limit) {
    let lastCall;
    let lastFunc;
    return function (...args) {
        const context = this;
        const now = Date.now();
        if (lastCall && (now - lastCall) < limit) {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(() => {
                lastCall = now;
                fn.apply(context, args);
            }, limit - (now - lastCall));
        } else {
            lastCall = now;
            fn.apply(context, args);
        }
    };
}

function parseQueryString(url) {
    const queryString = url.split('?')[1];
    return queryString ? Object.fromEntries(new URLSearchParams(queryString)) : {};
}

module.exports = { generateRandomString, debounce, throttle, parseQueryString };