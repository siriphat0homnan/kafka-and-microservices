const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const Kafka = require("node-rdkafka");
const { configFromPath } = require("./util");
const request = require("request");
const DEFAULT_LINE_URL = "https://notify-api.line.me/api/notify";

const TOKEN = "YOUR_TOKEN";

const app = express();
const port = 3002;

function createConfigMap(config) {
	if (config.hasOwnProperty("security.protocol")) {
		return {
			"bootstrap.servers": config["bootstrap.servers"],
			"sasl.username": config["sasl.username"],
			"sasl.password": config["sasl.password"],
			"security.protocol": config["security.protocol"],
			"sasl.mechanisms": config["sasl.mechanisms"],
			"group.id": "kafka-nodejs-getting-started",
		};
	} else {
		return {
			"bootstrap.servers": config["bootstrap.servers"],
			"group.id": "kafka-nodejs-getting-started",
		};
	}
}

function createConsumer(config, onData) {
	const consumer = new Kafka.KafkaConsumer(createConfigMap(config), { "auto.offset.reset": "earliest" });

	return new Promise((resolve, reject) => {
		consumer.on("ready", () => resolve(consumer)).on("data", onData);

		consumer.connect();
	});
}

async function consumerExample() {
	if (process.argv.length < 3) {
		console.log("Please provide the configuration file path as the command line argument");
		process.exit(1);
	}
	let configPath = process.argv.slice(2)[0];
	const config = await configFromPath(configPath);

	//let seen = 0;
	let topic = "notification_line";

	const consumer = await createConsumer(config, ({ key, value }) => {
		let k = key.toString().padEnd(10, " ");
		request(
			{
				method: "POST",
				uri: DEFAULT_LINE_URL,
				header: {
					"Content-Type": "multipart/form-data",
				},
				auth: {
					bearer: TOKEN,
				},
				form: {
					message: value,
				},
			},
			(err, httpResponse, body) => {
				if (err) {
					console.log(err);
				} else {
					console.log(body);
				}
			}
		);
		console.log(`Consumed event from topic ${topic}: key = ${k} value = ${value}`);
	});

	consumer.subscribe([topic]);
	consumer.consume();

	process.on("SIGINT", () => {
		console.log("\nDisconnecting consumer ...");
		consumer.disconnect();
	});
}

consumerExample().catch((err) => {
	console.error(`Something went wrong:\n${err}`);
	process.exit(1);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
