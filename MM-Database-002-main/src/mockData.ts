/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * NOTE: This file is deprecated. All data should be fetched from the backend via Convex queries.
 * These mock data definitions are kept only for reference and testing purposes.
 */

import { Creator, Activity, User } from './types';

// DEPRECATED: Use backend queries instead
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@shah.com', role: 'admin' },
  { id: 'u2', name: 'Manager Sarah', email: 'sarah@shah.com', role: 'manager' },
];

// DEPRECATED: Fetch from api.creators.list instead
export const MOCK_CREATORS: Creator[] = [];

// DEPRECATED: Fetch from api.activities.listAll instead
export const MOCK_ACTIVITIES: Activity[] = [];

