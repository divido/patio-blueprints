import { BaseShape } from './baseShape.js';

export class Support extends BaseShape {
	constructor(layer, pillarLayer, details, kind, name, center) {
		super(layer, details);

		this.name = name;

		const pillarRadius = 4;
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

		let pillarExtent = pillarRadius - halfSupport;
		this.extraCoords = {
			'Center': this.center,
			'Pillar North': [this.center[0], this.north - pillarExtent],
			'Pillar South': [this.center[0], this.south + pillarExtent],
			'Pillar West': [this.west - pillarExtent, this.center[1]],
			'Pillar East': [this.east + pillarExtent, this.center[1]]
		};

		this.shape.style.fillColor = 'olive';

		pillarLayer.activate();
		this.pillar = new paper.Shape.Circle(new paper.Point(0, 0), 0);
		this.pillar.style = {
			fillColor: 'lightgray',
			strokeColor: 'black',
			strokeWidth: 1
		}

		this.pillar.onClick = () => {
			this.shape.selected = true;
			details.select(this);
		}
	}

	adjust(zoom) {
		super.adjustSegments(zoom);

		const pillarRadius = 4;
		this.pillar.position = zoom.point(this.center);
		this.pillar.radius = zoom.length(pillarRadius);
	}
}
