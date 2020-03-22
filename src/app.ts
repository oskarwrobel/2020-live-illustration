import Illustrations from './utils/illustrations';

import roomCreator from './illustrations/room/roomcreator';

import './app.css';

const wrapperElement = document.querySelector( '.illustration' ) as HTMLDivElement;
const illustrations = new Illustrations( wrapperElement, '1280x720' );

illustrations.add( 'room', roomCreator );

illustrations.show( 'room' );
