let db;
// new database request for the "budget" database.
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
    // object store "pending" setting it to autoincrememnt
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;
    // if offline read from database
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    console.log("Woops! " + event.target.errorCode);
};

function saveRecord(record) {
    // set pending database with readwrite
    const transaction = db.transaction(["pending"], "readwrite");

    // variable to store objectstore, storing pending
    const store = transaction.objectStore("pending");

    // adding a record to the store
    store.add(record);
}

function checkDatabase() {

    // open a transaction
    const transaction = db.transaction(["pending"], "readwrite");

    // access pending
    const store = transaction.objectStore("pending");

    // get all records
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            //api call to create
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(() => {

                    // if successful, add a transaction to pending DB
                    const transaction = db.transaction(["pending"], "readwrite");

                    // access store of pending
                    const store = transaction.objectStore("pending");

                    // clear all items
                    store.clear();
                });
        }
    };
}

// check if app is online
window.addEventListener("online", checkDatabase);