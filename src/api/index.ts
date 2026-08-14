import request from '../utils/request';

export interface PageResult<T> {
    list: T[];
    pageTotal: number;
    page?: number;
    size?: number;
}

export interface LoginPayload {
    username: string;
    password: string;
}

export interface LoginResult {
    token: string;
    userId: number;
    username: string;
    roleKey: string;
}

export interface BackendUser {
    id: number;
    name: string;
    password: string;
    email: string;
    phone: string;
    role: string;
    date: string;
    status: boolean;
}

export interface BackendRole {
    id: number;
    name: string;
    key: string;
    status: boolean;
    permiss: string[];
}

export interface BackendMenu {
    id: string;
    parentId?: string | null;
    title: string;
    routePath: string;
    icon?: string;
    permissionCode?: string;
    sortOrder: number;
    status: boolean;
}

export interface BackendTableItem {
    id: number;
    name: string;
    thumb: string;
    money: number;
    state: boolean;
    date: string;
    address: string;
}

export interface RegisterPayload {
    username: string;
    password: string;
    email: string;
}

export interface ResetPasswordPayload {
    email: string;
}

export interface UserQuery {
    name?: string;
    page?: number;
    size?: number;
}

export interface RoleQuery {
    page?: number;
    size?: number;
}

export interface CreateUserPayload {
    name: string;
    password: string;
    email: string;
    phone?: string;
    roleId: number;
}

export interface UpdateUserPayload {
    email: string;
    phone?: string;
    roleId: number;
    status?: boolean;
    password?: string;
}

export interface SaveRolePayload {
    name: string;
    key: string;
    status: boolean;
}

export interface SaveRolePermissionsPayload {
    permiss: string[];
}

export interface SaveMenuPayload {
    id: string;
    pid?: string;
    title: string;
    index: string;
    icon?: string;
    permiss?: string;
    sortOrder: number;
    status: boolean;
}

export const login = (data: LoginPayload) => {
    return request<LoginResult>({
        url: '/auth/login',
        method: 'post',
        data
    });
};

export const register = (data: RegisterPayload) => {
    return request({
        url: '/auth/register',
        method: 'post',
        data
    });
};

export const resetPasswordByEmail = (data: ResetPasswordPayload) => {
    return request<{ message: string }>({
        url: '/auth/reset-password/email',
        method: 'post',
        data
    });
};

export const fetchData = () => {
    return request<PageResult<BackendTableItem>>({
        url: '/table-items',
        method: 'get'
    });
};

export const fetchUserData = (params?: UserQuery) => {
    return request<PageResult<BackendUser>>({
        url: '/users',
        method: 'get',
        params
    });
};

export const createUser = (data: CreateUserPayload) => {
    return request({
        url: '/users',
        method: 'post',
        data
    });
};

export const updateUser = (id: number, data: UpdateUserPayload) => {
    return request({
        url: `/users/${id}`,
        method: 'put',
        data
    });
};

export const deleteUser = (id: number) => {
    return request({
        url: `/users/${id}`,
        method: 'delete'
    });
};

export const fetchRoleData = (params: RoleQuery = { page: 1, size: 1000 }) => {
    return request<{ list: BackendRole[]; pageTotal: number }>({
        url: '/roles',
        method: 'get',
        params
    });
};

export const createRole = (data: SaveRolePayload) => {
    return request({
        url: '/roles',
        method: 'post',
        data
    });
};

export const updateRole = (id: number, data: SaveRolePayload) => {
    return request({
        url: `/roles/${id}`,
        method: 'put',
        data
    });
};

export const deleteRole = (id: number) => {
    return request({
        url: `/roles/${id}`,
        method: 'delete'
    });
};

export const updateRolePermissions = (id: number, data: SaveRolePermissionsPayload) => {
    return request({
        url: `/roles/${id}/permissions`,
        method: 'put',
        data
    });
};

export const fetchMenuData = () => {
    return request<{ list: BackendMenu[]; pageTotal: number }>({
        url: '/menus',
        method: 'get'
    });
};

export const createMenu = (data: SaveMenuPayload) => {
    return request({
        url: '/menus',
        method: 'post',
        data
    });
};

export const updateMenu = (id: string, data: SaveMenuPayload) => {
    return request({
        url: `/menus/${id}`,
        method: 'put',
        data
    });
};

export const deleteMenu = (id: string) => {
    return request({
        url: `/menus/${id}`,
        method: 'delete'
    });
};
