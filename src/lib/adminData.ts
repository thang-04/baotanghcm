export interface AdminData {
  galleries: unknown[];
  exhibits: unknown[];
}

type AdminDataFetcher = (url: string, init?: RequestInit) => Promise<Response>;

export async function fetchAdminData(
  fetcher: AdminDataFetcher = fetch,
  timeoutMs = 10_000,
): Promise<AdminData> {
  const loadData = Promise.all([
    fetcher('/api/galleries'),
    fetcher('/api/exhibits'),
  ]).then(async ([galleriesResponse, exhibitsResponse]) => {
    if (!galleriesResponse.ok || !exhibitsResponse.ok) {
      throw new Error('Không thể kết nối đến máy chủ.');
    }

    const [galleries, exhibits] = await Promise.all([
      galleriesResponse.json(),
      exhibitsResponse.json(),
    ]);

    return { galleries, exhibits };
  });

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Quá thời gian tải dữ liệu quản trị.'));
    }, timeoutMs);
  });

  try {
    return await Promise.race([loadData, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
