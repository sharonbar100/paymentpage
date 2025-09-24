import express from "express";
import cors from "cors";

import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import { defineSecret } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";

setGlobalOptions({ maxInstances: 10 });

const expressApp = express();
expressApp.use(cors());
expressApp.use(express.json());

const TERMINAL_NUMBER = defineSecret("TERMINAL_NUMBER");
const API_NAME = defineSecret("API_NAME");

// ✅ Endpoint to create a new payment page
expressApp.post("/create-payment", async (req, res) => {
  try {
    const { amount, cart } = req.body;

    let productName = "Cart Purchase";
    if (Array.isArray(cart) && cart.length > 0) {
      productName = cart.map((item) => `${item.name} x${item.qty}`).join(", ");
    }

    const orderId = `ORDER-${Date.now()}`;

    // Corrected URLs with {LowProfileId} placeholder (CardCom will replace it)
    const successUrl = "https://paymentpage-2f2d9.web.app/success-iframe?LowProfileId={LowProfileId}";
    const failedUrl = "https://paymentpage-2f2d9.web.app/error-iframe?LowProfileId={LowProfileId}";

    const payload = {
      TerminalNumber: TERMINAL_NUMBER.value(),
      ApiName: API_NAME.value(),
      Amount: amount,
      ISOCoinId: 1,
      Operation: "ChargeOnly",
      ProductName: productName,
      ReturnValue: orderId,
      Language: "he",
      SuccessRedirectUrl: successUrl,
      FailedRedirectUrl: failedUrl,
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
      url: data.Url,             // payment page URL
      lowProfileId: data.LowProfileId, // real LowProfileId
      orderId,
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

    if (!LowProfileId) {
      return res.status(400).json({ error: "Missing LowProfileId" });
    }

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

export const app = onRequest(
  { secrets: [TERMINAL_NUMBER, API_NAME] },
  expressApp
);
