
export class DeckBounds {
	constructor(foundation) {
		this.foundation = foundation;

		// Temporary
		this.xStepEast = 100;
		this.ySouth = 250;
	}

	setSouthernBorder(ySouth) { this.ySouth = ySouth; }
	setStepEast(xStepEast) { this.xStepEast = xStepEast; }

	get boardThickness() { return 5.5;  }
	get boardSpacing()   { return 0.25; }

	get postToHouse()    { return 4; }
	get postToEdge()     { return 1.5 + this.boardOverhang; }
	get postSpacing()    { return 33; }

	//get wallSpacing()    { return 1.5 - (1.5 - this.boardSpacing) / 2; }
	get wallSpacing()    { return this.entryPadding; }
	get stepSpacing()    { return 0.25; }
	get boardOverhang()  { return 0.75; }

	get entryPadding()   {
		let width = this.foundation.coords['Door East'][0] - this.foundation.coords['Door West'][0];
		let usedByBoards = 9 * this.boardThickness + 8 * this.boardSpacing;
		return (width - usedByBoards) / 2;
	}

	get bounds() {
		const T = this.boardThickness;
		const S = this.boardSpacing;
		const TS = T + S;

		let xWest = this.foundation.coords['Front Corner'][0] + this.entryPadding - TS;

		return {
			xWest: xWest,
			xOffice: xWest + TS,
			xEntry: this.foundation.coords['Door East'][0] - this.entryPadding,
			xStepEast: this.xStepEast,
			xEast: xWest + TS * 41 + T,

			yDoor: this.foundation.coords['Door East'][1] + this.wallSpacing,
			yMain: this.foundation.coords['Main West'][1] + this.wallSpacing,
			yFront: this.foundation.coords['Front Corner'][1] + this.wallSpacing,
			yStep: this.ySouth - TS - T - this.stepSpacing + this.boardOverhang, // Two boards on step, overlap by fascia overhang
			ySouth: this.ySouth
		};
	}
}
