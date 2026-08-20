import api from './api';

const auth = userId => ({ headers: { 'x-user-id': String(userId || 'guest_user').trim() } });

import { loadAppData } from './appDataService';

export async function getFeed(userId) {
  try {
    const response = await api.get('/posts/feed', auth(userId));
    return response.data.data;
  } catch (error) {
    if (error?.message === 'Network Error' || !error?.response) {
      const saved = await loadAppData(userId, 'social').catch(() => null);
      if (saved?.posts && Array.isArray(saved.posts)) {
        return saved.posts;
      }
    }
    throw error;
  }
}

export async function createPost(userId, post) {
  const response = await api.post('/posts', post, auth(userId));
  return response.data.data;
}

export async function editPost(userId, postId, postData) {
  const response = await api.put(`/posts/${postId}`, postData, auth(userId));
  return response.data.data;
}

export async function deletePost(userId, postId) {
  const response = await api.delete(`/posts/${postId}`, auth(userId));
  return response.data;
}

export async function togglePostLike(userId, postId) {
  const response = await api.post(`/posts/${postId}/like`, {}, auth(userId));
  return response.data.data;
}

export async function getUserPosts(userId, profileUserId = userId) {
  try {
    const response = await api.get(`/posts/user/${encodeURIComponent(profileUserId)}`, auth(userId));
    return response.data.data;
  } catch (error) {
    if (error?.message === 'Network Error' || !error?.response) {
      const saved = await loadAppData(userId, 'social').catch(() => null);
      if (saved?.posts && Array.isArray(saved.posts)) {
        return saved.posts;
      }
    }
    throw error;
  }
}

export async function addPostComment(userId, postId, text) {
  const response = await api.post(`/posts/${postId}/comments`, { text }, auth(userId));
  return response.data.data;
}

export async function deletePost(userId, postId) {
  const response = await api.delete(`/posts/${postId}`, auth(userId));
  return response.data;
}

export async function updatePost(userId, postId, fields) {
  const response = await api.put(`/posts/${postId}`, fields, auth(userId));
  return response.data.data;
}


export function mapMongoPostToFeedPost(mPost) {
  if (!mPost) return null;
  const firstImage = Array.isArray(mPost.images) && mPost.images.length > 0 && mPost.images[0]?.trim()
    ? mPost.images[0].trim()
    : (mPost.image?.trim() || '');

  const userAvatar = mPost.author?.avatar?.trim() || mPost.user?.avatar?.trim() || 'https://i.pravatar.cc/150?img=68';

  return {
    id: mPost._id || mPost.id,
    _id: mPost._id || mPost.id,
    authorId: mPost.authorId || mPost.user?.firebaseUid || null,
    title: mPost.title || (mPost.content ? (mPost.content.length > 50 ? mPost.content.slice(0, 50) + '...' : mPost.content) : 'Bản tin du lịch'),
    category: mPost.category || 'Check-in 360° 📸',
    privacy: mPost.privacy || 'public',
    source: mPost.author?.name || mPost.user?.name || 'Thành viên Vivu360',
    time: mPost.createdAt ? new Date(mPost.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + new Date(mPost.createdAt).toLocaleDateString() : 'Vừa xong',
    location: mPost.location || 'Việt Nam',
    content: mPost.content || '',
    image: firstImage,
    images: firstImage ? [firstImage] : [],
    likes: mPost.likesCount !== undefined ? mPost.likesCount : (Array.isArray(mPost.likes) ? mPost.likes.length : 0),
    commentsCount: mPost.commentsCount !== undefined ? mPost.commentsCount : (Array.isArray(mPost.comments) ? mPost.comments.length : 0),
    likedByUser: mPost.likedByMe || false,
    comments: (mPost.comments || []).map(c => ({
      id: c._id || c.id || Date.now(),
      user: c.author?.name || c.user || 'Bạn đọc',
      text: c.text || c.content || ''
    })),
    user: {
      firebaseUid: mPost.authorId || mPost.user?.firebaseUid,
      name: mPost.author?.name || mPost.user?.name || 'Thành viên Vivu360',
      avatar: userAvatar,
      level: mPost.author?.level || mPost.user?.level || 'Cấp 1',
    }
  };
}

