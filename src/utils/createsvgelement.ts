const parser = new DOMParser();

type Config = {
	classes?: string;
	id?: string;
}

/**
 * Creates SVG element from string data.
 */
export default function createSvgElement( rawData: string, config: Config, appendTo?: Element ): SVGElement {
	const element = parser.parseFromString( rawData, 'image/svg+xml' ).childNodes[ 0 ] as SVGElement;

	if ( config.id ) {
		element.id = config.id;
	}

	if ( config.classes ) {
		element.classList.add( config.classes );
	}

	if ( appendTo ) {
		appendTo.appendChild( element );
	}

	return element;
}
