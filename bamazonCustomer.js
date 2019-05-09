var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: "password",
    database: "bamazon"
});

connection.connect(function (err) {
    // if (err) throw err;
    start();
});

function start() {

    connection.query("SELECT * FROM products", function (err, results) {
        // if (err) throw err;
        let idArray = [];
        console.log("\n╔══════════════════════════════════════════════════════════════════════════╗");
        console.log("║  ID ||         Product Name         || Department ||  Price  || Quantity ║");
        console.log("║-----||------------------------------||------------||---------||----------║");

        for (var i = 0; i < results.length; i++) {

            console.log("║" + 
                results[i].item_ID.toString().padStart(4, " ") + " ||" +
                results[i].product_name.padStart(29, " ") + " ||" +
                results[i].department_name.padStart(11, " ") + " ||" +
                ("$" + results[i].price).padStart(8, " ") + " ||" +
                results[i].stock_quantity.toString().padStart(9, " ") + " ║");

            idArray.push(results[i].item_ID);
        };

        console.log("╚══════════════════════════════════════════════════════════════════════════╝\n");

        // console.log(idArray);

        inquirer
            .prompt([
                {
                    name: "item",
                    type: "input",
                    message: "What is the item number you would like to purchase?"
                },
                {
                    name: "purchQty",
                    type: "input",
                    message: "How many would you like to purchase?"
                },
            ])
            .then(function (answer) {
                if (idArray.indexOf(parseInt(answer.item)) === -1) {
                    console.log("That item ID is not valid; please try again.");
                    start();
                } else {
                    if (answer.purchQty < 1) {
                        console.log("You must purchase at least one item. Please try again.");
                        start();
                    } else {
                        connection.query("SELECT stock_quantity FROM products WHERE item_ID = " + answer.item, function (err, results) {
                            if (err) throw err;

                            console.log("Answer Item: " + answer.item);
                            console.log("Purchase Qty: " + parseInt(answer.purchQty));
                            console.log("Qty in Stock: " + results[0].stock_quantity);

                            if (parseInt(answer.purchQty) > results[0].stock_quantity) {
                                console.log("We don't have that many in stock. Please try again.");
                                start();
                            } else {
                                // console.log("Successful Purchase!");
                                // console.log("You just purchased " + )
                                let newQty = results[0].stock_quantity - parseInt(answer.purchQty);
                                connection.query("UPDATE products SET stock_quantity = " + newQty + " WHERE item_ID = " + answer.item, function (err, results) {
                                    if (err) throw err;

                                    start();
                                }
                                )
                            };
                        });
                    };
                }
            });
    });
}