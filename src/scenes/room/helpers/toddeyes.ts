import { random, throttle, clamp } from 'lodash-es';
import sendEvent from '../../../core/sendevent';

let leftEyeOpened: HTMLElement;
let leftEyeClosed: HTMLElement;
let rightEyeOpened: HTMLElement;
let rightEyeClosed: HTMLElement;
let blinkingTimerId: ReturnType<typeof setTimeout>;

let isLeftEyeHovered = false;
let isRightEyeHovered = false;

const eyeBounds = {
	maxShiftTop: -.11,
	maxShiftBottom: .16,
	maxShiftLeft: -.27,
	maxShiftRight: .27
};

export default function toddEyes(): () => void {
	leftEyeOpened = document.querySelector( '#left-eye-opened' );
	leftEyeClosed = document.querySelector( '#left-eye-closed' );
	rightEyeOpened = document.querySelector( '#right-eye-opened' );
	rightEyeClosed = document.querySelector( '#right-eye-closed' );

	const leftPupil = leftEyeOpened.querySelector( 'circle' );
	const rightPupil = rightEyeOpened.querySelector( 'circle' );

	let leftWrapperRect = ( leftPupil.parentNode as SVGGElement ).getBoundingClientRect();
	let rightWrapperRect = ( rightPupil.parentNode as SVGGElement ).getBoundingClientRect();

	const throttledMouseMoveHandler = throttle( mouseMoveHandler, 20, { leading: true } );
	const throttledResizeMoveHandler = throttle( resizeHandler, 100, { leading: true } );

	document.addEventListener( 'mousemove', throttledMouseMoveHandler );
	window.addEventListener( 'resize', throttledResizeMoveHandler );

	function mouseMoveHandler( evt: MouseEvent ): void {
		moveToCursor( evt.clientX, evt.clientY, Object.assign( { element: leftPupil, wrapperRect: leftWrapperRect }, eyeBounds ) );
		moveToCursor( evt.clientX, evt.clientY, Object.assign( { element: rightPupil, wrapperRect: rightWrapperRect }, eyeBounds ) );
	}

	function resizeHandler(): void {
		leftWrapperRect = ( leftPupil.parentNode as SVGGElement ).getBoundingClientRect();
		rightWrapperRect = ( rightPupil.parentNode as SVGGElement ).getBoundingClientRect();
	}

	enableCloseOnHover();
	startBlinking();

	return function destroy(): void {
		document.removeEventListener( 'mousemove', throttledMouseMoveHandler );
		window.removeEventListener( 'resize', throttledResizeMoveHandler );
		stopBlinking();
	};
}

function blink(): void {
	leftEyeOpened.style.display = 'none';
	rightEyeOpened.style.display = 'none';

	setTimeout( () => {
		if ( !isLeftEyeHovered ) {
			leftEyeOpened.style.display = null;
		}

		if ( !isRightEyeHovered ) {
			rightEyeOpened.style.display = null;
		}
	}, 250 );
}

function startBlinking(): void {
	blinkingTimerId = setTimeout( () => {
		blink();
		startBlinking();
	}, random( 3000, 10000 ) );
}

function stopBlinking(): void {
	clearInterval( blinkingTimerId );
}

function resetTimer(): void {
	stopBlinking();
	startBlinking();
}

function enableCloseOnHover(): void {
	let leftEyeHoverTimeId: ReturnType<typeof setTimeout>;
	let rightEyeHoverTimeId: ReturnType<typeof setTimeout>;

	leftEyeClosed.addEventListener( 'mouseenter', () => {
		leftEyeOpened.style.display = 'none';
		isLeftEyeHovered = true;

		leftEyeHoverTimeId = setTimeout( () => {
			sendEvent( 'todd', 'eyeHovered', 'left' );
		}, 300 );
	} );

	leftEyeClosed.addEventListener( 'mouseleave', () => {
		leftEyeOpened.style.display = null;
		rightEyeOpened.style.display = null;
		isLeftEyeHovered = false;
		resetTimer();

		clearInterval( leftEyeHoverTimeId );
	} );

	rightEyeClosed.addEventListener( 'mouseenter', () => {
		rightEyeOpened.style.display = 'none';
		isRightEyeHovered = true;

		rightEyeHoverTimeId = setTimeout( () => {
			sendEvent( 'todd', 'eyeHovered', 'right' );
		}, 300 );
	} );

	rightEyeClosed.addEventListener( 'mouseleave', () => {
		leftEyeOpened.style.display = null;
		rightEyeOpened.style.display = null;
		isRightEyeHovered = false;
		resetTimer();

		clearInterval( rightEyeHoverTimeId );
	} );
}

type MoveToCursorConfig = {
	element: Element;
	wrapperRect: ClientRect;
	maxShiftTop: number;
	maxShiftBottom: number;
	maxShiftLeft: number;
	maxShiftRight: number;
}

function moveToCursor( clientX: number, clientY: number, config: MoveToCursorConfig ): void {
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
