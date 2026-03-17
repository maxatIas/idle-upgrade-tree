// =========================
// VARIABLES GLOBALES
// =========================

let coin = document.querySelector(".CoinAmount");
let clickerAmount = document.querySelector(".clicker-amount");
let gps = document.querySelector(".gps");

let parsedCoin = parseFloat(coin.innerHTML);
let parsedClickerAmount = 1; // base click
let parsedgps = 0;

let coinContainer = document.querySelector(".coin-img-container");
let mult = 1;
let synergyTier = {};



// =========================
// LISTE DES UPGRADES
// =========================

const upgrades = [
    { id: "c1", name: "Click Upgrade I", baseIncrease: 1, cost: 10, scaling: 1.3 },
    { id: "c2", name: "Click Upgrade II", baseIncrease: 10, cost: 100, scaling: 1.3 },
    { id: "c3", name: "Click Upgrade III", baseIncrease: 100, cost: 1000, scaling: 1.3 },
    { id: "c4", name: "Click Upgrade IV", baseIncrease: 1000, cost: 10000, scaling: 1.3 },
    { id: "c5", name: "Click Upgrade V", baseIncrease: 10000, cost: 100000, scaling: 1.3 },
    { id: "c6", name: "Click Upgrade VI", baseIncrease: 100000, cost: 1000000, scaling: 1.3 },
    { id: "c7", name: "Click Upgrade VII", baseIncrease: 1000000, cost: 10000000, scaling: 1.3 },

    { id: "p1", name: "Passive Income I", baseIncrease: 1, cost: 15, scaling: 1.3 },
    { id: "p2", name: "Passive Income II", baseIncrease: 10, cost: 150, scaling: 1.3 },
    { id: "p3", name: "Passive Income III", baseIncrease: 100, cost: 1500, scaling: 1.3 },
    { id: "p4", name: "Passive Income IV", baseIncrease: 1000, cost: 15000, scaling: 1.3 },
    { id: "p5", name: "Passive Income V", baseIncrease: 10000, cost: 150000, scaling: 1.3 },
    { id: "p6", name: "Passive Income VI", baseIncrease: 100000, cost: 1500000, scaling: 1.3 },
    { id: "p7", name: "Passive Income VII", baseIncrease: 1000000, cost: 15000000, scaling: 1.3 },

    { id: "m1", name: "Gold Multiplier I", multiplier: 1.5, cost: 1000 },
    { id: "m2", name: "Gold Multiplier II", multiplier: 2, cost: 500000 },
    { id: "m3", name: "Gold Multiplier III", multiplier: 5, cost: 10000000 },
    { id: "m4", name: "Gold Multiplier IV", multiplier: 10, cost: 500000000 },
    { id: "m5", name: "Gold Multiplier V", multiplier: 25, cost: 10000000000 },

    { id: "s1", name: "Synergy Tier 1", effectPerUpgrade: 0.02, cost: 1000 },
    { id: "s2", name: "Synergy Tier 2", effectPerUpgrade: 0.02, cost: 10000 },
    { id: "s3", name: "Synergy Tier 3", effectPerUpgrade: 0.02, cost: 100000 },
    { id: "s4", name: "Synergy Tier 4", effectPerUpgrade: 0.02, cost: 1000000 },
    { id: "s5", name: "Synergy Tier 5", effectPerUpgrade: 0.02, cost: 10000000 },
    { id: "s6", name: "Synergy Tier 6", effectPerUpgrade: 0.02, cost: 100000000 },
    { id: "s7", name: "Synergy Tier 7", effectPerUpgrade: 0.02, cost: 1000000000 }

];
const typeMap = { c: "click", p: "passive", m: "mult", s: "synergy" };

for (const upg of upgrades) {
    upg.type = typeMap[upg.id[0]];
    upg.tier = parseInt(upg.id.slice(1));
}


// =========================
// GENERATION DES UPGRADES
// =========================

const scroller = document.querySelector(".scroller");

