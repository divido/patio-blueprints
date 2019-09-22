import { BaseShape } from './baseShape.js';

class VerticalJoist extends BaseShape {
	constructor(layer, details, name, color, west, north, south, thickness=1.5) {
		super(layer, details);

		this.name = name;

		let east = west + thickness;
		this.coords = {
			'North West': [west, north],
			'North East': [east, north],
			'South East': [east, south],
			'South West': [west, south]
		};

		const numPieces = Math.ceil((south - north) / VerticalDeckBoard.thickness) + 1;
		this.offset = Math.random() * VerticalDeckBoard.thickness;

		this.pieces = [];
		for (let i = 0; i < numPieces; i++) {
			let piece = new paper.Raster(color);
			if (i % 2 == 1) piece.scale(1, -1);
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

		let T = zoom.length(VerticalDeckBoard.thickness);
		let Off = Math.round(zoom.length(this.offset));

		this.pieces.forEach((piece, idx) => {
			piece.fitBounds(this.shape.bounds);
			piece.bounds.x = this.shape.bounds.x;
			piece.bounds.y = this.shape.bounds.y + T * idx - Off;
		});
	}
}

export class Framing {
	constructor(layer, deckBounds, details) {
	}

	adjust(zoom) {
		this.features.forEach((feature) => feature.adjust(zoom));
	}
}
