// =========================
// VARIABLES GLOBALES
// =========================

let coin = document.querySelector(".CoinAmount");
let clickerAmount = document.querySelector(".clicker-amount");
let gps = document.querySelector(".gps");
let gemAmountEl = document.querySelector(".gem-amount");
let currentPrestigeEl = document.querySelector(".current-prestige");
let prestigeButton = document.querySelector(".prestige-button");
let prestigeDescription = document.querySelector(".prestige-description");
let inventoryGrid = document.querySelector("#inventory-grid");

let parsedCoin = parseFloat(coin.innerHTML);
let parsedClickerAmount = 1; // base click
let parsedgps = 0;
let gems = 0;
let inventory = {
    common: 0,
    uncommon: 0,
    rare: 0
};

let coinContainer = document.querySelector(".coin-img-container");
let mult = 1;
let synergyTier = {};

// =========================
// GACHA SYSTEM
// =========================

const summonCosts = {
    single: 1,
    ten: 10
};

const itemRarity = [
    { id: "common", name: "Common", probability: 0.60, color: "#808080" },
    { id: "uncommon", name: "Uncommon", probability: 0.30, color: "#00ff00" },
    { id: "rare", name: "Rare", probability: 0.10, color: "#0000ff" }
];

// Update gem display
function updateGemDisplay() {
    gemAmountEl.textContent = formatNumber(gems);
}

// Update inventory display
function updateInventoryDisplay() {
    inventoryGrid.innerHTML = '';
    
    for (const item of itemRarity) {
        const count = inventory[item.id] || 0;
        if (count > 0) {
            const itemEl = document.createElement('div');
            itemEl.className = `inventory-item ${item.id}`;
            itemEl.innerHTML = `
                <span class="item-name">${item.name}</span>
                <span class="item-count">${formatNumber(count)}</span>
            `;
            inventoryGrid.appendChild(itemEl);
        }
    }
}

// =========================
// PRESTIGE SYSTEM
// =========================

const prestiges = [
    { id: 1, name: "Novice", requiredGold: 1e6, incomeBonus: 1.1 },
    { id: 2, name: "Apprentice", requiredGold: 1e8, incomeBonus: 1.2 },
    { id: 3, name: "Adept", requiredGold: 1e10, incomeBonus: 1.3 },
    { id: 4, name: "Expert", requiredGold: 1e12, incomeBonus: 1.4 },
    { id: 5, name: "Master", requiredGold: 1e14, incomeBonus: 1.5 },
    { id: 6, name: "Grandmaster", requiredGold: 1e16, incomeBonus: 1.6 },
    { id: 7, name: "Legend", requiredGold: 1e18, incomeBonus: 1.7 },
    { id: 8, name: "Myth", requiredGold: 1e20, incomeBonus: 1.8 },
    { id: 9, name: "Ascendant", requiredGold: 1e22, incomeBonus: 2.0 },
    { id: 10, name: "Divine", requiredGold: 1e24, incomeBonus: 2.5 }
];

let currentPrestige = 0; // 0 means no prestige yet
let prestigeBonus = 1; // multiplicative bonus from prestiges

// Get current prestige object
function getCurrentPrestige() {
    return prestiges.find(p => p.id === currentPrestige) || null;
}

// Get next prestige object
function getNextPrestige() {
    return prestiges.find(p => p.id === currentPrestige + 1) || null;
}

// Update prestige UI
function updatePrestigeUI() {
    const current = getCurrentPrestige();
    const next = getNextPrestige();

    // Update current prestige display
    if (current) {
        currentPrestigeEl.textContent = `${current.name} (x${formatNumber(current.incomeBonus)})`;
    } else {
        currentPrestigeEl.textContent = "None";
    }

    // Update prestige button and description
    if (next) {
        prestigeButton.textContent = `Prestige to ${next.name}`;
        prestigeDescription.textContent = `Requires ${formatNumber(next.requiredGold)} gold. Bonus: x${formatNumber(next.incomeBonus)} income`;
        
        // Enable/disable button based on gold
        if (parsedCoin >= next.requiredGold) {
            prestigeButton.classList.add("available");
            prestigeButton.disabled = false;
        } else {
            prestigeButton.classList.remove("available");
            prestigeButton.disabled = true;
        }
    } else {
        // All prestiges completed
        prestigeButton.textContent = "Max Prestige";
        prestigeDescription.textContent = "You have reached the maximum prestige level!";
        prestigeButton.disabled = true;
    }
}

