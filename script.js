// script.js

// 1. Game State Object
// This single object will hold all the data for our game.
let gameState = {
  player1Name: "",
  player2Name: "",
  initialLives: 0,
  player1Lives: 0,
  player2Lives: 0,
  currentRound: 1,
  playTime: 0,
  timerInterval: null,
};

// 2. DOM Element References
// We get references to the elements we need to interact with.
const setupScreen = document.getElementById("setup-screen");
const gameUIScreen = document.getElementById("game-ui-screen");
const startGameBtn = document.getElementById("start-game-btn");

const player1NameInput = document.getElementById("player1-name");
const player2NameInput = document.getElementById("player2-name");
const initialLivesInput = document.getElementById("initial-lives");

// 3. Event Listener for "Start Game" Button
startGameBtn.addEventListener("click", () => {
  // Get values from the input fields
  const p1Name = player1NameInput.value.trim();
  const p2Name = player2NameInput.value.trim();
  const initialLives = parseInt(initialLivesInput.value, 10);

  // Basic validation
  if (
    p1Name === "" ||
    p2Name === "" ||
    isNaN(initialLives) ||
    initialLives <= 0
  ) {
    document.getElementById("validation-dialog").showModal();
    new Audio("sound/error_sound.mp3").play();
    return;
  }

  // 4. Update the Game State
  // Set the initial values in our gameState object.
  // Update the Game State
  gameState.player1Name = p1Name;
  gameState.player2Name = p2Name;
  gameState.initialLives = initialLives;
  gameState.player1Lives = initialLives;
  gameState.player2Lives = initialLives;
  gameState.currentRound = 1;
  gameState.playTime = 0;

  // Switch Screens and Render the UI
  setupScreen.classList.remove("active");
  gameUIScreen.classList.add("active");

  // Call the render function to set initial UI values
  renderGameUI();
  startPlaytimeTimer(); // This function will be created in the next step
  new Audio("sound/game_start.mp3").play();
  console.log("Game started! Data saved to gameState.", gameState);
});

// New DOM Element References for the Game UI
const player1NameDisplay = document.getElementById("player1-name-display");
const player2NameDisplay = document.getElementById("player2-name-display");
const player1LivesDisplay = document.getElementById("player1-lives-display");
const player2LivesDisplay = document.getElementById("player2-lives-display");
const roundNumberDisplay = document.getElementById("round-number");
const playtimeDisplay = document.getElementById("playtime");
const closeGameBtn = document.getElementById("close-game-btn");
const nextRoundBtn = document.getElementById("next-round-btn");
const lifeButtons = document.querySelectorAll(".life-btn");
const winScreen = document.getElementById("win-screen");
const winTextAddition = document.getElementById("win-text-addition");
const winPlayerName = document.getElementById("win-player-name");
const okBtn = document.getElementById("ok-btn");

// Function to update the UI based on the current game state
function renderGameUI() {
  // Update player names and life points
  player1NameDisplay.textContent = gameState.player1Name;
  player2NameDisplay.textContent = gameState.player2Name;
  player1LivesDisplay.textContent = gameState.player1Lives;
  player2LivesDisplay.textContent = gameState.player2Lives;

  // Update round number
  roundNumberDisplay.textContent = gameState.currentRound;

  // We'll update the playtime timer separately

  // Update the orbs
  updateOrb(gameState.player1Lives, gameState.initialLives, "player1-path");
  updateOrb(gameState.player2Lives, gameState.initialLives, "player2-path");
}

// Event listener for the life point buttons (+ and -)
lifeButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    const player = event.target.dataset.player;
    const action = event.target.dataset.action;

    if (player === "1") {
      if (action === "plus") {
        gameState.player1Lives++;
      } else if (action === "minus") {
        gameState.player1Lives--;
      }
    } else if (player === "2") {
      if (action === "plus") {
        gameState.player2Lives++;
      } else if (action === "minus") {
        gameState.player2Lives--;
      }
    }

    gameState.player1Lives = Math.max(0, gameState.player1Lives);
    gameState.player2Lives = Math.max(0, gameState.player2Lives);
    if (gameState.player1Lives === 0 || gameState.player2Lives === 0) {
      const audio = new Audio("sound/man-death-scream.mp3");
      audio.play();
      disableButtons();
      audio.onended = function () {
        showWinScreen();
      };
    }
    renderGameUI();
    //checkGameEnd();
  });
});

