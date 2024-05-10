import { BoundingInfo, Color3, Color4, DefaultRenderingPipeline, FreeCamera, HemisphericLight, MeshBuilder, MotionBlurPostProcess, Scalar, Scene, SceneLoader, Sound, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import meshUrl from "../assets/models/playerHurdles.glb";
import eiffelUrl from "../assets/models/eiffel_tower.glb";
import roadTextureUrl from "../assets/textures/track1.jpg";
import redHeartUrl from "../assets/textures/red_heart.png";
import whiteHeartUrl from "../assets/textures/white_heart.png";

import musicUrl from "../assets/musics/Cyberpunk Moonlight Sonata v2.mp3";
import hitSoundUrl from "../assets/sounds/344033__reitanna__cute-impact.wav";
import obstacle1Url from "../assets/models/hurdle.glb";
import grassTextureUrl from "../assets/textures/grass.jpg";
import olympicLogoUrl from "../assets/models/ImageToStl_com_cliolympics.glb";

const TRACK_WIDTH = 8;
const TRACK_HEIGHT = 0.1;
const TRACK_DEPTH = 3;
const BORDER_HEIGHT = 0.5;
const NB_TRACKS = 50;
const NB_OBSTACLES = 10;
const SPAWN_POS_Z = (TRACK_DEPTH * NB_TRACKS);
const SPEED_Z = 40;
const SPEED_X = 10;


class Game {

    engine;
    canvas;
    scene;
    firstObstacleAvoided = false;

    startTimer;
    score = 0; 
    gameOver = false;
    isMoving = false;

    player;
    playerBox;
    obstacles = [];
    tracks = [];
    eiffelTowers = [];

    jumping = false;
    jumpDuration = 0.5; // Adjust as needed
    jumpHeight = 3; // Adjust as needed
    jumpElapsedTime = 0;
    targetScore = 50;


    inputMap = {};

    constructor(engine, canvas) {
        this.engine = engine;
        this.canvas = canvas;
        this.initInput();
        this.initHTML();
        this.gameStarted = false;
        // Initialize game state variables
        this.livesRemaining = 3;

        // Add CSS styles for heart icons
        const style = document.createElement('style');
        style.textContent = `
            .heart-icon {
                width: 30px; /* Adjust the width as needed */
                height: auto; /* Maintain aspect ratio */
                margin-right: 5px; /* Adjust the margin between hearts */
            }
            `;
        document.head.appendChild(style);
    }

    initInput() {
        this.inputMap = {};
        window.addEventListener("keydown", this.handleKeyDown.bind(this));
        window.addEventListener("keyup", this.handleKeyUp.bind(this));
    }

    startGame() {
        this.score = 0;
        this.gameOver = false;
        this.gameStarted = false;
        this.isMoving = false;
        this.running = false;
        this.livesRemaining = 3;
        this.playerLives = 3;

        // Create back button

        // Add arrow icon
        const arrowIcon = document.createElement("span");
        arrowIcon.innerHTML = "&#8592;"; // Unicode for left arrow
        arrowIcon.style.marginRight = "5px";

        this.backButton = document.createElement("button");
        this.backButton.textContent = "Quit";
        this.backButton.style.position = "absolute";
        this.backButton.style.top = "10px"; // Adjust the top position as needed
        this.backButton.style.right = "200px"; // Align to the left side of the screen
        this.backButton.style.fontSize = "17px";
        this.backButton.style.padding = "10px 20px";
        this.backButton.style.backgroundColor = "gold";
        this.backButton.style.color = "white";
        this.backButton.style.border = "none";
        this.backButton.style.borderRadius = "10px";
        this.backButton.style.cursor = "pointer";


        this.backButton.appendChild(arrowIcon);
        document.body.appendChild(this.backButton);

        this.backButton.addEventListener("click", () => {
            this.showStartScreen(); // Show the start screen
            this.hideGameScreen(); // Hide the game screen
        });
    }

    showStartScreen() {
        this.startScreen.style.display = "block";
    }

    hideGameScreen() {
        document.body.removeChild(this.backButton);
    }

    showHowToPlayPopup() {
        // Show the how to play popup
        this.howToPlayPopup.style.display = "block";
    }
    
    hideHowToPlayPopup() {
        // Hide the how to play popup
        this.howToPlayPopup.style.display = "none";
    }
    

    initHTML() {
        // Create heart container
        this.heartContainer = document.createElement("div");
        this.heartContainer.id = "heartContainer";
        this.heartContainer.style.position = "absolute";
        this.heartContainer.style.top = "10px";
        this.heartContainer.style.left = "20%";
        this.heartContainer.style.transform = "translateX(-50%)";
        document.body.appendChild(this.heartContainer);

         // Create score display element
         this.scoreDisplay = document.createElement("div");
         this.scoreDisplay.id = "scoreDisplay";
         this.scoreDisplay.style.position = "absolute";
         this.scoreDisplay.style.top = "10px";
         this.scoreDisplay.style.left = "50%";
         this.scoreDisplay.style.transform = "translateX(-50%)";
         this.scoreDisplay.style.color = "white";
         this.scoreDisplay.style.fontSize = "30px";
         this.scoreDisplay.textContent = `Score: ${this.score}`;
         document.body.appendChild(this.scoreDisplay);
 

        // Initialize heart lives
        this.playerLives = 3;
        this.updateHeartDisplay();
        // Create game over screen and restart button elements
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
                <button id="restartButton" style="position: absolute; top: 80%; left: 50%; transform: translateX(-50%); padding: 10px 20px; font-size: 24px; background-color: #4CAF50; color: white; border: none; border-radius: 10px; cursor: pointer;">Restart</button>
            </div>
        `;
        document.body.appendChild(this.gameOverScreen);
    
        const restartButton = this.gameOverScreen.querySelector("#restartButton");
        restartButton.addEventListener("click", () => {
            this.restartGame();
        });
        // Create start screen with picture and buttons
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
                    <h1 style="margin-bottom: 20px; color:gold;font-size: 50px; font-family:Georgia, 'Times New Roman', Times, serif; background-color: rgba(255, 255, 255, 0.9);">
                        Olympic Games Paris 2024
                    </h1>
                    <div style="text-align: center;">
                        <button id="startButton" class="game-button" style="padding: 10px 20px; font-size: 30px; margin: 10px; cursor: pointer; background-color:gold;color: white; border: none; border-radius: 5px; transition: background-color 0.3s ease;" onmouseover="this.style.backgroundColor='crimson'" onmouseout="this.style.backgroundColor='gold'">Start</button>
                        <button id="howToPlayButton" class="game-button" style="padding: 10px 20px; font-size: 30px; margin: 10px; cursor: pointer; background-color:gold;color: white; border: none; border-radius: 5px; transition: background-color 0.3s ease;" onmouseover="this.style.backgroundColor='crimson'" onmouseout="this.style.backgroundColor='gold'">How to play</button>                
                    </div>
                    <div style="position: absolute; bottom: 10px; right: 10px; color: black; font-size: 16px; font-family: Georgia, 'Times New Roman', Times, serif; background-color: rgba(255, 255, 255, 0.9);">
                        <a href="https://www.dezeen.com/2024/03/08/paris-2024-poster-ugo-gattoni/"><p> Poster Credit: Mr Ugo Gattoni </p></a>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(this.startScreen);

       
        
        const startButton = this.startScreen.querySelector("#startButton");
        startButton.addEventListener("click", () => {
            this.startGame();
            this.startScreen.style.display = "none"; 
        });

        
        const howToPlayButton = this.startScreen.querySelector("#howToPlayButton");
        howToPlayButton.addEventListener("click", () => {
            this.showHowToPlayPopup();
        });

        
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
                <p style = "font-size : 17px ; color : maroon">Welcome to the Olympic Games 2024 Paris on the web! </p>
                <p style = "font-size : 17px ; color : maroon"> Here is the instruction on how to play this running game using your keyboard:</p>
                <p style = "font-size : 17px ; color : maroon">1. The goal of this game is to keep the player avoiding the hurdle in yellow on the way until it reaches the target score. \n For example, you can track your score by looking at the top of the screen with the text like “56/100”, where “100” here is the target score and “56” is your score.</p>
                <p style = "font-size : 17px ; color : maroon">2. To make the player run, you can press the "Enter" button.</p>
                <p style = "font-size : 17px ; color : maroon">3. To make the player jump, you can press the "Space" button.</p>
                <p style = "font-size : 17px ; color : maroon">4. You can move the player to the left/right by pressing the left/right arrow buttons.</p>
                <p style = "font-size : 17px ; color : maroon">5. You will have three chances to win this game every time you play it, each chance will be displayed by a red heart (each time you lose the game temporarily, a heart will disappear).</p>
                <button id="closePopupButton" style="padding: 10px 20px; font-size: 18px; margin: 10px; cursor: pointer; background-color:gold;color: white; border: none; border-radius: 5px; transition: background-color 0.3s ease;" onmouseover="this.style.backgroundColor='crimson'" onmouseout="this.style.backgroundColor='gold'">Understood</button>
            </div>
        `;
        document.body.appendChild(this.howToPlayPopup);

        // Add event listener for close popup button
        const closePopupButton = this.howToPlayPopup.querySelector("#closePopupButton");
        closePopupButton.addEventListener("click", () => {
            this.hideHowToPlayPopup();
        });
    }

    updateHeartDisplay() {
        // Clear previous hearts
        this.heartContainer.innerHTML = "";
    

        // Create heart icons based on player lives
        for (let i = 0; i < this.playerLives; i++) {
            const heartImg = document.createElement("img");
            heartImg.src = this.playerLives > i ? redHeartUrl : whiteHeartUrl;
            heartImg.alt = "heart";
            heartImg.classList.add("heart-icon"); // Apply CSS class for styling
            this.heartContainer.appendChild(heartImg);
        }

            // If player has no more lives, hide the heart container
        if (this.playerLives <= 0) {
            this.heartContainer.style.display = "none";
        } else {
            this.heartContainer.style.display = "block";
        }
    }

    handleKeyDown(event) {
        this.inputMap[event.code] = true;
        if (event.code === "Enter" && !this.gameStarted) {
            this.gameStarted = true;
            this.isMoving = true;
            this.running = true;
            this.startRunningAnimation();
        } else if (event.code === "Space" && !this.jumping && this.gameStarted) {
            this.jumping = true;
            this.jumpStartTime = Date.now();
            this.jumpStartY = this.player.position.y;
            this.startJumpingAnimation();
        }
    }
    
    handleKeyUp(event) {
        this.inputMap[event.code] = false;
    }
    

    init() {
        this.engine.displayLoadingUI();
        this.createScene().then(() => {
            this.engine.hideLoadingUI();
        });
    }

    start() {
        this.startTimer = 0;
        this.engine.runRenderLoop(() => {
            let delta = this.engine.getDeltaTime() / 1000.0;
            if (!this.gameOver) {
                this.updateMoves(delta);
                this.update(delta);
            }
            this.updateScoreDisplay(); 
            this.scene.render();
        });
    }
    update(delta) {
        if (!this.gameOver && this.isMoving) {
            for (let i = 0; i < this.obstacles.length; i++) {
                let obstacle = this.obstacles[i];
                obstacle.position.z -= (SPEED_Z * delta);
                if (obstacle.position.z < 0) {
                    this.score++;
                    let x = Scalar.RandomRange(-TRACK_WIDTH / 2, TRACK_WIDTH / 2);
                    let z = Scalar.RandomRange(SPAWN_POS_Z - 15, SPAWN_POS_Z + 15);
                    obstacle.position.set(x, 0.5, z);
                } else {
                    if (this.playerBox.intersectsMesh(obstacle, false)) {
                        this.endGame();
                    }
                }
            }
    
            if (this.score >= this.targetScore && this.livesRemaining > 0) {
                this.displayWinScreen();
                this.gameOver = true;  
                return;  
            }
    
            if (this.jumping) {
                let elapsedTime = (Date.now() - this.jumpStartTime) / 1000.0;
                if (elapsedTime < this.jumpDuration) {
                    this.player.position.y = this.jumpStartY + this.jumpHeight * Math.sin((elapsedTime / this.jumpDuration) * Math.PI);
                } else {
                    this.player.position.y = this.jumpStartY;
                    this.jumping = false;
                    this.startRunningAnimation();
                }
            }
            
            for (let i = 0; i < this.tracks.length; i++) {
                let track = this.tracks[i];
                track.position.z -= SPEED_Z / 3 * delta;
                if (track.position.z <= 0) {
                    let nextTrackIdx = (i + this.tracks.length - 1) % this.tracks.length;
                    track.position.z = this.tracks[nextTrackIdx].position.z + TRACK_DEPTH;
                }
            }
            this.startTimer += delta;
        }
    }
    
    
    

    updateMoves(delta) {
        if (!this.gameOver) {
            if (this.inputMap["ArrowLeft"]) { 
                this.player.position.x -= SPEED_X * delta;
                if (this.player.position.x < -3.75)
                    this.player.position.x = -3.75;
            } else if (this.inputMap["ArrowRight"]) { 
                this.player.position.x += SPEED_X * delta;
                if (this.player.position.x > 3.75)
                    this.player.position.x = 3.75;
            }
        }
    }

    async createScene() {
        this.scene = new Scene(this.engine);
        this.scene.clearColor = new Color3(0.7, 0.7, 0.95);
        this.scene.ambientColor = new Color3(0.8, 0.8, 1);
        this.scene.fogMode = Scene.FOGMODE_LINEAR;
        this.scene.fogStart = SPAWN_POS_Z - 30;
        //this.scene.fogEnd = SPAWN_POS_Z;
        this.scene.fogColor = new Color3(0.6, 0.6, 0.85);
        this.scene.collisionsEnabled = true;
        this.scene.gravity = new Vector3(0, -0.15, 0);

        this.camera = new FreeCamera("camera1", new Vector3(0, 3.8, 0), this.scene);
        this.camera.setTarget(new Vector3(0, 3, 3));
        this.camera.attachControl(this.canvas, true);
        this.camera.lockedTarget = this.player;

        var pipeline = new DefaultRenderingPipeline("default", true, this.scene, [this.camera]);
        pipeline.glowLayerEnabled = true;
        pipeline.glowLayer.intensity = 0.35;
        pipeline.glowLayer.blurKernelSize = 16;
        pipeline.glowLayer.ldrMerge = true;

        var light = new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);
        light.intensity = 0.7;

        var mb = new MotionBlurPostProcess('mb', this.scene, 1.0, this.camera);
        mb.motionStrength = 1;

        

        let res1 = await SceneLoader.ImportMeshAsync("", "", meshUrl, this.scene);
        this.player = res1.meshes[0];
        console.log(this.player);
        res1.meshes[0].name = "Player";
        res1.meshes[0].scaling = new Vector3(1, 1, 1);
        res1.meshes[0].position.set(0, TRACK_HEIGHT / 2, 6);
        res1.meshes[0].rotation = new Vector3(0, 0, 0);
        res1.animationGroups[0].stop();
        res1.animationGroups[2].play(true);
        this.animationGroups = res1.animationGroups;
        this.animationGroups.forEach(group => group.stop());
        this.startIdleAnimation(); 
        this.playerBox = MeshBuilder.CreateCapsule("playerCap", { width: 0.4, height: 1.7 });
        this.playerBox.position.y = 1.7 / 2;
        this.playerBox.parent = this.player;
        this.playerBox.checkCollisions = true;
        this.playerBox.collisionGroup = 1;
        this.playerBox.visibility = 0;
        

        let mainTrack = MeshBuilder.CreateBox("trackmiddle", { width: TRACK_WIDTH, height: TRACK_HEIGHT, depth: TRACK_DEPTH });
        mainTrack.position = new Vector3(0, 0, 0);
        let matRoad = new StandardMaterial("road");
        let tex = new Texture(roadTextureUrl);
        matRoad.diffuseTexture = tex;
        mainTrack.material = matRoad;
        for (let i = 0; i < NB_TRACKS; i++) {
            let newTrack = mainTrack.clone();
            newTrack.position.z = TRACK_DEPTH * i;
            this.tracks.push(newTrack);
        }
        mainTrack.dispose();

        // GRASS
        let grassWidth = 20; 
        let grassHeight = 1000; 

        let grassLeft = MeshBuilder.CreateGround("grassLeft", { width: grassWidth, height: grassHeight }, this.scene);
        let grassRight = MeshBuilder.CreateGround("grassRight", { width: grassWidth, height: grassHeight }, this.scene);

        let grassMaterial = new StandardMaterial("grassMat", this.scene);
        let grassTexture = new Texture(grassTextureUrl, this.scene);
        grassMaterial.diffuseTexture = grassTexture;

        grassLeft.material = grassMaterial;
        grassRight.material = grassMaterial;

        grassLeft.position.x = -TRACK_WIDTH / 2 - 0.5 - (grassWidth - TRACK_WIDTH) / 2; 
        grassRight.position.x = TRACK_WIDTH / 2 + 0.5 + (grassWidth - TRACK_WIDTH) / 2;
        grassLeft.position.z = grassRight.position.z = 0; 

        grassMaterial.diffuseTexture.level = 1;

        let grassTextureScaleX = 1; 
        let grassTextureScaleY = grassHeight / 10; 
        grassTexture.uScale = grassTextureScaleX;
        grassTexture.vScale = grassTextureScaleY;

        const ROAD_SURFACE_HEIGHT = 0;
        let res3 = await SceneLoader.ImportMeshAsync("", "", obstacle1Url, this.scene);
        let obstacleModel = res3.meshes[0];
        
        for (let i = 0; i < NB_OBSTACLES; i++) {
            let obstacle = obstacleModel.clone("");
            obstacle.normalizeToUnitCube();
            // Set predefined size for the obstacle
            let obstacleSize = new Vector3(1, 1, 1); // Adjust as needed
            obstacle.scaling.copyFrom(obstacleSize);
        
            let x = Scalar.RandomRange(-TRACK_WIDTH / 2, TRACK_WIDTH / 2);
            let z = Scalar.RandomRange(SPAWN_POS_Z - 15, SPAWN_POS_Z + 15);
        
            // Ensure obstacle is aligned with the road surface
            let y = ROAD_SURFACE_HEIGHT + obstacleSize.y / 2; // Adjust y position to align with road surface
            obstacle.position.set(x, y, z);
        
            let childMeshes = obstacle.getChildMeshes();
        
            let min = childMeshes[0].getBoundingInfo().boundingBox.minimumWorld;
            let max = childMeshes[0].getBoundingInfo().boundingBox.maximumWorld;
            for (let i = 0; i < childMeshes.length; i++) {
                let mat = new StandardMaterial("mat", this.scene);
                mat.emissiveColor = new Color4(1, 1, 0, Scalar.RandomRange(.5, .8));
                mat.alpha = 0.5;
        
                childMeshes[i].material = mat;
                let meshMin = childMeshes[i].getBoundingInfo().boundingBox.minimumWorld;
                let meshMax = childMeshes[i].getBoundingInfo().boundingBox.maximumWorld;
        
                min = Vector3.Minimize(min, meshMin);
                max = Vector3.Maximize(max, meshMax);
            }
            obstacle.setBoundingInfo(new BoundingInfo(min, max));
        
            obstacle.showBoundingBox = false;
            obstacle.checkCollisions = true;
            obstacle.collisionGroup = 2;
        
            this.obstacles.push(obstacle);
        }
        obstacleModel.dispose();
        

        this.music = new Sound("music", musicUrl, this.scene, undefined, { loop: true, autoplay: true, volume: 0.4 });
        this.aie = new Sound("aie", hitSoundUrl, this.scene);

        let res4 = await SceneLoader.ImportMeshAsync("", "", olympicLogoUrl, this.scene);
        let olympicLogo = res4.meshes[0];
        olympicLogo.name = "olympicLogo";
        olympicLogo.position = new Vector3(13, 4.2, 70.2); 
        olympicLogo.rotation = new Vector3(-Math.PI / 2, 0, Math.PI/4);
        olympicLogo.scaling.scaleInPlace(0.2); 

        let res5 = await SceneLoader.ImportMeshAsync("", "", eiffelUrl, this.scene);
        let eiffelLogo = res5.meshes[0];
        eiffelLogo.name = "eiffelLogo";
        eiffelLogo.position = new Vector3(-7.5, 1, 64.2); 
        eiffelLogo.rotation = new Vector3(Math.PI, 20, Math.PI);
        eiffelLogo.scaling.scaleInPlace(0.7); 
        // Check if the imported mesh has child meshes
        if (eiffelLogo.getChildMeshes) {
            // Loop through each child mesh
            eiffelLogo.getChildMeshes().forEach(childMesh => {
                // Create a new material for each child mesh
                let mat = new StandardMaterial("mat", this.scene);
                //mat.emissiveColor = new Color3(0.8, 0.6, 0.1);
                mat.emissiveColor = new Color3(0.8, 0.6, 0.1).scale(0.5);
                // Apply the material to the child mesh
                childMesh.material = mat;
            });
        } else {
            console.error("Eiffel Tower does not have child meshes.");
        }
    }

    endGame() {
        console.log("Game Over");
        this.gameOver = true;
        
        // Stop the music
        this.music.stop();
        
        // Update lives and hearts
        this.livesRemaining--; // Reduce remaining lives
        this.playerLives = this.livesRemaining > 0 ? this.livesRemaining : 0; // Update player lives accordingly
        
        if (this.livesRemaining <= 0) {
            // Game over when no lives left
            this.displayGameOverScreen();
        } else {
            // Display game over screen with remaining lives message
            this.displayRemainingLivesScreen();
            // Reset player position
            this.player.position.set(0, TRACK_HEIGHT / 2, 6);
            // Update heart display
            this.updateHeartDisplay();
        }
    }
    

    restartGame() {
        this.gameOverScreen.style.display = "none";
        this.score = 0;
        this.gameOver = false;
        this.gameStarted = false;
        this.isMoving = false;
        this.running = false;
        this.livesRemaining = 3;
        this.playerLives = 3; 
        this.updateHeartDisplay(); 
        // Reset lives remaining to 3 if game is restarted
        this.livesRemaining = 3;
    
        this.player.position.set(0, TRACK_HEIGHT / 2, 6);
        this.animationGroups.forEach(group => group.stop());
        this.startIdleAnimation();
    
        this.tracks.forEach((track, index) => {
            track.position.z = TRACK_DEPTH * index;
        });
    
        this.obstacles.forEach((obstacle, index) => {
            let x = Scalar.RandomRange(-TRACK_WIDTH / 2, TRACK_WIDTH / 2);
            let z = Scalar.RandomRange(SPAWN_POS_Z - 15, SPAWN_POS_Z + 15);
            obstacle.position.set(x, 0.5, z);
        });

    
        this.music.play();
    }

    startIdleAnimation() {
        this.animationGroups.forEach(group => group.stop());
        this.animationGroups[0].play(true);
        this.currentAnimation = 'idle';
    }
    startRunningAnimation() {
        if (this.currentAnimation !== 'running') {
            this.animationGroups.forEach(group => group.stop());
            this.animationGroups[2].play(true);
            this.currentAnimation = 'running';
            this.isMoving = true; 
            this.running = true;
        }
    }


    startJumpingAnimation() {
        if (this.currentAnimation !== 'jumping') {
            this.animationGroups.forEach(group => group.stop()); 
            this.animationGroups[1].play(true);
            this.currentAnimation = 'jumping';

        }
    }
    

    updateScoreDisplay() {
        this.scoreDisplay.textContent = `Score: ${this.score} / ${this.targetScore}`;
    }

    displayWinScreen() {
        // Stop the game
        this.gameOver = true;
        this.isMoving = false;

        // Display "You won the game" message with restart button
        this.gameOverScreen.innerHTML = `
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                <img src="https://img.freepik.com/vecteurs-libre/personnage-gagnant-gagnant-design-plat_23-2147877481.jpg?t=st=1714590790~exp=1714594390~hmac=b9865df3e46e71c9810adb9daa214fdb0d37567dc590673d132a1c2842401759&w=740" alt="Winner" style="max-width: 90%; max-height: 100%; width: 90%; height: 80%;">
                <button id="restartButton" style="position: absolute; top: 80%; left: 50%; transform: translateX(-50%); padding: 10px 20px; font-size: 24px; background-color: #4CAF50; color: white; border: none; border-radius: 10px; cursor: pointer;">Restart</button>
            </div>
        `;

        // Add event listener for restart button
        const restartButton = this.gameOverScreen.querySelector("#restartButton");
        restartButton.addEventListener("click", () => {
            this.restartGame();
        });

        // Display the win screen
        this.gameOverScreen.style.display = "block";
    }

    displayGameOverScreen() {
        this.gameOverScreen.innerHTML = `
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                <img src="https://img.freepik.com/premium-vector/game-neon-glitch-style_212474-678.jpg" alt="Game Over" style="max-width: 100%; max-height: 100%; width: 100%; height: 100%;">
                <button id="restartButton" style="position: absolute; top: 80%; left: 50%; transform: translateX(-50%); padding: 10px 20px; font-size: 24px; background-color: #4CAF50; color: white; border: none; border-radius: 10px; cursor: pointer;">Restart</button>
            </div>
        `;
    
        // Add event listener for restart button
        const restartButton = this.gameOverScreen.querySelector("#restartButton");
        restartButton.addEventListener("click", () => {
            this.restartGame();
        });
    
        // Display game over screen
        this.gameOverScreen.style.display = "block";
    }

    displayRemainingLivesScreen() {
        const remainingLives = this.livesRemaining;
        this.gameOverScreen.innerHTML = `
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(226, 245, 39, 0.8); text-align: center;">
                <h2>You have ${remainingLives} out of 3 lives remaining.</h2>
                <button id="continueButton" style="padding: 10px 20px; font-size: 24px; background-color: #4CAF50; color: white; border: none; border-radius: 10px; cursor: pointer; margin-right: 10px;">Continue</button>
                <button id="restartButton" style="padding: 10px 20px; font-size: 24px; background-color: #FF0000; color: white; border: none; border-radius: 10px; cursor: pointer;">Restart</button>
            </div>
        `;
    
        // Add event listener for continue button
        const continueButton = this.gameOverScreen.querySelector("#continueButton");
        continueButton.addEventListener("click", () => {
            this.gameOverScreen.style.display = "none";
            this.gameOver = false;
            this.isMoving = true; // Continue the game
            // Update lives remaining
            this.playerLives = remainingLives;
            // Update heart display
            this.updateHeartDisplay();
        });
    
        // Add event listener for restart button
        const restartButton = this.gameOverScreen.querySelector("#restartButton");
        restartButton.addEventListener("click", () => {
            this.restartGame();
        });
    
        // Display game over screen
        this.gameOverScreen.style.display = "block";
    }
    
}

export default Game;

