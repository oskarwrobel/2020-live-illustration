import { random, throttle } from 'lodash-es';
import moveToCursor from '../../../utils/movetocursor';
import sendEvent from '../../../utils/sendevent';

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

export default function toodEyes(): () => void {
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

function closeLeftEye(): void {
	leftEyeOpened.style.display = 'none';
}

function openLeftEye(): void {
	leftEyeOpened.style.display = null;
}

function closeRightEye(): void {
	rightEyeOpened.style.display = 'none';
}

function openRightEye(): void {
	rightEyeOpened.style.display = null;
}

function blink(): void {
	closeLeftEye();
	closeRightEye();

	setTimeout( () => {
		if ( !isLeftEyeHovered ) {
			openLeftEye();
		}

		if ( !isRightEyeHovered ) {
			openRightEye();
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
		closeLeftEye();
		isLeftEyeHovered = true;

		leftEyeHoverTimeId = setTimeout( () => {
			sendEvent( 'tood', 'eyeHovered', 'left' );
		}, 300 );
	} );

	leftEyeClosed.addEventListener( 'mouseleave', () => {
		openLeftEye();
		openRightEye();
		isLeftEyeHovered = false;
		resetTimer();

		clearInterval( leftEyeHoverTimeId );
	} );

	rightEyeClosed.addEventListener( 'mouseenter', () => {
		closeRightEye();
		isRightEyeHovered = true;

		rightEyeHoverTimeId = setTimeout( () => {
			sendEvent( 'tood', 'eyeHovered', 'right' );
		}, 300 );
	} );

	rightEyeClosed.addEventListener( 'mouseleave', () => {
		openRightEye();
		openLeftEye();
		isRightEyeHovered = false;
		resetTimer();

		clearInterval( rightEyeHoverTimeId );
	} );
}
