import api from './api';

export async function getChatGroups(memberId) {
  const response = await api.get('/chat/groups', { params: { memberId } });
  return response.data.data;
}

export async function createChatGroup({ name, avatar, ownerId, memberIds = [], isDirect = false, tag = 'Du lịch' }) {
  const response = await api.post('/chat/groups', { name, avatar, ownerId, memberIds, isDirect, tag });
  return response.data.data;
}

export async function markMessagesAsRead(groupId, userId) {
  const response = await api.post(`/chat/groups/${encodeURIComponent(groupId)}/read`, { userId });
  return response.data.data;
}

export async function getChatMessages(groupId, requesterId) {
  const response = await api.get(`/chat/groups/${encodeURIComponent(groupId)}/messages`, {
    params: { requesterId, limit: 100 },
  });
  return response.data.data;
}

export async function sendChatMessage(groupId, senderId, content) {
  const response = await api.post(`/chat/groups/${encodeURIComponent(groupId)}/messages`, {
    senderId,
    content,
    type: 'text',
  });
  return response.data.data;
}

export async function addChatMembers(groupId, requesterId, memberIds) {
  const response = await api.post(`/chat/groups/${encodeURIComponent(groupId)}/members`, {
    requesterId,
    memberIds,
  });
  return response.data.data;
}

export async function updateChatGroup(groupId, requesterId, fields) {
  const response = await api.patch(`/chat/groups/${encodeURIComponent(groupId)}`, { requesterId, ...fields });
  return response.data.data;
}

export async function renameChatGroup(groupId, requesterId, name) {
  return updateChatGroup(groupId, requesterId, { name });
}

export async function removeChatMember(groupId, requesterId, memberId) {
  const response = await api.delete(`/chat/groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(memberId)}`, {
    params: { requesterId },
  });
  return response.data.data;
}

export async function sendTypingStatus(groupId, userId, userName, avatar, isTyping) {
  try {
    const response = await api.post(`/chat/groups/${encodeURIComponent(groupId)}/typing`, {
      userId,
      userName,
      avatar,
      isTyping,
    });
    return response.data;
  } catch (e) {
    return null;
  }
}

export async function getTypingStatus(groupId, requesterId) {
  try {
    const response = await api.get(`/chat/groups/${encodeURIComponent(groupId)}/typing`, {
      params: { requesterId },
    });
    return response.data.data;
  } catch (e) {
    return { isTyping: false };
  }
}
