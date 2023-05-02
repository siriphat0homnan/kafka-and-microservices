const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { produceRandomWord } = require("./producer");

const app = express();
const port = 3001;

// const { ORDERS_API_URL, PRODUCTS_API_URL } = require("./URLs");

// const optionsProducts = {
// 	target: PRODUCTS_API_URL,
// 	changeOrigin: true,
// 	logger: console,
// };

// const optionsOrders = {
// 	target: ORDERS_API_URL,
// 	changeOrigin: true,
// 	logger: console,
// };

// const productsProxy = createProxyMiddleware(optionsProducts);
// const ordersProxy = createProxyMiddleware(optionsOrders);

app.get("/", (req, res) => res.send("success"));

app.get("/random", async (req, res) => {
	produceRandomWord();
	res.send("success");
});

// app.get("/orders", ordersProxy);
// app.get("/products", productsProxy);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
