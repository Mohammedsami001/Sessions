import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryProfileRepository } from '../../lib/adapters/in-memory-profile-repository';
import { ProfileService } from '../../lib/services/ProfileService';

describe('ProfileService', () => {
  let repo: InMemoryProfileRepository;
  let service: ProfileService;

  beforeEach(() => {
    repo = new InMemoryProfileRepository();
    service = new ProfileService(repo);
  });

  it('ensureProfile returns existing profile if it already exists', async () => {
    // Arrange
    await repo.createProfile({
      id: 'user-123',
      display_name: 'Existing User',
      avatar_url: null,
    });

    // Act
    const profile = await service.ensureProfile('user-123');

    // Assert
    expect(profile).not.toBeNull();
    expect(profile?.display_name).toBe('Existing User');
  });

  it('ensureProfile creates a new profile if it does not exist', async () => {
    // Act
    const profile = await service.ensureProfile('new-user', 'new@example.com', { full_name: 'New User' });

    // Assert
    expect(profile).not.toBeNull();
    expect(profile?.display_name).toBe('New User');
    
    // Verify it was saved in repo
    const inRepo = await repo.fetchProfile('new-user');
    expect(inRepo).not.toBeNull();
    expect(inRepo?.display_name).toBe('New User');
  });

  it('updateProfile updates the profile', async () => {
    // Arrange
    await repo.createProfile({
      id: 'user-456',
      display_name: 'Old Name',
      avatar_url: null,
    });

    // Act
    const profile = await service.updateProfile('user-456', { display_name: 'New Name' });

    // Assert
    expect(profile).not.toBeNull();
    expect(profile?.display_name).toBe('New Name');

    // Verify it was saved in repo
    const inRepo = await repo.fetchProfile('user-456');
    expect(inRepo?.display_name).toBe('New Name');
  });
});
