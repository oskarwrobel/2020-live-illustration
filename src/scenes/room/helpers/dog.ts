import { gsap } from 'gsap';
import sendEvent from '../../../core/sendevent';
import hoverHandler from '../../../core/hoverhandler';

export default function dog(): () => void {
	const smileAnimation = gsap.to( '#smile', { attr: { d: 'M41.1,100.5 c0,0,22.9-6.5,22.9-19' }, paused: true } );
	let eventTimeoutId: ReturnType<typeof setTimeout>;

	hoverHandler( document.querySelector( '#leash' ), {
		enter: () => {
			smileAnimation.play();
			eventTimeoutId = setTimeout( () => {
				sendEvent( 'room-scene', 'Dog smile' );
			}, 500 );
		},
		leave: () => {
			smileAnimation.reverse();
			clearInterval( eventTimeoutId );
		}
	} );

	return function dogDestructor(): void {
		smileAnimation.kill();
	};
}
