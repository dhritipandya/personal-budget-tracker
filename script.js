let transactions = [];
let chart;

const form = document.getElementById("transactionForm");
const table = document.getElementById("transactionTable");

form.addEventListener("submit", function(e){
    e.preventDefault();

    let title = document.getElementById("title").value.trim();
    let amount = parseFloat(document.getElementById("amount").value);
    let date = document.getElementById("date").value;
    let category = document.getElementById("category").value;
    let type = document.querySelector('input[name="type"]:checked').value;

    transactions.push({title, amount, date, category, type});

    display();
    form.reset();
});

function display(){

    table.innerHTML = "";

    let incomeTotal = 0;
    let expenseTotal = 0;

    let list = [...transactions];

    const filterType = document.getElementById("filterType").value;
    const filterCat = document.getElementById("filterCategory").value;
    const sortDir = document.getElementById("sortByDate").value;

    if(filterType !== "All") list = list.filter(t => t.type === filterType);
    if(filterCat !== "All") list = list.filter(t => t.category === filterCat);

    list.sort((a,b) => {
        return sortDir === "asc"
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date);
    });

    list.forEach((t, index) => {

        if(t.type === "Income") incomeTotal += t.amount;
        else expenseTotal += t.amount;

        const amtClass = t.type === "Income" ? "text-income" : "text-expense";
        const prefix = t.type === "Income" ? "+" : "-";

        table.innerHTML += `
            <tr>
                <td><strong>${t.title}</strong></td>
                <td class="${amtClass}">${prefix}$${t.amount.toFixed(2)}</td>
                <td>${t.date}</td>
                <td>${t.category}</td>
                <td>${t.type}</td>
                <td>
                    <button class="btn-outline" onclick="edit(${index})">Edit</button>
                    <button class="btn-outline" onclick="del(${index})">Delete</button>
                </td>
            </tr>
        `;
    });

    document.getElementById("income").innerText = "$" + incomeTotal.toFixed(2);
    document.getElementById("expense").innerText = "-$" + expenseTotal.toFixed(2);
    document.getElementById("balance").innerText = "$" + (incomeTotal - expenseTotal).toFixed(2);

    /* =========================
       🚨 OVERSPENDING ALERT
    ========================= */
    let warning = document.getElementById("warning");

    if(expenseTotal > incomeTotal){
        warning.innerText = "⚠ You are overspending!";
        warning.style.color = "red";
        warning.style.fontWeight = "bold";
        warning.style.textAlign = "center";
        warning.style.marginTop = "10px";
    } else {
        warning.innerText = "";
    }

    updateChart();
}

// DELETE
function del(i){
    transactions.splice(i,1);
    display();
}

// EDIT
function edit(i){
    let t = transactions[i];

    document.getElementById("title").value = t.title;
    document.getElementById("amount").value = t.amount;
    document.getElementById("date").value = t.date;
    document.getElementById("category").value = t.category;

    document.querySelector(`input[value="${t.type}"]`).checked = true;

    transactions.splice(i,1);
    display();
}

// FILTERS
document.getElementById("filterType").onchange = display;
document.getElementById("filterCategory").onchange = display;
document.getElementById("sortByDate").onchange = display;

// CHART
function updateChart(){

    let dataMap = {};

    transactions.forEach(t => {
        if(t.type === "Expense"){
            dataMap[t.category] = (dataMap[t.category] || 0) + t.amount;
        }
    });

    let labels = Object.keys(dataMap);
    let data = Object.values(dataMap);

    if(chart) chart.destroy();

    const ctx = document.getElementById("expenseChart").getContext("2d");

    chart = new Chart(ctx, {
        type: "pie",
        data: {
            labels,
            datasets: [{
                data
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right' }
            }
        }
    });
}

/* =========================
   CSV DOWNLOAD
========================= */
function downloadCSV(){

    if(transactions.length === 0){
        alert("No data to export");
        return;
    }

    let csv = "Title,Amount,Date,Category,Type\n";

    transactions.forEach(t => {
        csv += `"${t.title}",${t.amount},${t.date},${t.category},${t.type}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "budget-data.csv";
    a.click();

    URL.revokeObjectURL(url);
}

/* =========================
   PDF DOWNLOAD
========================= */
function downloadPDF(){

    if(transactions.length === 0){
        alert("No data to export");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text("Personal Budget Report", 10, 10);

    let y = 20;

    transactions.forEach((t, i) => {

        let line = `${i+1}. ${t.title} | $${t.amount} | ${t.date} | ${t.category} | ${t.type}`;

        doc.text(line, 10, y);
        y += 10;

        if(y > 280){
            doc.addPage();
            y = 10;
        }
    });

    doc.save("budget-report.pdf");
}

window.onload = display;
