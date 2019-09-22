import { BaseShape } from './baseShape.js';

export class Foundation extends BaseShape {
	constructor(layer, details) {
		super(layer, details);

		const measurements = {
			// Measured inside mounted boards, attempted to press flashing. Assumed board thickness of 1.5 each
			// Likely within 1/8"
			entryWidth: 50.75 + 3,

			// Low fidelity measurement due to low importance
			entryDepth: 24,

			// Measured from main wall board to edge, adding in entryDepth and board thickness
			officeWallLength: 24 + 1.5 + 61
		};

		this.name = 'Foundation';
		this.coords = {
			'Canvas Top Left': [-Infinity, -Infinity],
			'Trailing West':   [-Infinity, 24 + measurements.officeWallLength],
			'Front Corner':    [ 24, 24 + measurements.officeWallLength],
			'Door West':       [ 24,  24],
			'Door East':       [ 24 + measurements.entryWidth,  24],
			'Main West':       [ 24 + measurements.entryWidth,  24 + measurements.entryDepth],
			'Main East':       [281,  24 + measurements.entryDepth],
			'Trailing East':   [281, -Infinity]
		};
	}

	adjust(zoom) {
		super.adjustSegments(zoom);
	}
}
