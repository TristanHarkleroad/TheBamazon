const mysql = require("mysql");
const inquirer = require("inquirer")
const log = console.log;
const table = console.table;

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazon_db"
});

function validateInput(value) {
	var integer = Number.isInteger(parseFloat(value));
	var sign = Math.sign(value);

	if (integer && (sign === 1)) {
		return true;
	} else {
		return 'Please enter a whole non-zero number.';
	}
}


connection.connect(function(err) {
  if (err) throw err;
  log("connected as id " + connection.threadId);
  log("\nProducts For Sale\n");
  listProducts();
});

function listProducts() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    table(res);
    start();
  })
}

function start() {
  inquirer.prompt([
    {
      type: "input",
      name: "whatProduct",
      message: "Hello! What Product would you like to purchase? Please provide the ID.",
      validate: validateInput,
      default: "7"
    },
    { type: "input",
      name: "quantity",
      message: "Excellent! How many units would you like?",
      validate: validateInput,
      default: "2"
    }
  ]).then(function(input) {
    
    var queryStr = 'SELECT * FROM products WHERE ?';
    var item = input.whatProduct;
    var inputQuantity = input.quantity;

    connection.query(queryStr, {item_id: item}, function(err, data) {
			if (err) throw err;

			// If the user has selected an invalid item ID, data attay will be empty
			// console.log('data = ' + JSON.stringify(data));

			if (data.length === 0) {
				console.log('ERROR: Invalid Item ID. Please select a valid Item ID.');
				listProducts();

			} else {
				var productData = data[0];

				// If the quantity requested by the user is in stock
				if (inputQuantity <= productData.stock_quantity) {
					console.log('Congratulations, the product you requested is in stock! Placing order!');

					// Construct the updating query string
					var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity - inputQuantity) + ' WHERE item_id = ' + item;
				

					// Update the inventory
					connection.query(updateQueryStr, function(err, data) {
						if (err) throw err;

						console.log('Your oder has been placed! Your total is $' + productData.price * inputQuantity);
						console.log('Thank you for shopping with us!');
						console.log("\n---------------------------------------------------------------------\n");

						// End the database connection
						connection.end();
					})
				} else {
					console.log('Sorry, there is not enough product in stock, your order can not be placed as is.');
					console.log('Please modify your order.');
					console.log("\n---------------------------------------------------------------------\n");

					listProducts();
				}
      }
    })
  })  
}

// function checkForProducts () {
 
// }
// Once the customer has placed the order, your application should check if your store
// has enough of the product to meet the customer's request.

// If not, the app should log a phrase like Insufficient quantity!, and then prevent
// the order from going through.



// However, if your store does have enough of the product, you should fulfill t
//he customer's order.

// This means updating the SQL database to reflect the remaining quantity.
// Once the update goes through, show the customer the total cost of their purchase.



