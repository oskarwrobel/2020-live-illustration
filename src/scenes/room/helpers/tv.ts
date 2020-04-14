import { gsap } from 'gsap';
import { random } from 'lodash-es';
import createClipPath from '../../../core/createclippath';
import sendEvent from '../../../core/sendevent';

type Channel = {
	screen: SVGGElement;
	button: SVGGElement;
	pendingAnimations: Set<gsap.core.Timeline>;
	start( channel: Channel ): void;
};

let isFirstTime = true;
let isOn = true;
let turnOffAnimation: gsap.core.Timeline;
let screenMask: SVGClipPathElement;

export default function tv( illustrationData: any ): () => void {
	screenMask = createClipPath( {
		source: '#mask-shape',
		targets: [ '#channel-1', '#channel-2', '#channel-3', '#tv-off-shape' ]
	} );

	createClipPath( {
		source: '#bubbles-mask',
		targets: [ '#bubbles' ]
	} );

	// Channels definition.
	const channels: Channel[] = [
		{
			screen: document.querySelector( '#channel-1' ) as SVGGElement,
			button: document.querySelector( '#button-1-on' ) as SVGGElement,
			pendingAnimations: new Set(),
			start: channel1Animation
		},
		{
			screen: document.querySelector( '#channel-2' ) as SVGGElement,
			button: document.querySelector( '#button-2-on' ) as SVGGElement,
			pendingAnimations: new Set() as Set<gsap.core.Timeline>,
			start: channel2Animation
		},
		{
			screen: document.querySelector( '#channel-3' ) as SVGGElement,
			button: document.querySelector( '#button-3-on' ) as SVGGElement,
			pendingAnimations: new Set() as Set<gsap.core.Timeline>,
			start: channel3Animation
		}
	];

	// Reset initial states.
	channels.forEach( ( channel: any, i: number ) => {
		channel.screen.style.display = 'none';
		channel.button.style.visibility = null;
		channels[ i ].button.addEventListener( 'mousedown', () => {
			sendEvent( 'tv', 'switchChannel', 'buttonClick', i );
			switchChannel( i, channels, illustrationData );
		} );
	} );

	// Turn off tv after clicking red button.
	document.querySelector( '#button-0-on' ).addEventListener( 'mousedown', ( evt: MouseEvent ) => {
		const target = evt.currentTarget as SVGGElement;

		target.style.visibility = 'hidden';
		document.addEventListener( 'mouseup', () => ( target.style.visibility = null ) );

		if ( isOn ) {
			turnOffTv( illustrationData.channelNumber, channels, illustrationData );
		}
	} );

	// Switch channel after clicking on the screen.
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

		sendEvent( 'tv', 'switchChannel', 'screenClick', nextChannel );
		switchChannel( nextChannel, channels, illustrationData );
	} );

	// Display channel on init.
	if ( illustrationData.channelNumber !== undefined ) {
		sendEvent( 'tv', 'switchChannel', 'initial', illustrationData.channelNumber );
		switchChannel( illustrationData.channelNumber, channels, illustrationData );
	} else {
		switchChannel( 1, channels, illustrationData );
	}

	// Destroy scene and release all assets.
	return function tvDestructor(): void {
		for ( const channel of channels ) {
			channel.pendingAnimations.forEach( ( animation: gsap.core.Timeline ) => animation.kill() );
		}

		screenMask = null;
	};
}

function turnOffTv( channelNumber: number, channels: Channel[], illustrationData: any ): void {
	sendEvent( 'tv', 'off' );
	isOn = false;

	// Channel button should be released immediately as TV is turned off.
	channels[ illustrationData.channelNumber ].button.style.visibility = null;

	gsap.timeline( {
		onStart() {
			turnOffAnimation = this as gsap.core.Timeline;
		},
		onComplete() {
			turnOffAnimation = null;
			gsap.set( [ '#tv-off-shape', screenMask.firstChild ], { scaleY: 1, opacity: 0 } );
			turnOffChannel( illustrationData.channelNumber, channels, illustrationData );
		}
	} )
		.to( screenMask.firstChild, { scaleY: 0, duration: 1, transformOrigin: 'center center' } )
		.to( '#tv-off-shape', { opacity: 1, delay: -.7, duration: .7 } );
}

function turnOnTv(): void {
	sendEvent( 'tv', 'on' );
	isOn = true;

	if ( turnOffAnimation ) {
		turnOffAnimation.kill();
		turnOffAnimation = null;
		gsap.set( [ '#tv-off-shape', screenMask.firstChild ], { scaleY: 1, opacity: 0 } );
	}
}

