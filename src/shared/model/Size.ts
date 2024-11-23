export class Size {

    private height: number;
    private width: number;

    constructor(height: number, width: number) {
        this.height = height;
        this.width = width;
    }

    getHeight(): number {
        return this.height;
    }

    getWidth(): number {
        return this.width;
    }

    toJSON() {
        return {
            height: this.height,
            width: this.width,
        };
    }

    static fromData(data: any): Size {
        return new Size(data.height, data.width);
    }
}