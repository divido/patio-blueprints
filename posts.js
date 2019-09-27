import { Support } from './support.js';

class Post extends Support {
	constructor(layer, details, name, center) {
		super(layer, details, 'Post', name, center);
	}
}

export class Posts {
	constructor(layer, foundation, deckBounds, details) {
		this.features = [];

		const postWidth = 3.5;
		const halfPost = postWidth / 2;
		const postSpacingOC = postWidth + deckBounds.postSpacing;

		const postToEdge = deckBounds.postToEdge;
		const postToHouse = deckBounds.postToHouse;

		// Coordinates of post centers on eastern side
		this.xEasternPosts = deckBounds.bounds.xEast - postToEdge - halfPost;

		let postY = foundation.coords['Main West'][1] + postToHouse + halfPost;
		for (let idx = 1; idx < 5; idx++) {
			this.features.push(new Post(layer, details, "Eastern Post " + idx, [this.xEasternPosts, postY]));
			postY += postSpacingOC;
		}

		// ----------------------------------------
		// Coordinates of post centers on southern side
		this.ySouthernPosts = postY;
		this.features.push(new Post(layer, details, "Southeast Corner Post", [this.xEasternPosts, this.ySouthernPosts]));

		let postX = this.xEasternPosts;
		for (let idx = 1; idx < 4; idx++) {
			postX -= postSpacingOC;
			this.features.push(new Post(layer, details, "Southern Post " + idx, [postX, this.ySouthernPosts]));
		}

		deckBounds.setSouthernBorder(this.ySouthernPosts + halfPost + postToEdge);
		deckBounds.setStepEast(postX - halfPost - postToEdge);
		this.xSouthernPosts_lastPost = postX;

		// ----------------------------------------
		// Coordinates of post centers on western side
		this.xWesternPosts = deckBounds.bounds.xWest + postToEdge + halfPost;

		let firstPostY = foundation.coords['Front Corner'][1] + postToHouse + halfPost;
		let thirdPostY = deckBounds.bounds.yStep - postToEdge - halfPost;
		let secondPostY = (firstPostY + thirdPostY) / 2;

		this.features.push(new Post(layer, details, "Western Post 1", [this.xWesternPosts, firstPostY]));
		this.features.push(new Post(layer, details, "Western Post 2", [this.xWesternPosts, secondPostY]));
		this.features.push(new Post(layer, details, "Western Post 3", [this.xWesternPosts, thirdPostY]));

		this.features.push(new Post(layer, details, "Step Post", [this.xWesternPosts, this.ySouthernPosts]));

		this.yWesternPosts_thirdPost = thirdPostY;
	}

	get westernPosts() {
		const postWidth = 3.5;
		const halfPost = postWidth / 2;

		return {
			westEdge: this.xWesternPosts - halfPost,
			center: this.xWesternPosts,
			eastEdge: this.xWesternPosts + halfPost,

			southEdge: this.yWesternPosts_thirdPost + halfPost
		};
	}

	get easternPosts() {
		const postWidth = 3.5;
		const halfPost = postWidth / 2;

		return {
			westEdge: this.xEasternPosts - halfPost,
			center: this.xEasternPosts,
			eastEdge: this.xEasternPosts + halfPost
		};
	}

	get southernPosts() {
		const postWidth = 3.5;
		const halfPost = postWidth / 2;

		return {
			northEdge: this.ySouthernPosts - halfPost,
			center: this.ySouthernPosts,
			southEdge: this.ySouthernPosts + halfPost,

			westEdge: this.xSouthernPosts_lastPost - halfPost
		};
	}

	adjust(zoom) {
		this.features.forEach((feature) => feature.adjust(zoom));
	}
}
