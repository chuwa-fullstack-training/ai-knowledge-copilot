import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/Card';

describe('Card Component', () => {
  it('renders Card with children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders CardHeader, CardTitle, CardDescription', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
      </Card>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders CardContent with children', () => {
    render(
      <Card>
        <CardContent>
          <p>Content here</p>
        </CardContent>
      </Card>
    );

    expect(screen.getByText('Content here')).toBeInTheDocument();
  });

  it('renders CardFooter with children', () => {
    render(
      <Card>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('applies custom className to Card', () => {
    const { container } = render(<Card className="custom-card">Content</Card>);
    expect(container.firstChild).toHaveClass('custom-card');
  });
});
