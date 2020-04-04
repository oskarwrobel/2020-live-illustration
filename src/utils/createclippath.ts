import createXmlElement, { updateXmlElement } from './createxmlelement';

type Config = {
	source: string;
	targets: string[];
};

export default function createClipPath( config: Config ): void {
	const clipPathElement = createXmlElement( 'clipPath', { id: config.source.replace( '#', '' ) } );
	const source = document.querySelector( config.source );

	source.removeAttribute( 'id' );
	source.parentNode.insertBefore( clipPathElement, source );
	clipPathElement.appendChild( source );

	for ( const target of config.targets ) {
		updateXmlElement( document.querySelector( target ), {
			'clip-path': `url(${ config.source })`
		} );
	}
}
