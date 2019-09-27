import { BaseShape } from './baseShape.js';

export class Support extends BaseShape {
	constructor(layer, details, kind, name, center) {
		super(layer, details);

		this.name = name;

		const halfSupport = 3.5 / 2;

		this.east = center[0] + halfSupport;
		this.west = center[0] - halfSupport;

		this.north = center[1] - halfSupport;
		this.south = center[1] + halfSupport;

		this.center = center;

		this.coords = {
			['NW ' + kind + ' Corner']: [this.west, this.north],
			['NE ' + kind + ' Corner']: [this.east, this.north],
			['SE ' + kind + ' Corner']: [this.east, this.south],
			['SW ' + kind + ' Corner']: [this.west, this.south]
		};

		this.shape.style.fillColor = 'olive';
	}

	adjust(zoom) {
		super.adjustSegments(zoom);
	}
}