for (const upg of upgrades) {

    let template = (upg.type === "mult" || upg.type === "synergy")
        ? document.getElementById("template-mult-upgrade")
        : document.getElementById("template-normal-upgrade");

    const clone = template.content.cloneNode(true);
    const el = clone.querySelector(".upgrade");

    upg.el = el;
    upg.costEl = el.querySelector(".upgrade-cost");
    const info = el.querySelector(".level-info p");

    if (upg.type === "click" || upg.type === "passive") {
        upg.levelEl = el.querySelector(".upgrade-level");
    } else {
        upg.levelEl = null;
    }

    upg.statusEl = el.querySelector(".status");

    el.querySelector(".upgrade-name").textContent = upg.name;
    upg.costEl.textContent = formatNumber(upg.cost);

    if (upg.type === "click") info.innerHTML = `+${upg.baseIncrease} per click`;
    if (upg.type === "passive") info.innerHTML = `+${upg.baseIncrease} per second`;
    if (upg.type === "mult") info.innerHTML = `x${upg.multiplier} multiplier`;
    if (upg.type === "synergy") {
        synergyTier[upg.tier] = 1; // multiplicateur de base
        info.innerHTML = `+${upg.effectPerUpgrade * 100}% per tier ${upg.tier} upgrade`;
    }



    el.classList.add(upg.type);

    if (upg.type === "mult" || upg.type === "synergy") {
        el.querySelector(".buy").addEventListener("click", () => buyUpgrade(upg));
    } else {
        el.querySelector(".buy1").addEventListener("click", () => buyUpgrade(upg));
        el.querySelector(".buy10").addEventListener("click", () => buy10Upgrade(upg));
        el.querySelector(".buyMax").addEventListener("click", () => buyMaxUpgrade(upg));
    }

    scroller.appendChild(clone);
}


// =========================
// RECALCUL DES BASES
// =========================

function recalcBaseValues() {
    let clickBase = 1; // base click
    let passiveBase = 0;

    for (const upg of upgrades) {
        if (upg.type === "click" && upg.levelEl) {
            clickBase += upg.baseIncrease * parseInt(upg.levelEl.textContent);
        }
        if (upg.type === "passive" && upg.levelEl) {
            passiveBase += upg.baseIncrease * parseInt(upg.levelEl.textContent);
        }
    }

    parsedClickerAmount = clickBase;
    parsedgps = passiveBase;
}
function countUpgradesInTier(tier) {
    let total = 0;

    for (const upg of upgrades) {
        if (upg.tier === tier && upg.levelEl) {
            total += parseInt(upg.levelEl.textContent);
        }
    }
    return total;
}
function recalcSynergyTier(tier) {
    const synergyUpg = upgrades.find(u => u.type === "synergy" && u.tier === tier);
    if (!synergyUpg) return;

    if (!synergyUpg.el.classList.contains("owned")) {
        synergyTier[tier] = 1;
        return;
    }

    const total = countUpgradesInTier(tier);
    synergyTier[tier] = 1 + (total * synergyUpg.effectPerUpgrade);
}
function getSynergyMultiplier() {
    let total = 1;
    for (const tier in synergyTier) {
        total *= synergyTier[tier];
    }
    return total;
}

function formatNumber(num) {
    if (num < 1000) return num.toString();

    const units = ["", "K", "M", "B", "T", "Qd", "Qi", "Sx", "Se", "Oc", "No", "De"];
    let unitIndex = 0;

    while (num >= 1000 && unitIndex < units.length - 1) {
        num /= 1000;
        unitIndex++;
    }

    return num.toFixed(2).replace(/\.00$/, "") + units[unitIndex];
}


// =========================
// STATS
// =========================

function updateStats() {
    const synergy = getSynergyMultiplier();
    clickerAmount.textContent = formatNumber(parsedClickerAmount * mult * synergy);
    gps.textContent = formatNumber(parsedgps * mult * synergy);
}


// =========================
// CLICK
// =========================

function incrementCoin(event) {
    const synergy = getSynergyMultiplier();
    const gpc = parsedClickerAmount * mult * synergy;
    parsedCoin += gpc;
    coin.textContent = formatNumber(parsedCoin);

    // Animation du +X
    const x = event.offsetX;
    const y = event.offsetY;
    const div = document.createElement('div');
    div.innerHTML = `+${formatNumber(gpc)}`;
    div.style.cssText = `
        color: white;
        position: absolute;
        top: ${y - 15}px;
        left: ${x - 5}px;
        pointer-events: none;
    `;
    coinContainer.appendChild(div);
    div.classList.add("fade-up");

    updateStats();
    checkAvailable();

    setTimeout(() => div.remove(), 900);
}


