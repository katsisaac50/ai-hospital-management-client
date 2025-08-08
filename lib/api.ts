export const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  console.log("token", token)
  // If no token exists, redirect to login
  if (!token) {
    // redirectToLogin();
    throw new Error('Authentication required');
  }

  const headers = {
    ...(options.headers || {}),
   Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(url, { ...options, headers });

    console.log('apt response', response)

    // Handle 401 Unauthorized responses
    if (response.status === 401) {
      localStorage.removeItem("token");
      throw new Error('Session expired. Please log in again.');
    }

//     if (error.response?.data?.error?.includes('Please log in again')) {
//   localStorage.removeItem('token');
//   window.location.href = '/login?session=expired';
// }

    // Handle other error responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Request failed');
    }
    // If the response is successful, return the response object
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Helper function to redirect to login
// const redirectToLogin = () => {
//   if (typeof window !== 'undefined') {
//     const currentPath = window.location.pathname;
//     window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
//   }
// };