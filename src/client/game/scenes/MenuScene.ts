const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'MenuScene',
};

export class MenuScene extends Phaser.Scene {
    constructor() {
        super(sceneConfig);
    }

    create() {
        const width = typeof this.game.config.width === 'number' ? this.game.config.width : parseInt(this.game.config.width as string, 10);

        this.add.image(width / 2, 150, 'logo');
        const singlePlayerBtn = this.add.text(width / 2, 300, "Singleplayer", {
            fontSize: '30px',
            color: '#ffffff',
            fontFamily: '"Lobster Two", cursive'
        }).setOrigin(0.5).setInteractive();

// Cursor enter the button
        singlePlayerBtn.on('pointerover', () => {
            singlePlayerBtn.setStyle({fill: '#ff0'});
        });

// Event, wenn der Mauszeiger den Button verlässt
        singlePlayerBtn.on('pointerout', () => {
            singlePlayerBtn.setStyle({fill: '#ffffff'});
        });
        singlePlayerBtn.setInteractive();
        singlePlayerBtn.on('pointerdown', () => {
            this.scene.start('GameScene', {});
        });

        const multiPlayerBtn = this.add.text(width / 2, 400, "Multiplayer", {
            fontSize: '30px',
            color: '#ffffff',
            fontFamily: '"Lobster Two", cursive'
        }).setOrigin(0.5).setInteractive();

// Cursor enter the button
        multiPlayerBtn.on('pointerover', () => {
            multiPlayerBtn.setStyle({fill: '#ff0'});
        });

// Event, wenn der Mauszeiger den Button verlässt
        multiPlayerBtn.on('pointerout', () => {
            multiPlayerBtn.setStyle({fill: '#ffffff'});
        });

        multiPlayerBtn.setInteractive();
        multiPlayerBtn.on('pointerdown', () => {
            singlePlayerBtn.setVisible(false);
            multiPlayerBtn.setVisible(false);
            howToPlayBtn.setVisible(false);
            multiPlayerLocalBtn.setVisible(true);
            multiPlayerOnlineBtn.setVisible(true);
            backBtn.setVisible(true);
        });

        const howToPlayBtn = this.add.text(width / 2, 500, "How to Play", {
            fontSize: '30px',
            color: '#ffffff',
            fontFamily: '"Lobster Two", cursive'
        }).setOrigin(0.5).setInteractive();
        howToPlayBtn.setInteractive();
        howToPlayBtn.on('pointerdown', () => {
            // TODO: implement how to play
        });
// Cursor enter the button
        howToPlayBtn.on('pointerover', () => {
            howToPlayBtn.setStyle({fill: '#ff0'});
        });

// Event, wenn der Mauszeiger den Button verlässt
        howToPlayBtn.on('pointerout', () => {
            howToPlayBtn.setStyle({fill: '#ffffff'});
        });

        // Multiplayer modes
        const multiPlayerLocalBtn = this.add.text(width / 2, 300, "Lokal", {
            fontSize: '30px',
            color: '#ffffff',
            fontFamily: '"Lobster Two", cursive'
        }).setOrigin(0.5).setInteractive();
        multiPlayerLocalBtn.setInteractive();
        multiPlayerLocalBtn.on('pointerdown', () => {
            this.scene.start('GameScene',
                {})
        });
        multiPlayerLocalBtn.setVisible(false);
// Cursor enter the button
        multiPlayerLocalBtn.on('pointerover', () => {
            multiPlayerLocalBtn.setStyle({fill: '#ff0'});
        });

// Event, wenn der Mauszeiger den Button verlässt
        multiPlayerLocalBtn.on('pointerout', () => {
            multiPlayerLocalBtn.setStyle({fill: '#ffffff'});
        });

        const multiPlayerOnlineBtn = this.add.text(width / 2, 400, "Online", {
            fontSize: '30px',
            color: '#ffffff',
            fontFamily: '"Lobster Two", cursive'
        }).setOrigin(0.5).setInteractive();
        multiPlayerOnlineBtn.setInteractive();
        multiPlayerOnlineBtn.on('pointerdown', () => {
            this.showMultiplayerOptions(width);
        });
        multiPlayerOnlineBtn.setVisible(false);

// Cursor enter the button
        multiPlayerOnlineBtn.on('pointerover', () => {
            multiPlayerOnlineBtn.setStyle({fill: '#ff0'});
        });

// Event, wenn der Mauszeiger den Button verlässt
        multiPlayerOnlineBtn.on('pointerout', () => {
            multiPlayerOnlineBtn.setStyle({fill: '#ffffff'});
        });

        const backBtn = this.add.text(width / 2, 500, "Zurück", {
            fontSize: '30px',
            color: '#ffffff',
            fontFamily: '"Lobster Two", cursive'
        }).setOrigin(0.5).setInteractive();
        backBtn.setInteractive();
        backBtn.on('pointerdown', () => {
            singlePlayerBtn.setVisible(true);
            multiPlayerBtn.setVisible(true);
            howToPlayBtn.setVisible(true);
            multiPlayerLocalBtn.setVisible(false);
            multiPlayerOnlineBtn.setVisible(false);
            backBtn.setVisible(false);
        });
        backBtn.setVisible(false);

// Cursor enter the button
        backBtn.on('pointerover', () => {
            backBtn.setStyle({fill: '#ff0'});
        });

// Event, wenn der Mauszeiger den Button verlässt
        backBtn.on('pointerout', () => {
            backBtn.setStyle({fill: '#ffffff'});
        });
    }

