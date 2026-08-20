export const getHeaders = () => {
  const token = localStorage.getItem('uniport_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Authentication Actions
  auth: {
    async register(payload) {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      return data;
    },

    async verifyOTP(payload) {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      return data;
    },

    async resendOTP(payload) {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend verification code');
      return data;
    },

    async login(payload) {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        const err = new Error(data.error || 'Authentication credentials rejected');
        err.requireVerification = data.requireVerification;
        err.email = data.email;
        err.otpCode = data.otpCode;
        throw err;
      }
      return data;
    },

    async me() {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        headers: getHeaders(),
      });
      if (!res.ok) {
        localStorage.removeItem('uniport_token');
        throw new Error('Session credentials expired');
      }
      return await res.json();
    }
  },

  // Student Enrollment Actions
  student: {
    async submitForm(payload) {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Form submission failure');
      return data;
    },

    async getStatus() {
      const res = await fetch('/api/students/my', {
        method: 'GET',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch personal registration status');
      return data;
    }
  },

  // Administrative Control Actions
  admin: {
    async getApplications() {
      const res = await fetch('/api/students', {
        method: 'GET',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch student registry list');
      return data;
    },

    async getApplicationDetails(id) {
      const res = await fetch(`/api/students/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch registration details');
      return data;
    },

    async updateStatus(id, payload) {
      const res = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update student workflow status');
      return data;
    },

    async deleteApplication(id) {
      const res = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete applicant record');
      return data;
    },

    async getStats() {
      const res = await fetch('/api/stats', {
        method: 'GET',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch registry stats');
      return data;
    }
  },

  // Notifications Actions
  notifications: {
    async getAll() {
      const token = localStorage.getItem('uniport_token');
      if (!token) {
        return { notifications: [], unreadCount: 0 };
      }
      try {
        const res = await fetch('/api/notifications', {
          method: 'GET',
          headers: getHeaders(),
        });
        if (!res.ok) {
          if (res.status === 401) {
            return { notifications: [], unreadCount: 0 };
          }
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to fetch notifications');
        }
        const data = await res.json().catch(() => ({ notifications: [], unreadCount: 0 }));
        return {
          notifications: Array.isArray(data?.notifications) ? data.notifications : [],
          unreadCount: typeof data?.unreadCount === 'number' ? data.unreadCount : 0,
        };
      } catch (err) {
        return { notifications: [], unreadCount: 0 };
      }
    },

    async markRead(id) {
      try {
        const res = await fetch(`/api/notifications/${id}/read`, {
          method: 'PUT',
          headers: getHeaders(),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Failed to update notification');
        return data;
      } catch (err) {
        return { success: false };
      }
    },

    async markAllRead() {
      try {
        const res = await fetch('/api/notifications/read-all', {
          method: 'PUT',
          headers: getHeaders(),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Failed to update notifications');
        return data;
      } catch (err) {
        return { success: false };
      }
    },

    async deleteNotif(id) {
      try {
        const res = await fetch(`/api/notifications/${id}`, {
          method: 'DELETE',
          headers: getHeaders(),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Failed to delete notification');
        return data;
      } catch (err) {
        return { success: false };
      }
    }
  }
};
