const btnsLinks = {
  main: "../index.html",
  normal: "../html/normal.html",
  advanced: "../html/advanced.html",
};

document.querySelectorAll(".top-options button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const value = btn.getAttribute("data");
    const location = btnsLinks[value];
    window.location.href = location;
  });
});

document.querySelector("#reset-btn").addEventListener("click", () => {
  noLoop();
  // delete all the canvas
  document.querySelectorAll("canvas").forEach((canvas) => {
    canvas.remove();
  });
  loop();
  setup();
});