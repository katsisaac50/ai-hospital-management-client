export const authFetch = async (
  url: string,
  options: RequestInit = {},
  retries = 3
): Promise<Response> => {
  const token = localStorage.getItem("token")

  // No token → force login
  if (!token) {
    // redirectToLogin()
    throw new Error("Authentication required")
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, { ...options, headers })

      // Handle expired session
      if (response.status === 401) {
        localStorage.removeItem("token")
        // redirectToLogin()
        throw new Error("Session expired. Please log in again.")
      }

      // Handle rate-limiting
      if (response.status === 429 && attempt < retries) {
        const retryAfter = response.headers.get("Retry-After")
        const delay = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : Math.pow(2, attempt) * 1000

        console.warn(`Rate limited. Retrying in ${delay}ms...`)
        await new Promise(res => setTimeout(res, delay))
        continue
      }

      // Handle other non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Request failed with status ${response.status}`)
      }

      return response
    } catch (err) {
      console.error(`Attempt ${attempt + 1} failed:`, err)

      if (attempt === retries) throw err

      // Retry after backoff
      const delay = Math.pow(2, attempt) * 1000
      await new Promise(res => setTimeout(res, delay))
    }
  }

  throw new Error("Max retries exceeded")
}

// JSON helper wrapper

// const patients = await authFetchJson<Patient[]>("/api/patients")
// console.log("Patients:", patients)
export const authFetchJson = async <T = any>(
  url: string,
  options: RequestInit = {},
  retries = 3
): Promise<T> => {
  const response = await authFetch(url, options, retries)
  return response.json()
}

// Helper function to redirect to login
// const redirectToLogin = () => {
//   if (typeof window !== 'undefined') {
//     const currentPath = window.location.pathname;
//     window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
//   }
// };