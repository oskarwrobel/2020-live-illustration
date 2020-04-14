type Config = {
	enter(): void;
	leave(): void;
}

export default function hoverHandler( element: HTMLElement, config: Config ): () => void {
	element.addEventListener( 'mouseenter', handleEnter );
	element.addEventListener( 'mouseleave', handleLeave );

	return function hoverHandlerDestructor(): void {
		element.removeEventListener( 'mouseenter', handleEnter );
		element.removeEventListener( 'mouseleave', handleLeave );
	};

	function handleEnter(): void {
		config.enter();
	}

	function handleLeave(): void {
		config.leave();
	}
}
