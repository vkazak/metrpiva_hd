const trashList = [
    '//_//QCMhQEBAIyMkJEBA', // @#!@@@##$$@@
    '//_//JCQkIyMjIyEhISEhISE=', // $$$####!!!!!!!
    '//_//Xl4jQEAhIUAjISQ=', // ^^#@@!!@#!$
    '//_//Xl5eXl5eIyNA', // ^^^^^^##@
    '//_//QCFeXiFAI0BAJCQkJCQ=' // @!^^!@#@@$$$$$
];

// this function removes artifacts from base64 file specific for voidboost
export const decodeUrl = (data) => {
    let decodedData = data.slice(0);
    decodedData = decodedData.replace('#2', '');

    let atLeastOneRemoved = true;
    while (atLeastOneRemoved) {
        atLeastOneRemoved = false;

        for (const trashItem of trashList) {
            if (decodedData.includes(trashItem)) {
                decodedData = decodedData.replaceAll(trashItem, '');
                atLeastOneRemoved = true;
            }
        };
    }

    return atob(decodedData);
}