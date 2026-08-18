import api from './api';

import { loadAppData } from './appDataService';

export async function getChatGroups(memberId) {
  try {
    const response = await api.get('/chat/groups', { params: { memberId } });
    return response.data.data;
  } catch (error) {
    if (error?.message === 'Network Error' || !error?.response) {
      const saved = await loadAppData(memberId, 'chat').catch(() => null);
      if (saved?.groups && Array.isArray(saved.groups)) {
        return saved.groups;
      }
    }
    throw error;
  }
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
  try {
    const response = await api.get(`/chat/groups/${encodeURIComponent(groupId)}/messages`, {
      params: { requesterId, limit: 100 },
    });
    return response.data.data;
  } catch (error) {
    if (error?.message === 'Network Error' || !error?.response) {
      const saved = await loadAppData(requesterId, 'chat').catch(() => null);
      if (saved?.groups && Array.isArray(saved.groups)) {
        const foundGroup = saved.groups.find(g => String(g.id || g._id) === String(groupId));
        if (foundGroup && Array.isArray(foundGroup.messages)) {
          return foundGroup.messages;
        }
      }
    }
    throw error;
  }
}

export async function sendChatMessage(groupId, senderId, content) {
  const response = await api.post(`/chat/groups/${encodeURIComponent(groupId)}/messages`, {
    senderId,
    content,
    type: 'text',
  });
  return response.data.data;
}

export async function editChatMessage(groupId, messageId, requesterId, content) {
  const response = await api.patch(`/chat/groups/${encodeURIComponent(groupId)}/messages/${encodeURIComponent(messageId)}`, {
    requesterId,
    content,
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

export async function askGroupAssistant(groupId, requesterId, question) {
  const response = await api.post(`/chat/groups/${encodeURIComponent(groupId)}/assistant-ask`, {
    requesterId,
    question,
  });
  return response.data.data;
}

export async function createGroupPoll(groupId, senderId, question, options, multipleChoice = false) {
  const response = await api.post(`/chat/groups/${encodeURIComponent(groupId)}/polls`, {
    senderId,
    question,
    options,
    multipleChoice,
  });
  return response.data.data;
}

export async function voteGroupPoll(groupId, messageId, optionId, requesterId) {
  const response = await api.post(`/chat/groups/${encodeURIComponent(groupId)}/polls/${encodeURIComponent(messageId)}/vote`, {
    optionId,
    requesterId,
  });
  return response.data.data;
}

export async function closeGroupPoll(groupId, messageId, requesterId) {
  const response = await api.patch(`/chat/groups/${encodeURIComponent(groupId)}/polls/${encodeURIComponent(messageId)}/close`, {
    requesterId,
  });
  return response.data.data;
}

export async function updateGroupMemberRoles(groupId, requesterId, deputyIds) {
  const response = await api.patch(`/chat/groups/${encodeURIComponent(groupId)}/roles`, {
    requesterId,
    deputyIds,
  });
  return response.data.data;
}

export async function createGroupTask(groupId, requesterId, taskPayload) {
  const response = await api.post(`/chat/groups/${encodeURIComponent(groupId)}/tasks`, {
    requesterId,
    ...taskPayload,
  });
  return response.data.data;
}

export async function updateGroupTask(groupId, taskId, requesterId, fields) {
  const response = await api.patch(`/chat/groups/${encodeURIComponent(groupId)}/tasks/${encodeURIComponent(taskId)}`, {
    requesterId,
    ...fields,
  });
  return response.data.data;
}

export async function remindGroupTask(groupId, taskId, requesterId) {
  const response = await api.post(`/chat/groups/${encodeURIComponent(groupId)}/tasks/${encodeURIComponent(taskId)}/remind`, {
    requesterId,
  });
  return response.data.data;
}