// Prestige function - resets most things but preserves gems and inventory
function prestige() {
    const next = getNextPrestige();
    if (!next || parsedCoin < next.requiredGold) return;

    // Apply prestige bonus
    currentPrestige = next.id;
    prestigeBonus *= next.incomeBonus;

    // Reset game state (but NOT gems or inventory)
    parsedCoin = 0;
    mult = 1;
    synergyTier = {};

    // Reset all upgrades
    for (const upg of upgrades) {
        upg.cost = originalUpgradeCosts[upg.id];
        upg.costEl.textContent = formatNumber(upg.cost);
        
        if (upg.levelEl) {
            upg.levelEl.textContent = "0";
        }
        
        if (upg.el.classList.contains("owned")) {
            upg.el.classList.remove("owned");
            if (upg.statusEl) {
                upg.statusEl.textContent = "not owned";
            }
        }
    }

    // Update display
    coin.textContent = "0";
    recalcBaseValues();
    updateStats();
    checkAvailable();
    updatePrestigeUI();
    updateGemDisplay(); // Gems are preserved, just update display
    updateInventoryDisplay(); // Inventory is preserved, just update display
}

// Dev function to add currency for testing
function addDevCurrency() {
    parsedCoin += 1e25; // Add a large amount of gold
    gems += 1000;     // Add plenty of gems
    coin.textContent = formatNumber(parsedCoin);
    updateGemDisplay();
    updateStats();
    checkAvailable();
    updatePrestigeUI();
}



// =========================
// LISTE DES UPGRADES
// =========================

