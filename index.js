let deckID = ""
let dealerCards = []
let dealerScore = 0
let playerCards = []
let playerScore = 0
let roundWon = false
let roundTied = false
let roundLost = false

const dealerScoreArea = document.querySelector("#dealer-number")
const dealerCardsArea = document.querySelector("#dealer-cards")
const playerScoreArea = document.querySelector("#player-number")
const playerCardsArea = document.querySelector("#player-cards")
const announcementArea = document.querySelector("#announcement")
const newDeckArea = document.querySelector("#new-game")
const nextHandArea = document.querySelector("#next-hand")
const hitMeArea = document.querySelector("#hit-me")
const stayArea = document.querySelector("#stay")

newDeckArea.onclick = getNewDeck
nextHandArea.onclick = newHand
hitMeArea.onclick = () => hitMe('player')
stayArea.onclick = () => setTimeout(() => dealerPlays(), 600)

function getNewDeck() {
    resetGame()
    fetch ("http://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6")
    .then(response => response.json())
    .then(response => {
        deckID = response.deck_id
        nextHandArea.style.display = "block"
        hitMeArea.style.display = "none"
        stayArea.style.display = "none"
    })
}

function newHand() {
  resetGame()
  fetch(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=4`)
    .then(response => response.json())
    .then(response => {
      hitMeArea.style.display = "block"
      stayArea.style.display = "block"

      dealerCards.push(response.cards[0], response.cards[1])
      playerCards.push(response.cards[2], response.cards[3])

      dealerScore = "?"
      dealerScoreArea.textContent = dealerScore

      dealerCards.forEach((card, i) => {
        let cardDomElement = document.createElement("img")
        if (i === 0) {
          cardDomElement.src = "./images/card.png"
        } else {
          cardDomElement.src = card.image
        }
        dealerCardsArea.appendChild(cardDomElement)
      })

      playerCards.forEach(card => {
        let cardDomElement = document.createElement("img")
        cardDomElement.src = card.image
        playerCardsArea.appendChild(cardDomElement)
      })

      playerScore = computeScore(playerCards)
      if (playerScore === 21) {
        roundWon = true
        announcementArea.textContent = "BlackJack! You Win!"
      }
      playerScoreArea.textContent = playerScore

    })
  }

function computeScore(cards) {
  let hasAce = false
  score = cards.reduce((acc, card) => {
    if (card.value === "ACE") {
      hasAce = true
      return acc + 1
    }
    if (isNaN(card.value)) { return acc + 10 }
    return acc + Number(card.value)
  }, 0)
  if (hasAce) {
    score = (score + 10) > 21 ? score : score + 10
  }
  return score
}


function hitMe(target) {
  if (roundLost || roundWon || roundTied) {return}
  fetch(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=1`)
  .then(response => response.json())
  .then(response => {

    if (target === 'player') {
      playerCards.push(response.cards[0])
      let cardDomElement = document.createElement("img");
      cardDomElement.src = response.cards[0].image;
      playerCardsArea.appendChild(cardDomElement)

      playerScore = computeScore(playerCards);

      playerScoreArea.textContent = playerScore;
      if (playerScore > 21) {
        roundLost = true;
        announcementArea.textContent = "Bust"
      }
    }

    if (target === 'dealer') {
      let cardDomElement = document.createElement("img");
      dealerCards.push(response.cards[0])
      cardDomElement.src = response.cards[0].image;
      dealerCardsArea.appendChild(cardDomElement)
      dealerPlays();
    }

  })
}

function dealerPlays() {
  if (roundLost || roundWon || roundTied) {return}
  dealerScore = computeScore(dealerCards);
  dealerScoreArea.textContent = dealerScore;
  dealerCardsArea.firstChild.src = dealerCards[0].image;
  if (dealerScore < 17) {
    setTimeout(()=>hitMe('dealer'), 1000)
  }
  else if (dealerScore > 21) {
    roundWon = true;
    announcementArea.textContent = "Dealer busts, you win!";
  }
  else if (dealerScore > playerScore) {
    roundLost = true;
    announcementArea.textContent = "You lose!";
  }
  else if (dealerScore === playerScore) {
    roundTied = true;
    announcementArea.textContent = "Push, It's a draw";
  }
  else {
    roundWon = true;
    announcementArea.textContent = "You win!";
  }
}

function resetGame() {
  dealerCards = []
  playerCards = []
  roundLost = false
  roundWon = false
  roundTied = false
  dealerScore = ""
  playerScore = 0
  dealerScoreArea.textContent = dealerScore
  announcementArea.textContent = ""
  while (dealerCardsArea.firstChild) {
    dealerCardsArea.removeChild(dealerCardsArea.firstChild)
  }
  while (playerCardsArea.firstChild) {
    playerCardsArea.removeChild(playerCardsArea.firstChild)
  }
}