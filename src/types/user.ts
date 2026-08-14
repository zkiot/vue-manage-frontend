
export interface User {
    id: number;
    name: string;
    password?: string;
    email: string;
    phone: string;
    roleId: number;
    role: string;
    date: string;
    status: boolean;
    editing?: boolean;
}

export interface Register {
    username: string;
    password: string;
    email: string;
}