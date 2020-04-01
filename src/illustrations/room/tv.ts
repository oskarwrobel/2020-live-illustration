import gsap from 'gsap';

export default function tv( illustrationData: any ): void {
	// Channels definition.
	const channels = [
		{
			screen: document.querySelector( '#channel-1' ) as HTMLElement,
			button: document.querySelector( '#button-1-on' ) as HTMLElement,
			animationDefinition: channel1Animation,
			pendingAnimation: gsap.Timeline = null
		},
		{
			screen: document.querySelector( '#channel-2' ) as HTMLElement,
			button: document.querySelector( '#button-2-on' ) as HTMLElement,
			animationDefinition: channel2Animation,
			pendingAnimation: gsap.Timeline = null
		},
		{
			screen: document.querySelector( '#channel-3' ) as HTMLElement,
			button: document.querySelector( '#button-3-on' ) as HTMLElement,
			animationDefinition: channel3Animation,
			pendingAnimation: gsap.Timeline = null
		}
	];

	channels.forEach( ( channel: any, i: number ) => {
		turnOffChannel( i );
		channels[ i ].button.addEventListener( 'mousedown', () => switchChannel( i ) );
	} );

	document.querySelector( '#button-0-on' ).addEventListener( 'mousedown', ( evt: MouseEvent ) => {
		const target = evt.currentTarget as HTMLElement;

		target.style.visibility = 'hidden';

		if ( illustrationData.channelNumber !== undefined ) {
			turnOffChannel( illustrationData.channelNumber );
		}

		document.addEventListener( 'mouseup', () => ( target.style.visibility = null ) );
	} );

	document.querySelector( '#screen' ).addEventListener( 'click', () => {
		let nextChannel: number;

		if ( illustrationData.channelNumber === undefined ) {
			nextChannel = 0;
		} else {
			nextChannel = illustrationData.channelNumber + 1;

			if ( nextChannel >= channels.length ) {
				nextChannel = 0;
			}
		}

		switchChannel( nextChannel );
	} );

	// Display channel on init.
	if ( typeof illustrationData.channelNumber === 'number' ) {
		switchChannel( illustrationData.channelNumber );
	} else if ( illustrationData.channelNumber === undefined ) {
		switchChannel( 0 );
	}

	function switchChannel( channelNumber: number ): void {
		if ( illustrationData.channelNumber !== undefined ) {
			turnOffChannel( illustrationData.channelNumber );
		}

		turnOnChannel( channelNumber );
	}

	function turnOnChannel( channelNumber: number ): void {
		channels[ channelNumber ].screen.style.display = null;
		channels[ channelNumber ].button.style.visibility = 'hidden';

		if ( channels[ channelNumber ].pendingAnimation ) {
			channels[ channelNumber ].pendingAnimation.resume();
		} else {
			channels[ channelNumber ].pendingAnimation = channels[ channelNumber ].animationDefinition();
		}

		illustrationData.channelNumber = channelNumber;
	}

	function turnOffChannel( channelNumber: number ): void {
		channels[ channelNumber ].screen.style.display = 'none';
		channels[ channelNumber ].button.style.visibility = null;

		if ( channels[ channelNumber ].pendingAnimation ) {
			channels[ channelNumber ].pendingAnimation.pause();
		}

		illustrationData.channelNumber = undefined;
	}

	function channel1Animation(): gasp.Timeline {
		const tl = gsap.timeline( { repeat: Infinity, repeatDelay: 0.1, delay: 1 } );
		const transformOrigin = 'center center';

		tl.from( '#soup', { duration: .5, x: -300, transformOrigin, ease: 'back.out(2)' } );
		tl.to( '#soup', { duration: .5, delay: 1.5, scale: 0, transformOrigin, ease: 'back.in(5)' } );
		tl.from( '#two-soups', { duration: .3, delay: .1, y: -200, transformOrigin, ease: 'back.out(4)' } );
		tl.to( '#two-soups', { duration: .3, delay: 1.5, y: 200, transformOrigin, ease: 'back.in(4)' } );
		tl.from( '#food', { duration: .6, delay: .1, scale: 0, rotate: 1080, transformOrigin, ease: 'none' } );
		tl.to( '#food', { duration: .5, delay: 1.5, scale: 5, opacity: 0, transformOrigin, ease: 'none' } );
		tl.from( '#good', { duration: .5, delay: .1, scale: 3, opacity: 0, transformOrigin, ease: 'back.out(2)' } );
		tl.to( '#good', { duration: 1, delay: 1.5, opacity: 0, transformOrigin, ease: 'none' } );

		return tl;
	}

	function channel2Animation(): void {
		console.log( 'HELLO!' );
	}

	function channel3Animation(): void {
		console.log( 'HELLO!' );
	}
}
