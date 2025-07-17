const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "product-service-producer",
  brokers: process.env.KAFKA_BROKERS.split(","),
});

const producer = kafka.producer();

const connectProducer = async () => {
  try {
    await producer.connect();
    console.log("[Kafka Producer] Connected successfully!");
  } catch (error) {
    console.error("[Kafka Producer] Error connecting to Kafka:", error);
  }
};

const disconnectProducer = async () => {
  try {
    await producer.disconnect(); // Disconnect from Kafka
    console.log("[Kafka Producer] Disconnected successfully!");
  } catch (error) {
    console.error("[Kafka Producer] Error disconnecting:", error);
  }
};

/**
 * Sends a message to a specific Kafka topic.
 * @param {string} topic - The Kafka topic to send the message to.
 * @param {Array<object>} messages - An array of messages to send. Each message should have 'value'.
 * Example: [{ value: JSON.stringify({ eventType: 'PRODUCT_CREATED', data: product }) }]
 */

const sendMessage = async (topic, messages) => {
  try {
    await producer.send({
      topic: topic,
      messages: messages,
    });
    console.log(
      `[Kafka Producer] Message sent to topic ${topic}:`,
      messages.map((m) => m.value)
    );
  } catch (error) {
    console.error(
      `[Kafka Producer] Error sending message to topic ${topic}:`,
      error
    );
  }
};

module.exports = {
  producer,
  connectProducer,
  disconnectProducer,
  sendMessage,
};
