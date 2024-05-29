import redHeartUrl from "../assets/textures/red_heart.png";
import whiteHeartUrl from "../assets/textures/white_heart.png";
import eiffelIConUrl from "../assets/textures/eiffel_icon.png";

class HtmlUI {
    constructor(game) {
        this.game = game;
        this.createHeartContainer();
        this.createEiffelAndLevelContainer();
        this.createGameOverScreen();
        this.createStartScreen();
        this.createHowToPlayPopup();
        this.createKeyPressedDisplay();
    }

    createHeartContainer() {
        this.heartContainer = document.createElement("div");
        this.heartContainer.id = "heartContainer";
        this.heartContainer.style.position = "absolute";
        this.heartContainer.style.top = "1vw";
        this.heartContainer.style.left = "1vw"; 
        this.heartContainer.style.display = "flex";
        this.heartContainer.style.display = "none";
        document.body.appendChild(this.heartContainer);
        this.updateHeartDisplay();
    }

    createEiffelAndLevelContainer() {
        this.eiffelAndLevelContainer = document.createElement("div");
        this.eiffelAndLevelContainer.id = "eiffelAndLevelContainer";
        this.eiffelAndLevelContainer.style.position = "absolute";
        this.eiffelAndLevelContainer.style.top = "1vw"; 
        this.eiffelAndLevelContainer.style.left = "50%";
        this.eiffelAndLevelContainer.style.transform = "translateX(-50%)";
        this.eiffelAndLevelContainer.style.color = "white";
        this.eiffelAndLevelContainer.style.fontSize = "2.5vw";
        this.eiffelAndLevelContainer.style.display = "flex";
        this.eiffelAndLevelContainer.style.alignItems = "center";
        document.body.appendChild(this.eiffelAndLevelContainer);

        this.createLevelDisplay();
        this.createEiffelDisplay();
    }

    createEiffelDisplay() {
        this.eiffelDisplay = document.createElement("div");
        this.eiffelDisplay.id = "eiffelDisplay";
        this.eiffelDisplay.style.display = "flex";
        this.eiffelDisplay.style.alignItems = "center";
        this.levelDisplay.style.marginRight = "2vw";
        this.updateEiffelDisplay();
        this.eiffelAndLevelContainer.appendChild(this.eiffelDisplay);
    }

    createLevelDisplay() {
        this.levelDisplay = document.createElement("div");
        this.levelDisplay.id = "levelDisplay";
        this.levelDisplay.style.marginLeft = "2vw"; 
        this.updateLevelDisplay();
        this.eiffelAndLevelContainer.appendChild(this.levelDisplay);
    }

    updateEiffelDisplay() {
        this.eiffelDisplay.innerHTML = `<img src="${eiffelIConUrl}" alt="Eiffel Tower" style="width:2vw; height:2vw; vertical-align:middle; margin-right:1vw;"> Eiffel Towers: ${this.game.eiffelCollected} / ${this.game.targetEiffelCount}`;
    }

    updateLevelDisplay() {
        this.levelDisplay.textContent = `Level: ${this.game.level}`;
    }

    createGameOverScreen() {
        this.gameOverScreen = document.createElement("div");
        this.gameOverScreen.id = "gameOverScreen";
        this.gameOverScreen.style.position = "absolute";
        this.gameOverScreen.style.top = "0";
        this.gameOverScreen.style.left = "0";
        this.gameOverScreen.style.width = "100%";
        this.gameOverScreen.style.height = "100%";
        this.gameOverScreen.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        this.gameOverScreen.style.display = "none";
        this.gameOverScreen.innerHTML = `
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                <img src="https://img.freepik.com/premium-vector/game-neon-glitch-style_212474-678.jpg" alt="Game Over" style="max-width: 100%; max-height: 100%; width: 100%; height: 100%;">
                <button id="restartButton" style="position: absolute; top: 80%; left: 50%; transform: translateX(-50%); padding: 1vw 2vw; font-size: 2vw; background-color: #4CAF50; color: white; border: none; border-radius: 10px; cursor: pointer;">Restart</button>
            </div>
        `;
        document.body.appendChild(this.gameOverScreen);

        const restartButton = this.gameOverScreen.querySelector("#restartButton");
        restartButton.addEventListener("click", () => {
            this.game.restartGame();
        });
    }

