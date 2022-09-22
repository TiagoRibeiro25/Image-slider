const difficultyChoices = {
  normal: "../html/normal.html",
  advanced: "../html/advanced.html",
};

document.querySelectorAll(".options button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const difficulty = btn.getAttribute("data");
    const location = difficultyChoices[difficulty];
    window.location.href = location;
  });
});

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.querySelector("#name").value;
  const email = document.querySelector("#email").value;
  const message = document.querySelector("#message").value;

  console.log("Sending request to server...");
  const response = await fetch("/feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, message }),
  });

  const data = await response.json();
  console.log("Response received from server");

  if (data.status === "error") {
    alert("Error: " + data.message);
  } else {
    alert("Success: " + data.message);
  }
});
