import { Foundation } from './foundation.js';
import { Piers } from './piers.js';
import { Framing } from './framing.js';
import { DeckBoards } from './deckboards.js';
import { Posts } from './posts.js';
import { Siding } from './siding.js';
import { Details } from './details.js';

import { DeckBounds } from './deckBounds.js';

let layoutProject;
let joistViewProject;

let allLayers;
let allObjects;
let pillarLayers;

export function redraw() {
	let zoomLevel = parseInt(document.getElementById('zoomLevel').value);
	let max = [300 * zoomLevel, 250 * zoomLevel];

	const offScreen = 10;
	let zoom = {
		point: (coord) => new paper.Point(coord.map((val, idx) =>
			Math.max(-offScreen, Math.min(val * zoomLevel, max[idx] + offScreen)))),

		length: (len) => zoomLevel * len
	};

	// --------------------

	layoutProject.activate();
	layoutProject.view.viewSize = new paper.Size(max[0], max[1]);

	Object.keys(allLayers).forEach((layerName) =>
		allLayers[layerName].visible = document.getElementById(layerName).checked);

	Object.keys(pillarLayers).forEach((layerName) =>
		pillarLayers[layerName].visible = document.getElementById(layerName).checked);

	allObjects.forEach((obj) => obj.adjust(zoom));

	allLayers.deckboards.opacity = 0.5;
	layoutProject.view.draw();
}

export function initialize() {
	paper.setup('layoutCanvas');
	paper.setup('joistViewCanvas');
	[layoutProject, joistViewProject] = paper.projects;

	layoutProject.activate();
	pillarLayers = {
		piers: new paper.Layer(),
		posts: new paper.Layer()
	};

	allLayers = {
		foundation: new paper.Layer(),
		piers: new paper.Layer(),
		stepFraming: new paper.Layer(),
		framing: new paper.Layer(),
		deckboards: new paper.Layer(),
		posts: new paper.Layer(),
		siding: new paper.Layer(),
		origin: new paper.Layer()
	};

	let details = new Details(allLayers.origin);
	let foundation = new Foundation(allLayers.foundation, details);

	// Coordinate computer, not a layer
	let deckBounds = new DeckBounds(foundation);

	// Posts updates the deckBounds math, and therefore must be built before deckboards
	let posts = new Posts(allLayers.posts, pillarLayers.posts, foundation, deckBounds, details);
	let deckboards = new DeckBoards(allLayers.deckboards, deckBounds, details);

	let framing = new Framing(allLayers.stepFraming, allLayers.framing, foundation, deckBounds, deckboards, posts, details);

	let piers = new Piers(allLayers.piers, pillarLayers.piers, framing, posts, details);
	let siding = new Siding(allLayers.siding, foundation, details);

	allObjects = [foundation, piers, framing, deckboards, posts, siding, details];

	layoutProject.view.onMouseDown = () => {
		layoutProject.deselectAll();
		details.clear();
	};

	redraw();
}
