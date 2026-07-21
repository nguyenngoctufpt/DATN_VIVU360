// Dữ liệu người dùng mẫu dùng chung giữa social & chat
export const ALL_USERS = [
  { id: '1', name: 'Tú (Bạn)', avatar: 'T', points: 8250 },
  { id: '2', name: 'Hoàng Long', avatar: 'H', points: 3400 },
  { id: '3', name: 'Mai Phương', avatar: 'M', points: 5600 },
  { id: '4', name: 'Linh Chi', avatar: 'L', points: 9100 },
  { id: '5', name: 'Minh Tuấn', avatar: 'T', points: 4200 },
  { id: '6', name: 'Hương Giang', avatar: 'H', points: 7800 },
];

const initialGroupMessages = [
  { id: 'ai-welcome', senderId: 'ai', text: 'Xin chào! 🤖 Mình là trợ lý AI Vivu360. Hãy hỏi mình bất cứ điều gì về chuyến đi nhé!\n\n💡 Gợi ý: Nhắn "@ai" + câu hỏi, hoặc dùng các nút gợi ý bên dưới.', timestamp: '09:55' },
  { id: '1', senderId: '1', text: 'Chào mọi người, mình lập nhóm để bàn kế hoạch đi Đà Lạt tháng sau nhé!', timestamp: '10:00' },
  { id: '2', senderId: '2', text: 'Tuyệt vời, mình hóng chuyến này lâu lắm rồi.', timestamp: '10:05' },
  { id: '3', senderId: '3', text: 'Count me in! Lần này mình muốn đi săn mây sớm nha 🌄', timestamp: '10:08' },
];

// Shared state đơn giản cho cross-tab events
let _listeners = [];
export const globalSharedState = {
  friends: ['2', '3', '4'],
  activeChatUser: null,
  posts: [],
  groupMessages: initialGroupMessages,

  subscribe(listener) {
    _listeners.push(listener);
    return () => { _listeners = _listeners.filter(l => l !== listener); };
  },

  emit(event, data) {
    _listeners.forEach(l => l(event, data));
  },

  addFriend(userId) {
    if (!this.friends.includes(userId)) {
      this.friends.push(userId);
      this.emit('friendAdded', userId);
    }
  },

  setActiveChatUser(userId) {
    this.activeChatUser = userId;
    this.emit('openChat', userId);
  },

  addPost(post) {
    this.posts.unshift(post);
    this.emit('postAdded', post);
  },
};

