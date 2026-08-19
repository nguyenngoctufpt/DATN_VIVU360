import api from './api';

export async function createPoll(groupId, title, options, userId) {
  try {
    const response = await api.post('/polls', {
      groupId,
      title,
      options,
      userId,
    }, {
      headers: {
        'x-user-id': userId,
      },
    });

    return response.data.poll;
  } catch (error) {
    console.error('Error creating poll:', error);
    throw error;
  }
}

export async function getPollsForGroup(groupId) {
  try {
    const response = await api.get(`/polls/group/${groupId}`);
    return response.data.polls || [];
  } catch (error) {
    console.error('Error fetching polls:', error);
    throw error;
  }
}

export async function getPoll(pollId) {
  try {
    const response = await api.get(`/polls/${pollId}`);
    return response.data.poll;
  } catch (error) {
    console.error('Error fetching poll:', error);
    throw error;
  }
}

export async function votePoll(pollId, optionId, userId) {
  try {
    const response = await api.post(`/polls/${pollId}/vote`, {
      optionId,
      userId,
    }, {
      headers: {
        'x-user-id': userId,
      },
    });

    return response.data.poll;
  } catch (error) {
    console.error('Error voting on poll:', error);
    throw error;
  }
}

export async function closePoll(pollId, userId) {
  try {
    const response = await api.put(`/polls/${pollId}/close`, {}, {
      headers: {
        'x-user-id': userId,
      },
    });

    return response.data.poll;
  } catch (error) {
    console.error('Error closing poll:', error);
    throw error;
  }
}

export async function deletePoll(pollId, userId) {
  try {
    const response = await api.delete(`/polls/${pollId}`, {
      headers: {
        'x-user-id': userId,
      },
    });

    return true;
  } catch (error) {
    console.error('Error deleting poll:', error);
    throw error;
  }
}
