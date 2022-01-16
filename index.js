let deckID = ""
let dealerCards = []
let dealerScore = 0
let playerCards = []
let playerScore = 0
let roundWon = false
let roundTied = false
let roundLost = false

const dealerScoreNode = document.querySelector("#dealer-number")
const dealerCardsNode = document.querySelector("#dealer-cards")
const playerScoreNode = document.querySelector("#player-number")
const playerCardsNode = document.querySelector("#player-cards")
const announcementNode = document.querySelector("#announcement")
const newDeckNode = document.querySelector("#new-game")
const nextHandNode = document.querySelector("#next-hand")
const hitMeNode = document.querySelector("#hit-me")
const stayNode = document.querySelector("#stay")


// On click events
// ==================
newDeckNode.onclick = getNewDeck
nextHandNode.onclick = newHand
hitMeNode.onclick = () => hitMe('player')
stayNode.onclick = () => setTimeout(() => dealerPlays(), 600)
// ==================


// Game mechanics functions
// ========================
function getNewDeck() {
    resetGame()
    fetch ("http://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6")
    .then(response => response.json())
    .then(response => {
        deckID = response.deck_id
        nextHandNode.style.display = "block"
        hitMeNode.style.display = "none"
        stayNode.style.display = "none"
    })
}

function newHand() {
  resetGame()
  fetch(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=4`)
    .then(response => response.json())
    .then(response => {
      hitMeNode.style.display = "block"
      stayNode.style.display = "block"

      dealerCards.push(response.cards[0], response.cards[1])
      playerCards.push(response.cards[2], response.cards[3])

      dealerScore = "?"
      dealerScoreNode.textContent = dealerScore

      dealerCards.forEach((card, i) => {
        let cardDomElement = document.createElement("img")
        if (i === 0) {
          cardDomElement.src = "./card.png"
        } else {
          cardDomElement.src = card.image
        }
        dealerCardsNode.appendChild(cardDomElement)
      })

      playerCards.forEach(card => {
        let cardDomElement = document.createElement("img")
        cardDomElement.src = card.image
        playerCardsNode.appendChild(cardDomElement)
      })

      playerScore = computeScore(playerCards)
      if (playerScore === 21) {
        roundWon = true
        announcementNode.textContent = "BlackJack! You Win!"
      }
      playerScoreNode.textContent = playerScore

    })
  }



  // This function receives an array of cards and returns the total score.
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
      playerCardsNode.appendChild(cardDomElement)

      playerScore = computeScore(playerCards);

      playerScoreNode.textContent = playerScore;
      if (playerScore > 21) {
        roundLost = true;
        announcementNode.textContent = "Bust"
      }
    }

    if (target === 'dealer') {
      let cardDomElement = document.createElement("img");
      dealerCards.push(response.cards[0])
      cardDomElement.src = response.cards[0].image;
      dealerCardsNode.appendChild(cardDomElement)
      dealerPlays();
    }

  })
}

function dealerPlays() {
  if (roundLost || roundWon || roundTied) {return}
  dealerScore = computeScore(dealerCards);
  dealerScoreNode.textContent = dealerScore;
  dealerCardsNode.firstChild.src = dealerCards[0].image;
  if (dealerScore < 17) {
    setTimeout(()=>hitMe('dealer'), 1000)
  }
  else if (dealerScore > 21) {
    roundWon = true;
    announcementNode.textContent = "Dealer busts, you win!";
  }
  else if (dealerScore > playerScore) {
    roundLost = true;
    announcementNode.textContent = "You lose!";
  }
  else if (dealerScore === playerScore) {
    roundTied = true;
    announcementNode.textContent = "Push, It's a draw";
  }
  else {
    roundWon = true;
    announcementNode.textContent = "You win!";
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
  dealerScoreNode.textContent = dealerScore
  announcementNode.textContent = ""
  while (dealerCardsNode.firstChild) {
    dealerCardsNode.removeChild(dealerCardsNode.firstChild)
  }
  while (playerCardsNode.firstChild) {
    playerCardsNode.removeChild(playerCardsNode.firstChild)
  }
}