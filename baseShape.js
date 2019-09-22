
export class BaseShape {
	constructor(layer, details) {
		layer.activate();
		this.shape = new paper.Path();

		this.shape.style = {
			fillColor: 'lightgray',
			strokeColor: 'black',
			strokeWidth: 1
		};

		this.shape.onClick = () => {
			this.shape.selected = true;
			details.select(this);
		}
	}

	adjustSegments(zoom) {
		let coords = Object.values(this.coords);
		coords.push(coords[0]);

		this.shape.removeSegments();
		this.shape.addSegments(coords.map((coord) => zoom.point(coord)));
	}
}
