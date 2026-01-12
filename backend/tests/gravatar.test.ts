import { test, expect } from 'bun:test';
import { generateGravatarUrl } from '../src/utils/gravatar';

test('generateGravatarUrl should generate valid Gravatar URL', () => {
  const email = 'test@example.com';
  const gravatarUrl = generateGravatarUrl(email);

  expect(gravatarUrl).toContain('gravatar.com/avatar/');
  expect(gravatarUrl).toContain('s=200'); // default size
  expect(gravatarUrl).toContain('d=identicon'); // default image type
  expect(gravatarUrl).toContain('r=pg'); // default rating
  expect(gravatarUrl).toStartWith('https://'); // secure protocol
});

test('generateGravatarUrl should handle custom options', () => {
  const email = 'test@example.com';
  const gravatarUrl = generateGravatarUrl(email, {
    size: 150,
    default: 'robohash',
    rating: 'g',
  });

  expect(gravatarUrl).toContain('s=150');
  expect(gravatarUrl).toContain('d=robohash');
  expect(gravatarUrl).toContain('r=g');
});

test('generateGravatarUrl should generate same URL for same email', () => {
  const email = 'test@example.com';
  const url1 = generateGravatarUrl(email);
  const url2 = generateGravatarUrl(email);

  expect(url1).toBe(url2);
});

test('generateGravatarUrl should generate different URLs for different emails', () => {
  const url1 = generateGravatarUrl('user1@example.com');
  const url2 = generateGravatarUrl('user2@example.com');

  expect(url1).not.toBe(url2);
});
