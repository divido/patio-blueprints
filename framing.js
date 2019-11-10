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

		this.extraCoords = {
			'Center': [(this.west + this.east) / 2, (this.north + this.south) / 2]
		};

		this.shape.style.fillColor = 'olive';

		this.length = Math.max(this.south - this.north, this.east - this.west);
		this.attributes = {
			'Length': this.length
		};
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

class AngleSupport extends BaseShape {
	constructor(layer, details, north, east, deckBounds, stepConnector) {
		super(layer, details);

		this.name = "Step Angle Support";

		let boardSW = stepConnector.coords["South West"];

		// Extrapolate at a 45 from the boardSW to get the intersection on the north side
		// Also account for overhang amounts, which pushes the support board east of the deck board
		let deltaNorth = boardSW[1] - north;
		let west = boardSW[0] - deltaNorth + Math.sqrt(2) * deckBounds.boardOverhang;

		// Create a 45 here by enforcing (south - north) == (east - west)
		let south = north + (east - west);

		let T = Math.sqrt(2) * 1.5;
		this.coords = {
			'North West': [west, north],
			'North East': [west + T, north],
			'East North': [east, south - T],
			'East South': [east, south]
		};
		console.log('this.coords =', this.coords);

		this.shape.style.fillColor = 'olive';
	}

	adjust(zoom) {
		super.adjustSegments(zoom);
	}
}

// --------------------------------------------------------------------------------

