import { Base64 } from "js-base64";

const product = (iterables, repeat) => {
    const copies = [];
    for (let i = 0; i < repeat; i++) {
        copies.push(iterables.slice());
    }

    return copies.reduce(function tl(accumulator, value) {
        const tmp = [];
        accumulator.forEach(function (a0) {
            value.forEach(function (a1) {
                tmp.push(a0.concat(a1));
            });
        });
        return tmp;
    }, [[]]);
}

export const decodeUrl = (data) => {
    const Buffer = require('buffer/').Buffer;

    const trashList = ["@", "#", "!", "^", "$"];
    let decodedString = data.replace("#2", "").split("//_//").join("")

    for (let i = 2; i < 4; i++) {
        const combos = product(trashList, i);

        for (let i = 0; i < combos.length; i++) {
            let chars = Buffer.from(combos[i].join(''), 'utf8');
            const encoded = Base64.encode(chars.toString());

            if (decodedString.includes(encoded)) {
                decodedString = decodedString.replaceAll(encoded, '');
            }
        }
    }

    decodedString += "==";

    return Buffer.from(decodedString.toString('utf8'), 'base64').toString('utf8');
}