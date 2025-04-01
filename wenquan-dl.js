/**
 * MIT License
 *
 * Copyright (c) 2025 Chenxuan Huang
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
  await sleep(1500 * (1 + Math.random()));

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

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = imgWidth * scale;
  canvas.height = imgHeight * scale;
  data.forEach((d) =>
    ctx.drawImage(d.img, d.offset * scale, 0, d.width * scale, d.height * scale)
  );

  return {
    width: canvas.width,
    height: canvas.height,
    url: canvas.toDataURL("image/webp", 1),
  };
}

async function main() {
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
  const pages = [...pb.childNodes].filter(
    (e) => e instanceof HTMLDivElement && e.hasAttribute("index")
  );
  const scale = 1.0;

  let doc;
  for (let i = 0; i < pages.length; i++) {
    const img = await downloadPage(pages[i], scale);
    if (!doc) doc = new jsPDF({ format: [img.width, img.height], unit: "px" });
    else doc.addPage([img.width, img.height]);
    doc.addImage(img.url, "WEBP", 0, 0, img.width, img.height);
  }

  const title = document.querySelector(".read-header-name").innerText;
  doc.save(title + ".pdf");
}
