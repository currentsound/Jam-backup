import {derived, writable} from "svelte/store";
import type {Modal} from "$lib/types";
import type {ComponentProps, ComponentType, SvelteComponent} from "svelte";
import {uuidv7} from "uuidv7";


export const modals = writable<Modal[]>([])

export const openModal = <T extends SvelteComponent<{close: () => void}>>(
    componentType: ComponentType<T>,
    props?: Omit <ComponentProps<T>, 'close'>,
    id: string = uuidv7(),
    onClose: () => void = () => undefined
) => {
    const modal = {
        id,
        componentType,
        props: {...props, close: () => {
            onClose && onClose();
            closeModal(id);
        }}
    };
    modals.update(modals => modals.map(m => m.id).includes(id) ? modals : [modal, ...modals]);
}

export const closeModal = (id: string) => modals.update((modals) => modals.filter(m => m.id !== id));

export const isModalOpen = (id: string) => derived(modals, $writableModals => $writableModals.map(m => m.id).includes(id));


