import api from '../api';

// Single place for every API call the UI makes. Each function resolves to response data.
const data = (request) => request.then((r) => r.data);

export const courseApi = {
  list: (params) => data(api.get('/courses', { params })),
  categories: () => data(api.get('/courses/categories')),
  get: (id) => data(api.get(`/courses/${id}`)),
  create: (body) => data(api.post('/courses', body)),
  update: (id, body) => data(api.put(`/courses/${id}`, body)),
  remove: (id) => data(api.delete(`/courses/${id}`)),
};

export const enrollmentApi = {
  enroll: (courseId) => data(api.post('/enrollments', { courseId })),
  mine: () => data(api.get('/enrollments/my-courses')),
  complete: (id) => data(api.patch(`/enrollments/${id}`, { status: 'completed' })),
  remove: (id) => data(api.delete(`/enrollments/${id}`)),
  all: () => data(api.get('/enrollments')),
};

export const userApi = { all: () => data(api.get('/users')) };
export const statsApi = { get: () => data(api.get('/stats')) };
