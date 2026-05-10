import { execSync } from 'child_process';
import "dotenv/config";
import { defineConfig } from "@prisma/config";

// Read from config/env
const dbUrl = process.env.DATABASE_URL;

try {
  execSync(`npx prisma migrate diff --from-url "${dbUrl}" --to-schema-datamodel prisma/schema.prisma --script > diff.sql`, { stdio: 'inherit' });
  console.log('Diff generated!');
} catch (e) {
  console.error(e);
}