function switchChannel( channelNumber: number, channels: Channel[], illustrationData: any ): void {
	if ( illustrationData.channelNumber !== undefined ) {
		turnOffChannel( illustrationData.channelNumber, channels, illustrationData );
	}

	turnOnChannel( channelNumber, channels, illustrationData );
}

function turnOnChannel( channelNumber: number, channels: Channel[], illustrationData: any ): void {
	const channel = channels[ channelNumber ];

	if ( !isOn ) {
		turnOnTv();
	}

	channel.screen.style.display = null;
	channel.button.style.visibility = 'hidden';

	if ( channel.pendingAnimations.size ) {
		channel.pendingAnimations.forEach( animation => ( animation.resume() ) );
	} else {
		channel.start( channel );
	}

	illustrationData.channelNumber = channelNumber;
}

function turnOffChannel( channelNumber: number, channels: Channel[], illustrationData: any ): void {
	const channel = channels[ channelNumber ];

	channel.button.style.visibility = null;
	channel.screen.style.display = 'none';
	illustrationData.channelNumber = undefined;
	channel.pendingAnimations.forEach( animation => ( animation.pause() ) );
}

function channel1Animation( channel: Channel ): void {
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

	tl.from( [ '#bun-back', '#bun-front' ], { duration: .3, y: -200, ease: 'back.out(2)', ...def } );
	tl.from( '#sausage', { duration: .4, y: -200, ease: 'none', ...def } );
	tl.from( '#mustard', { duration: .4, y: -200, ease: 'none', ...def } );
	tl.to( [ '#bun-back', '#bun-front' ], { duration: .3, delay: 1, y: 30, ease: 'normal', ...def } );
	tl.to( [ '#mustard' ], { duration: .2, delay: -.3, y: -30, ease: 'normal', ...def } );
	tl.to( [ '#bun-back', '#bun-front' ], { duration: .5, delay: .6, y: 0, ease: 'normal', ...def } );
	tl.to( [ '#mustard' ], { duration: .4, delay: -.5, y: 0, ease: 'normal', ...def } );
	tl.from( [ '#BUN' ], { duration: .55, delay: .5, x: -300, ease: 'back.out(2)', ...def } );
	tl.from( [ '#CAN-BE-FUN' ], { duration: .55, delay: .2, x: 300, ease: 'back.out(2)', ...def } );
	tl.to( '#hot-dog', { duration: 1, delay: 2, rotate: 1580, scale: 0, ease: 'normal', ...def } );

	if ( isFirstTime ) {
		isFirstTime = false;
	} else {
		tl.time( random( 1, tl.duration() ) );
	}

	channel.pendingAnimations.add( tl );
}

