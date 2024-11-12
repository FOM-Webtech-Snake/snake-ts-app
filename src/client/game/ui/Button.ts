const style = {
    fontSize: '30px',
    color: '#ffffff',
    fontFamily: '"Lobster Two", cursive'
};

export class Button {
    private scene: Phaser.Scene;
    private x: number;
    private y: number;
    private text: string;
    private onClick: () => void;
    private button: Phaser.GameObjects.Text;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        text: string,
        onClick: () => void,
        visible: boolean = true) {

        this.scene = scene;
        this.x = x;
        this.y = y;
        this.text = text;
        this.onClick = onClick;

        this.button = this.scene.add.text(this.x, this.y, this.text, style).setOrigin(0.5).setInteractive();
        this.button.setVisible(visible);

        this.setupEvents();
    }

    private setupEvents(): void {
        // Change button color on hover
        this.button.on('pointerover', () => this.button.setStyle({fill: '#ff0'}));
        this.button.on('pointerout', () => this.button.setStyle({fill: '#ffffff'}));

        // Trigger the onClick event on button click
        this.button.on('pointerdown', this.onClick);
    }

    // Method to make the button visible or invisible
    setVisible(visible: boolean) {
        this.button.setVisible(visible);
    }

    // Method to change the button text dynamically
    setText(text: string) {
        this.button.setText(text);
    }
}