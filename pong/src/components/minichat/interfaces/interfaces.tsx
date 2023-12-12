export interface ChatState {
    groupOption: string | null;
    me: string | null;
    users: string[] | null;
    selectedUser: string | null;
    selectedGroup: string | null;
    selectedGroupOption: string | null;
}

export interface Channel{
    title: any | null,
    password: any | null,
    access_level : any,
}