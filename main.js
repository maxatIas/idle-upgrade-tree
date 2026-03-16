let coin = document.querySelector(".CoinAmount");
let clickerAmount = document.querySelector(".clicker-amount");
let gps = document.querySelector(".gps")

let parsedCoin = parseFloat(coin.innerHTML);
let parsedClickerAmount = parseFloat(clickerAmount.innerHTML);
let parsedgps = parseFloat(gps.innerHTML)


let coinContainer = document.querySelector(".coin-img-container")
let mult = 1;

const upgrades = [
    {
        id: "click-upgrade1",
        type: "click",
        baseIncrease: 1,
        cost: 10,
        scaling: 1.1
    },
    {
        id: "click-upgrade2",
        type: "click",
        baseIncrease: 10,
        cost: 100,
        scaling: 1.1
    },
    {
        id: "click-upgrade3",
        type: "click",
        baseIncrease: 100,
        cost: 1000,
        scaling: 1.1
    },
    {
        id: "multiplier-upgrade1",
        type: "mult",
        multiplier: 1.5,
        cost: 100
    },
    {
        id: "passive-upgrade1",
        type: "passive",
        baseIncrease: 1,
        cost: 15,
        scaling: 1.1
    }
];
for (const upg of upgrades) {
    const el = document.getElementById(upg.id);
    upg.el = el;
    upg.costEl = el.querySelector(".upgrade-cost");
    upg.levelEl = el.querySelector(".upgrade-level");
    upg.increaseEl = el.querySelector(".level-increase");
    upg.statusEl = el.querySelector(".status");
}


function checkAvailable() {
    for (const upg of upgrades) {

        const buttons = upg.el.querySelectorAll(".left-section .upgrade-button");
        const btn1 = buttons[0];
        const btn10 = buttons[1];
        const btnMax = buttons[2];

        if (parsedCoin >= upg.cost && !upg.el.classList.contains("owned")) {
            btn1.classList.add("available");
            btn1.classList.remove("unavailable");
            if (btnMax) {
                btnMax.classList.add("available");
                btnMax.classList.remove("unavailable");
            }
        } else {
            btn1.classList.add("unavailable");
            btn1.classList.remove("available");
            if (btnMax) {
                btnMax.classList.add("unavailable");
                btnMax.classList.remove("available");
            }
        }

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
    }
}


function incrementCoin(event){
    gpc = parsedClickerAmount * mult
    parsedCoin += gpc
    coin.innerHTML = Math.round(parsedCoin)
    const x = event.offsetX
    const y = event.offsetY
    const div = document.createElement('div')
    div.innerHTML = `+${Math.round(gpc)}`
    div.style.cssText = `color: white; position: absolute; top: ${y-15}px; left: ${x-5}px; pointer-events: none;`
    coinContainer.appendChild(div)
    div.classList.add("fade-up")
    checkAvailable()

    timeout(div)
}

const timeout = (div) => {
    setTimeout(() => {
        div.remove()
    }, 900)
}


function buyUpgrade(upg) {
    if (parsedCoin < upg.cost) return false;

    parsedCoin -= upg.cost;
    coin.innerHTML = Math.round(parsedCoin);

    if (upg.type === "click") {
        parsedClickerAmount += upg.baseIncrease;
        clickerAmount.innerHTML = parsedClickerAmount * mult;
    }

    if (upg.type === "mult") {
        mult *= upg.multiplier;
        upg.el.classList.remove("available")
        upg.el.classList.add("owned")
        upg.statusEl.innerHTML = "owned";
        clickerAmount.innerHTML = parsedClickerAmount * mult;
        gps.innerHTML = parsedgps * mult;
    }

    if (upg.type === "passive") {
        parsedgps += upg.baseIncrease;
        gps.innerHTML = parsedgps * mult;
    }

    if (upg.scaling) {
        upg.cost = Math.round(upg.cost * upg.scaling);
    }

    upg.costEl.innerHTML = upg.cost;

    if (upg.levelEl) {
        let lvl = parseInt(upg.levelEl.innerHTML);
        upg.levelEl.innerHTML = lvl + 1;
    }

    checkAvailable();
    return true;
}

function costForNextN(upg, n) {
    let total = 0;
    let cost = upg.cost;

    for (let i = 0; i < n; i++) {
        total += cost;
        if (upg.scaling) {
            cost = Math.round(cost * upg.scaling);
        }
    }
    return total;
}


function buy10Upgrade(upg) {
    const totalCost = costForNextN(upg, 10);

    if (parsedCoin < totalCost) return false;

    for (let i = 0; i < 10; i++) {
        buyUpgrade(upg);
    }
    return true;
}


function buyMaxUpgrade(upg){
    while (buyUpgrade(upg) === true){
    }
}

setInterval(() => {
    parsedCoin += parsedgps * mult / 100
    coin.innerHTML = Math.round(parsedCoin)
    checkAvailable()
}, 10)

function save() {
    localStorage.clear();

    upgrades.map((upgrade) => {
        const object = JSON.stringify({
            savedlvl: upgrade.levelEl ? parseFloat(upgrade.levelEl.innerHTML) : null,
            savedcost: upgrade.costEl ? parseFloat(upgrade.costEl.innerHTML) : null,
            savedlvlincr: upgrade.increaseEl ? parseFloat(upgrade.increaseEl.innerHTML) : null,
            savedstatus: upgrade.statusEl ? upgrade.statusEl.innerHTML : null,
        });

        localStorage.setItem(upgrade.id, object);
    });

    localStorage.setItem('Gold', JSON.stringify(parsedCoin));
    localStorage.setItem('goldpc', JSON.stringify(parsedClickerAmount));
    localStorage.setItem('goldps', JSON.stringify(parsedgps));
}



function load() {
    upgrades.map((upgrade) => {
        const savedvalue = JSON.parse(localStorage.getItem(upgrade.id));
        if (!savedvalue) return;

        if (upgrade.levelEl && savedvalue.savedlvl !== null)
            upgrade.levelEl.innerHTML = savedvalue.savedlvl;

        if (upgrade.costEl && savedvalue.savedcost !== null)
            upgrade.costEl.innerHTML = savedvalue.savedcost;

        if (upgrade.increaseEl && savedvalue.savedlvlincr !== null)
            upgrade.increaseEl.innerHTML = savedvalue.savedlvlincr;

        if (upgrade.statusEl && savedvalue.savedstatus !== null)
            upgrade.statusEl.innerHTML = savedvalue.savedstatus;
    });

    parsedCoin = JSON.parse(localStorage.getItem('Gold')) || 0;
    parsedClickerAmount = JSON.parse(localStorage.getItem('goldpc')) || 1;
    parsedgps = JSON.parse(localStorage.getItem('goldps')) || 0;

    coin.innerHTML = parsedCoin;
    clickerAmount.innerHTML = parsedClickerAmount;
    gps.innerHTML = parsedgps;
}



checkAvailable();