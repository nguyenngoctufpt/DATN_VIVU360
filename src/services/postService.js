import api from './api';

const auth = userId => ({ headers: { 'x-user-id': userId } });

export async function getFeed(userId) {
  const response = await api.get('/posts/feed', auth(userId));
  return response.data.data;
}

export async function createPost(userId, post) {
  const response = await api.post('/posts', post, auth(userId));
  return response.data.data;
}

export async function togglePostLike(userId, postId) {
  const response = await api.post(`/posts/${postId}/like`, {}, auth(userId));
  return response.data.data;
}
