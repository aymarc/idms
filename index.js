'use strict'
/*
    Description: Index DB Management script (IDBMS), is a light weight wrapper for indexdb.
    facilitating use of index db operation amd aiming to reduce repetition in the 
    process of using Index DB.
*/


export default class IDBMS {

    #dbName = "alaanu";
    #storeName = "iye";
    #reportType = {
        info: "info",
        error: "error",
        dbError: "dbError"
    };
    #action = {
        set: "set",
        get: "get",
        del: "del"
    };

    constructor(databaseName, storeName) {
        this.#dbName = databaseName || this.#dbName;
        this.#storeName = storeName || this.#storeName;
        this.#createDatabase();
    }

    async getItem(key) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.#dbName, 1);
            request.onsuccess = (event) => {
                return this.#operate(event, this.#action.get, this.#storeName, key, resolve, reject);
            };
            request.onerror = (event) => {
                reject("Database error: " + event.target.errorCode);
            };
        });
    }

    async setItem(key, data, extraOperationCb = null) { // Added 'data' parameter
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.#dbName, 1);
            request.onsuccess = async (event) => {
                let newData = data;
                if (extraOperationCb) {
                    newData = await extraOperationCb(data);
                }
                this.#operate(event, this.#action.set, this.#storeName, key, resolve, reject, newData);
            };
            request.onerror = (event) => {
                reject("Database error: " + event.target.errorCode);
            };
        });
    }

    async delItem(key) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.#dbName, 1);
            request.onsuccess = (event) => {
                return this.#operate(event, this.#action.del, this.#storeName, key, resolve, reject);
            };
            request.onerror = (event) => {
                reject("Database error: " + event.target.errorCode);
            };
        });
    }

    // Create database
    #createDatabase() {
        const request = indexedDB.open(this.#dbName, 1);
        request.onupgradeneeded = this.#onUpgradeCallback.bind(this);
        request.onerror = (event) => {
            this.#report({ type: this.#reportType.dbError });
        };
    }

    // Add, retrieve, and delete data from store
    #operate(event, action, storeName, key, resolve, reject, data = null) {
        if (!action) {
            return;
        }
        const db = event.target.result;
        const transaction = db.transaction([storeName], action === this.#action.get ? "readonly" : "readwrite");
        const objectStore = transaction.objectStore(storeName);
        let dbRequest = null;

        switch (action) {
            case this.#action.get:
                if (!key) {
                    reject("No key provided");
                    return;
                }
                dbRequest = objectStore.get(key);
                break;
            case this.#action.set:
                if (!data) {
                    reject("No data provided");
                    return;
                }
                dbRequest = objectStore.put({ id: key, data: data });
                break;
            case this.#action.del:
                dbRequest = objectStore.delete(key);
                break;
        }

        dbRequest.onsuccess = (event) => {
            switch (action) {
                case this.#action.get:
                    resolve(dbRequest.result ? dbRequest.result.data : null);
                    break;
                case this.#action.set:
                case this.#action.del:
                    resolve(true);
                    break;
            }
        };

        dbRequest.onerror = () => {
            switch (action) {
                case this.#action.get:
                    reject("Unable to get data.");
                    break;
                case this.#action.set:
                    reject("Unable to set data.");
                    break;
                case this.#action.del:
                    reject("Unable to delete data.");
                    break;
            }
        };
    }

    // Delete store
    deleteStore(storeName) {
        const request = indexedDB.open(this.#dbName, 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (db.objectStoreNames.contains(storeName)) {
                db.deleteObjectStore(storeName);
                this.#report({ msg: "Store deleted: " + storeName });
            } else {
                this.#report({ msg: "Store does not exist: " + storeName, type: this.#reportType.info });
            }
        };
    }

    // For reporting
    #report({ msg = "", type = this.#reportType.info }) { // Default type to 'info'
        if (type === this.#reportType.error || type === this.#reportType.dbError) {
            console.error(this.#dbName + ": " + msg);
        } else {
            console.info(this.#dbName + ": " + msg);
        }
    }

    // On upgrade callback
    #onUpgradeCallback(event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.#storeName)) {
            db.createObjectStore(this.#storeName, { keyPath: "id" });
            this.#report({ msg: "Created Store" });
        } else {
            this.#report({ msg: "Store '" + this.#storeName + "' already exists" });
        }
    }
}




