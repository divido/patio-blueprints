import { Support } from './support.js';

class Pier extends Support {
	constructor(layer, details, name, center) {
		super(layer, details, 'Pier', name, center);
	}
}

export class Piers {
	constructor(layer, framing, posts, details) {
		this.features = [];

		const pierWidth = 3.5;
		const halfPier = pierWidth / 2;

		let thirdOfBeam = Math.floor((framing.westBeam[0].length / 3) * 8) / 8;
		let northPierY = framing.westBeam[0].north + thirdOfBeam;
		let southPierY = framing.westBeam[0].south - thirdOfBeam;

		this.features.push(new Pier(layer, details, "West Beam Support 1", [framing.westBeam[0].east, northPierY]));
		this.features.push(new Pier(layer, details, "West Beam Support 2", [framing.westBeam[0].east, southPierY]));
		this.features.push(new Pier(layer, details, "West Beam Support 3", [framing.westBeam[0].east, framing.westBeam[0].south - halfPier]));

		this.features.push(new Pier(layer, details, "East Beam Support 1", [framing.eastBeam[0].east, northPierY]));
		this.features.push(new Pier(layer, details, "East Beam Support 1", [framing.eastBeam[0].east, southPierY]));

		let stepSupportX = (posts.southernPosts.westEdge + posts.westernPosts.eastEdge) / 2;
		let stepSupportY = posts.southernPosts.center + 1.5;
		this.features.push(new Pier(layer, details, "Step Front Support", [stepSupportX, stepSupportY]));
	}

	adjust(zoom) {
		this.features.forEach((feature) => feature.adjust(zoom));
	}
}