    createStartScreen() {
        this.startScreen = document.createElement("div");
        this.startScreen.id = "startScreen";
        this.startScreen.style.position = "absolute";
        this.startScreen.style.top = "0";
        this.startScreen.style.left = "0";
        this.startScreen.style.width = "100%";
        this.startScreen.style.height = "100%";
        this.startScreen.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        this.startScreen.innerHTML = `
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
                <img src="https://static.dezeen.com/uploads/2024/03/paris-2024-olympic-paralympic-poster-ugo-gattoni_dezeen_2364_col_0.jpg" alt="Game Start Picture" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;">
                <div class="container" style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
                    <h1 style="margin-bottom: 2vw; color:gold; font-size: 4vw; font-family:Georgia, 'Times New Roman', Times, serif; background-color: rgba(255, 255, 255, 0.9);">
                        Olympic Games Paris 2024
                    </h1>
                    <div style="text-align: center;">
                        <button id="startButton" class="game-button" style="padding: 1vw 2vw; font-size: 2vw; margin: 1vw; cursor: pointer; background-color:gold; color: white; border: none; border-radius: 5px; transition: background-color 0.3s ease;" onmouseover="this.style.backgroundColor='crimson'" onmouseout="this.style.backgroundColor='gold'">Start</button>
                        <button id="howToPlayButton" class="game-button" style="padding: 1vw 2vw; font-size: 2vw; margin: 1vw; cursor: pointer; background-color:gold; color: white; border: none; border-radius: 5px; transition: background-color 0.3s ease;" onmouseover="this.style.backgroundColor='crimson'" onmouseout="this.style.backgroundColor='gold'">How to play</button>                
                    </div>
                    <div style="position: absolute; bottom: 1vw; right: 1vw; color: black; font-size: 1vw; font-family: Georgia, 'Times New Roman', Times, serif; background-color: rgba(255, 255, 255, 0.9);">
                        <a href="https://www.dezeen.com/2024/03/08/paris-2024-poster-ugo-gattoni/"><p> Poster Credit: Mr Ugo Gattoni </p></a>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(this.startScreen);

        const startButton = this.startScreen.querySelector("#startButton");
        startButton.addEventListener("click", () => {
            this.game.startGame();
            this.startScreen.style.display = "none";
            this.heartContainer.style.display = "flex"; // Show heart container when game starts
        });

        const howToPlayButton = this.startScreen.querySelector("#howToPlayButton");
        howToPlayButton.addEventListener("click", () => {
            this.showHowToPlayPopup();
        });
    }

    createHowToPlayPopup() {
        this.howToPlayPopup = document.createElement("div");
        this.howToPlayPopup.id = "howToPlayPopup";
        this.howToPlayPopup.style.position = "absolute";
        this.howToPlayPopup.style.top = "0";
        this.howToPlayPopup.style.left = "0";
        this.howToPlayPopup.style.width = "100%";
        this.howToPlayPopup.style.height = "100%";
        this.howToPlayPopup.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        this.howToPlayPopup.style.display = "none";
        this.howToPlayPopup.innerHTML = `
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(255, 255, 255, 0.9); text-align: center;">
                <h2>How to play</h2>
                <p style="font-size: 1vw; color: maroon">Welcome to the Olympic Games 2024 Paris on the web!</p>
                <p style="font-size: 1vw; color: maroon">Here is the instruction on how to play this running game using your keyboard:</p>
                <p style="font-size: 1vw; color: maroon">1. The goal of this game is to keep the player avoiding the hurdle in yellow on the way until it reaches the target score.</p>
                <p style="font-size: 1vw; color: maroon">2. To make the player run, you can press the "Enter" button.</p>
                <p style="font-size: 1vw; color: maroon">3. To make the player jump, you can press the "Space" button.</p>
                <p style="font-size: 1vw; color: maroon">4. You can move the player to the left/right by pressing the left/right arrow buttons.</p>
                <p style="font-size: 1vw; color: maroon">5. You will have three chances to win this game every time you play it, each chance will be displayed by a red heart (each time you lose the game temporarily, a heart will disappear).</p>
                <button id="closePopupButton" style="padding: 1vw 2vw; font-size: 2vw; margin: 1vw; cursor: pointer; background-color:gold; color: white; border: none; border-radius: 5px; transition: background-color 0.3s ease;" onmouseover="this.style.backgroundColor='crimson'" onmouseout="this.style.backgroundColor='gold'">Understood</button>
            </div>
        `;
        document.body.appendChild(this.howToPlayPopup);

        const closePopupButton = this.howToPlayPopup.querySelector("#closePopupButton");
        closePopupButton.addEventListener("click", () => {
            this.hideHowToPlayPopup();
        });
    }

    createBackButton() {
        const arrowIcon = document.createElement("span");
        arrowIcon.innerHTML = "&#8592;";
        arrowIcon.style.marginRight = "0.5vw";

        this.backButton = document.createElement("button");
        this.backButton.textContent = "Quit";
        this.backButton.style.position = "absolute";
        this.backButton.style.top = "1vw";
        this.backButton.style.right = "1vw";
        this.backButton.style.fontSize = "1.5vw";
        this.backButton.style.padding = "1vw 2vw";
        this.backButton.style.backgroundColor = "gold";
        this.backButton.style.color = "white";
        this.backButton.style.border = "none";
        this.backButton.style.borderRadius = "10px";
        this.backButton.style.cursor = "pointer";
        this.backButton.appendChild(arrowIcon);
        document.body.appendChild(this.backButton);

        this.backButton.addEventListener("click", () => {
            this.game.showStartScreen();
            this.game.restartGame();
        });
    }

    updateHeartDisplay() {
        this.heartContainer.innerHTML = "";

        for (let i = 0; i < this.game.playerLives; i++) {
            const heartImg = document.createElement("img");
            heartImg.src = this.game.playerLives > i ? redHeartUrl : whiteHeartUrl;
            heartImg.alt = "heart";
            heartImg.classList.add("heart-icon");
            heartImg.style.width = "2.5vw";
            heartImg.style.height = "auto";
            heartImg.style.marginRight = "0.5vw";
            this.heartContainer.appendChild(heartImg);
        }

        if (this.game.playerLives <= 0) {
            this.heartContainer.style.display = "none";
        } else {
            this.heartContainer.style.display = "block";
        }
    }

    showHowToPlayPopup() {
        this.howToPlayPopup.style.display = "block";
    }

    hideHowToPlayPopup() {
        this.howToPlayPopup.style.display = "none";
    }

    displayRemainingLivesScreen() {
        const remainingLives = this.game.livesRemaining;
        this.gameOverScreen.innerHTML = `
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                padding: 2vw;
                background-color: rgba(0, 0, 0, 0.8);
                border-radius: 1.5vw;
                border: 0.2vw solid #FFD700;
                box-shadow: 0 0 1.5vw #FFD700;
            ">
                <h2 style="color: #FFD700; margin-bottom: 2vw;">
                    You have ${remainingLives} out of 3 lives remaining.
                </h2>
                <button id="continueButton" style="
                    padding: 1vw 2vw;
                    font-size: 2vw;
                    background-color: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 1vw;
                    cursor: pointer;
                    margin-right: 1vw;
                    transition: background-color 0.3s ease;
                ">
                    Continue
                </button>
                <button id="restartButton" style="
                    padding: 1vw 2vw;
                    font-size: 2vw;
                    background-color: #FF0000;
                    color: white;
                    border: none;
                    border-radius: 1vw;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                ">
                    Restart
                </button>
            </div>
        `;

        const continueButton = this.gameOverScreen.querySelector("#continueButton");
        continueButton.addEventListener("click", () => {
            this.gameOverScreen.style.display = "none";
            this.game.gameOver = false;
            this.game.isMoving = false;
            this.game.gameStarted = false;
            this.game.playerLives = remainingLives;
            this.updateHeartDisplay();
        });

        const restartButton = this.gameOverScreen.querySelector("#restartButton");
        restartButton.addEventListener("click", () => {
            this.game.restartGame();
        });

        this.gameOverScreen.style.display = "block";
    }
    createKeyPressedDisplay() {
        this.keyPressedDisplay = document.createElement("div");
        this.keyPressedDisplay.id = "keyPressedDisplay";
        this.keyPressedDisplay.style.position = "absolute";
        this.keyPressedDisplay.style.bottom = "1vw";
        this.keyPressedDisplay.style.right = "1vw"; 
        this.keyPressedDisplay.style.color = "white";
        this.keyPressedDisplay.style.fontSize = "2vw";
        this.keyPressedDisplay.style.padding = "0.5vw";
        this.keyPressedDisplay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        this.keyPressedDisplay.style.borderRadius = "0.5vw";
        this.keyPressedDisplay.style.display = "none"; 
        document.body.appendChild(this.keyPressedDisplay);
    }

    updateKeyPressedDisplay(keyCode) {
        const keyIcon = this.getKeyIcon(keyCode);
        this.keyPressedDisplay.innerHTML = `Key Pressed: ${keyIcon}`;
        this.keyPressedDisplay.style.display = "block";
        setTimeout(() => {
            this.keyPressedDisplay.style.display = "none";
        }, 1000); 
    }

    getKeyIcon(keyCode) {
        const keyIcons = {
            "Enter": "Enter ⏎",  
            "Space": "Space ⎵",   
            "ArrowUp": "↑", 
            "ArrowDown": "↓", 
            "ArrowLeft": "ArrowLeft ←", 
            "ArrowRight": "ArrowRight →", 
           
        };
        return keyIcons[keyCode] || keyCode; 
    }
}

export default HtmlUI;
