
export interface MsgData { cmd: string, data: any }

// PROFILE

export interface Profile
{
    p_id      ?: number;    p_id_user?: number;
    p_surname  : string;    p_name   ?: string;    p_fathername?: string;
    p_birthday : string;    p_gender  : string;
    p_phone   ?: string;
}

// REGISTRATE

export interface Registrate
{
    user   : User;
    profile: Profile;
}

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
