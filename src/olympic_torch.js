import { MeshBuilder, Color3, ParticleSystem, Texture, Color4, StandardMaterial } from "@babylonjs/core";

class OlympicCauldron {
    constructor(scene) {
        this.scene = scene;
        this.createCauldron();
        this.createFireParticles();
    }

    createCauldron() {
        // Create a cylinder for the stand
        this.stand = MeshBuilder.CreateCylinder("cauldronStand", { diameter: 1, height: 5 }, this.scene);
        // Position the stand appropriately
        this.stand.position.y = 2.5; // Adjust height as needed
        // Apply material to the stand
        this.stand.material = new StandardMaterial("cauldronStandMaterial", this.scene);
        this.stand.material.diffuseColor = new Color3(0.5, 0.5, 0.5); // Adjust color as needed

        // Create a sphere for the cauldron
        this.cauldron = MeshBuilder.CreateSphere("cauldron", { diameter: 3 }, this.scene);
        // Position the cauldron on top of the stand
        this.cauldron.position.y = 5.5; // Adjust height as needed
        // Apply material to the cauldron
        let cauldronMaterial = new StandardMaterial("cauldronMaterial", this.scene);
        cauldronMaterial.diffuseColor = new Color3(0.8, 0.4, 0.1); // Adjust color as needed
        this.cauldron.material = cauldronMaterial;
    }

    createFireParticles() {
        // Create particle system for the fire
        this.fireParticles = new ParticleSystem("fireParticles", 2000, this.scene);
        // Assign texture to the particles
        this.fireParticles.particleTexture = new Texture("textures/flare.png", this.scene);
        // Set the emission source
        this.fireParticles.emitter = this.cauldron; // Emit particles from the cauldron
        // Set particle color
        this.fireParticles.color1 = new Color4(1, 0.5, 0, 1); // Yellowish color
        this.fireParticles.color2 = new Color4(1, 0, 0, 1);   // Reddish color
        // Set other particle properties as needed
        this.fireParticles.minSize = 0.1;
        this.fireParticles.maxSize = 0.3;
        this.fireParticles.minLifeTime = 0.3;
        this.fireParticles.maxLifeTime = 0.6;
        // Set particle emission rate
        this.fireParticles.emitRate = 100;
        // Start the particle system
        this.fireParticles.start();
    }
}

export default OlympicCauldron;
