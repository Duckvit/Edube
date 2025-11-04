import axiosConfig from "../axiosConfig";

export const getEnrollmentsByLearner = async (learnerId, token) => {
  const config = {};
  if (token) config.headers = { Authorization: `Bearer ${token}` };
  const res = await axiosConfig.get(
    `/api/enrollments/learner/${learnerId}`,
    config
  );
  return res.data;
};

// Create a new enrollment
export const createEnrollment = async (payload, token) => {
  const config = {};
  if (token) config.headers = { Authorization: `Bearer ${token}` };
  const res = await axiosConfig.post(`/api/enrollments`, payload, config);
  return res.data;
};

export const createFreeEnrollments = async (token, data) => {
  const res = await axiosConfig.post(`/api/enrollments/free`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Patch enrollment progress: PATCH /api/enrollments/{id}/progress?progressPercentage={value}
export const patchEnrollmentProgress = async (
  enrollmentId,
  progressPercentage,
  token
) => {
  const res = await axiosConfig.patch(
    `/api/enrollments/${enrollmentId}/progress`,
    null,
    {
      params: { progressPercentage },
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

// Patch enrollment status: PATCH /api/enrollments/{id}/status?status=completed
export const patchEnrollmentStatus = async (enrollmentId, status, token) => {
  const res = await axiosConfig.patch(
    `/api/enrollments/${enrollmentId}/status`,
    null,
    {
      params: { status },
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};
