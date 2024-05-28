import { BoundingInfo, Color3, Color4, DefaultRenderingPipeline, FreeCamera, HemisphericLight, MeshBuilder, MotionBlurPostProcess, ParticleSystem, Scalar, SceneLoader, Sound, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import meshUrl from "../assets/models/playerHurdles.glb";
import roadTextureUrl from "../assets/textures/track1.jpg";
import obstacle1Url from "../assets/models/hurdle.glb";
import grassTextureUrl from "../assets/textures/grass.jpg";
import olympicLogoUrl from "../assets/models/ImageToStl_com_cliolympics.glb";
import eiffelUrl from "../assets/models/eiffel_tower.glb";
import musicUrl from "../assets/musics/Cyberpunk Moonlight Sonata v2.mp3";
import hitSoundUrl from "../assets/sounds/344033__reitanna__cute-impact.wav";

class SceneCreator {
    constructor(game) {
        this.game = game;
        this.scene = game.scene;
        this.engine = game.engine;
    }

    async createScene() {
        this.scene.clearColor = new Color3(0.7, 0.7, 0.95);
        this.scene.ambientColor = new Color3(0.8, 0.8, 1);
        this.scene.fogMode = this.scene.FOGMODE_LINEAR;
        this.scene.fogStart = this.game.SPAWN_POS_Z - 30;
        this.scene.fogEnd = this.game.SPAWN_POS_Z; 
        this.scene.fogColor = new Color3(0.6, 0.6, 0.85);
        this.scene.collisionsEnabled = true;
        this.scene.gravity = new Vector3(0, -0.15, 0);

        this.camera = new FreeCamera("camera1", new Vector3(0, 3.8, 0), this.scene);
        this.camera.setTarget(new Vector3(0, 3, 3));
        this.camera.attachControl(this.game.canvas, true);
        this.camera.lockedTarget = this.game.player;

        var pipeline = new DefaultRenderingPipeline("default", true, this.scene, [this.camera]);
        pipeline.glowLayerEnabled = true;
        pipeline.glowLayer.intensity = 0.35;

        var light = new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);
        light.intensity = 0.7;

        var mb = new MotionBlurPostProcess('mb', this.scene, 1.0, this.camera);
        mb.motionStrength = 1;

        await this.loadModels();
        await this.loadTextures();
    }

    async loadModels() {
        if (this.game.player) {
            console.log("Player model already exists. Skipping creation.");
            return;
        }
        let res1 = await SceneLoader.ImportMeshAsync("", "", meshUrl, this.scene);
        this.game.player = res1.meshes[0];
        this.game.player.name = "Player";
        this.game.player.scaling = new Vector3(1, 1, 1);
        this.game.player.position.set(0, this.game.TRACK_HEIGHT / 2, 6);
        this.game.player.rotation = new Vector3(0, 0, 0);

        this.game.animationGroups = res1.animationGroups;
        this.game.animationGroups.forEach(group => group.stop());
        this.game.startIdleAnimation();

        this.game.playerBox = MeshBuilder.CreateCapsule("playerCap", { width: 0.4, height: 1.7 });
        this.game.playerBox.position.y = 1.7 / 2;
        this.game.playerBox.parent = this.game.player;
        this.game.playerBox.checkCollisions = true;
        this.game.playerBox.collisionGroup = 1;
        this.game.playerBox.visibility = 0;
        console.log("Player model loaded:", this.game.player);

        // Load the obstacle model
        let res3 = await SceneLoader.ImportMeshAsync("", "", obstacle1Url, this.scene);
        let obstacleModel = res3.meshes[0];
        for (let i = 0; i < Scalar.RandomRange(2, 10); i++) {
            let obstacle = obstacleModel.clone("");
            obstacle.normalizeToUnitCube();
            let obstacleSize = new Vector3(1, 1, 1);
            obstacle.scaling.copyFrom(obstacleSize);

            let x = Scalar.RandomRange(-this.game.TRACK_WIDTH / 2, this.game.TRACK_WIDTH / 2);
            let z = Scalar.RandomRange(this.game.SPAWN_POS_Z - 15, this.game.SPAWN_POS_Z + 15);

            let y = 0.5; // Adjust obstacle height if necessary
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

            this.game.obstacles.push(obstacle);
        }
        obstacleModel.dispose();

        // Load the Olympic logo model
        let res4 = await SceneLoader.ImportMeshAsync("", "", olympicLogoUrl, this.scene);
        let olympicLogo = res4.meshes[0];
        olympicLogo.name = "olympicLogo";
        olympicLogo.position = new Vector3(13, 4.2, 70.2);
        olympicLogo.rotation = new Vector3(-Math.PI / 2, 0, Math.PI/4);
        olympicLogo.scaling.scaleInPlace(0.2);

        // Load the Eiffel Tower model
        let res5 = await SceneLoader.ImportMeshAsync("", "", eiffelUrl, this.scene);
        let eiffelModel = res5.meshes[0];
        eiffelModel.name = "eiffelModel";
        for (let i = 0; i < this.game.targetEiffelCount; i++) {
            let eiffel = eiffelModel.clone("");
            eiffel.normalizeToUnitCube();
            let eiffelSize = new Vector3(0.1, 0.1, 0.1);
            eiffel.scaling.copyFrom(eiffelSize);

            let x = Scalar.RandomRange(-this.game.TRACK_WIDTH / 2, this.game.TRACK_WIDTH / 2);
            let z = Scalar.RandomRange(this.game.SPAWN_POS_Z - 15, this.game.SPAWN_POS_Z + 15);

            let y = 0.5; // Adjust height if necessary
            eiffel.position.set(x, y, z);

            let childMeshes = eiffel.getChildMeshes();

            let min = childMeshes[0].getBoundingInfo().boundingBox.minimumWorld;
            let max = childMeshes[0].getBoundingInfo().boundingBox.maximumWorld;
            for (let i = 0; i < childMeshes.length; i++) {
                let mat = new StandardMaterial("mat", this.scene);
                mat.emissiveColor = new Color4(1, 0.6, 0.2, 1.0);
                mat.alpha = 0.5;

                childMeshes[i].material = mat;
                let meshMin = childMeshes[i].getBoundingInfo().boundingBox.minimumWorld;
                let meshMax = childMeshes[i].getBoundingInfo().boundingBox.maximumWorld;

                min = Vector3.Minimize(min, meshMin);
                max = Vector3.Maximize(max, meshMax);
            }
            eiffel.setBoundingInfo(new BoundingInfo(min, max));

            eiffel.showBoundingBox = false;
            eiffel.checkCollisions = true;
            eiffel.collisionGroup = 2;

            this.game.eiffelTowers.push(eiffel);
        }
        eiffelModel.dispose();
    }

    async loadTextures() {
        let mainTrack = MeshBuilder.CreateBox("trackmiddle", { width: this.game.TRACK_WIDTH, height: this.game.TRACK_HEIGHT, depth: this.game.TRACK_DEPTH });
        mainTrack.position = new Vector3(0, 0, 0);
        let matRoad = new StandardMaterial("road");
        let tex = new Texture(roadTextureUrl);
        matRoad.diffuseTexture = tex;
        mainTrack.material = matRoad;
        for (let i = 0; i < this.game.NB_TRACKS; i++) {
            let newTrack = mainTrack.clone();
            newTrack.position.z = this.game.TRACK_DEPTH * i;
            this.game.tracks.push(newTrack);
        }
        mainTrack.dispose();
    
        let grassWidth = 30; 
        let grassHeight = 1000;
    
        let grassLeft = MeshBuilder.CreateGround("grassLeft", { width: grassWidth, height: grassHeight }, this.scene);
        let grassRight = MeshBuilder.CreateGround("grassRight", { width: grassWidth, height: grassHeight }, this.scene);
    
        let grassMaterial = new StandardMaterial("grassMat", this.scene);
        let grassTexture = new Texture(grassTextureUrl, this.scene);
        grassMaterial.diffuseTexture = grassTexture;
    
        grassLeft.material = grassMaterial;
        grassRight.material = grassMaterial;
    
        grassLeft.position.x = -this.game.TRACK_WIDTH; 
        grassRight.position.x = this.game.TRACK_WIDTH; 
        grassLeft.position.z = grassRight.position.z = 0;
    
        grassMaterial.diffuseTexture.level = 1;
    
        let grassTextureScaleX = 1;
        let grassTextureScaleY = grassHeight / 10;
        grassTexture.uScale = grassTextureScaleX;
        grassTexture.vScale = grassTextureScaleY;
    
        this.game.music = new Sound("music", musicUrl, this.scene, undefined, { loop: true, autoplay: true, volume: 0.4 });
        this.game.aie = new Sound("aie", hitSoundUrl, this.scene);
    }

    createFireworks() {
        const particleSystem = new ParticleSystem("particles", 2000, this.scene);

        particleSystem.particleTexture = new Texture("https://www.babylonjs-playground.com/textures/flare.png", this.scene);

        particleSystem.emitter = new Vector3(0, 10, 5); 
        particleSystem.color1 = new Color4(1, 0.5, 0.2, 1.0); 
        particleSystem.color2 = new Color4(0.2, 1, 0.2, 1.0); 
        particleSystem.colorDead = new Color4(0.2, 0.2, 1, 0.0); 
        particleSystem.minSize = 1;
        particleSystem.maxSize = 2;
        particleSystem.minLifeTime = 1;
        particleSystem.maxLifeTime = 3;

        particleSystem.emitRate = 5000;

        particleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;

        particleSystem.gravity = new Vector3(0, -9.81, 0);

        particleSystem.direction1 = new Vector3(-1, 1, 0);
        particleSystem.direction2 = new Vector3(1, 1, 0);

        particleSystem.minAngularSpeed = 0;
        particleSystem.maxAngularSpeed = Math.PI;

        particleSystem.minEmitPower = 3;
        particleSystem.maxEmitPower = 5;
        particleSystem.updateSpeed = 0.01;

        particleSystem.start();

        setTimeout(() => {
            particleSystem.stop();
        }, 2000);
    }

}

export default SceneCreator;
