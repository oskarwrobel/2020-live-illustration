type Config = {
	enter( evt: MouseEvent ): void;
	leave( evt: MouseEvent ): void;
}

export default function hoverHandler( element: HTMLElement, config: Config ): () => void {
	element.addEventListener( 'mouseenter', handleEnter );
	element.addEventListener( 'mouseleave', handleLeave );

	return function hoverHandlerDestructor(): void {
		element.removeEventListener( 'mouseenter', handleEnter );
		element.removeEventListener( 'mouseleave', handleLeave );
	};

	function handleEnter( evt: MouseEvent ): void {
		config.enter( evt );
	}

	function handleLeave( evt: MouseEvent ): void {
		config.leave( evt );
	}
}
