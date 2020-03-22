import animate, { easeOutQuad, Animate } from './utils/animate';

const singleShift = 26;
const maxShift = 17 * singleShift + 14;
const duration = 1200;

let animation: Animate;
let currentValue: number;
let direction: string;

export default function initBlinds(): void {
	const blinds: SVGGElement[] = Array.from( document.querySelectorAll( '#blinds > g' ) );

	document.querySelector( '#blinds' ).addEventListener( 'click', () => {
		toggleBlinds( blinds );
	} );
}

function openBlinds( blinds: Element[] ): void {
	animation = animate( {
		from: currentValue,
		to: maxShift,
		duration,
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

function closeBlinds( blinds: Element[] ): void {
	animation = animate( {
		from: currentValue,
		to: 0,
		duration,
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

function toggleBlinds( blinds: Element[] ): void {
	if ( animation ) {
		animation.stop();
	}

	if ( !direction || direction === 'bottom' ) {
		direction = 'top';
		openBlinds( blinds );
	} else {
		direction = 'bottom';
		closeBlinds( blinds );
	}
}
