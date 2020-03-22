import { random, throttle } from 'lodash-es';
import lookAtCursor from '../../utils/lookatcursor';

let leftEyeOpened: HTMLElement;
let leftEyeClosed: HTMLElement;
let rightEyeOpened: HTMLElement;
let rightEyeClosed: HTMLElement;
let timerId: number;

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

	const throttledMouseMoveHandler = throttle( mouseMoveHandler, 20, { leading: true } );

	document.addEventListener( 'mousemove', throttledMouseMoveHandler );

	function mouseMoveHandler( evt: MouseEvent ): void {
		lookAtCursor( evt.clientX, evt.clientY, Object.assign( { element: leftPupil }, eyeBounds ) );
		lookAtCursor( evt.clientX, evt.clientY, Object.assign( { element: rightPupil }, eyeBounds ) );
	}

	enableCloseOnHover();
	startBlinking();

	return function destroy(): void {
		document.removeEventListener( 'mousemove', throttledMouseMoveHandler );
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
	timerId = setTimeout( () => {
		blink();
		startBlinking();
	}, random( 3000, 10000 ) );
}

function stopBlinking(): void {
	clearInterval( timerId );
}

function resetTimer(): void {
	stopBlinking();
	startBlinking();
}

function enableCloseOnHover(): void {
	leftEyeClosed.addEventListener( 'mouseenter', () => {
		closeLeftEye();
		isLeftEyeHovered = true;
	} );

	leftEyeClosed.addEventListener( 'mouseleave', () => {
		openLeftEye();
		openRightEye();
		isLeftEyeHovered = false;
		resetTimer();
	} );

	rightEyeClosed.addEventListener( 'mouseenter', () => {
		closeRightEye();
		isRightEyeHovered = true;
	} );

	rightEyeClosed.addEventListener( 'mouseleave', () => {
		openRightEye();
		openLeftEye();
		isRightEyeHovered = false;
		resetTimer();
	} );
}
