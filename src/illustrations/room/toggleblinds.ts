import gsap from 'gsap';

const singleShift = 28;
const maxShift = 18 * singleShift + 14;
const duration = 1.2;

const data: { value: number } = { value: 0 };
let animation: gsap.Timeline;

export function toggleBlinds( blinds: Element[], illustrationData: any ): void {
	if ( animation ) {
		animation.kill();
	}

	if ( !illustrationData.areBlindsOpened ) {
		openBlinds( blinds );
		illustrationData.areBlindsOpened = true;
	} else {
		closeBlinds( blinds );
		illustrationData.areBlindsOpened = false;
	}
}

export function openBlinds( blinds: Element[] ): void {
	animation = gsap.to( data, {
		value: maxShift,
		duration,
		onUpdate() {
			const mostTopBlind = Math.floor( data.value / singleShift );

			for ( let i = 0; i <= mostTopBlind; i++ ) {
				const top = ( mostTopBlind - i ) * singleShift + ( data.value - ( mostTopBlind * singleShift ) );

				requestAnimationFrame( () => {
					blinds[ i ].setAttribute( 'transform', `translate(0,-${ top })` );
				} );
			}
		}
	} );
}

export function closeBlinds( blinds: Element[] ): void {
	animation = gsap.to( data, {
		value: 0,
		duration,
		onUpdate() {
			const mostTopBlind = Math.floor( maxShift / singleShift );

			for ( let i = mostTopBlind; i >= 0; i-- ) {
				const top = ( mostTopBlind - i ) * singleShift + ( data.value - ( mostTopBlind * singleShift ) );

				requestAnimationFrame( () => {
					blinds[ i ].setAttribute( 'transform', `translate(0,-${ Math.max( top, 0 ) })` );
				} );
			}
		}
	} );
}
