import { expect } from 'chai';
import * as sinon from 'sinon';
import escHandler from '../../src/core/eschandler';

describe( 'escHandler', () => {
	it( 'should handle esc key press', () => {
		const spy = sinon.spy();
		const destructor = escHandler( spy );

		document.dispatchEvent( new KeyboardEvent( 'keydown', { key: 'Enter' } ) );

		sinon.assert.notCalled( spy );

		document.dispatchEvent( new KeyboardEvent( 'keydown', { key: 'Escape' } ) );

		sinon.assert.calledOnce( spy );
		expect( spy.lastCall.args[ 0 ] ).instanceof( KeyboardEvent );

		destructor();
	} );

	it( 'should return destructor function to detach event', () => {
		const spy = sinon.spy();
		const destructor = escHandler( spy );

		document.dispatchEvent( new KeyboardEvent( 'keydown', { key: 'Escape' } ) );
		sinon.assert.calledOnce( spy );

		destructor();

		document.dispatchEvent( new KeyboardEvent( 'keydown', { key: 'Escape' } ) );
		sinon.assert.calledOnce( spy ); // Still once.
	} );
} );
