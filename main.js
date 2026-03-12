//let replaceme = document.querySelector("#replaceme")
//let parsedreplaceme = parseFloat(replaceme.innerHTML)

let coin = document.querySelector(".CoinAmount")
let parsedCoin = parseFloat(coin.innerHTML)

let clickerAmount = document.querySelector(".clicker-amount")
let parsedClickerAmount = parseFloat(clickerAmount.innerHTML)

let clicker1Cost = document.querySelector("#clicker1-cost")
let parsedClicker1Cost = parseFloat(clicker1Cost.innerHTML)

let clicker1upgradeLevel = document.querySelector("#clicker1-upgrade-level")
let parsedClicker1UpgradeLevel = parseFloat(clicker1upgradeLevel.innerHTML)

let clicker1levelIncrease = document.querySelector("#clicker1-level-increase")
let parsedClicker1LevelIncrease = parseFloat(clicker1levelIncrease.innerHTML)

let clicker2Cost = document.querySelector("#clicker2-cost")
let parsedClicker2Cost = parseFloat(clicker2Cost.innerHTML)

let clicker2upgradeLevel = document.querySelector("#clicker2-upgrade-level")
let parsedClicker2UpgradeLevel = parseFloat(clicker2upgradeLevel.innerHTML)

let clicker2levelIncrease = document.querySelector("#clicker2-level-increase")
let parsedClicker2LevelIncrease = parseFloat(clicker2levelIncrease.innerHTML)

let clicker3Cost = document.querySelector("#clicker3-cost")
let parsedClicker3Cost = parseFloat(clicker3Cost.innerHTML)

let clicker3upgradeLevel = document.querySelector("#clicker3-upgrade-level")
let parsedClicker3UpgradeLevel = parseFloat(clicker3upgradeLevel.innerHTML)

let clicker3levelIncrease = document.querySelector("#clicker3-level-increase")
let parsedClicker3LevelIncrease = parseFloat(clicker3levelIncrease.innerHTML)

let multiplier1 = document.querySelector("#multiplier1")
let parsedMultiplier1 = parseFloat(multiplier1.innerHTML)

let multiplier1cost = document.querySelector("#multiplier1-cost")
let parsedmultiplier1cost = parseFloat(multiplier1cost.innerHTML)

let multiplier1Owned = document.querySelector("#multiplier1-owned-statement")


let mult1 = false

let gpc = parsedClickerAmount
let mult = 1

function incrementCoin(){
    parsedCoin += parsedClickerAmount * mult
    coin.innerHTML = Math.round(parsedCoin)
}
function buyUpgrade1(){
    if (parsedCoin >= parsedClicker1Cost){

        parsedCoin -= parsedClicker1Cost
        coin.innerHTML = parsedCoin

        parsedClickerAmount += 1
        clickerAmount.innerHTML = parsedClickerAmount

        parsedClicker1LevelIncrease += 1
        clicker1levelIncrease.innerHTML = parsedClicker1LevelIncrease

        parsedClicker1Cost = parseInt(parsedClicker1Cost * 1.1)
        clicker1Cost.innerHTML = parsedClicker1Cost

        parsedClicker1UpgradeLevel += 1
        clicker1upgradeLevel.innerHTML = parsedClicker1UpgradeLevel
        
        return true
    }
}

function buyUpgrade2(){
    if (parsedCoin >= parsedClicker2Cost){

        parsedCoin -= parsedClicker2Cost
        coin.innerHTML = parsedCoin

        parsedClickerAmount += 10
        clickerAmount.innerHTML = parsedClickerAmount

        parsedClicker2LevelIncrease += 10
        clicker2levelIncrease.innerHTML = parsedClicker2LevelIncrease

        parsedClicker2Cost = parseInt(parsedClicker2Cost * 1.1)
        clicker2Cost.innerHTML = parsedClicker2Cost

        parsedClicker2UpgradeLevel += 1
        clicker2upgradeLevel.innerHTML = parsedClicker2UpgradeLevel
        
        return true
    }
}

function buyUpgrade3(){
    if (parsedCoin >= parsedClicker3Cost){

        parsedCoin -= parsedClicker3Cost
        coin.innerHTML = parsedCoin

        parsedClickerAmount += 100
        clickerAmount.innerHTML = parsedClickerAmount

        parsedClicker3LevelIncrease += 100
        clicker3levelIncrease.innerHTML = parsedClicker3LevelIncrease

        parsedClicker3Cost = parseInt(parsedClicker3Cost * 1.1)
        clicker3Cost.innerHTML = parsedClicker3Cost

        parsedClicker3UpgradeLevel += 1
        clicker3upgradeLevel.innerHTML = parsedClicker3UpgradeLevel

        return true
    }
}

function buy10Upgrade(upgrade){
    for (let i = 0; i < 10; i++){
        upgrade()
    }
}

function buyMaxUpgrade(upgrade){
    while (upgrade() === true){
        upgrade()
    }
}

function buyMultiplier1(){
    if (parsedCoin >= parsedmultiplier1cost && mult1 == false){
        parsedCoin -= parsedmultiplier1cost
        coin.innerHTML = parsedCoin
        mult *= parsedMultiplier1
        mult1 = true
        multiplier1Owned.innerHTML = "owned"
        document.getElementById("multiplier-upgrade1").style.backgroundColor = rgb(187, 255, 103);
        document.getElementById("multiplier1-button").style.backgroundColor = rgb(200, 200, 200);
    }
}