    showMultiplayerOptions(width: number) {
        // Clear the previous buttons (singleplayer and multiplayer buttons)
        this.children.removeAll();

        // Add text for 'Multiplayer Options'
        this.add.text(width / 2, 150, 'Multiplayer Online', {
            fontSize: '30px',
            color: '#ffffff',
            fontFamily: '"Lobster Two", cursive'
        }).setOrigin(0.5).setInteractive();

        // Host Game Button
        const hostBtn = this.add.text(width / 2, 300, "Host Game", {
            fontSize: '30px',
            color: '#ffffff',
            fontFamily: '"Lobster Two", cursive'
        }).setOrigin(0.5).setInteractive();
        hostBtn.setInteractive();
        hostBtn.on('pointerdown', () => {
            // TODO: add lobby screen
            this.scene.start('GameScene', {})
        });

// Cursor enter the button
        hostBtn.on('pointerover', () => {
            hostBtn.setStyle({fill: '#ff0'});
        });

// Cursor left button
        hostBtn.on('pointerout', () => {
            hostBtn.setStyle({fill: '#ffffff'});
        });

        // Join Game Button
        const joinBtn = this.add.text(width / 2, 400, "Join Game", {
            fontSize: '30px',
            color: '#ffffff',
            fontFamily: '"Lobster Two", cursive'  // Schriftart Lobster Two anwenden
        }).setOrigin(0.5).setInteractive();
        joinBtn.setInteractive();
        joinBtn.on('pointerdown', () => {
            // TODO: add "enter sessionID" screen -> after join show lobby
            this.scene.start('GameScene',
                {})
        });

// Cursor enter the button
        joinBtn.on('pointerover', () => {
            joinBtn.setStyle({fill: '#ff0'});
        });

// Cursor left button
        joinBtn.on('pointerout', () => {
            joinBtn.setStyle({fill: '#ffffff'});
        });

        // Back Button to go back to main menu
        const backBtn = this.add.text(width / 2, 500, "Back", {
            fontSize: '30px',
            color: '#ffffff',
            fontFamily: '"Lobster Two", cursive'  // Schriftart Lobster Two anwenden
        }).setOrigin(0.5).setInteractive();
        backBtn.setInteractive();
        backBtn.on('pointerdown', () => {
            this.scene.restart(); // Restart the scene to show the main menu again
        });
// Cursor enter the button
        backBtn.on('pointerover', () => {
            backBtn.setStyle({fill: '#ff0'});
        });

// Event, wenn der Mauszeiger den Button verlässt
        backBtn.on('pointerout', () => {
            backBtn.setStyle({fill: '#ffffff'});
        });
    }


}