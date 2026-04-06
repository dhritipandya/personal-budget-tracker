let transactions = [];

const form = document.getElementById("transactionForm");
const table = document.getElementById("transactionTable");

form.addEventListener("submit", function(e){

e.preventDefault();

let title = document.getElementById("title").value.trim();
let amount = document.getElementById("amount").value;
let date = document.getElementById("date").value;
let category = document.getElementById("category").value;
let type = document.querySelector('input[name="type"]:checked').value;

if(title === "" || amount === "" || date === ""){
alert("Please fill all fields correctly.");
return;
}

if(isNaN(amount)){
alert("Amount must be numeric.");
return;
}

amount = parseFloat(amount);

const transaction = {title, amount, date, category, type};

transactions.push(transaction);

displayTransactions();

form.reset();

});

function displayTransactions(){

table.innerHTML="";

let income = 0;
let expense = 0;

transactions.forEach((t,index)=>{

if(t.type==="Income"){
income += t.amount;
}else{
expense += t.amount;
}

let row = `
<tr>
<td>${t.title}</td>
<td>$${t.amount}</td>
<td>${t.date}</td>
<td>${t.category}</td>
<td>${t.type}</td>
<td>
<button class="edit" onclick="editTransaction(${index})">Edit</button>
<button class="delete" onclick="deleteTransaction(${index})">Delete</button>
</td>
</tr>
`;

table.innerHTML += row;

});

document.getElementById("income").innerText = "$" + income;
document.getElementById("expense").innerText = "$" + expense;
document.getElementById("balance").innerText = "$" + (income - expense);

}

function deleteTransaction(index){

if(confirm("Are you sure you want to delete this transaction?")){
transactions.splice(index,1);
displayTransactions();
}

}

function editTransaction(index){

let t = transactions[index];

document.getElementById("title").value = t.title;
document.getElementById("amount").value = t.amount;
document.getElementById("date").value = t.date;
document.getElementById("category").value = t.category;

transactions.splice(index,1);

displayTransactions();

}