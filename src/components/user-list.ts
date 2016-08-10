import {Projector, h} from 'maquette';
import {DataService} from '../services/data-service';
import {UserInfo, MessageInfo} from '../interfaces';
import {createList} from '../components/list';
import {getFormattedDate} from '../utilities';

export let createUserList = (dataService: DataService, user: UserInfo, projector: Projector, handleClick: (itemId: string) => void) => {

  let users: UserInfo[] = undefined;
  let usersCollection = dataService.horizon('users');

  let lastMessages: MessageInfo[] = [];

  let subscription = usersCollection.order('lastName').watch().subscribe((allUsers: UserInfo[]) => {
    users = allUsers;

    users.forEach((otheruser) => {
      let chatRoomId = [user.id, otheruser.id].sort().join('-'); // format: lowestUserId-highestUserId
      dataService.horizon('directMessages').findAll({ chatRoomId: chatRoomId }).order('timestamp', 'descending').limit(1).watch().subscribe((msg: any) => {
        if (msg[0]) {
          lastMessages.push(msg[0]);
        }
        projector.scheduleRender();
      });
    });
  });

  let list = createList({className: 'user-list'}, {
      getItems: () => users,
      getKey: (otherUser: UserInfo) => otherUser.id,
      renderRow: (item: UserInfo) => {

        let chatRoomId = [user.id, item.id].sort().join('-'); // format: lowestUserId-highestUserId

        let lastMessage: MessageInfo;
        lastMessages.forEach((message) => {
          if (message.chatRoomId === chatRoomId) {
            lastMessage = message;
          }
        });

        return h('div', {class: 'row'},
        [ h('img', {class: 'profile-picture', src: item.image}),
        h('div', {class: 'messagecontainer'}, [
          h('div', { class: 'messageTitleContainer'}, [
            h('b', [item.firstName + ' ' + item.lastName]),
            h('i', [lastMessage ? getFormattedDate(lastMessage.date) : undefined ])
          ]),
          h('p', [lastMessage ? lastMessage.text : undefined])
        ])
      ]);

    },
    rowClicked: (item: UserInfo) => {
    //  let w = <any>window;
    //  w.location = `#chat/${item.id}` ;
    handleClick(item.id);
    }
  });
  return list;
};