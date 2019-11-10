import { BaseShape } from './baseShape.js';

class DeckBoard extends BaseShape {
	constructor(layer, details, deckBounds, name, color, north, south, west, east, buildPiece) {
		super(layer, details);

		this.name = name;
		this.deckBounds = deckBounds;

		const T = this.deckBounds.boardThickness;
		const S = this.deckBounds.boardSpacing;
		const TS = T + S;

		this.coords = {
			'North West': [west, north],
			'North East': [east, north],
			'South East': [east, south],
			'South West': [west, south]
		};

		let length = Math.max((south - north), (east - west));

		const numPieces = Math.ceil(length / T) + 1;
		this.offset = Math.random() * T;

		this.pieces = [];
		for (let i = 0; i < numPieces; i++) {
			this.pieces.push(buildPiece(i));
		}

		this.boardGroup = new paper.Group([this.shape, ...this.pieces]);
		this.boardGroup.clipped = true;

		this.boardGroup.onClick = () => {
			this.shape.selected = true;
			details.select(this);
		}
	}

	miter(cornerName, angle=45) {
		const angleRad = angle * Math.PI / 180.0;

		const cutT = this.deckBounds.boardThickness * Math.tan(angleRad);
		const cutDistance = (this.deckBounds.boardSpacing / 2) / Math.cos(angleRad);

		let [pointCorner, cutDimenson, cutDirection] = this._miterData(cornerName);
		this.coords[cornerName][cutDimenson] += cutDirection * (cutT + cutDistance);
		this.coords[pointCorner][cutDimenson] += cutDirection * (cutDistance);

		return this;
	}

	adjust(zoom) {
		super.adjustSegments(zoom);

		let T = zoom.length(this.deckBounds.boardThickness);
		let Off = zoom.length(this.offset);

		const dim = this._boundsDimension;

		this.pieces.forEach((piece, idx) => {
			piece.fitBounds(this.shape.bounds);
			piece.bounds.x = this.shape.bounds.x;
			piece.bounds.y = this.shape.bounds.y;

			piece.bounds[dim] = Math.round(this.shape.bounds[dim] - Off) + T * idx;
		});
	}
}

// --------------------------------------------------------------------------------

class VerticalDeckBoard extends DeckBoard {
	constructor(layer, details, deckBounds, name, color, west, north, south) {
		super(layer, details, deckBounds, name, color, north, south, west, west + deckBounds.boardThickness,
			(idx) => {
				let piece = new paper.Raster(color);
				if (idx % 2 == 1) piece.scale(1, -1);
				return piece;
			});
	}

	_miterData(cornerName) {
		switch (cornerName) {
			case 'North West': return ['North East', 1,  1];
			case 'North East': return ['North West', 1,  1];
			case 'South West': return ['South East', 1, -1];
			case 'South East': return ['South West', 1, -1];
		}
	}

	get _boundsDimension() { return 'y'; }
}

// --------------------------------------------------------------------------------

class HorizontalDeckBoard extends DeckBoard {
	constructor(layer, details, deckBounds, name, color, north, west, east) {
		super(layer, details, deckBounds, name, color, north, north + deckBounds.boardThickness, west, east,
			(idx) => {
				let piece = new paper.Raster(color);
				piece.rotation = 90;
				if (idx % 2 == 1) piece.scale(-1, 1);
				return piece;
			});
	}

	_miterData(cornerName) {
		switch (cornerName) {
			case 'North West': return ['South West', 0,  1];
			case 'South West': return ['North West', 0,  1];
			case 'North East': return ['South East', 0, -1];
			case 'South East': return ['North East', 0, -1];
		}
	}

	get _boundsDimension() { return 'x'; }
}

// --------------------------------------------------------------------------------

class StepConnector extends BaseShape {
	constructor(layer, details, deckBounds, color) {
		super(layer, details);

		this.name = "Deck Step Border Angle";
		this.deckBounds = deckBounds;

		const T = this.deckBounds.boardThickness;
		const S = this.deckBounds.boardSpacing;
		const TS = T + S;

		const angleRad = 22.5 * Math.PI / 180.0;
		const cutT = T * Math.tan(angleRad);
		const cutDistance = ((S / 2) / Math.cos(angleRad)) / Math.sqrt(2);

		const bounds = this.deckBounds.bounds;
		let yDelta = bounds.ySouth - TS - bounds.yStep;

		let ne = [bounds.xStepEast + cutT, bounds.ySouth - TS - T];
		let se = [bounds.xStepEast, bounds.ySouth - TS];

		let nw = [ne[0] - yDelta, ne[1] - yDelta];
		let sw = [se[0] - yDelta, se[1] - yDelta];

		this.outerCoords = {
			'North West': nw,
			'North East': ne,
			'South East': se,
			'South West': sw
		};

		this.coords = {
			'North West': [nw[0] + cutDistance, nw[1] + cutDistance],
			'North East': [ne[0] - cutDistance, ne[1] - cutDistance],
			'South East': [se[0] - cutDistance, se[1] - cutDistance],
			'South West': [sw[0] + cutDistance, sw[1] + cutDistance]
		};

		const length = Math.sqrt(2) * yDelta;
		const numPieces = Math.ceil(length / T) + 2;
		this.offset = Math.random() * T;

		this.pieces = [];
		for (let i = 0; i < numPieces; i++) {
			let piece = new paper.Raster(color);
			if (i % 2 == 1) piece.scale(-1, 1);
			this.pieces.push(piece);
		}

		this.boardGroup = new paper.Group([this.shape, ...this.pieces]);
		this.boardGroup.clipped = true;

		this.boardGroup.onClick = () => {
			this.shape.selected = true;
			details.select(this);
		}
	}

