import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
app.use(bodyParser.json());

// Razorpay keys
const key_id = "rzp_live_yCQ5jbRwGGI9nT";
const key_secret = "BYB4pMAswaTKUESdBUxHteHR";

// WhatsApp sending function (dummy – replace with your bot sendMessage)
async function sendWhatsAppMessage(number, text) {
  console.log(`Send WhatsApp to ${number}: ${text}`);
  // integrate your WhatsApp API here
}

// ======= POST request (already present) =======
app.post("/create-payment-link", async (req, res) => {
  try {
    const { amount, reference_id, customerName, customerContact, customerEmail } = req.body;

    const response = await axios.post(
      "https://api.razorpay.com/v1/payment_links",
      {
        amount: amount,
        currency: "INR",
        accept_partial: false,
        reference_id: reference_id,
        description: "Payment for your order",
        customer: {
          name: customerName,
          contact: customerContact,
          email: customerEmail,
        },
        notify: { sms: true, email: true },
        reminder_enable: true,
        callback_url: "https://www.google.com",
        callback_method: "get",
      },
      {
        auth: {
          username: key_id,
          password: key_secret,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const link = response.data.short_url;

    await sendWhatsAppMessage(customerContact, `Please pay using this link: ${link}`);

    res.json({
      success: true,
      payment_link: link,
      full_response: response.data,
    });
  } catch (err) {
    console.error("Error creating payment link:", err.response?.data || err.message);
    res.status(500).json({ success: false, error: err.response?.data || err.message });
  }
});
app.get("/", (req, res) => {
  res.send("Welcome to the Razorpay Payment Link API");
})
// ======= GET request (new) =======
app.get("/create-payment-link", async (req, res) => {
  try {
    // Get query parameters from the URL
    const { amount, reference_id, customerName, customerContact, customerEmail } = req.query;

    const response = await axios({
  method: "POST",
  url: "https://api.razorpay.com/v1/payment_links",
  auth: {
    username: key_id,
    password: key_secret,
  },
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "User-Agent": "curl/7.79.1",
    "Accept-Encoding": "identity"
  },
  data: {
    amount: parseInt(amount),
    currency: "INR",
    accept_partial: false,
    reference_id,
    description: "Payment for your order",
    customer: {
      name: customerName,
      contact: customerContact, // e.g., 919000090000 (no plus)
      email: customerEmail,
    },
    notify: { sms: true, email: true },
    reminder_enable: true,
    callback_url: "https://www.google.com",
    callback_method: "get",
  },
});


    const link = response.data.short_url;

    await sendWhatsAppMessage(customerContact, `Please pay using this link: ${link}`);

    // Send as JSON
    res.json({
      success: true,
      payment_link: link,
      full_response: response.data,
    });
  } catch (err) {
    console.error("Error creating payment link:", err.response?.data || err.message);
    res.status(500).json({ success: false, error: err.response?.data || err.message });
  }
});

app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