// Event listener for the "Next Round" button
nextRoundBtn.addEventListener("click", () => {
  gameState.currentRound++;
  renderGameUI(); // Rerender to show the new round number
});

// Function to start the game timer
function startPlaytimeTimer() {
  gameState.timerInterval = setInterval(() => {
    gameState.playTime++;
    const minutes = Math.floor(gameState.playTime / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (gameState.playTime % 60).toString().padStart(2, "0");
    playtimeDisplay.textContent = `${minutes}:${seconds}`;
  }, 1000); // 1000 milliseconds = 1 second
}

// Event listener for "Close Game" button
closeGameBtn.addEventListener("click", () => {
  // Show a confirmation pop-up
  const quitDialog = document.getElementById("quit-dialog");
  quitDialog.showModal();

  document.getElementById("quit-confirm").onclick = () => {
    quitDialog.close();

    // Reset the game state
    clearInterval(gameState.timerInterval); // Stop the timer
    gameState = {
      player1Name: "",
      player2Name: "",
      initialLives: 0,
      player1Lives: 0,
      player2Lives: 0,
      currentRound: 1,
      playTime: 0,
      timerInterval: null,
    };

    // Go back to the setup screen
    gameUIScreen.classList.remove("active");
    setupScreen.classList.add("active");
  };

  document.getElementById("quit-cancel").onclick = () => quitDialog.close();
});

// Close validation dialog
document.getElementById("validation-ok").addEventListener("click", () => {
  document.getElementById("validation-dialog").close();
});

// Function to generate the SVG path data for a liquid-like effect
function getLiquidPath(percentage) {
  // We'll use a simple sine wave to create a wavy top line for the liquid
  // This is a simplified calculation to create the effect you want
  const waveHeight = 10; // How high the wave is
  const startY = 100 - percentage; // Start from the bottom

  return `M 0,100 L 0,${startY} 
            C 25,${startY - waveHeight} 75,${startY + waveHeight} 100,${startY} 
            L 100,100 Z`;
}

// Function to update the orb based on life points
function checkGameEnd() {
  if (gameState.player1Lives === 0 || gameState.player2Lives === 0) {
    disableButtons();
    showWinScreen();
  }
}

// Function to disable buttons on the game screen
function disableButtons() {
  document.querySelectorAll("#game-ui-screen button").forEach((button) => {
    button.disabled = !button.disabled;
  });
}

function showWinScreen() {
  gameUIScreen.classList.remove("active");
  winScreen.classList.add("active");

  const winner = gameState.player1Lives > 0 ? gameState.player1Name : gameState.player2Name;
  winTextAddition.textContent = `is`;
  winPlayerName.textContent = `${winner}`;

  const audio = new Audio("sound/win_sound1.mp3");
  audio.play();

  audio.onended = function () {
    new Audio("sound/win_sound2.mp3").play();
    setTimeout(() => {
      winScreen.querySelector(".win-content").classList.add("active");
      winScreen.querySelector("#ok-btn").classList.add("active");
    }, 100);
  };

  // new Audio("sound/win_sound.wav").play();
}

okBtn.addEventListener("click", () => {
  winScreen.classList.remove("active");
  setupScreen.classList.add("active");
  winScreen.querySelector(".win-content").classList.remove("active");
  winScreen.querySelector("#ok-btn").classList.remove("active");
  clearInterval(gameState.timerInterval);
  disableButtons();
});

function updateOrb(playerLives, maxLives, pathId) {
  const pathElement = document.getElementById(pathId);
  if (!pathElement) return; // Exit if the element doesn't exist

  const percentage = (playerLives / maxLives) * 100;
  pathElement.setAttribute("d", getLiquidPath(percentage));
}

// Play default beat sound
function playDefaultSound() {
  new Audio("sound/beat_btn.wav").play();
}

// Dialog buttons play sound
document.querySelectorAll(".df-sound").forEach((button) => {
  button.addEventListener("click", () => {
    playDefaultSound();
  });
});