	adjust(zoom) {
		super.adjustSegments(zoom);

		let centerOf = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

		let T = this.deckBounds.boardThickness;
		let Off = this.offset;

		let position = centerOf(this.coords['North West'], this.coords['South West']);
		position[0] -= Off;
		position[1] -= Off;

		this.pieces.forEach((piece, idx) => {
			piece.rotation = 0;

			let r = new paper.Rectangle(this.shape.position,
				new paper.Size(zoom.length(T), zoom.length(T)));

			piece.fitBounds(r);

			let pt = zoom.point(position);
			piece.position.x = Math.round(pt.x);
			piece.position.y = Math.round(pt.y);
			piece.rotation = -45;

			position[0] += T / Math.sqrt(2);
			position[1] += T / Math.sqrt(2);
		});
	}

	trimBoard(board) {
		const T = this.deckBounds.boardThickness;
		const S = this.deckBounds.boardSpacing;
		const TS = T + S;

		const angleRad = 22.5 * Math.PI / 180.0;
		const angleS = S * Math.sin(angleRad);

		let ySouthWest = this.deckBounds.bounds.yStep - TS;

		board.coords = {
			'North West': board.coords['North West'],
			'North East': board.coords['North East'],
			'South East': board.coords['South East'],
			'East Slope': [this.outerCoords['North East'][0] + angleS, board.coords['South East'][1]],
			'West Slope': [this.outerCoords['North West'][0] + angleS, ySouthWest],
			'South West': [board.coords['South West'][0], ySouthWest],
		};
	}
}

// --------------------------------------------------------------------------------

export class DeckBoards {
	constructor(layer, deckBounds, details) {
		let adjustCoord = (base, adjust) => base.map((c, idx) => c + adjust[idx]);

		const bounds = deckBounds.bounds;

		const T = deckBounds.boardThickness;
		const S = deckBounds.boardSpacing;
		const TS = T + S;

		// ----------------------------------------

		let boardX = bounds.xWest;
		let boardIdx = 1;

		this.features = [];

		let createV = ({ name, color, west, north, south }) => {
			let board = new VerticalDeckBoard(layer, details, deckBounds, name || "Deck Board " + boardIdx,
				color || 'coastalBluff', west || boardX, north, south);

			if (!name) {
				boardIdx++;
				boardX += TS;
			}

			this.features.push(board);
			return board;
		};

		let createH = ({ name, color, north, west, east }) => {
			let board = new HorizontalDeckBoard(layer, details, deckBounds, name,
				color || 'coastalBluff', north, west, east);

			this.features.push(board);
			return board;
		};

		// ----------------------------------------

		createH({
			name: "Step Board 1",
			north: bounds.ySouth - T,
			west: bounds.xWest,
			east: bounds.xStepEast + deckBounds.boardOverhang - deckBounds.stepSpacing
		});

		createH({
			name: "Step Board 2",
			north: bounds.ySouth - T - TS,
			west: bounds.xWest,
			east: bounds.xStepEast + deckBounds.boardOverhang - deckBounds.stepSpacing
		}).miter('North East');

		// ----------------------------------------

		this.stepConnector = new StepConnector(layer, details, deckBounds, 'spicedRum');
		this.features.push(this.stepConnector);

		createH({
			name: "Step Border",
			color: 'spicedRum',
			north: bounds.yStep - T,
			west: bounds.xWest,
			east: this.stepConnector.outerCoords['North West'][0]
		}).miter('North West').miter('South East', 22.5);

		createH({
			name: "Southern Border 2",
			color: 'spicedRum',
			north: bounds.ySouth - T - TS,
			west: bounds.xStepEast,
			east: bounds.xEast - TS
		}).miter('North West', 22.5).miter('North East');

		// --------------------

		createH({
			name: "Southern Border 1",
			color: 'spicedRum',
			north: bounds.ySouth - T,
			west: bounds.xStepEast,
			east: bounds.xEast
		}).miter('North East');

		// ----------------------------------------

		createV({ color: 'spicedRum', north: bounds.yFront, south: bounds.yStep }).miter('South East');
		createV({ color: 'spicedRum', north: bounds.yDoor,  south: bounds.yStep - TS });

		for (let idx = 0; idx < 7; idx++) {
			createV({ north: bounds.yDoor,  south: bounds.yStep - TS });
		}

		let entryBorder = createV({
			name: "Entry Border Deck Board",
			color: 'spicedRum',
			west: bounds.xEntry - T,
			north: bounds.yDoor,
			south: bounds.yMain + T
		}).miter('South East');

		createH({
			name: "Main Wall Border",
			color: 'spicedRum',
			north: bounds.yMain,
			west: bounds.xEntry - T,
			east: bounds.xEast
		}).miter('North West').miter('South East');

		for (let idx = 0; idx < 12; idx++) {
			createV({ north: bounds.yMain + TS,  south: bounds.yStep - TS });
		}

		this.stepConnector.trimBoard(createV({ north: bounds.yMain + TS,  south: bounds.ySouth - 2 * TS }));

		for (let idx = 0; idx < 18; idx++) {
			createV({ north: bounds.yMain + TS,  south: bounds.ySouth - 2 * TS});
		}

		createV({ color: 'spicedRum', north: bounds.yMain + TS,  south: bounds.ySouth - TS }).miter('South West');
		createV({ color: 'spicedRum', north: bounds.yMain,  south: bounds.ySouth }).miter('South West').miter('North West');
	}

	adjust(zoom) {
		this.features.forEach((feature) => feature.adjust(zoom));
	}
}
