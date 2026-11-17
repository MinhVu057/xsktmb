const PRIZES = [
  { name: "Special", digits: 5, count: 1, mult: 20000, cols: 1, accent: true },
  { name: "First", digits: 5, count: 1, mult: 2000, cols: 1 },
  { name: "Second", digits: 5, count: 2, mult: 500, cols: 2 },
  { name: "Third", digits: 5, count: 6, mult: 200, cols: 3 },
  { name: "Fourth", digits: 4, count: 4, mult: 40, cols: 4 },
  { name: "Fifth", digits: 4, count: 6, mult: 20, cols: 3 },
  { name: "Sixth", digits: 3, count: 3, mult: 10, cols: 3 },
  { name: "Seventh", digits: 2, count: 4, mult: 4, cols: 4, accent: true },
];

const FREQ_KEY = "xskt_freq";

const state = {
  bank: 1000000,
  limit: 500000,
  pendingDeposit: null,
  freq: loadFreq(),
};

function loadFreq() {
  const empty = { 5: {}, 4: {}, 3: {}, 2: {} };
  try {
    const saved = JSON.parse(localStorage.getItem(FREQ_KEY) || "{}");
    for (const digits of [5, 4, 3, 2]) {
      if (saved[digits] && typeof saved[digits] === "object") empty[digits] = saved[digits];
    }
  } catch {
    /* keep empty counts */
  }
  return empty;
}

function rememberDraw(byDigits) {
  for (const digits of [5, 4, 3, 2]) {
    for (const entry of byDigits[digits]) {
      state.freq[digits][entry.value] = (state.freq[digits][entry.value] || 0) + 1;
    }
  }
  localStorage.setItem(FREQ_KEY, JSON.stringify(state.freq));
}

function topNumbers(freq, digits) {
  return Object.entries(freq[digits])
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3);
}

function renderFreqTable(aside, freq) {
  aside.replaceChildren();
  const title = document.createElement("h2");
  title.textContent = "Most frequent";
  const table = document.createElement("table");
  table.className = "freq";
  for (const digits of [5, 4, 3, 2]) {
    const head = document.createElement("tr");
    const th = document.createElement("th");
    th.colSpan = 2;
    th.textContent = `${digits} digits`;
    head.append(th);
    table.append(head);
    const top = topNumbers(freq, digits);
    for (let i = 0; i < 3; i++) {
      const tr = document.createElement("tr");
      const number = document.createElement("td");
      const count = document.createElement("td");
      number.textContent = top[i] ? top[i][0] : "—";
      count.textContent = top[i] ? String(top[i][1]) : "";
      tr.append(number, count);
      table.append(tr);
    }
  }
  aside.append(title, table);
}

function renderFrequency() {
  renderFreqTable(document.getElementById("frequency"), state.freq);
}

function emptyFreq() {
  return { 5: {}, 4: {}, 3: {}, 2: {} };
}

function vnd(n) {
  return `${Number(n).toLocaleString("en-US")} VND`;
}

function pad(n, digits) {
  return String(n).padStart(digits, "0");
}

function uniqueNumbers(digits, count) {
  const seen = new Set();
  const max = 10 ** digits;
  while (seen.size < count) seen.add(Math.floor(Math.random() * max));
  return [...seen].map((n) => pad(n, digits));
}

function draw() {
  const pools = {};
  for (const digits of [5, 4, 3, 2]) {
    const count = PRIZES.filter((prize) => prize.digits === digits)
      .reduce((sum, prize) => sum + prize.count, 0);
    pools[digits] = uniqueNumbers(digits, count);
  }
  const byDigits = { 2: [], 3: [], 4: [], 5: [] };
  const rows = PRIZES.map((prize) => {
    const numbers = pools[prize.digits].splice(0, prize.count);
    byDigits[prize.digits].push(...numbers.map((value) => ({ value, mult: prize.mult })));
    return { ...prize, numbers };
  });
  return { rows, byDigits };
}

function winsFor(ticket, byDigits) {
  const wins = [];
  for (const digits of [5, 4, 3, 2]) {
    const tail = ticket.slice(-digits);
    const hit = byDigits[digits].find((entry) => entry.value === tail);
    if (hit) wins.push({ digits, value: tail, mult: hit.mult });
  }
  return wins;
}

function show(el, text, kind) {
  el.hidden = false;
  el.textContent = text;
  el.className = `message${kind ? ` ${kind}` : ""}`;
}

function renderBoard(rows, ticket) {
  const board = document.getElementById("board");
  board.hidden = false;
  board.replaceChildren();
  const table = document.createElement("table");
  table.className = "board";
  for (const row of rows) {
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    th.textContent = row.name;
    const td = document.createElement("td");
    const grid = document.createElement("div");
    grid.className = `nums cols-${row.cols}${row.accent ? " hit" : ""}`;
    for (const value of row.numbers) {
      const span = document.createElement("span");
      span.textContent = value;
      if (ticket.slice(-row.digits) === value) span.className = "match";
      grid.append(span);
    }
    td.append(grid);
    tr.append(th, td);
    table.append(tr);
  }
  board.append(table);
}

function renderAccount() {
  document.getElementById("balance").textContent = vnd(state.bank);
  document.getElementById("limit").textContent = vnd(state.limit);
}

document.querySelectorAll("nav button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("nav button").forEach((b) => b.classList.toggle("active", b === button));
    document.querySelectorAll(".page").forEach((page) => {
      page.hidden = page.id !== button.dataset.page;
    });
    if (button.dataset.page === "account") renderAccount();
  });
});

const SIM_PRICE = 10000;

function countNumber(freq, digits, value) {
  freq[digits][value] = (freq[digits][value] || 0) + 1;
}

