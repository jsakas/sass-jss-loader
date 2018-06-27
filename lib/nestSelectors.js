const nestSelectors = (obj, selector = ':', prefix = '&') => {
    // console.log('nest selectors with selector', selector)
    const ret = {};
    for (let k in obj) {
        if (typeof k === 'string') {
            // console.log('the key is', k);
            const arr = k.split(selector); //.map(i => i.trim());
            // console.log('the array is', arr);
            let prop = arr.shift();

            if (prefix && prop.includes(prefix)) {
                prop = `${prop}${selector}${arr.shift()}`;
            }

            let next;
            if (arr.length > 0) {
                next = {
                    [`${prefix}${prefix && selector}${arr.join(selector)}`.trim()]: obj[k]
                }
                ret[prop.trim()] = {
                    ...ret[prop.trim()],
                    ...nestSelectors(next, selector, prefix)   
                };
            } else {
                ret[k] = {
                    ...ret[k],
                    ...obj[k]
                };
            }
        } else {
            ret[k] = {
                ...ret[k],
                ...obj[k]
            };
        }
    }
    return ret;
}

module.exports = nestSelectors;
