
function domCreate(tagName, options, parent) {
	let elem = document.createElement(tagName);

	if (options)
		Object.keys(options).forEach((key) => elem[key] = options[key]);

	if (parent) parent.appendChild(elem);
	return elem;
}

export class Details {
	constructor(originLayer) {
		this.nameElem = document.querySelector('.details .name');
		this.valueElem = document.querySelector('.details .value');

		this.origin = [0, 0];

		originLayer.activate();
		this.xAxis = new paper.Path();
		this.yAxis = new paper.Path();

		this.xAxis.style = {
			strokeColor: 'green',
			strokeWidth: 2
		};

		this.yAxis.style = {
			strokeColor: 'red',
			strokeWidth: 2
		};

		// --------------------

		this.highlightLayer = new paper.Layer();
		this.highlightLayer.activate();

		this.highlight = new paper.Path.Circle({
			radius: 5,
			strokeColor: '#009dec',
			strokeWidth: 2
		});

		this.highlightLayer.visible = false;
	}

	clear() {
		this.nameElem.innerHTML = "";
		this.valueElem.innerHTML = "";
	}

	select(selected) {
		this.nameElem.innerHTML = selected.name;

		let coords = {
			...selected.coords,
			...selected.extraCoords
		};

		this.valueElem.appendChild(this._coordinateTable(coords));

		if (selected.attributes) {
			this.valueElem.appendChild(this._attributeTable(selected.attributes));
		}
	}

	adjust(zoom) {
		this.zoom = zoom;

		this.xAxis.removeSegments();
		this.xAxis.addSegments([
			zoom.point([-Infinity, this.origin[1]]),
			zoom.point([Infinity, this.origin[1]])
		]);

		this.yAxis.removeSegments();
		this.yAxis.addSegments([
			zoom.point([this.origin[0], -Infinity]),
			zoom.point([this.origin[0], Infinity])
		]);
	}

	_coordinateTable(coords) {
		let table = domCreate('table', { className: 'coordinateTable' })

		let headerRow = domCreate('tr', { className: 'headerRow' }, table);
		domCreate('th', { innerHTML: 'Coordinates', className: 'name' }, headerRow);
		domCreate('th', { innerHTML: 'X', className: 'x value' }, headerRow);
		domCreate('th', { innerHTML: 'Y', className: 'y value' }, headerRow);

		let refreshValues = [];

		Object.keys(coords)
			.filter((name) => isFinite(coords[name][0]) && isFinite(coords[name][1]))
			.forEach((name) => {
				let c = coords[name];
				let row = domCreate('tr', {
					onmouseover: () => {
						this.highlightLayer.visible = true;
						this.highlight.position = this.zoom.point(c);
					},
					onmouseout: () => {
						this.highlightLayer.visible = false;
					}
				}, table);

				domCreate('td', {
					innerHTML: name,
					className: 'name'
				}, row);

				let xCell = domCreate('td', {
					className: 'x value',
					onclick: () => {
						this.origin[0] = c[0];
						this.adjust(this.zoom);
						refreshValues.forEach((fn) => fn());
					}
				}, row);

				let yCell =domCreate('td', {
					className: 'y value',
					onclick: () => {
						this.origin[1] = c[1];
						this.adjust(this.zoom);
						refreshValues.forEach((fn) => fn());
					}
				}, row);

				let refresh = () => {
					xCell.innerHTML = this._formatLength(c[0] - this.origin[0]);
					yCell.innerHTML = this._formatLength(c[1] - this.origin[1]);
				};

				refreshValues.push(refresh);
				refresh();
			});

		return table;
	}

	_attributeTable(attrs) {
		let table = domCreate('table', { className: 'attributeTable' })

		let headerRow = domCreate('tr', { className: 'headerRow' }, table);
		domCreate('th', { innerHTML: 'Attributes', className: 'name' }, headerRow);
		domCreate('th', { className: 'value' }, headerRow);

		Object.keys(attrs)
			.forEach((name) => {
				let a = attrs[name];
				let row = domCreate('tr', {}, table);

				domCreate('td', {
					innerHTML: name,
					className: 'name'
				}, row);

				let valueCell = domCreate('td', {
					className: 'value',
					innerHTML: this._formatLength(a)
				}, row);
			});

		return table;
	}

	_formatLength(length) {
		let whole = Math.trunc(length);
		let denom = 16;
		let numer = Math.round(Math.abs((length - whole) * denom));

		let str = whole;

		if (numer > 0) {
			while (numer % 2 == 0) {
				numer /= 2;
				denom /= 2;
			}

			str += ' <sup>' + numer + '</sup>/<sub>' + denom + '</sub>';
		}

		return str + '"';
	}
}
