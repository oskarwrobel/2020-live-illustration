import Scenes from './core/scenes';

import roomSceneCreator from './scenes/room/creator';
import oscarSceneCreator from './scenes/oscar/creator';
import drawerSceneCreator from './scenes/drawer/creator';
import postcardSceneCreator from './scenes/postcard/creator';

import './app.css';

const wrapperElement = document.querySelector( '#scene' ) as HTMLDivElement;
const scenes = new Scenes( wrapperElement, '16:9' );

scenes
	.add( 'room', { creator: roomSceneCreator, path: '/' } )
	.add( 'oscar', { creator: oscarSceneCreator, path: '/oscar' } )
	.add( 'drawer', { creator: drawerSceneCreator, path: '/drawer' } )
	.add( 'postcard', { creator: postcardSceneCreator, path: '/postcard' } );

showInitPage();

function showInitPage(): void {
	if ( window.location.hash ) {
		const path = window.location.hash.replace( '#', '' );

		if ( scenes.has( path ) ) {
			scenes.show( path );

			return;
		}
	}

	scenes.show( '/' );
}