const upgrades = [
    // CLICK UPGRADES
    { id: "c1",  name: "Click Upgrade I",   baseIncrease: 1,        cost: 10,          scaling: 1.5 },
    { id: "c2",  name: "Click Upgrade II",  baseIncrease: 10,       cost: 1e2,        scaling: 1.5 },
    { id: "c3",  name: "Click Upgrade III", baseIncrease: 100,      cost: 1e3,      scaling: 1.5 },
    { id: "c4",  name: "Click Upgrade IV",  baseIncrease: 1000,     cost: 1e4,      scaling: 1.5 },
    { id: "c5",  name: "Click Upgrade V",   baseIncrease: 10000,    cost: 1e7,        scaling: 1.5 },
    { id: "c6",  name: "Click Upgrade VI",  baseIncrease: 100000,   cost: 1e8,      scaling: 1.5 },
    { id: "c7",  name: "Click Upgrade VII", baseIncrease: 1e6,      cost: 1e9,        scaling: 1.5 },
    { id: "c8",  name: "Click Upgrade VIII",  baseIncrease: 1e7,   cost: 1e10,    scaling: 1.5 },
    { id: "c9",  name: "Click Upgrade IX",   baseIncrease: 1e8,   cost: 1e11,  scaling: 1.5 },
    { id: "c10", name: "Click Upgrade X",    baseIncrease: 1e9,   cost: 1e15, scaling: 1.5 },
    { id: "c11", name: "Click Upgrade XI",   baseIncrease: 1e10,  cost: 1e16, scaling: 1.5 },
    { id: "c12", name: "Click Upgrade XII",  baseIncrease: 1e11,  cost: 1e17, scaling: 1.5 },
    { id: "c13", name: "Click Upgrade XIII", baseIncrease: 1e12,  cost: 1e18, scaling: 1.5 },
    { id: "c14", name: "Click Upgrade XIV",  baseIncrease: 1e13,  cost: 1e19,  scaling: 1.5 },
    { id: "c15", name: "Click Upgrade XV",   baseIncrease: 1e14,  cost: 1e21,  scaling: 1.5 },

    // PASSIVE UPGRADES
    { id: "p1",  name: "Passive Income I",   baseIncrease: 1,        cost: 10,      scaling: 1.5 },
    { id: "p2",  name: "Passive Income II",  baseIncrease: 10,       cost: 1e2,     scaling: 1.5 },
    { id: "p3",  name: "Passive Income III", baseIncrease: 100,      cost: 1e3,     scaling: 1.5 },
    { id: "p4",  name: "Passive Income IV",  baseIncrease: 1000,     cost: 1e4,     scaling: 1.5 },
    { id: "p5",  name: "Passive Income V",   baseIncrease: 10000,    cost: 1e7,     scaling: 1.5 },
    { id: "p6",  name: "Passive Income VI",  baseIncrease: 100000,   cost: 1e8,     scaling: 1.5 },
    { id: "p7",  name: "Passive Income VII", baseIncrease: 1e6,      cost: 1e9,     scaling: 1.5 },
    { id: "p8",  name: "Passive Income VIII",  baseIncrease: 1e7,   cost: 1e10,  scaling: 1.5 },
    { id: "p9",  name: "Passive Income IX",   baseIncrease: 1e8,   cost: 1e11,  scaling: 1.5 },
    { id: "p10", name: "Passive Income X",    baseIncrease: 1e9,   cost: 1e15,  scaling: 1.5 },
    { id: "p11", name: "Passive Income XI",   baseIncrease: 1e10,  cost: 1e16,  scaling: 1.5 },
    { id: "p12", name: "Passive Income XII",  baseIncrease: 1e11,  cost: 1e17,  scaling: 1.5 },
    { id: "p13", name: "Passive Income XIII", baseIncrease: 1e12,  cost: 1e18,  scaling: 1.5 },
    { id: "p14", name: "Passive Income XIV",  baseIncrease: 1e13,  cost: 1e19,  scaling: 1.5 },
    { id: "p15", name: "Passive Income XV",   baseIncrease: 1e14,  cost: 1e21,  scaling: 1.5 },

    // MULTIPLIERS
    { id: "m1", name: "Gold Multiplier I",  multiplier: 1.2,  cost: 5e2 },
    { id: "m2", name: "Gold Multiplier II", multiplier: 1.4,  cost: 5e3 },
    { id: "m3", name: "Gold Multiplier III", multiplier: 1.6,  cost: 5e4 },
    { id: "m4", name: "Gold Multiplier IV", multiplier: 1.8,  cost: 2.5e5 },
    { id: "m5", name: "Gold Multiplier V",  multiplier: 2.0,  cost: 1e6 },
    { id: "m6",  name: "Gold Multiplier VI",  multiplier: 2.2,  cost: 5e10 },
    { id: "m7",  name: "Gold Multiplier VII", multiplier: 2.4,  cost: 2.5e11 },
    { id: "m8",  name: "Gold Multiplier VIII", multiplier: 2.6, cost: 1e12 },
    { id: "m9",  name: "Gold Multiplier IX",  multiplier: 2.8, cost: 5e12 },
    { id: "m10", name: "Gold Multiplier X",   multiplier: 3.0, cost: 2.5e13 },
    { id: "m11", name: "Gold Multiplier XI",  multiplier: 3.3, cost: 1e14 },
    { id: "m12", name: "Gold Multiplier XII", multiplier: 3.6, cost: 5e15 },
    { id: "m13", name: "Gold Multiplier XIII", multiplier: 4.0, cost: 2.5e16 },
    { id: "m14", name: "Gold Multiplier XIV", multiplier: 4.5, cost: 1e17 },
    { id: "m15", name: "Gold Multiplier XV",  multiplier: 5.0, cost: 5e18 },

    // SYNERGIES
    { id: "s1", name: "Synergy Tier 1", effectPerUpgrade: 0.02, cost: 100},
    { id: "s2", name: "Synergy Tier 2", effectPerUpgrade: 0.02, cost: 1e3},
    { id: "s3", name: "Synergy Tier 3", effectPerUpgrade: 0.02, cost: 1e4},
    { id: "s4", name: "Synergy Tier 4", effectPerUpgrade: 0.02, cost: 1e5},
    { id: "s5", name: "Synergy Tier 5", effectPerUpgrade: 0.02, cost: 1e8},
    { id: "s6", name: "Synergy Tier 6", effectPerUpgrade: 0.02, cost: 1e9},
    { id: "s7", name: "Synergy Tier 7", effectPerUpgrade: 0.02, cost: 1e10},
    { id: "s8",  name: "Synergy Tier 8",  effectPerUpgrade: 0.02, cost: 1e11},
    { id: "s9",  name: "Synergy Tier 9",  effectPerUpgrade: 0.02, cost: 1e12},
    { id: "s10", name: "Synergy Tier 10", effectPerUpgrade: 0.02, cost: 1e16},
    { id: "s11", name: "Synergy Tier 11", effectPerUpgrade: 0.02, cost: 1e17},
    { id: "s12", name: "Synergy Tier 12", effectPerUpgrade: 0.02, cost: 1e18},
    { id: "s13", name: "Synergy Tier 13", effectPerUpgrade: 0.02, cost: 1e19},
    { id: "s14", name: "Synergy Tier 14", effectPerUpgrade: 0.02, cost: 1e20},
    { id: "s15", name: "Synergy Tier 15", effectPerUpgrade: 0.02, cost: 1e22}
];

