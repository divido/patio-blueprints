import { BaseShape } from './baseShape.js';

class Joist extends BaseShape {
	constructor(layer, details, name, coords) {
		super(layer, details);

		this.name = name;

		this.north = coords.north || coords.south - 1.5;
		this.south = coords.south || coords.north + 1.5;
		this.west  = coords.west  || coords.east  - 1.5;
		this.east  = coords.east  || coords.west  + 1.5;

		this.coords = {
			'North West': [this.west, this.north],
			'North East': [this.east, this.north],
			'South East': [this.east, this.south],
			'South West': [this.west, this.south]
		};

		this.shape.style.fillColor = 'olive';

		this.length = Math.max(this.south - this.north, this.east - this.west);
	}

	adjust(zoom) {
		super.adjustSegments(zoom);
	}
}

// --------------------------------------------------------------------------------

class VerticalJoist extends Joist {
	constructor(layer, details, name, coords) {
		super(layer, details, name, coords);

		if (!(coords.north && coords.south)) {
			console.log("----------------------------------------");
			console.log("Vertical Joists should have north and south defined");
			console.log('coords =', coords);
			console.trace();
			console.log('');
		}
	}
}

// --------------------------------------------------------------------------------

class HorizontalJoist extends Joist {
	constructor(layer, details, name, coords) {
		super(layer, details, name, coords);

		if (!(coords.west && coords.east)) {
			console.log("----------------------------------------");
			console.log("Horizontal Joists should have west and east defined");
			console.log('coords =', coords);
			console.trace();
			console.log('');
		}
	}
}

// --------------------------------------------------------------------------------

export class Framing {
	constructor(layer, foundation, deckBounds, posts, details) {

		this.features = [];

		let createV = (name, coords) => {
			let joist = new VerticalJoist(layer, details, name, coords);
			this.features.push(joist);
			return joist;
		};

		let createH = (name, coords) => {
			let joist = new HorizontalJoist(layer, details, name, coords);
			this.features.push(joist);
			return joist;
		};

		// ----------------------------------------
		// Primary Reference Boards

		let officeWall = createV('Office Wall Anchor Joist', {
			west: foundation.coords['Front Corner'][0],
			north: foundation.coords['Door West'][1],
			south: posts.westernPosts.southEdge
		});

		let mainWall = createH('Main Wall Anchor Joist', {
			north: foundation.coords['Main West'][1],
			west: officeWall.east,
			east: posts.easternPosts.eastEdge
		});

		// ----------------------------------------
		// Doorway framing

		let entryWall = createV('Entry Wall Anchor Joist', {
			east: foundation.coords['Door East'][0],
			north: foundation.coords['Door East'][1],
			south: mainWall.north
		});

		let doorAnchor = createH('Door Anchor Joist', {
			north: foundation.coords['Door West'][1],
			west: officeWall.east,
			east: entryWall.west
		});

		createH('Entryway Joist', {
			north: (doorAnchor.south + mainWall.north) / 2 - 0.75,
			west: officeWall.east,
			east: entryWall.west
		});

		// ----------------------------------------
		// Post supports

		let outerEasternPost = createV('Outer Eastern Post Joist', {
			west: posts.easternPosts.eastEdge,
			north: mainWall.north,
			south: posts.southernPosts.southEdge
		});

		let outerSouthernPost = createH('Outer Southern Post Joist', {
			north: posts.southernPosts.southEdge,
			west: posts.southernPosts.westEdge,
			east: outerEasternPost.east
		});

		let innerEasternPost = createV('Inner Eastern Post Joist', {
			east: posts.easternPosts.westEdge,
			north: mainWall.south,
			south: outerSouthernPost.north
		});

		let innerSouthernPost = createH('Inner Southern Post Joist', {
			south: posts.southernPosts.northEdge,
			west: posts.southernPosts.westEdge,
			east: innerEasternPost.west
		});

		let outerWesternPost = createV('Outer Western Post Joist', {
			east: posts.westernPosts.westEdge,
			north: foundation.coords['Front Corner'][1],
			south: posts.westernPosts.southEdge
		});

		// ----------------------------------------
		// Beams
		let createBeam = (name, coords) => [
			createV(name + ' 1', { east: coords.center, north: coords.north, south: coords.south }),
			createV(name + ' 2', { west: coords.center, north: coords.north, south: coords.south }) ];

		// Divide the span into thirds, but round to nearest eigth, giving extra to the center
		let span = (innerEasternPost.west - officeWall.east);
		let thirdOfSpan = Math.floor((span / 3) * 8) / 8;

		let westBeam = createBeam('Western Beam', {
			center: officeWall.east + thirdOfSpan,
			north: mainWall.south,
			south: posts.westernPosts.southEdge
		});
		this.westBeam = westBeam;

		let eastBeam = createBeam('Eastern Beam', {
			center: innerEasternPost.west - thirdOfSpan,
			north: mainWall.south,
			south: innerSouthernPost.north
		});
		this.eastBeam = eastBeam;

		// ----------------------------------------
		// Step Framework

		let stepNorthBoundary = createH('Step North Boundary', {
			north: posts.westernPosts.southEdge,
			west: outerWesternPost.west,
			east: eastBeam[0].west
		});

		let stepEastBoundary = createV('Step East Boundary', {
			east: posts.southernPosts.westEdge,
			south: outerSouthernPost.south,
			north: stepNorthBoundary.south
		});

		// ----------------------------------------
		// Inner Framing

		let north = deckBounds.bounds.yMain + deckBounds.boardThickness + deckBounds.boardSpacing / 2 - 0.75;

		let createInnerJoists = (north, idx) => {
			createH('West Inner Joist ' + idx, {
				north: north[0],
				west: officeWall.east,
				east: westBeam[0].west
			});

			createH('Center Inner Joist ' + idx, {
				north: north[1],
				west: westBeam[1].east,
				east: eastBeam[0].west
			});

			createH('East Inner Joist ' + idx, {
				north: north[2],
				west: eastBeam[1].east,
				east: innerEasternPost.west
			});
		};

		for (let i = 0; i < 9; i++) {
			let n = north + 16 * i;
			createInnerJoists([n, n, n], i + 1);
		}

		let stepBorderSupport = deckBounds.bounds.yStep - deckBounds.boardThickness - deckBounds.boardSpacing / 2 - 0.75;
		let southernBorderSupport = deckBounds.bounds.ySouth - 2 * deckBounds.boardThickness - 1.5 * deckBounds.boardSpacing - 0.75;
		createInnerJoists([stepBorderSupport, stepBorderSupport, southernBorderSupport], 10);
	}

	adjust(zoom) {
		this.features.forEach((feature) => feature.adjust(zoom));
	}
}
