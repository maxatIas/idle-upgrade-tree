let coin = document.querySelector(".CoinAmount")
let clickerCost = document.querySelector(".clicker-cost")
let upgradeLevel = document.querySelector(".upgrade-level")
let clickerAmount = document.querySelector(".clicker-amount")
function incrementCoin(){
    coin.innerHTML = parseFloat(coin.innerHTML)+parseInt(clickerAmount.innerHTML)
}
function buyUpgrade1(){
    if (parseFloat(coin.innerHTML) >= parseFloat(clickerCost.innerHTML)){
        coin.innerHTML -= clickerCost.innerHTML
        clickerAmount.innerHTML = parseInt(clickerAmount.innerHTML)+1
        clickerCost.innerHTML = parseInt(parseFloat(clickerCost.innerHTML)*1.1)
        upgradeLevel.innerHTML = parseFloat(upgradeLevel.innerHTML)+1
    }
}