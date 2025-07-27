#!/usr/bin/env node

import { createMonorepo } from './index';

createMonorepo().catch((error: any) => {
  console.error(error);
  process.exit(1);
});
