import { gsap } from 'gsap';

export default function tv( illustrationData: any ): void {
	// Channels definition.
	const channels = [
		{
			screen: document.querySelector( '#channel-1' ) as HTMLElement,
			button: document.querySelector( '#button-1-on' ) as HTMLElement,
			animationDefinition: channel1Animation,
			pendingAnimation: undefined as gsap.core.Timeline
		},
		{
			screen: document.querySelector( '#channel-2' ) as HTMLElement,
			button: document.querySelector( '#button-2-on' ) as HTMLElement,
			animationDefinition: channel2Animation,
			pendingAnimation: undefined as gsap.core.Timeline
		},
		{
			screen: document.querySelector( '#channel-3' ) as HTMLElement,
			button: document.querySelector( '#button-3-on' ) as HTMLElement,
			animationDefinition: channel3Animation,
			pendingAnimation: undefined as gsap.core.Timeline
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
		const channel = channels[ channelNumber ];

		channel.screen.style.display = null;
		channel.button.style.visibility = 'hidden';

		if ( channel.pendingAnimation ) {
			channel.pendingAnimation.resume();
		} else {
			channel.pendingAnimation = channel.animationDefinition();
		}

		illustrationData.channelNumber = channelNumber;
	}

	function turnOffChannel( channelNumber: number ): void {
		const channel = channels[ channelNumber ];

		channel.screen.style.display = 'none';
		channel.button.style.visibility = null;

		if ( channel.pendingAnimation ) {
			channel.pendingAnimation.pause();
		}

		illustrationData.channelNumber = undefined;
	}

	function channel1Animation(): gsap.core.Timeline {
		const tl = gsap.timeline( { repeat: -1, repeatDelay: 1, delay: 1 } );
		const def = { transformOrigin: 'center center' };

		tl.from( '#soup', { duration: .5, x: -300, ease: 'back.out(2)', ...def } );
		tl.to( '#soup', { duration: .5, delay: 1.5, scale: 0, ease: 'back.in(3)', ...def } );
		tl.from( '#two-soups > g:first-child', { duration: .3, delay: .3, y: -200, ease: 'back.out(2)', ...def } );
		tl.from( '#two-soups > g:last-child', { duration: .3, y: 200, ease: 'back.out(2)', ...def } );
		tl.to( '#two-soups > g:first-child', { duration: .4, delay: 1.5, y: 200, ease: 'back.in(2)', ...def } );
		tl.to( '#two-soups > g:last-child', { duration: .4, delay: -.4, y: -200, ease: 'back.in(2)', ...def } );
		tl.from( '#food', { duration: .6, delay: .1, scale: 0, rotate: 1080, ease: 'none', ...def } );
		tl.to( '#food', { duration: .5, delay: 1.5, scale: 5, opacity: 0, ease: 'back.in(2)', ...def } );
		tl.from( '#good', { duration: .5, delay: .1, scale: 3, opacity: 0, ease: 'back.out(2)', ...def } );
		tl.to( '#good', { duration: 1, delay: 1.5, opacity: 0, ease: 'none', ...def } );

		tl.from( [ '#bun-back', '#bun-front' ], { duration: .4, y: -200, ease: 'back.out(2)', ...def } );
		tl.from( '#sausage', { duration: .4, y: -200, ease: 'none', ...def } );
		tl.from( '#mustard', { duration: .4, y: -200, ease: 'none', ...def } );
		tl.to( [ '#bun-back', '#bun-front' ], { duration: .3, delay: 1, y: 30, ease: 'normal', ...def } );
		tl.to( [ '#mustard' ], { duration: .2, delay: -.3, y: -30, ease: 'normal', ...def } );
		tl.to( [ '#bun-back', '#bun-front' ], { duration: .5, delay: .6, y: 0, ease: 'normal', ...def } );
		tl.to( [ '#mustard' ], { duration: .4, delay: -.5, y: 0, ease: 'normal', ...def } );
		tl.from( [ '#BUN' ], { duration: .55, delay: .5, x: -300, ease: 'back.out(2)', ...def } );
		tl.from( [ '#CAN-BE-FUN' ], { duration: .55, delay: .2, x: 300, ease: 'back.out(2)', ...def } );
		tl.to( '#hot-dog', { duration: 1, delay: 2, rotate: 1580, scale: 0, ease: 'normal', ...def } );

		return tl;
	}

	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore
	function channel2Animation(): gsap.core.Timeline {
	}

	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore
	function channel3Animation(): gsap.core.Timeline {
	}
}
