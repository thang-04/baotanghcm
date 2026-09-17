import { describe, expect, it } from 'vitest';
import { fetchAdminData } from './adminData';

describe('fetchAdminData', () => {
  it('loads galleries and exhibits together', async () => {
    const fetcher = async (url: string) => new Response(
      JSON.stringify(url.endsWith('galleries') ? [{ id: 'gallery-1' }] : [{ id: 'exhibit-1' }]),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );

    await expect(fetchAdminData(fetcher)).resolves.toEqual({
      galleries: [{ id: 'gallery-1' }],
      exhibits: [{ id: 'exhibit-1' }],
    });
  });

  it('fails instead of waiting forever when an endpoint hangs', async () => {
    const fetcher = async (url: string) => {
      if (url.endsWith('exhibits')) return new Promise<Response>(() => {});
      return new Response('[]', { status: 200 });
    };

    await expect(fetchAdminData(fetcher, 5)).rejects.toThrow('Quá thời gian tải dữ liệu quản trị.');
  });
});
