const MAX_BOXES = 16;
const WALL = 12;
const BOTTOM_HALF_MIN = 15;
const MIN_TOP = 4;

const form = document.querySelector("#planner-form");
const input = document.querySelector("#box-count");
const message = document.querySelector("#message");
const results = document.querySelector("#results");
const planLine = document.querySelector("#plan-line");
const floorList = document.querySelector("#floor-list");

function label(n) {
  if (n === MAX_BOXES) return "filled";
  if (n >= WALL) return "wall formed";
  if (n > 4) return "partial";
  return "weak";
}

function valid(floors) {
  if (!floors.length || floors[floors.length - 1] < MIN_TOP) return false;
  if (floors.length <= 3) return floors[0] >= WALL;
  return (
    floors.every((floor, i) => i === floors.length - 1 || floor >= floors[i + 1]) &&
    floors.slice(0, Math.floor(floors.length / 2)).every((floor) => floor >= BOTTOM_HALF_MIN)
  );
}

function better(a, b) {
  if (!b) return true;
  if (a[a.length - 1] !== b[b.length - 1]) return a[a.length - 1] > b[b.length - 1];
  if (a.length !== b.length) return a.length < b.length;
  if (a.length <= 3 && a[0] !== b[0]) return a[0] < b[0];
  return a.join(",") > b.join(",");
}

function bestStack(total) {
  if (total <= 0) return [];
  let best = null;

  function search(left, floors, count) {
    const need = count - floors.length;
    if (need === 0) {
      if (left === 0 && valid(floors) && better(floors, best)) best = [...floors];
      return;
    }

    if (left < need || left > need * MAX_BOXES) return;

    let low = Math.max(1, left - (need - 1) * MAX_BOXES);
    let high = Math.min(MAX_BOXES, left - (need - 1));

    if (count <= 3) {
      if (!floors.length) low = Math.max(low, WALL);
      else if (floors.length === 1 && floors[0] === WALL) high = MAX_BOXES;
    } else if (floors.length) {
      high = Math.min(high, floors[floors.length - 1]);
    }

    for (let boxes = high; boxes >= low; boxes -= 1) {
      floors.push(boxes);
      search(left - boxes, floors, count);
      floors.pop();
    }
  }

  for (let count = Math.ceil(total / MAX_BOXES); count <= total; count += 1) {
    search(total, [], count);
    if (best) return best;
  }
  return [];
}

function render(total) {
  const floors = bestStack(total);
  if (!floors.length) {
    results.classList.add("hidden");
    message.textContent = "No valid stack found for that number.";
    return;
  }

  const ordered = [...floors].sort((a, b) => b - a);
  const top = floors[floors.length - 1];
  message.textContent = `Calculated for ${total} boxes.`;
  planLine.textContent = `${floors.length} floors`;
  floorList.innerHTML = "";

  ordered.forEach((boxes, index) => {
    const status = label(boxes);
    const topNote = boxes === top ? '<span class="floor-top">Top Floor</span>' : "";
    const card = document.createElement("article");
    card.className = `floor-card ${status.replace(/\s+/g, "-")}`;
    card.innerHTML = `
      <div class="floor-main">
        <span class="floor-name">Floor ${index + 1}</span>
        <strong class="floor-count">${boxes}</strong>
      </div>
      <div class="floor-meta">
        ${topNote}
        <span class="floor-tag">${status}</span>
      </div>
    `;
    floorList.appendChild(card);
  });

  results.classList.remove("hidden");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const total = Number.parseInt(input.value, 10);

  if (!Number.isInteger(total) || total <= 0) {
    results.classList.add("hidden");
    message.textContent = "Please enter a whole number greater than 0.";
    return;
  }

  render(total);
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));

    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  });
}
