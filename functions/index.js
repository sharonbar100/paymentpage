// functions/index.js
import express from "express";
import cors from "cors";

import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
// <-- correct import for secret/param helpers:
import { defineSecret } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";

// Set global options for your functions
setGlobalOptions({ maxInstances: 10 });

// The `expressApp` will be the one we use for routing
const expressApp = express();
expressApp.use(cors());
expressApp.use(express.json());

// Define the secrets to be loaded from Google Cloud Secret Manager
const TERMINAL_NUMBER = defineSecret("TERMINAL_NUMBER");
const API_NAME = defineSecret("API_NAME");

// ✅ Endpoint to create a new payment page
expressApp.post("/create-payment", async (req, res) => {
  try {
    const { amount, cart } = req.body;

    let productName = "Cart Purchase";
    if (Array.isArray(cart) && cart.length > 0) {
      productName = cart
        .map((item) => `${item.name} x${item.qty}`)
        .join(", ");
    }

    const UIDefinition = {
      CardOwnerNameValue: "Test User",
      CardOwnerIdValue: "1111111",
      CardOwnerEmailValue: "test@test.com",
      CardOwnerPhoneValue: "0521234567",
      CustomFields: [
        { Id: 1, Value: "Test Value 1" },
        { Id: 2, Value: "Test Value 2" }
      ]
    };

    const payload = {
      TerminalNumber: TERMINAL_NUMBER.value(), // secret value
      ApiName: API_NAME.value(),               // secret value
      Amount: amount,
      ISOCoinId: 1,
      Operation: "ChargeOnly",
      SuccessRedirectUrl: "https://paymentpage-2f2d9.web.app/success",
      FailedRedirectUrl: "https://paymentpage-2f2d9.web.app/error",
      ProductName: productName,
      ReturnValue: "ORDER-1234",
      Language: "he",
      UIDefinition: UIDefinition
    };

    logger.info("➡️ Sending payload to Cardcom:", payload);

    const response = await fetch(
      "https://secure.cardcom.solutions/api/v11/LowProfile/Create",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    logger.info("✅ Cardcom response for Create:", data);

    res.json({
      url: data.Url,
      lowProfileId: data.LowProfileId,
      raw: data,
    });
  } catch (error) {
    logger.error("❌ Error from Cardcom:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Endpoint to check the payment status
expressApp.post("/check-payment", async (req, res) => {
  try {
    const { LowProfileId } = req.body;

    const payload = {
      TerminalNumber: TERMINAL_NUMBER.value(),
      ApiName: API_NAME.value(),
      LowProfileId,
    };

    logger.info("➡️ Checking payment status:", payload);

    const response = await fetch(
      "https://secure.cardcom.solutions/api/v11/LowProfile/GetLpResult",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    logger.info("✅ Payment status:", data);

    res.json(data);
  } catch (error) {
    logger.error("❌ Error checking payment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Bind the secrets to the function so they are available at runtime
export const app = onRequest(
  { secrets: [TERMINAL_NUMBER, API_NAME] },
  expressApp
);
