const parser = new DOMParser();

type Config = {
	classes: string;
	id: string;
}

export default function createSvgElement( rawData: string, { classes, id }: Config, appendTo?: Element ): SVGElement {
	const element = parser.parseFromString( rawData, 'image/svg+xml' ).childNodes[ 0 ] as SVGElement;

	element.id = id;
	element.classList.add( classes );

	if ( appendTo ) {
		appendTo.appendChild( element );
	}

	return element;
}
