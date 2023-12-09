export interface ChatState {
    groupOption: string | null;
    me: string | null;
    users: string[] | null;
    selectedUser: string | null;
    selectedGroup: string | null;
    selectedGroupOption: string | null;
}
// const [chat, setChat] = useState({
//     groupOption : null,
//     me : null,
//     users :null,
//     selectedUser : null,
//     selectedGroup : null,
//     selectedGroupOption : null,
//   })
