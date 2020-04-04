import createSvgElement from '../../utils/createsvgelement';
import backSvgData from './backbutton.svg';
import './backbutton.css';

export default function createBackButton( target: HTMLElement, onClick: () => void ): HTMLButtonElement {
	const button = document.createElement( 'button' );

	button.id = 'back-button';
	button.title = 'Back to the previous scene';
	button.addEventListener( 'click', () => onClick() );
	createSvgElement( backSvgData, {}, button );

	target.appendChild( button );

	return button;
}
