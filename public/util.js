class Utilities {
    constructor() {

    }

    get createUUID() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
    }

    getData(key) {
        // const localData = localStorage.getItem(`pb_${key}`);
        const localData = localStorage.getItem(key);
        return localData ? JSON.parse(localData) : [];
    }

    saveData(key, data) {
        // localStorage.setItem(`pb_${key}`, JSON.parse(data));
        localStorage.setItem(key, JSON.parse(data));
    }
}

const util = new Utilities();