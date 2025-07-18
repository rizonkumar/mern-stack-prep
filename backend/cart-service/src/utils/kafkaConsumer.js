const { Kafka } = require("kafkajs");
const { redisClient } = require("../config/db");
const { CartItem } = require("../models");

const KAFKA_BROKERS = process.env.KAFKA_BROKERS.split(",");
const PRODUCT_TOPIC = "product-events"; // The topic our Product Service publishes to
const PRODUCT_CACHE_PREFIX = "product:"; // Prefix used for product IDs in Redis cache

const kafka = new Kafka({
  clientId: "cart-service-consumer",
  brokers: KAFKA_BROKERS,
});

const consumer = kafka.consumer({ groupId: "cart-service-group" });

const connectConsumer = async () => {
  try {
    await consumer.connect();
    console.log("[Kafka Consumer] Connected successfully!");

    await consumer.subscribe({ topic: PRODUCT_TOPIC, fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString());
        const productId = message.key.toString();

        console.log(
          `[Kafka Consumer] Received event from ${topic} [${partition}]: ${event.eventType} for product ${productId}`
        );

        // Redis Cache Invalidation Logic
        const cacheKey = `${PRODUCT_CACHE_PREFIX}${productId}`;
        try {
          await redisClient.del(cacheKey);
          console.log(
            `[Kafka Consumer] Invalidated Redis cache for product: ${productId}`
          );
        } catch (error) {
          console.warn(
            `[Kafka Consumer] Error invalidating Redis cache for ${productId}:`,
            cacheError.message
          );
        }
        if (event.eventType === "PRODUCT_UPDATED") {
          const {
            name,
            price,
            imageUrl,
            quantity: updatedQuantity,
          } = event.data;
          try {
            const [updatedRows] = await CartItem.update(
              {
                productName: name,
                productPrice: price,
                productImage: imageUrl,
              },
              {
                where: { productId: productId },
              }
            );
            if (updatedRows > 0) {
              console.log(
                `[Kafka Consumer] Updated denormalized fields for ${updatedRows} cart item(s) for product: ${productId}`
              );
            } else {
              console.log(
                `[Kafka Consumer] No cart items found to update for product: ${productId}`
              );
            }
          } catch (dbError) {
            console.error(
              `[Kafka Consumer] Error updating cart items denormalized fields for product ${productId}:`,
              dbError
            );
          }
        } else if (event.eventType === "PRODUCT_DELETED") {
          try {
            const deletedRows = await CartItem.destroy({
              where: { productId: productId },
            });
            if (deletedRows > 0) {
              console.log(
                `[Kafka Consumer] Removed ${deletedRows} cart item(s) for deleted product: ${productId}`
              );
            } else {
              console.log(
                `[Kafka Consumer] No cart items found to remove for deleted product: ${productId}`
              );
            }
          } catch (dbError) {
            console.error(
              `[Kafka Consumer] Error removing cart items for deleted product ${productId}:`,
              dbError
            );
          }
        }
      },
    });
    console.log(`[Kafka Consumer] Subscribed to topic: ${PRODUCT_TOPIC}`);
  } catch (error) {
    console.error("[Kafka Consumer] Error connecting to Kafka:", error);
  }
};

const disconnectConsumer = async () => {
  try {
    await consumer.disconnect();
    console.log("[Kafka Consumer] Disconnected successfully!");
  } catch (error) {
    console.error("[Kafka Consumer] Error disconnecting:", error);
  }
};

module.exports = {
  connectConsumer,
  disconnectConsumer,
};
