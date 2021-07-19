let db;

const request = window.indexedDB.open("indexDB", 1)

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    const objectStore = db.createObjectStore("BudgetStore", {
        autoIncrement: true
    })
};

request.onsuccess = function (event) {
    db = event.target.result;
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    db = event.target.result;
    console.log("Unable to update the Object Store", event.target.errorCode)
}

function saveRecord(record) {
    const transaction = db.transaction(["BudgetStore"], "readwrite");
    const store = transaction.objectStore("BudgetStore");
    store.add(record)
}

function checkDatabase() {
    const transaction = db.transaction(["BudgetStore"], "readwrite");
    const store = transaction.objectStore("BudgetStore");
    const getAll = store.getAll()

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => response.json())
                .then(() => {
                    const transaction = db.transaction(['BudgetStore'], 'readwrite');
                    const store = transaction.objectStore('BudgetStore');
                    store.clear();
                })
                .catch(error => {
                    console.log(error.message)
                });
        }
    };
}

window.addEventListener('online', checkDatabase);