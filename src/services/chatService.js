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

export async function getOrCreateDirectChat(ownerId, friendId) {
  const response = await api.post('/chat/direct', { ownerId, friendId });
  return response.data.data;
}

export async function getChatMessages(groupId, requesterId) {
  const response = await api.get(`/chat/groups/${encodeURIComponent(groupId)}/messages`, {
    params: { requesterId, limit: 100 },
  });
  return response.data.data;
}

export async function updateChatMessage(groupId, messageId, requesterId, newContent) {
  const response = await api.patch(`/chat/groups/${encodeURIComponent(groupId)}/messages/${encodeURIComponent(messageId)}`, {
    requesterId,
    content: newContent
  });
  return response.data.data;
}

export async function recallChatMessage(groupId, messageId, requesterId) {
  const response = await api.delete(`/chat/groups/${encodeURIComponent(groupId)}/messages/${encodeURIComponent(messageId)}`, {
    params: { requesterId },
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

export async function updateChatGroupWorkspace(groupId, requesterId, updates, options = {}) {
  const proofImageFile = options.proofImageFile || null;
  if (proofImageFile) {
    const formData = new FormData();
    formData.append('requesterId', requesterId);

    if (typeof updates.announcement === 'string') {
      formData.append('announcement', updates.announcement);
    }
    if (typeof updates.skipAnnouncement !== 'undefined') {
      formData.append('skipAnnouncement', updates.skipAnnouncement ? 'true' : 'false');
    }
    if (typeof updates.fundGoal !== 'undefined') {
      formData.append('fundGoal', String(updates.fundGoal));
    }
    if (typeof updates.itinerary !== 'undefined') {
      formData.append('itinerary', JSON.stringify(updates.itinerary));
    }
    if (typeof updates.fund !== 'undefined') {
      formData.append('fund', JSON.stringify(updates.fund));
    }
    if (typeof updates.contribution !== 'undefined') {
      const { proofImage, ...contribution } = updates.contribution;
      formData.append('contribution', JSON.stringify(contribution));
    }
    if (typeof updates.expense !== 'undefined') {
      formData.append('expense', JSON.stringify(updates.expense));
    }

    formData.append('proofImage', proofImageFile);

    const response = await api.patch(`/chat/groups/${encodeURIComponent(groupId)}/workspace`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 15000,
    });
    return response.data.data;
  }

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
