export interface IToast {
    id: string;
    message: string;
    ttl?: number;
    type?: 'info' | 'success' | 'warning' | 'error';
    customClass?: string;
}

let toasts = $state<IToast[]>([]);

export const toastManager = {
    get list() {
        return toasts;
    },

    show(payload: Omit<IToast, 'id'>) {
        const id = crypto.randomUUID();
        const newToast: IToast = { ...payload, id };
        toasts.push(newToast);
        setTimeout(() => {
            this.dismiss(id);
        }, payload.ttl || 1000);
    },
    dismiss(id: string) {
        toasts = toasts.filter(t => t.id !== id);
    }
};