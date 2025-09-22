// This is free and unencumbered software released into the public domain.
// For more information, please refer to <https://unlicense.org/>
// ==UserScript==
// @name         文泉学堂保护装置
// @namespace    http://tampermonkey.net/
// @version      2025-09-22
// @description  try to take over the world!
// @author       You
// @match        https://lib-tsinghua.wqxuetang.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wqxuetang.com
// @grant        none
// @run-at       document-start
// ==/UserScript==

const vault = {};
vault.log = console.log;
const aCanvas = document.createElement("canvas");
const aCtx = aCanvas.getContext("2d");
vault.drawImage = Object.getPrototypeOf(aCtx).drawImage;

window.revert = () => {
  console.log = vault.log;
  Object.getPrototypeOf(aCtx).drawImage = vault.drawImage;
};

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function downloadPage(page, scale) {
  page.scrollIntoView();

  let imgs;
  while (1) {
    imgs = [...page.getElementsByClassName("plg")[0].childNodes];
    if (imgs.length >= 6) break;
    await sleep(500);
  }
  await sleep(1000 * (1 + Math.random()));

  const data = imgs.map((img) => ({
    img,
    width: img.naturalWidth,
    height: img.naturalHeight,
    left: parseFloat(img.style.left.slice(0, -2)),
  }));
  data.sort((a, b) => a.left - b.left);
  let currentOffset = 0;
  data.forEach((item) => {
    item.offset = currentOffset;
    currentOffset += item.width;
  });
  const imgWidth = currentOffset;
  const imgHeight = Math.max(...data.map((d) => d.height));

  vault.log(`Page size: ${imgWidth}x${imgHeight}, preparing canvas...`);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = imgWidth * scale;
  canvas.height = imgHeight * scale;
  const drawImage = vault.drawImage.bind(ctx);
  for (const d of data) {
    drawImage(d.img, d.offset * scale, 0, d.width * scale, d.height * scale);
  }

  return {
    width: canvas.width,
    height: canvas.height,
    url: canvas.toDataURL("image/webp", 1),
  };
}

window.dl = async function main(start, end, scale = 1.0) {
  revert();
  await new Promise((res) => {
    if (window.jspdf) return res();
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = res;
    document.body.appendChild(script);
  });
  if (!window.jspdf) return;
  const { jsPDF } = window.jspdf;
  // get page count
  const pb = document.getElementById("pb");
  let pages = [...pb.childNodes].filter(
    (e) => e instanceof HTMLDivElement && e.hasAttribute("index")
  );
  pages = pages.slice(start, end);

  let doc;
  for (let i = 0; i < pages.length; i++) {
    vault.log(`Processing page ${i + 1}/${pages.length}`);
    const img = await downloadPage(pages[i], scale);
    vault.log(
      `Adding page ${i + 1}/${pages.length}: ${img.width}x${img.height}`
    );
    if (!doc) doc = new jsPDF({ format: [img.width, img.height], unit: "px" });
    else doc.addPage([img.width, img.height]);
    doc.addImage(img.url, "WEBP", 0, 0, img.width, img.height);
  }

  const title = document.querySelector(".read-header-name").innerText;
  vault.log(`Saving PDF: as {title}.pdf`);
  doc.save(title + ".pdf");
};
