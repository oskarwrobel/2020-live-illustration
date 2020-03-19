const blinds: SVGGElement[] = Array.from( document.querySelectorAll( '#blinds > g' ) );

const singleShift = 25;
const maxShift = 18 * singleShift + 10;
const speed = 22;
let currentShift = 0;
let direction: string;

const ease = ( t: number ): number => t * ( 2 - t );

function openBlinds( velocity: number ): void {
	if ( direction === 'top' && currentShift < maxShift ) {
		requestAnimationFrame( () => {
			velocity = ease( velocity );
			currentShift += velocity * speed;
			currentShift = Math.min( currentShift, maxShift );

			const mostTopBlind = Math.floor( currentShift / singleShift );

			for ( let i = 0; i <= mostTopBlind; i++ ) {
				const top = ( mostTopBlind - i ) * singleShift + ( currentShift - ( mostTopBlind * singleShift ) );

				blinds[ i ].setAttribute( 'transform', `translate(0,-${ top })` );
			}

			openBlinds( velocity );
		} );
	}
}

function closeBlinds( velocity: number ): void {
	if ( direction === 'bottom' && currentShift > 0 ) {
		requestAnimationFrame( () => {
			velocity = ease( velocity );
			currentShift -= velocity * speed;
			currentShift = Math.max( currentShift, 0 );

			const mostTopBlind = Math.floor( currentShift / singleShift );

			for ( let i = mostTopBlind + 1; i >= 0; i-- ) {
				const top = ( mostTopBlind - i ) * singleShift + ( currentShift - ( mostTopBlind * singleShift ) );

				blinds[ i ].setAttribute( 'transform', `translate(0,-${ Math.max( top, 0 ) })` );
			}

			closeBlinds( velocity );
		} );
	}
}

function toggleBlinds( velocity: number ): void {
	if ( !direction || direction === 'bottom' ) {
		direction = 'top';
		openBlinds( velocity );
	} else {
		direction = 'bottom';
		closeBlinds( velocity );
	}
}

export default function initBlinds(): void {
	document.querySelector( '#blinds' ).addEventListener( 'click', () => {
		toggleBlinds( 0.02 );
	} );
}
