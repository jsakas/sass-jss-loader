const nestSelectors = (obj, selector = ':', prefix = '&') => {
    console.log('nestSelectors', obj);
    const ret = {};
    for (let k in obj) {
        if (typeof k === 'string') {
            const arr = k.split(selector);
            let prop = arr.shift();

            console.log('The prop is', prop);

            if (prefix && prop.includes(prefix)) {
                prop = `${prop}${selector}${arr.shift()}`;
            }

            let next = {
                [`${prefix}${prefix && selector}${arr.join(selector)}`.trim()]: obj[k]
            }

            ret[prop.trim()] = arr.length > 1
                ? nestSelectors(next, selector, prefix)
                : next;

        } else {
            ret[k] = obj[k];
        }
    }
    return ret;
}

module.exports = nestSelectors;
