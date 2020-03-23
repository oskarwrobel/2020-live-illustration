export default function tv(): void {
	const button0on = document.querySelector( '#button-0-on' ) as HTMLElement;
	const button1on = document.querySelector( '#button-1-on' ) as HTMLElement;
	const button2on = document.querySelector( '#button-2-on' ) as HTMLElement;
	const button3on = document.querySelector( '#button-3-on' ) as HTMLElement;

	button1on.addEventListener( 'mousedown', pressChannelButton );
	button2on.addEventListener( 'mousedown', pressChannelButton );
	button3on.addEventListener( 'mousedown', pressChannelButton );

	button0on.addEventListener( 'mousedown', () => {
		button0on.style.visibility = 'hidden';
		clearAllButtons();

		document.addEventListener( 'mouseup', () => {
			button0on.style.visibility = null;
		} );
	} );

	function pressChannelButton( evt: MouseEvent ): void {
		const element = evt.currentTarget as HTMLElement;

		clearAllButtons();
		element.style.visibility = 'hidden';
	}

	function clearAllButtons(): void {
		[ button1on, button2on, button3on ].forEach( el => ( el.style.visibility = null ) );
	}
}