document.getElementById("sim-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const message = document.getElementById("sim-message");
  const ticket = document.getElementById("sim-ticket").value.trim();
  const times = Number(document.getElementById("sim-count").value);
  if (!/^\d{5}$/.test(ticket)) {
    show(message, "Enter a 5-digit ticket, including leading zeros.");
    return;
  }
  if (!Number.isInteger(times) || times < 1 || times > 100000) {
    show(message, "Enter a number of draws from 1 to 100,000.");
    return;
  }

  const prizeCounts = Object.fromEntries(PRIZES.map((prize) => [prize.name, 0]));
  const freq = emptyFreq();
  let payout = 0;
  for (let n = 0; n < times; n++) {
    const { rows, byDigits } = draw();
    for (const digits of [5, 4, 3, 2]) {
      for (const entry of byDigits[digits]) countNumber(freq, digits, entry.value);
    }
    const tailHits = new Set();
    for (const row of rows) {
      const tail = ticket.slice(-row.digits);
      if (row.numbers.includes(tail) && !tailHits.has(row.digits)) {
        tailHits.add(row.digits);
        prizeCounts[row.name] += 1;
        payout += row.mult * SIM_PRICE;
      }
    }
  }

  const spent = times * SIM_PRICE;
  const net = payout - spent;
  const summary = net >= 0
    ? `Gain ${vnd(net)}`
    : `Loss ${vnd(-net)}`;
  show(
    message,
    `${times.toLocaleString("en-US")} draws at ${vnd(SIM_PRICE)}. Won ${vnd(payout)}, spent ${vnd(spent)}. ${summary}.`,
    net >= 0 ? "win" : "lose",
  );

  const tbody = document.querySelector("#sim-prizes tbody");
  tbody.replaceChildren();
  for (const prize of PRIZES) {
    const tr = document.createElement("tr");
    for (const text of [prize.name, String(prizeCounts[prize.name]), vnd(prizeCounts[prize.name] * prize.mult * SIM_PRICE)]) {
      const td = document.createElement("td");
      td.textContent = text;
      tr.append(td);
    }
    tbody.append(tr);
  }
  document.getElementById("sim-prizes").hidden = false;
  renderFreqTable(document.getElementById("sim-frequency"), freq);
});

document.getElementById("ticket-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const message = document.getElementById("play-message");
  const ticket = document.getElementById("ticket").value.trim();
  const price = Number(document.getElementById("price").value);
  if (!/^\d{5}$/.test(ticket)) {
    show(message, "Enter a 5-digit ticket, including leading zeros.");
    return;
  }
  if (!Number.isInteger(price) || price < 10000) {
    show(message, "Price must be at least 10,000 VND.");
    return;
  }
  if (price > state.bank) {
    show(message, `Not enough balance. You have ${vnd(state.bank)}.`);
    return;
  }

  state.bank -= price;
  const { rows, byDigits } = draw();
  const wins = winsFor(ticket, byDigits
  let payout = 0;
  for (const win of wins) {
    payout += win.mult * price;
  }
  state.bank += payout;
  rememberDraw(byDigits);
  renderBoard(rows, ticket);
  renderFrequency();
  if (wins.length === 0) {
    show(message, `Ticket ${ticket} did not win. Paid ${vnd(price)}. Balance ${vnd(state.bank)}.`, "lose");
  } else {
    const parts = wins.map((win) => `${win.value} × ${win.mult.toLocaleString("en-US")}`);
    show(
      message,
      `Ticket ${ticket} won ${vnd(payout)} (${parts.join(", ")}). Balance ${vnd(state.bank)}.`,
      "win",
    );
  }
});

document.getElementById("deposit-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const message = document.getElementById("account-message");
  const amount = Number(document.getElementById("deposit").value);
  const limitForm = document.getElementById("limit-form");
  if (!Number.isInteger(amount) || amount <= 0) {
    show(message, "Enter a positive amount.");
    return;
  }
  if (amount <= state.limit) {
    state.bank += amount;
    state.pendingDeposit = null;
    limitForm.hidden = true;
    renderAccount();
    show(message, `Added ${vnd(amount)}.`, "win");
    return;
  }
  state.pendingDeposit = amount;
  limitForm.hidden = false;
  document.getElementById("new-limit").value = String(amount);
  show(message, `Cannot add more than ${vnd(state.limit)} at once. Set a higher limit to continue.`);
});

document.getElementById("limit-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const message = document.getElementById("account-message");
  const newLimit = Number(document.getElementById("new-limit").value);
  const amount = state.pendingDeposit;
  if (!Number.isInteger(newLimit) || newLimit <= 0) {
    show(message, "Enter a positive limit.");
    return;
  }
  state.limit = newLimit;
  if (amount != null && amount <= newLimit) {
    state.bank += amount;
    state.pendingDeposit = null;
    document.getElementById("limit-form").hidden = true;
    renderAccount();
    show(message, `Limit is now ${vnd(newLimit)}. Added ${vnd(amount)}.`, "win");
    return;
  }
  renderAccount();
  show(message, `Amount exceeds the new limit of ${vnd(newLimit)}. Deposit was not added.`);
});

document.getElementById("cancel-limit").addEventListener("click", () => {
  state.pendingDeposit = null;
  document.getElementById("limit-form").hidden = true;
  show(document.getElementById("account-message"), "Deposit cancelled.");
});

const music = document.getElementById("music");
const volume = document.getElementById("volume");

function applyVolume() {
  music.volume = Number(volume.value) / 100;
}

function startMusic() {
  applyVolume();
  music.play().catch(() => {});
}

volume.addEventListener("input", startMusic);
document.addEventListener("pointerdown", startMusic, { once: true });
applyVolume();
startMusic();

renderAccount();
renderFrequency();
renderFreqTable(document.getElementById("sim-frequency"), emptyFreq());
