import { execSync } from 'child_process';

/**
 * Agent OS Skill: verify-build
 * Description: AI agents must run this script before marking a task complete.
 * It ensures there are no TypeScript errors and that the linter passes.
 */
function verify() {
  console.log("🛠️ Running Agent OS Verification Skill...");

  try {
    console.log("1. Checking TypeScript compilation...");
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
    
    console.log("2. Running ESLint...");
    execSync('npm run lint', { stdio: 'inherit' });

    console.log("✅ Verification Passed! The agent may proceed.");
  } catch (error) {
    console.error("❌ Verification Failed! The agent must fix these errors before proceeding.");
    process.exit(1);
  }
}

verify();
