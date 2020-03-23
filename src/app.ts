import Illustrations from './utils/illustrations';

import roomCreator from './illustrations/room/creator';
import oscarCreator from './illustrations/oscar/creator';
import drawerCreator from './illustrations/drawer/creator';

import './app.css';

const wrapperElement = document.querySelector( '.illustration' ) as HTMLDivElement;
const illustrations = new Illustrations( wrapperElement, '1280x720' );

illustrations.add( 'room', roomCreator );
illustrations.add( 'oscar', oscarCreator );
illustrations.add( 'drawer', drawerCreator );

illustrations.show( 'room' );
