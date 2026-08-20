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

export async function getUserPosts(userId, profileUserId = userId) {
  const response = await api.get(`/posts/user/${encodeURIComponent(profileUserId)}`, auth(userId));
  return response.data.data;
}

export async function addPostComment(userId, postId, text) {
  const response = await api.post(`/posts/${postId}/comments`, { text }, auth(userId));
  return response.data.data;
}
export async function uploadPostImage(ownerId, imageAsset) {
  if (!ownerId) {
    throw new Error('Thiếu ownerId khi upload ảnh');
  }

  if (!imageAsset?.uri) {
    throw new Error('Không tìm thấy ảnh để upload');
  }

  const formData = new FormData();

  const fileName =
    imageAsset.fileName ||
    `post-${Date.now()}.jpg`;

  const mimeType =
    imageAsset.mimeType ||
    'image/jpeg';

  formData.append('image', {
    uri: imageAsset.uri,
    name: fileName,
    type: mimeType,
  });

  const response = await api.post(
    '/posts/upload-image',
    formData,
    {
      headers: {
        'x-user-id': ownerId,
      },
    }
  );

  return response.data?.data?.imageUrl;
}