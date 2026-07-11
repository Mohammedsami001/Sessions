import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GlobalChatPage from '../app/global-chat/page';

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: '123' } } } })
    },
    channel: vi.fn().mockReturnValue({ on: vi.fn().mockReturnValue({ subscribe: vi.fn() }) }),
    removeChannel: vi.fn(),
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { display_name: 'test' }, error: null })
        }),
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            is: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        })
      }),
      upsert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { display_name: 'test' }, error: null })
        })
      })
    })
  }
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useParams: () => ({})
}));

describe('GlobalChatPage', () => {
  it('renders the global chat portal', async () => {
    render(<GlobalChatPage />);
    expect(await screen.findByText(/Global Network/i)).not.toBeNull();
    expect(await screen.findByText(/Return to Dashboard/i)).not.toBeNull();
  });
});
