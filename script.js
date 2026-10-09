
const form = document.getElementById("transaction-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const dateInput = document.getElementById("date");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");
const transactionList = document.getElementById("transaction-list");
const emptyMessage = document.getElementById("empty-message");

const STORAGE_KEY = "expenseTrackerTransactions";

let transactions = [];

try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

    if (Array.isArray(saved)) {
        transactions = saved.filter(item =>
            item &&
            typeof item.id === "string" &&
            typeof item.description === "string" &&
            Number.isFinite(item.amount) &&
            item.amount > 0 &&
            ["income", "expense"].includes(item.type) &&
            typeof item.date === "string"
        );
    }
} catch {
    transactions = [];
}

dateInput.value = new Date().toLocaleDateString("en-CA");

function formatMoney(amount) {
    return amount.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2
    });
}

function saveTransactions() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch {
        alert("Unable to save data in this browser.");
    }
}

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const type = typeInput.value;
    const date = dateInput.value;

    if (!description || !Number.isFinite(amount) || amount <= 0 || !date) {
        alert("Please enter valid transaction details.");
        return;
    }

    const transaction = {
        id: crypto.randomUUID(),
        description: description,
        amount: amount,
        type: type,
        date: date
    };

    transactions.push(transaction);
    saveTransactions();
    renderTransactions();

    form.reset();
    dateInput.value = new Date().toLocaleDateString("en-CA");
    typeInput.value = "expense";
});

function deleteTransaction(id) {
    transactions = transactions.filter(item => item.id !== id);
    saveTransactions();
    renderTransactions();
}

function renderTransactions() {
    transactionList.replaceChildren();

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(transaction => {
        if (transaction.type === "income") {
            totalIncome += transaction.amount;
        } else {
            totalExpense += transaction.amount;
        }

        const item = document.createElement("li");
        item.className = "transaction";

        const info = document.createElement("div");
        info.className = "transaction-info";

        const name = document.createElement("strong");
        name.textContent = transaction.description;

        const date = document.createElement("small");
        date.textContent = transaction.date;

        info.append(name, date);

        const right = document.createElement("div");
        right.className = "transaction-right";

        const amount = document.createElement("span");
        amount.className = "transaction-amount " +
            (transaction.type === "income"
                ? "amount-income"
                : "amount-expense");

        amount.textContent =
            (transaction.type === "income" ? "+ " : "- ") +
            formatMoney(transaction.amount);

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.type = "button";
        deleteButton.setAttribute(
            "aria-label",
            "Delete transaction: " + transaction.description
        );

        deleteButton.addEventListener("click", function () {
            deleteTransaction(transaction.id);
        });

        right.append(amount, deleteButton);
        item.append(info, right);
        transactionList.appendChild(item);
    });

    incomeElement.textContent = formatMoney(totalIncome);
    expenseElement.textContent = formatMoney(totalExpense);
    balanceElement.textContent = formatMoney(totalIncome - totalExpense);

    emptyMessage.style.display =
        transactions.length === 0 ? "block" : "none";
}

renderTransactions();
