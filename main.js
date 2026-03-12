let coin = document.querySelector(".CoinAmount");
let clickerAmount = document.querySelector(".clicker-amount");

let parsedCoin = parseFloat(coin.innerHTML);
let parsedClickerAmount = parseFloat(clickerAmount.innerHTML);

// Multiplicateur global
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
    }
];
for (const upg of upgrades) {
    upg.el = document.getElementById(upg.id);
    upg.costEl = upg.el.querySelector(".upgrade-cost");
    upg.levelEl = upg.el.querySelector(".upgrade-level");
    upg.increaseEl = upg.el.querySelector(".level-increase");
    upg.statusEl = upg.el.querySelector(".status");
}


function checkAvailable() {
    for (const upg of upgrades) {
        if (parsedCoin >= upg.cost && !upg.el.classList.contains("owned")) {
            upg.el.classList.add("available");
            upg.el.classList.remove("unavailable");
        } else {
            upg.el.classList.add("unavailable");
            upg.el.classList.remove("available");
        }
    }
}


function incrementCoin(){
    parsedCoin += parsedClickerAmount * mult
    coin.innerHTML = Math.round(parsedCoin)
    checkAvailable()

}

function buyUpgrade(upg) {
    if (parsedCoin < upg.cost) return false;

    parsedCoin -= upg.cost;
    coin.innerHTML = Math.round(parsedCoin);

    if (upg.type === "click") {
        parsedClickerAmount += upg.baseIncrease;
        clickerAmount.innerHTML = parsedClickerAmount;
    }

    if (upg.type === "mult") {
        mult *= upg.multiplier;
        upg.el.classList.remove("available")
        upg.el.classList.add("owned")
        upg.statusEl.innerHTML = "owned";
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


function buy10Upgrade(upg){
    for (let i = 0; i < 10; i++){
        buyUpgrade(upg);
    }
}

function buyMaxUpgrade(upg){
    while (buyUpgrade(upg) === true){
    }
}

checkAvailable();