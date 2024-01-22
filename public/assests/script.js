const get_username = async () => {
	document.querySelector(".header p").innerHTML = "";
	const res = await fetch("/getUserId");
	const data = await res.json();
	console.log(data);
	document.querySelector(".header p").innerHTML = `${data.user[0].username}`;
	document.querySelector(".income p").innerHTML = `₦ ${data.user[0].income}`;
};
get_username();
const update_income = async (income) => {
	const response = await fetch("/new-income", {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ income }),
	});
	data = response.json();
	get_username();
	document.querySelector("#income-amount").value = "";
};
document.querySelector("#income-btn").addEventListener("click", function (e) {
	e.preventDefault();
	const income = Number(document.querySelector("#income-amount").value);
	if (income > 1) {
		update_income(income);
	} else {
		alert("Value is Too Small!!");
	}
});

const add_expense = async (name, amount, category) => {
	const response = await fetch("/new-expense", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ name, amount, category }),
	});
};

const expense_btn = document.querySelector("#expense-btn");
expense_btn.addEventListener("click", function (e) {
	e.preventDefault();
	const name = document.querySelector("#expense-name").value;
	const category = document.querySelector("#category").value;
	const amount = document.querySelector("#amount").value;

	add_expense(name, amount, category);
	document.querySelector("#expense-name").value = "";
	document.querySelector("#amount").value = "";
	// reload the page
	location.reload();
});
