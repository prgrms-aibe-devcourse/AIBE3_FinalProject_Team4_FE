const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const apiFetch = (url: string, options?: RequestInit) => {
  options = options || {};
  options.credentials = 'include';
  if (options?.body) {
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    options.headers = headers;
  }

  return fetch(`${API_BASE_URL}${url}`, options).then((res) => res.json());
};

/*

const [posts, setPosts] = useState<{ id: number; title: string }[]>([])
useEffect(() => {
        apiFetch('/api/v1/posts').then(setPosts)
    }, [])

*/
