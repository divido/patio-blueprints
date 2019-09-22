import { BaseShape } from './baseShape.js';

class OutsideCorner extends BaseShape {
	static get thickness() { return 1.25; }
	static get width()     { return 5;    }

	constructor(layer, details, name, baseCoord, kind) {
		super(layer, details);

		// --------------------

		// This is the direction of the flange
		let north = (kind[0] == 'n' ?  1 : -1);
		let east  = (kind[1] == 'e' ? -1 :  1);

		// Flange names go back towards the corners, thus the reversal
		let nsLabel = (kind[0] == 'n' ? 'South' : 'North') + ' Flange';
		let ewLabel = (kind[1] == 'e' ? 'West' : 'East') + ' Flange';

		// --------------------

		this.name = name;

		const x = baseCoord[0];
		const y = baseCoord[1];

		const eT = east * OutsideCorner.thickness;
		const nT = north * OutsideCorner.thickness;

		const eW = east * OutsideCorner.width;
		const nW = north * OutsideCorner.width;

		this.coords = {
			'Inner Corner':       [x,      y],
			['Inner ' + nsLabel]: [x,      y + nW],
			['Outer ' + nsLabel]: [x - eT, y + nW],
			'Outer Corner':       [x - eT, y - nT],
			['Outer ' + ewLabel]: [x + eW, y - nT],
			['Inner ' + ewLabel]: [x + eW, y]
		};
	}

	adjust(zoom) {
		super.adjustSegments(zoom);
	}
}

class InsideCorner extends BaseShape {
	static get thickness() { return 1; }
	static get width()     { return 2; }

	constructor(layer, details, name, baseCoord, kind) {
		super(layer, details);

		// --------------------

		// This is the direction of the flange
		let north = (kind[0] == 'n' ?  1 : -1);
		let east  = (kind[1] == 'e' ? -1 :  1);

		// Flange names go back away from the corners, thus the reversal
		let nsLabel = (kind[0] == 'n' ? 'South' : 'North') + ' Flange';
		let ewLabel = (kind[1] == 'e' ? 'West' : 'East') + ' Flange';

		// --------------------

		this.name = name;

		const x = baseCoord[0];
		const y = baseCoord[1];

		const eT = east * InsideCorner.thickness;
		const nT = north * InsideCorner.thickness;

		const eW = east * InsideCorner.width;
		const nW = north * InsideCorner.width;

		this.coords = {
			'Inner Corner':       [x,      y],
			['Inner ' + nsLabel]: [x,      y + nW],
			['Outer ' + nsLabel]: [x + eT, y + nW],
			['Outer ' + ewLabel]: [x + eW, y + nT],
			['Inner ' + ewLabel]: [x + eW, y]
		};
	}

	adjust(zoom) {
		super.adjustSegments(zoom);
	}
}

class WallSiding extends BaseShape {
	static get thickness() { return 0.5 }

	constructor(layer, details, name, from, to, kind) {
		super(layer, details);

		// --------------------

		const west = Math.min(from[0], to[0]);
		const north = Math.min(from[1], to[1]);

		const east = Math.max(from[0], to[0]);
		const south = Math.max(from[1], to[1]);

		let inner = (kind == 'n' || kind == 's' ? from[1] : from[0]);
		let outer = inner + (kind == 'n' || kind == 'w' ?  -1 : 1) * WallSiding.thickness;

		switch (kind) {
			case 'n':
			case 's':
				this.coords = {
					'Inner West': [west, inner],
					'Outer West': [west, outer],
					'Outer East': [east, outer],
					'Inner East': [east, inner]
				};
				break;

			case 'w':
			case 'e':
				this.coords = {
					'Inner North': [inner, north],
					'Outer North': [outer, north],
					'Outer South': [outer, south],
					'Inner South': [inner, south]
				};
				break;
		}
	}

	adjust(zoom) {
		super.adjustSegments(zoom);
	}
}

export class Siding {
	constructor(layer, foundation, details) {
		let adjustCoord = (base, adjust) => base.map((c, idx) => c + adjust[idx]);

		this.features = [
			new WallSiding(layer, details, 'Office Front Siding',
				adjustCoord(foundation.coords['Front Corner'], [-Infinity, 0]),
				adjustCoord(foundation.coords['Front Corner'], [-OutsideCorner.width, 0]),
				's'),

			new OutsideCorner(layer, details, 'Front Corner Siding',
				foundation.coords['Front Corner'], 'se'),

			new WallSiding(layer, details, 'Office Wall Siding',
				adjustCoord(foundation.coords['Front Corner'], [0, -OutsideCorner.width]),
				adjustCoord(foundation.coords['Door West'], [0, InsideCorner.width]),
				'e'),

			new InsideCorner(layer, details, 'Doorway West Corner Siding', foundation.coords['Door West'], 'nw'),

			new WallSiding(layer, details, 'Door Siding',
				adjustCoord(foundation.coords['Door West'], [InsideCorner.width, 0]),
				adjustCoord(foundation.coords['Door East'], [-InsideCorner.width, 0]),
				's'),

			new InsideCorner(layer, details, 'Doorway East Corner Siding', foundation.coords['Door East'], 'ne'),

			new WallSiding(layer, details, 'Entryway Siding',
				adjustCoord(foundation.coords['Door East'], [0, InsideCorner.width]),
				adjustCoord(foundation.coords['Main West'], [0, -OutsideCorner.width]),
				'w'),

			new OutsideCorner(layer, details, 'Entry Corner Siding', foundation.coords['Main West'], 'sw'),

			new WallSiding(layer, details, 'Front Siding',
				adjustCoord(foundation.coords['Main West'], [OutsideCorner.width, 0]),
				adjustCoord(foundation.coords['Main East'], [-OutsideCorner.width, 0]),
				's'),

			new OutsideCorner(layer, details, 'Far Corner Siding', foundation.coords['Main East'], 'se'),

			new WallSiding(layer, details, 'East Siding',
				adjustCoord(foundation.coords['Main East'], [0, -OutsideCorner.width]),
				adjustCoord(foundation.coords['Main East'], [0, -Infinity]),
				'e')
		];

		this.features.forEach((feature) => feature.shape.style.fillColor = 'palegoldenrod');
	}

	adjust(zoom) {
		this.features.forEach((feature) => feature.adjust(zoom));
	}
}
