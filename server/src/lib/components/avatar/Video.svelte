<script lang="ts">
    export let stream: MediaStream;
    export let onClick: () => void = () => undefined;
    export let mirror: boolean = false;
    export let className: string;

    const srcObject = (node: HTMLVideoElement, stream: MediaStream) => {
        node.srcObject = stream;
        return {
            update(newStream: MediaStream) {
                if (node.srcObject != newStream) {
                    node.srcObject = newStream;
                }
            },
        };
    };
</script>

<video
        class={className}
        use:srcObject={stream}
        on:click={onClick}
        style={mirror ? "transform: 'scaleX(-1)'" : "" }
        autoPlay
        playsInline
/>
