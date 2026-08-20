import api from './api';
import { loadAppData } from './appDataService';

export async function markMessagesAsRead(groupId, requesterId) {
  try {
    const response = await api.post(`/chat/groups/${encodeURIComponent(groupId)}/read`, {
      requesterId,
    });
    return response.data;
  } catch (error) {
    return null;
  }
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

export async function updateChatMessage(groupId, messageId, requesterId, newContent) {
  const response = await api.patch(`/chat/groups/${encodeURIComponent(groupId)}/messages/${encodeURIComponent(messageId)}`, {
    requesterId,
    content: newContent
  });
  return response.data.data;
}

export async function editChatMessage(groupId, messageId, requesterId, content) {
  return updateChatMessage(groupId, messageId, requesterId, content);
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

export async function removeChatMember(groupId, requesterId, targetUserId) {
  const response = await api.delete(`/chat/groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(targetUserId)}`, {
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
