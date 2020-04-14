import toUnit from './tounit';

const toPx = toUnit( 'px' );

export default function setProportions( element: HTMLElement, optimalWidth: number, optimalHeight: number ): void {
	const ratio = optimalWidth / optimalHeight;
	const maxWidth = window.innerWidth;
	const maxHeight = window.innerHeight;

	let width = maxWidth;
	let height = maxWidth / ratio;

	if ( height > maxHeight ) {
		width = maxHeight * ratio;
		height = maxHeight;
	}

	element.style.width = toPx( width );
	element.style.height = toPx( height );
}
