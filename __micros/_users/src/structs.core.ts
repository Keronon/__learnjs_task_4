
export interface MsgData { cmd: string, data: any }

// TOKEN

export interface Token
{
    u_id   ?: number;
    u_email : string;
    u_role ?: string;
}

// USER

export interface User extends Token
{
    u_login   ?: string;
    u_password : string;
}
