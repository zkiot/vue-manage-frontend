import { defineStore } from 'pinia';
import { getStoredPermissions, storageKeys } from '@/utils';

interface ObjectList {
    [key: string]: string[];
}

export const usePermissStore = defineStore('permiss', {
    state: () => {
        const defaultList: ObjectList = {};
        return {
            key: getStoredPermissions(),
            defaultList,
        };
    },
    actions: {
        handleSet(val: string[]) {
            this.key = val;
            localStorage.setItem(storageKeys.permiss, JSON.stringify(val));
        },
        clear() {
            this.key = [];
            localStorage.removeItem(storageKeys.permiss);
        },
    },
});
