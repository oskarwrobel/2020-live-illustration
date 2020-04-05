import { clamp } from 'lodash-es';

type Config = {
	element: Element;
	wrapperRect: ClientRect;
	maxShiftTop: number;
	maxShiftBottom: number;
	maxShiftLeft: number;
	maxShiftRight: number;
}

export default function moveToCursor( clientX: number, clientY: number, config: Config ): void {
	const { element, wrapperRect, maxShiftTop, maxShiftBottom, maxShiftLeft, maxShiftRight } = config;

	const widthHalf = wrapperRect.width / 2;
	const heightHalf = wrapperRect.height / 2;

	let x = ( ( ( clientX - ( wrapperRect.left + widthHalf ) ) * Math.abs( maxShiftLeft ) ) / widthHalf );
	let y = ( ( ( clientY - ( wrapperRect.top + heightHalf ) ) * Math.abs( maxShiftTop ) ) / heightHalf );

	x = clamp( x, maxShiftLeft, maxShiftRight );
	y = clamp( y, maxShiftTop, maxShiftBottom );

	const targetElement = element as HTMLElement;
	targetElement.style.transform = `translate(${ x }%,${ y }%)`;
}
