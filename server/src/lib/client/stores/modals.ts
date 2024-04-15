import {derived, writable} from "svelte/store";
import type {Modal} from "$lib/types";
import type {ComponentType} from "svelte";


export const modals = writable<Modal[]>([])


export function ShowModal({id, component, show = false, onClose}: {id: string, component: ComponentType, show: boolean, onClose: () => void}) {
    const shouldOpen = show && !!component;
    const isOpen = isModalOpen(id);

    if (shouldOpen && !isOpen) {
        openModal(component, id, onClose);
    } else if (!shouldOpen && isOpen) {
        closeModal(id);
    }
}

export const openModal = (component: ComponentType, id: string, onClose: () => void) => {
    const modal = {id, component};
    modals.update(modals => modals.map(m => m.id).includes(id) ? modals : [modal, ...modals]);
    return () => {
        if (onClose) onClose();
        modals.update((modals) => modals.filter(m => m.id !== modal.id));
    };
}

export const closeModal = (id: string) => modals.update((modals) => modals.filter(m => m.id !== id));

export const isModalOpen = (id: string) => derived(modals, $writableModals => $writableModals.map(m => m.id).includes(id));