// =========================
// ACHAT D'UPGRADES
// =========================

function buyUpgrade(upg) {
    if (parsedCoin < upg.cost) return false;

    parsedCoin -= upg.cost;
    coin.textContent = Math.round(parsedCoin);

    if (upg.type === "mult") {
        mult *= upg.multiplier;
        upg.el.classList.add("owned");
        upg.statusEl.textContent = "owned";
    }

    if (upg.type === "synergy") {
        upg.el.classList.add("owned");
        upg.statusEl.textContent = "owned";
        recalcSynergyTier(upg.tier);
    }


    if (upg.levelEl) {
        upg.levelEl.textContent = parseInt(upg.levelEl.textContent) + 1;
        recalcSynergyTier(upg.tier);
    }

    if (upg.scaling) {
        upg.cost = Math.round(upg.cost * upg.scaling);
        upg.costEl.textContent = formatNumber(upg.cost);
    }

    recalcBaseValues();
    updateStats();
    checkAvailable();
    return true;
}


// =========================
// CHECK AVAILABLE
// =========================

function checkAvailable() {
    for (const upg of upgrades) {

        const buttons = upg.el.querySelectorAll(".left-section .upgrade-button");
        const btn1 = buttons[0] || null;
        const btn10 = buttons[1] || null;
        const btnMax = buttons[2] || null;

        // BUY 1
        if (btn1) {
            if (parsedCoin >= upg.cost && !upg.el.classList.contains("owned")) {
                btn1.classList.add("available");
                btn1.classList.remove("unavailable");
            } else {
                btn1.classList.add("unavailable");
                btn1.classList.remove("available");
            }
        }

        // BUY 10
        if (btn10) {
            const totalCost10 = costForNextN(upg, 10);
            if (parsedCoin >= totalCost10 && !upg.el.classList.contains("owned")) {
                btn10.classList.add("available");
                btn10.classList.remove("unavailable");
            } else {
                btn10.classList.add("unavailable");
                btn10.classList.remove("available");
            }
        }

        // BUY MAX
        if (btnMax) {
            if (parsedCoin >= upg.cost && !upg.el.classList.contains("owned")) {
                btnMax.classList.add("available");
                btnMax.classList.remove("unavailable");
            } else {
                btnMax.classList.add("unavailable");
                btnMax.classList.remove("available");
            }
        }
    }
}


// =========================
// BUY 10 / BUY MAX
// =========================

function costForNextN(upg, n) {
    let total = 0;
    let cost = upg.cost;

    for (let i = 0; i < n; i++) {
        total += cost;
        if (upg.scaling) cost = Math.round(cost * upg.scaling);
    }
    return total;
}

function buy10Upgrade(upg) {
    const totalCost = costForNextN(upg, 10);
    if (parsedCoin < totalCost) return false;

    for (let i = 0; i < 10; i++) buyUpgrade(upg);
    return true;
}

function buyMaxUpgrade(upg) {
    while (buyUpgrade(upg)) {}
}


// =========================
// PASSIF
// =========================

setInterval(() => {
    const synergy = getSynergyMultiplier()
    parsedCoin += parsedgps * mult * synergy / 100;
    coin.textContent = formatNumber(parsedCoin);
    updateStats();
    checkAvailable();
}, 10);


// =========================
// FILTRAGE
// =========================

function filterUpgrades(category) {
    for (const upg of upgrades) {
        upg.el.style.display = (upg.type === category) ? "flex" : "none";
    }
}

document.querySelector(".click-select").addEventListener("click", () => filterUpgrades("click"));
document.querySelector(".passive-select").addEventListener("click", () => filterUpgrades("passive"));
document.querySelector(".mult-select").addEventListener("click", () => filterUpgrades("mult"));
document.querySelector(".synergy-select").addEventListener("click", () => filterUpgrades("synergy"));

filterUpgrades("click");
checkAvailable();

coinContainer.addEventListener("click", incrementCoin);
updateStats();
