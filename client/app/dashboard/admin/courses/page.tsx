'use client';

// Re-use the educator courses table for admins until a dedicated admin view is built.
// This avoids 404s while keeping real data fetched from the same endpoint.
// NOTE: The educator page already performs its own API fetch & rendering.

export { default } from '../../educator/courses/page';
