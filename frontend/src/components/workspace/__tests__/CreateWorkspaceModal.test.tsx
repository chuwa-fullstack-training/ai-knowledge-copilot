import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../test/utils/test-utils';
import { CreateWorkspaceModal } from '../../../components/workspace/CreateWorkspaceModal';

describe('CreateWorkspaceModal', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when open is true', () => {
    renderWithProviders(
      <CreateWorkspaceModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText(/create workspace/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/workspace name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    renderWithProviders(
      <CreateWorkspaceModal
        open={false}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.queryByText(/create workspace/i)).not.toBeInTheDocument();
  });

  it('validates workspace name (min 3 chars)', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <CreateWorkspaceModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByLabelText(/workspace name/i);
    const submitButton = screen.getByRole('button', { name: /create/i });

    await user.type(nameInput, 'AB'); // Less than 3 characters
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/workspace name must be at least 3 characters/i)).toBeInTheDocument();
    });
  });

  it('closes modal on cancel', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <CreateWorkspaceModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