// Store original costs for resetting when prestiging
const originalUpgradeCosts = {};
for (const upg of upgrades) {
    originalUpgradeCosts[upg.id] = upg.cost;
}

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

    if (upg.type === "click") info.innerHTML = `+${formatNumber(upg.baseIncrease)} per click`;
    if (upg.type === "passive") info.innerHTML = `+${formatNumber(upg.baseIncrease)} per second`;
    if (upg.type === "mult") info.innerHTML = `x${formatNumber(upg.multiplier)} multiplier`;
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

    const units = ["", "K", "M", "B", "T", "Qd", "Qi", "Sx", "Se", "Oc", "No", "De", "UDe", "DDe", "TDe"];
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
    const totalMultiplier = mult * synergy * prestigeBonus;
    clickerAmount.textContent = formatNumber(parsedClickerAmount * totalMultiplier);
    gps.textContent = formatNumber(parsedgps * totalMultiplier);
}


// =========================
// CLICK
// =========================

function incrementCoin(event) {
    const synergy = getSynergyMultiplier();
    const totalMultiplier = mult * synergy * prestigeBonus;
    const gpc = parsedClickerAmount * totalMultiplier;
    parsedCoin += gpc;
    coin.textContent = formatNumber(Math.round(parsedCoin));

    // 0.5% chance to get a gem
    if (Math.random() < 0.005) {
        gems += 1;
        updateGemDisplay();
        // Show gem +1 animation
        const x = event.offsetX;
        const y = event.offsetY;
        const gemDiv = document.createElement('div');
        gemDiv.innerHTML = '+1 Gem';
        gemDiv.style.cssText = `
            color: #00ffff;
            position: absolute;
            top: ${y - 15}px;
            left: ${x - 5}px;
            pointer-events: none;
            font-weight: 700;
        `;
        coinContainer.appendChild(gemDiv);
        gemDiv.classList.add("fade-up");
        setTimeout(() => gemDiv.remove(), 900);
    }

    // Animation du +X
    const x = event.offsetX;
    const y = event.offsetY;
    const div = document.createElement('div');
    div.innerHTML = `+${formatNumber(Math.round(gpc))}`;
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
    updatePrestigeUI();

    setTimeout(() => div.remove(), 900);
}