export class Framing {
	constructor(stepLayer, mainLayer, foundation, deckBounds, deckboards, posts, details) {

		this.features = [];

		let createV = (layer, name, coords) => {
			let joist = new VerticalJoist(layer, details, name, coords);
			this.features.push(joist);
			return joist;
		};

		let createH = (layer, name, coords) => {
			let joist = new HorizontalJoist(layer, details, name, coords);
			this.features.push(joist);
			return joist;
		};

		// ----------------------------------------
		// Primary Reference Boards

		let officeWall = createV(mainLayer, 'Office Wall Anchor Joist', {
			west: foundation.coords['Front Corner'][0],
			north: foundation.coords['Door West'][1],
			south: posts.westernPosts.southEdge
		});

		let mainWall = createH(mainLayer, 'Main Wall Anchor Joist', {
			north: foundation.coords['Main West'][1],
			west: officeWall.east,
			east: posts.easternPosts.eastEdge
		});

		// ----------------------------------------
		// Doorway framing

		let entryWall = createV(mainLayer, 'Entry Wall Anchor Joist', {
			east: foundation.coords['Door East'][0],
			north: foundation.coords['Door East'][1],
			south: mainWall.north
		});

		let doorAnchor = createH(mainLayer, 'Door Anchor Joist', {
			north: foundation.coords['Door West'][1],
			west: officeWall.east,
			east: entryWall.west
		});

		createH(mainLayer, 'Entryway Joist', {
			north: (doorAnchor.south + mainWall.north) / 2 - 0.75,
			west: officeWall.east,
			east: entryWall.west
		});

		// ----------------------------------------
		// Post supports

		let outerEasternPost = createV(mainLayer, 'Outer Eastern Post Joist', {
			west: posts.easternPosts.eastEdge,
			north: mainWall.north,
			south: posts.southernPosts.southEdge
		});

		let outerSouthernPost = createH(mainLayer, 'Outer Southern Post Joist', {
			north: posts.southernPosts.southEdge,
			west: posts.southernPosts.westEdge,
			east: outerEasternPost.east
		});

		let innerEasternPost = createV(mainLayer, 'Inner Eastern Post Joist', {
			east: posts.easternPosts.westEdge,
			north: mainWall.south,
			south: outerSouthernPost.north
		});

		let innerSouthernPost = createH(mainLayer, 'Inner Southern Post Joist', {
			south: posts.southernPosts.northEdge,
			west: posts.southernPosts.westEdge,
			east: innerEasternPost.west
		});

		let outerWesternPost = createV(mainLayer, 'Outer Western Post Joist', {
			east: posts.westernPosts.westEdge,
			north: foundation.coords['Front Corner'][1],
			south: posts.westernPosts.southEdge
		});

		// ----------------------------------------
		// Beams
		let createBeam = (name, coords) => [
			createV(mainLayer, name + ' 1', { east: coords.center, north: coords.north, south: coords.south }),
			createV(mainLayer, name + ' 2', { west: coords.center, north: coords.north, south: coords.south }) ];

		// Divide the span into thirds, but round to nearest eighth, giving extra to the center
		let span = (innerEasternPost.west - officeWall.east - 6); // Subtract the beam widths, to make inner joists as close as possble
		let thirdOfSpan = Math.floor((span / 3) * 8) / 8 + 1.5; // Add the 1.5 to account for half a beam, so as to reference beam centers

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

		let stepNorthBoundary = createH(mainLayer, 'Step North Boundary', {
			north: posts.westernPosts.southEdge,
			west: outerWesternPost.west,
			east: eastBeam[0].west
		});

		let stepEastBoundary = createV(mainLayer, 'Step East Boundary', {
			east: posts.southernPosts.westEdge,
			south: outerSouthernPost.south,
			north: stepNorthBoundary.south
		});

		// ----------------------------------------
		// Lower Step Framework

		let lowerNorthBoundary = createH(stepLayer, 'Lower Step North Boundary', {
			north: posts.westernPosts.southEdge,
			west: posts.westernPosts.westEdge,
			east: posts.southernPosts.westEdge
		});

		let lowerWestBoundary = createV(stepLayer, 'Lower Step West Boundary', {
			north: posts.westernPosts.southEdge - 3.5,
			south: posts.southernPosts.southEdge,
			east: posts.westernPosts.westEdge
		});

		let lowerEastBoundary = createV(stepLayer, 'Lower Step East Boundary', {
			east: posts.southernPosts.westEdge,
			south: posts.southernPosts.southEdge,
			north: stepNorthBoundary.south
		});

		let lowerSouthBoundary = createH(stepLayer, 'Lower Step South Boundary', {
			west: lowerWestBoundary.west,
			east: lowerEastBoundary.east + 3.5,
			north: lowerEastBoundary.south
		});

		let createStepJoist = (west, idx) => {
			createV(stepLayer, 'Step Joist ' + idx, {
				north: lowerNorthBoundary.south,
				south: lowerSouthBoundary.north,
				west: west
			});
		};

		for (let i = 0; i < 8; i++) {
			createStepJoist(posts.westernPosts.eastEdge + 16 * i, i + 1);
		}
		createStepJoist(lowerEastBoundary.west - 1.5, 9);

		// ----------------------------------------
		// Inner Framing

		let north = deckBounds.bounds.yMain + deckBounds.boardThickness + deckBounds.boardSpacing / 2 - 0.75;

		let createInnerJoists = (north, idx) => {
			createH(mainLayer, 'West Inner Joist ' + idx, {
				north: north[0],
				west: officeWall.east,
				east: westBeam[0].west
			});

			createH(mainLayer, 'Center Inner Joist ' + idx, {
				north: north[1],
				west: westBeam[1].east,
				east: eastBeam[0].west
			});

			createH(mainLayer, 'East Inner Joist ' + idx, {
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

		// ----------------------------------------
		// Extra Support

		createH(mainLayer, 'South Border Step-Side Support', {
			west: stepEastBoundary.east,
			east: eastBeam[0].west,
			north: stepNorthBoundary.south
		});
		console.log('deckboards =', deckboards);

		this.features.push(new AngleSupport(
			mainLayer, details,
			stepNorthBoundary.south,
			stepEastBoundary.west,
			deckBounds,
			deckboards.stepConnector));

		let eastPostGapSupport = (north, south, idx) => {
			createH(mainLayer, 'East Border Support ' + idx, {
				north: north,
				west: innerEasternPost.east,
				east: outerEasternPost.west
			});

			createH(mainLayer, 'East Border Support ' + (idx + 1), {
				north: (north + south) / 2 - 0.75,
				west: innerEasternPost.east,
				east: outerEasternPost.west
			});

			createH(mainLayer, 'East Border Support ' + (idx + 2), {
				south: south,
				west: innerEasternPost.east,
				east: outerEasternPost.west
			});
		};

		for (let i = 0; i < 4; i++) {
			let postSouthEdge = posts.southernPosts.southEdge - (4 - i) * (deckBounds.postSpacing + 3.5);
			eastPostGapSupport(postSouthEdge, postSouthEdge + deckBounds.postSpacing, i * 3 + 1);
		}

		let southPostGapSupport = (west, east, idx) => {
			createV(mainLayer, 'South Border Support ' + idx, {
				west: west,
				north: innerSouthernPost.south,
				south: outerSouthernPost.north
			});

			createV(mainLayer, 'South Border Support ' + (idx + 1), {
				west: (west + east) / 2 - 0.75,
				north: innerSouthernPost.south,
				south: outerSouthernPost.north
			});

			// Skip this on the last support group, since the innerEasternPost board handles this
			if (idx < 7) {
				createV(mainLayer, 'South Border Support ' + (idx + 2), {
					east: east,
					north: innerSouthernPost.south,
					south: outerSouthernPost.north
				});
			}
		};

		for (let i = 0; i < 3; i++) {
			let postWestEdge = posts.easternPosts.eastEdge - (3 - i) * (deckBounds.postSpacing + 3.5);
			southPostGapSupport(postWestEdge, postWestEdge + deckBounds.postSpacing, i * 3 + 1);
		}
	}

	adjust(zoom) {
		this.features.forEach((feature) => feature.adjust(zoom));
	}
}
