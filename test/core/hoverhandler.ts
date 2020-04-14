import { expect } from 'chai';
import * as sinon from 'sinon';
import hoverHandler from '../../src/core/hoverhandler';

describe( 'hoverHandler', () => {
	it( 'should allow to attach callbacks for enter and leave events', () => {
		const element = document.createElement( 'div' );

		const hoverSpy = sinon.spy();
		const leaveSpy = sinon.spy();

		hoverHandler( element, {
			enter: hoverSpy,
			leave: leaveSpy
		} );

		element.dispatchEvent( new MouseEvent( 'mouseenter' ) );
		sinon.assert.calledOnce( hoverSpy );
		sinon.assert.notCalled( leaveSpy );
		expect( hoverSpy.lastCall.args[ 0 ] ).to.instanceof( MouseEvent );

		element.dispatchEvent( new MouseEvent( 'mouseleave' ) );
		sinon.assert.calledOnce( hoverSpy ); // Still once.
		sinon.assert.calledOnce( leaveSpy );
		expect( leaveSpy.lastCall.args[ 0 ] ).to.instanceof( MouseEvent );
	} );

	it( 'should return destructor function to detach events', () => {
		const element = document.createElement( 'div' );

		const hoverSpy = sinon.spy();
		const leaveSpy = sinon.spy();

		const destructor = hoverHandler( element, {
			enter: hoverSpy,
			leave: leaveSpy
		} );

		element.dispatchEvent( new Event( 'mouseenter' ) );
		element.dispatchEvent( new Event( 'mouseleave' ) );
		sinon.assert.calledOnce( hoverSpy );
		sinon.assert.calledOnce( leaveSpy );

		destructor();

		element.dispatchEvent( new Event( 'mouseenter' ) );
		element.dispatchEvent( new Event( 'mouseleave' ) );
		sinon.assert.calledOnce( hoverSpy ); // Still once.
		sinon.assert.calledOnce( leaveSpy ); // Still once.
	} );
} );
