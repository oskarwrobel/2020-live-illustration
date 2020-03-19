import animate, { easeOutQuad, Animate } from './utils/animate';

const blinds: SVGGElement[] = Array.from( document.querySelectorAll( '#blinds > g' ) );
const singleShift = 25;
const maxShift = 18 * singleShift + 10;

let animation: Animate;
let currentValue: number;
let direction: string;

function openBlinds(): void {
	animation = animate( {
		from: currentValue,
		to: maxShift,
		duration: 2000,
		easing: easeOutQuad,
		onUpdate( value: number ) {
			currentValue = value;

			const mostTopBlind = Math.floor( value / singleShift );

			for ( let i = 0; i <= mostTopBlind; i++ ) {
				const top = ( mostTopBlind - i ) * singleShift + ( value - ( mostTopBlind * singleShift ) );

				blinds[ i ].setAttribute( 'transform', `translate(0,-${ top })` );
			}
		}
	} );
}

function closeBlinds(): void {
	animation = animate( {
		from: currentValue,
		to: 0,
		duration: 2000,
		easing: easeOutQuad,
		onUpdate( value: number ) {
			currentValue = value;

			const mostTopBlind = Math.floor( value / singleShift );

			for ( let i = mostTopBlind + 1; i >= 0; i-- ) {
				const top = ( mostTopBlind - i ) * singleShift + ( value - ( mostTopBlind * singleShift ) );

				blinds[ i ].setAttribute( 'transform', `translate(0,-${ Math.max( top, 0 ) })` );
			}
		}
	} );
}

function toggleBlinds(): void {
	if ( animation ) {
		animation.stop();
	}

	if ( !direction || direction === 'bottom' ) {
		direction = 'top';
		openBlinds();
	} else {
		direction = 'bottom';
		closeBlinds();
	}
}

export default function initBlinds(): void {
	document.querySelector( '#blinds' ).addEventListener( 'click', () => {
		toggleBlinds();
	} );
}
