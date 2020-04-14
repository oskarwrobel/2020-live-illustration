type Attributes = {
	[ key: string ]: string;
}

const defaultNs = 'http://www.w3.org/2000/svg';

/**
 * Creates XML element with attributes.
 */
export default function createXmlElement( name: string, attributes: Attributes = {}, ns: string = defaultNs ): Element {
	const element = document.createElementNS( ns, name );

	updateXmlElement( element, attributes );

	return element;
}

/**
 * Sets value of attributes to XML element.
 */
export function updateXmlElement( element: Element, attributes: Attributes ): void {
	for ( const name of Object.keys( attributes ) ) {
		element.setAttribute( name, attributes[ name ] );
	}
}
