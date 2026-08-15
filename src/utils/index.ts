import { Menus } from '@/types/menu';

export const storageKeys = {
    token: 'vuems_token',
    username: 'vuems_name',
    roleKey: 'vuems_role_key',
    permiss: 'vuems_permiss'
};

export const getStoredPermissions = () => {
    const raw = localStorage.getItem(storageKeys.permiss);
    if (!raw) {
        return [] as string[];
    }
    try {
        const permissions = JSON.parse(raw);
        return Array.isArray(permissions) ? permissions.map((item) => String(item)) : [];
    } catch {
        return [] as string[];
    }
};

export const saveAuthState = (token: string, username: string, roleKey: string, permissions: string[]) => {
    localStorage.setItem(storageKeys.token, token);
    localStorage.setItem(storageKeys.username, username);
    localStorage.setItem(storageKeys.roleKey, roleKey);
    localStorage.setItem(storageKeys.permiss, JSON.stringify(permissions));
};

export const clearAuthState = () => {
    localStorage.removeItem(storageKeys.token);
    localStorage.removeItem(storageKeys.username);
    localStorage.removeItem(storageKeys.roleKey);
    localStorage.removeItem(storageKeys.permiss);
};

export const mapMenuItem = (item: {
    id: string;
    parentId?: string | null;
    title: string;
    routePath: string;
    icon?: string;
    permissionCode?: string;
    sortOrder?: number;
    status?: boolean;
}): Menus => {
    return {
        id: item.id,
        pid: item.parentId || undefined,
        title: item.title,
        index: item.routePath,
        icon: item.icon || undefined,
        permiss: item.permissionCode || undefined,
        sortOrder: item.sortOrder,
        status: item.status,
    };
};

export const buildMenuTree = (menus: Menus[]) => {
    const lookup = new Map<string, Menus>();
    const roots: Menus[] = [];
    menus
        .map((item) => ({ ...item, children: [] as Menus[] }))
        .sort((first, second) => (first.sortOrder || 0) - (second.sortOrder || 0))
        .forEach((item) => {
            lookup.set(item.id, item);
        });

    lookup.forEach((item) => {
        if (item.pid && lookup.has(item.pid)) {
            lookup.get(item.pid)!.children!.push(item);
            return;
        }
        roots.push(item);
    });

    return roots;
};

export const setProperty = (prop: string, val: any, dom = document.documentElement) => {
    dom.style.setProperty(prop, val);
};

export const mix = (color1: string, color2: string, weight: number = 0.5): string => {
    let color = '#';
    for (let i = 0; i <= 2; i++) {
        const c1 = parseInt(color1.substring(1 + i * 2, 3 + i * 2), 16);
        const c2 = parseInt(color2.substring(1 + i * 2, 3 + i * 2), 16);
        const c = Math.round(c1 * weight + c2 * (1 - weight));
        color += c.toString(16).padStart(2, '0');
    }
    return color;
};
