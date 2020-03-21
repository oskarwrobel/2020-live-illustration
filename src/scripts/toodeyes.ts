import { random } from 'lodash-es';

let leftEyeOpened: HTMLElement;
let leftEyeClosed: HTMLElement;
let rightEyeOpened: HTMLElement;
let rightEyeClosed: HTMLElement;
let timerId: number;

let isLeftEyeHovered = false;
let isRightEyeHovered = false;

export default function toodEyes(): void {
	leftEyeOpened = document.querySelector( '#left-eye-opened' );
	leftEyeClosed = document.querySelector( '#left-eye-closed' );
	rightEyeOpened = document.querySelector( '#right-eye-opened' );
	rightEyeClosed = document.querySelector( '#right-eye-closed' );

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

	startBlinking();
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
