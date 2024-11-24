import Phaser from "phaser";
import AppleImage from "../../../../public/assets/apple.png";
import FeatherImage from '../../../../public/assets/feather.png';
import SproutImage from '../../../../public/assets/sprout.png';
import MagnifyingGlassImage from '../../../../public/assets/magnifying_glass.png';
import SnailImage from '../../../../public/assets/snail.png';
import UTurnImage from '../../../../public/assets/u_turn.png';
import OrangeImage from '../../../../public/assets/orange.png';
import SplitImage from '../../../../public/assets/split.png';
import LogoImage from '../../../../public/assets/logo.png';
import SnakeBody from '../../../../public/assets/snakeBody.png';
import SnakeFace from '../../../../public/assets/snakeFace.png';
import CollectableArrow from '../../../../public/assets/collectable_arrow.png';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'BootScene',
};

export class BootScene extends Phaser.Scene {
    constructor() {
        super(sceneConfig);
    }

    /** preload any assets here
     *
     * please pay attention to the spelling!
     * upper and lower case needs to be matched for the filename.
     * otherwise the files cannot be found on unix systems
     */
    preload() {
        this.load.image('food_item_apple', AppleImage);
        this.load.image('power_up_feather', FeatherImage);
        this.load.image('power_up_sprout', SproutImage);
        this.load.image('power_up_magnifying_glass', MagnifyingGlassImage);
        this.load.image('power_up_snail', SnailImage);
        this.load.image('power_up_u_turn', UTurnImage);
        this.load.image('power_up_orange', OrangeImage);
        this.load.image('power_up_split', SplitImage);
        this.load.image('logo', LogoImage);
        this.load.image('snake_body', SnakeBody);
        this.load.image('snake_face', SnakeFace);
        this.load.image('collectable_arrow', CollectableArrow);
    }

    create() {
        // TODO: implement / add game config from previous side (inject by custom game config later)
        this.scene.start('GameScene', {}); // Start the game scene after preloading
    }
}