function save() {
    localStorage.clear()
    const data = {
        coin: parsedCoin,
        mult: mult,
        gems: gems,
        inventory: inventory,
        currentPrestige: currentPrestige,
        prestigeBonus: prestigeBonus,
        upgrades: upgrades.map(upg => ({
            id: upg.id,
            cost: upg.cost,
            level: upg.levelEl ? parseInt(upg.levelEl.textContent) : null,
            owned: upg.el.classList.contains("owned")
        }))
    };
    localStorage.setItem("idleSave", JSON.stringify(data));
}


function load() {
    const rawdata = localStorage.getItem("idleSave");
    if (!rawdata) return;

    const data = JSON.parse(rawdata);

    parsedCoin = data.coin;
    mult = data.mult;
    gems = data.gems || 0;
    inventory = data.inventory || { common: 0, uncommon: 0, rare: 0 };
    currentPrestige = data.currentPrestige || 0;
    prestigeBonus = data.prestigeBonus || 1;
    coin.textContent = formatNumber(parsedCoin);
    updateGemDisplay();

    for (const saved of data.upgrades) {
        const upg = upgrades.find(u => u.id === saved.id);
        if (!upg) continue;

        upg.cost = saved.cost;
        upg.costEl.textContent = formatNumber(upg.cost);

        if (upg.levelEl && saved.level !== null) {
            upg.levelEl.textContent = saved.level;
        }

        if (saved.owned) {
            upg.el.classList.add("owned");
            upg.statusEl.textContent = "owned";
        }
    }

    recalcBaseValues();

    // Recalcule toutes les synergies
    for (const upg of upgrades) {
        if (upg.type === "synergy") {
            recalcSynergyTier(upg.tier);
        }
    }

    updateInventoryDisplay();
    updateStats();
    checkAvailable();
    updatePrestigeUI();
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
    const totalMultiplier = mult * synergy * prestigeBonus;
    parsedCoin += parsedgps * totalMultiplier / 100;
    coin.textContent = formatNumber(Math.round(parsedCoin));
    updateStats();
    checkAvailable();
    updatePrestigeUI();
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
updatePrestigeUI();
updateGemDisplay();
updateInventoryDisplay();

// =========================
// PAGE TAB SYSTEM
// =========================

function switchPage(pageName) {
    // Update tab buttons
    const tabButtons = document.querySelectorAll(".tab-button");
    tabButtons.forEach(btn => {
        if (btn.dataset.page === pageName) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    // Show/hide pages (pages are inside .page-content > .page-container)
    const pageContainer = document.querySelector(".page-content .page-container");
    const pages = pageContainer.querySelectorAll(".page");
    pages.forEach(page => {
        if (page.classList.contains(`${pageName}-page`)) {
            page.style.display = "flex";
        } else {
            page.style.display = "none";
        }
    });
}

// Initialize tab system
document.querySelectorAll(".tab-button").forEach(btn => {
    btn.addEventListener("click", () => {
        switchPage(btn.dataset.page);
    });
});

// =========================
// SUMMON FUNCTIONS
// =========================

function getRandomItem() {
    const rand = Math.random();
    let cumulative = 0;
    
    for (const item of itemRarity) {
        cumulative += item.probability;
        if (rand < cumulative) {
            return item.id;
        }
    }
    return "common"; // fallback
}

function addItemToInventory(itemId) {
    inventory[itemId] = (inventory[itemId] || 0) + 1;
    updateInventoryDisplay();
}

function summonOnce() {
    if (gems < summonCosts.single) return;
    
    gems -= summonCosts.single;
    updateGemDisplay();
    
    const item = getRandomItem();
    addItemToInventory(item);
    
    // Bonus for single summon: nothing special
}

function summon10() {
    if (gems < summonCosts.ten) return;
    
    gems -= summonCosts.ten;
    updateGemDisplay();
    
    // 10 summons for 10 gems, get 11 items (bonus)
    for (let i = 0; i < 11; i++) {
        const item = getRandomItem();
        addItemToInventory(item);
    }
}
