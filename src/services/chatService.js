import api from './api';

export async function getChatGroups(memberId) {
  const response = await api.get('/chat/groups', { params: { memberId } });
  return response.data.data;
}

export async function getChatGroup(groupId, requesterId) {
  const response = await api.get(`/chat/groups/${encodeURIComponent(groupId)}`, {
    params: { requesterId },
  });
  return response.data.data;
}

export async function createChatGroup({ name, avatar, ownerId, memberIds = [], itinerary, fund }) {
  const response = await api.post('/chat/groups', { name, avatar, ownerId, memberIds, itinerary, fund });
  return response.data.data;
}

export async function getChatMessages(groupId, requesterId) {
  const response = await api.get(`/chat/groups/${encodeURIComponent(groupId)}/messages`, {
    params: { requesterId, limit: 100 },
  });
  return response.data.data;
}

export async function getGroupNotifications(groupId, requesterId) {
  const response = await api.get(`/notifications/groups/${encodeURIComponent(groupId)}`, {
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

export async function updateChatGroupWorkspace(groupId, requesterId, updates) {
  const response = await api.patch(`/chat/groups/${encodeURIComponent(groupId)}/workspace`, {
    requesterId,
    ...updates,
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

export async function renameChatGroup(groupId, requesterId, name) {
  const response = await api.patch(`/chat/groups/${encodeURIComponent(groupId)}`, { requesterId, name });
  return response.data.data;
}

export async function removeChatMember(groupId, requesterId, memberId) {
  const response = await api.delete(`/chat/groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(memberId)}`, {
    params: { requesterId },
  });
  return response.data.data;
}
