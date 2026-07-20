import api from './api';

const auth = userId => ({ headers: { 'x-user-id': userId } });

export async function getFriendships(userId, status) {
  const response = await api.get('/friendships', {
    ...auth(userId),
    params: status ? { status } : undefined,
  });
  return response.data.data;
}

export async function sendFriendRequest(userId, receiverId) {
  const response = await api.post('/friendships/requests', { userId: receiverId }, auth(userId));
  return response.data.data;
}

export async function acceptFriendRequest(userId, friendshipId) {
  const response = await api.patch(`/friendships/${friendshipId}/accept`, {}, auth(userId));
  return response.data.data;
}

export async function rejectFriendRequest(userId, friendshipId) {
  await api.patch(`/friendships/${friendshipId}/reject`, {}, auth(userId));
}
