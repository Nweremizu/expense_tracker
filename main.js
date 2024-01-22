const mongoose = require("mongoose");
const express = require("express");
const fs = require("fs");
const path = require("path");
const PORT = 3000;
const session = require("express-session");
const chart = require("chart.js");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(
	session({
		secret: "csc-310",
		resave: true,
		saveUninitialized: true,
	})
);
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*"); // Adjust to your specific needs
	res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");
	next();
});

mongoose.connect(
	"mongodb+srv://admin:admin@feed.5uf8avf.mongodb.net/expense?retryWrites=true&w=majority"
);

const ExpenseSchema = mongoose.Schema({
	name: String,
	amount: Number,
	category: String,
	userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});
const Expense = mongoose.model("Expense", ExpenseSchema);

const UserSchema = mongoose.Schema({
	username: String,
	password: String,
	income: { type: Number, default: 0 },
});
const User = mongoose.model("User", UserSchema);

// Routes
app.get("/", (req, res) => {
	const homePath = `${__dirname}/public/login.html`;
	fs.readFile(homePath, "utf8", (err, data) => {
		if (err) {
			console.error(err);
			res.status(500).send("Internal Server Error");
		} else {
			res.send(data);
		}
	});
});

app.get("/total-expenses", async (req, res) => {
	try {
		const expenses = await Expense.find({ userId: req.session.user._id });
		const totalAmount = expenses.reduce((acc, expense) => acc + expense.amount, 0);
		res.json(totalAmount);
	} catch (err) {
		console.error(err);
		res.status(500).send("Internal Server Error");
	}
});

app.post("/login", async (req, res) => {
	const { username, password } = req.body;
	try {
		const user = await User.findOne({ username });
		if (user) {
			if (user.password === password) {
				req.session.user = user;
				res.redirect(`/expense/${req.session.user.username}`);
			} else {
				res.status(401).send("Invalid Password");
			}
		} else {
			const newUser = new User({ username, password });
			await newUser.save();
			req.session.user = newUser;
			res.redirect(`/expense/${req.session.user.username}`);
		}
	} catch (err) {
		console.error(err);
		res.status(500).send("Internal Server Error");
	}
});

app.put("/new-income", async (req, res) => {
	const { income } = req.body;

	const user = req.session.user._id;
	try {
		const userr = await User.findByIdAndUpdate(user, { income }, { new: true });
		res.json(userr);
	} catch (error) {
		res.status(500).json({ error: "Error updating Income" });
	}
});

app.post("/new-expense", async (req, res) => {
	const { name, amount, category } = req.body;
	const userId = req.session.user._id;
	try {
		const newEXp = new Expense({
			name,
			category,
			amount,
			userId,
		});
		await newEXp.save();
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: "Error Adding Expenses" });
	}
});

app.get("/getUserId", async (req, res) => {
	const userr = req.session.user;
	console.log(userr);
	const user = await User.find({ username: userr.username }).exec();
	res.json({ user });
});

app.get("/expense/:username", (req, res) => {
	if (req.session.user === undefined) {
		res.redirect("/");
	} else {
		const homePath = `${__dirname}/public/main.html`;
		fs.readFile(homePath, "utf8", (err, data) => {
			if (err) {
				console.error(err);
				res.status(500).send("Internal Server Error");
			} else {
				res.send(data);
			}
		});
	}
});

app.get("/visualize", async (req, res) => {
	try {
		const expenses = await Expense.find({ userId: req.session.user._id });

		// Process data for visualization (sum amounts per category)
		const categories = {};
		expenses.forEach((expense) => {
			categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
		});

		// Prepare data for Chart.js
		const chartData = {
			labels: Object.keys(categories),
			datasets: [
				{
					label: "Total Amount per Category",
					data: Object.values(categories),
					backgroundColor: "rgba(0, 0, 0, 0.5)",
					borderColor: "rgba(0, 0, 0, 1)",
					borderWidth: 1,
				},
			],
		};

		res.json(chartData);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

app.listen(PORT, () => {
	console.log(`Server is listening on port ${PORT}`);
});
