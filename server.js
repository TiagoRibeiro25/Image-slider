const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const Datastore = require("nedb");
const axios = require("axios");

const app = express();
const port = process.env.PORT ?? 3000;

app.listen(port, () => {
  console.log(`Listening at ${port}`);
});
app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));

const database = new Datastore("./data/database.db");
database.loadDatabase();

async function sendEmail(name, email, message) {
  const data = JSON.stringify({
    Messages: [
      {
        From: {
          Email: process.env.MAILJET_FROM_EMAIL,
          Name: process.env.MAILJET_FROM_NAME,
        },
        To: [
          {
            Email: process.env.MAILJET_TO_EMAIL,
            Name: process.env.MAILJET_TO_NAME,
          },
        ],
        Subject: "You've got some new feedback!",
        TextPart: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      },
    ],
  });

  const config = {
    method: "post",
    url: "https://api.mailjet.com/v3.1/send",
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
    auth: {
      username: process.env.MAILJET_PUBLIC_KEY,
      password: process.env.MAILJET_SECRET_KEY,
    },
  };

  return axios(config)
    .then((response) => {
      console.log(`${response.status}: ${response.statusText}`);
    })
    .catch((error) => {
      console.log(error);
    });
}

async function checkDataBase(email) {
  const now = Date.now();
  let result;
  database.find({ email: email }, (err, docs) => {
    if (err) {
      result = "error";
      return "error";
    } else {
      if (docs.length > 0) {
        const lastEntry = docs[docs.length - 1];
        const timeSinceLastEntry = now - lastEntry.timestamp;
        if (timeSinceLastEntry < 1000 * 60 * 60) {
          result = true;
        } else {
          result = false;
        }
      } else {
        result = false;
      }
    }
  });

  while (result === undefined) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return result;
}

// Get feedback
app.post("/feedback", async (request, response) => {
  const data = request.body;
  data.timestamp = Date.now();

  const result = await checkDataBase(data.email);

  if (result === "error") {
    response.json({
      status: "error",
      message: "Error checking database",
    });
    response.end();
  } else if (result) {
    response.json({
      status: "error",
      message: "You have already submitted feedback in the last hour",
    });
    response.end();
  } else {
    database.insert(data);

    // Send email
    sendEmail(data.name, data.email, data.message);
    response.json({
      status: "success",
      message: "Thank you for your feedback!",
    });
    response.end();
  }
});