function channel2Animation( channel: Channel ): void {
	const pendingAnimations = channel.pendingAnimations;
	const bubbles = document.querySelectorAll( '#bubbles > circle' );

	bubble( bubbles[ 0 ], 3, 6 );
	bubble( bubbles[ 1 ], 6, 3, .7 );
	bubble( bubbles[ 2 ], 2, 7, 1.4 );
	bubble( bubbles[ 3 ], 7, 3, 2.1 );

	omg();
	stripe();
	talkingFish();
	sealEyes();

	function omg(): void {
		const elements: NodeListOf<SVGGElement> = document.querySelectorAll( '#omg > path' );
		const tl = gsap.timeline( { repeat: -1, delay: -.5 } );

		tl.from( elements[ 0 ], { y: 50, duration: .3, ease: 'back.out(2)' } );
		tl.to( elements[ 0 ], { y: 50, duration: .3, delay: 5, ease: 'back.in(2)' } );
		tl.from( elements[ 1 ], { y: 50, duration: .3, ease: 'back.out(2)' } );
		tl.to( elements[ 1 ], { y: 50, duration: .3, delay: 5, ease: 'back.in(2)' } );
		tl.from( elements[ 2 ], { y: 50, duration: .3, ease: 'back.out(2)' } );
		tl.to( elements[ 2 ], { y: 50, duration: .3, delay: 5, ease: 'back.in(2)' } );

		pendingAnimations.add( tl );
	}

	function stripe(): void {
		const initialDelay = 3.8;
		const tl1 = gsap.timeline( { repeat: -1, repeatDelay: 4.4, delay: -initialDelay } );
		const tl2 = gsap.timeline( { repeat: -1, repeatDelay: 4.4, delay: 8.2 - initialDelay } );

		tl1.to( '#stripe-1', { x: -625, duration: 12, ease: 'none', clearProps: 'all' } );
		tl2.to( '#stripe-2', { x: -625, duration: 12, ease: 'none', clearProps: 'all' } );

		pendingAnimations.add( tl1 );
		pendingAnimations.add( tl2 );
	}

	function bubble( element: Element, leftShift: number, rightShift: number, delay = 0 ): void {
		const tl = gsap.timeline( { repeat: -1, delay, repeatDelay: 1.2 } );
		const def = { duration: .3, ease: 'none' };

		tl.from( element, { x: 10, y: 4, scale: 0, transformOrigin: 'center center', ...def } );
		tl.to( element, { x: '+=' + rightShift, y: -10, ...def } );
		tl.to( element, { x: '-=' + leftShift, y: -20, scale: 1.15, ...def } );
		tl.to( element, { x: '+=' + rightShift, y: -30, scale: 1.3, ...def } );
		tl.to( element, { x: '-=' + leftShift, y: -40, scale: 1.45, ...def } );
		tl.to( element, { x: '+=' + rightShift, y: -55, scale: 1.60, ...def, onComplete: () => ( pendingAnimations.delete( tl ) ) } );

		pendingAnimations.add( tl );
	}

	function talkingFish(): void {
		const tl = gsap.timeline( { delay: random( 0, 0.2 ) } );

		pendingAnimations.add( tl );

		tl.to( '#jaw', { transformOrigin: '100% 100%', rotate: -random( 5, 20 ), duration: .25 } );
		tl.to( '#jaw', { transformOrigin: '100% 100%', rotate: -random( 0, 7 ), duration: .25 } );
		tl.to( '#jaw', { transformOrigin: '100% 100%', rotate: -random( 13, 20 ), duration: .25 } );
		tl.to( '#jaw', { transformOrigin: '100% 100%', rotate: -random( 3, 10 ), duration: .25 } );
		tl.to( '#jaw', { transformOrigin: '100% 100%', rotate: 0, duration: .25, onComplete } );

		function onComplete(): void {
			pendingAnimations.delete( tl );
			talkingFish();
		}
	}

	function sealEyes(): void {
		const sealEyes = gsap.timeline( { repeat: -1, repeatDelay: 1, delay: 1 } )
			.to( [ '#seal-eye-left', '#seal-eye-right' ], { x: -4, y: 0, duration: .4, delay: 3 } )
			.to( [ '#seal-eye-left', '#seal-eye-right' ], { x: 0, y: 0, duration: .4, delay: 3 } )
			.to( [ '#seal-eye-left', '#seal-eye-right' ], { x: -8, y: 1, duration: .4, delay: 3 } )
			.to( [ '#seal-eye-left', '#seal-eye-right' ], { x: 0, y: 0, duration: .4, delay: 3 } );

		pendingAnimations.add( sealEyes );
	}
}

function channel3Animation( channel: Channel ): void {
	const elements: NodeListOf<SVGPathElement> = document.querySelectorAll( '#channel-3 path' );
	const modes = [ randomSkew, randomMisalignment ];

	let tl1: gsap.core.Timeline;
	let tl2: gsap.core.Timeline;

	modes[ random( 0, 1 ) ]();

	function randomSkew(): void {
		const delay = random( 0, 2 );

		tl1 = gsap.timeline( { delay } );
		tl2 = gsap.timeline( { delay, onComplete } );

		channel.pendingAnimations.add( tl1 );
		channel.pendingAnimations.add( tl2 );

		for ( let i = 0; i < random( 2, 4 ); i++ ) {
			const value = random( -60, 60 );
			const duration = random( .1, .3 );

			tl1.to( elements[ 0 ], { skewX: value, duration, ease: 'back.out(2)' } );
			tl2.to( elements[ 1 ], { skewX: -value, duration, ease: 'back.out(2)', transformOrigin: 'left bottom' } );
		}

		tl1.to( elements[ 0 ], { skewX: 0, duration: .1, ease: 'back.out(2)' } );
		tl2.to( elements[ 1 ], { skewX: 0, duration: .1, ease: 'back.out(2)', transformOrigin: 'left bottom' } );
	}

	function randomMisalignment(): void {
		const delay = random( 2, 4 );

		tl1 = gsap.timeline( { delay } );
		tl2 = gsap.timeline( { delay, onComplete } );

		channel.pendingAnimations.add( tl1 );
		channel.pendingAnimations.add( tl2 );

		const value = random( -15, 15 );
		const duration = random( .3, .6 );

		tl1.to( elements[ 0 ], { x: value, duration, ease: 'back.out(2)' } );
		tl2.to( elements[ 1 ], { x: -value, duration, ease: 'back.out(2)' } );

		tl1.to( elements[ 0 ], { x: 0, duration: .1, ease: 'back.out(2)' } );
		tl2.to( elements[ 1 ], { x: 0, duration: .1, ease: 'back.out(2)' } );
	}

	function onComplete(): void {
		modes[ random( 0, 1 ) ]();
		channel.pendingAnimations.delete( tl1 );
		channel.pendingAnimations.delete( tl2 );
	}
}
