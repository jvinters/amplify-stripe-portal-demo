/**
 * Validates that a required environment variable is set
 * @param variableName - The name of the environment variable
 * @returns The value of the environment variable
 * @throws {Error} If the environment variable is not set
 */
export function getRequiredEnv(variableName: string): string {
  const value = process.env[variableName];

  if (!value) {
    throw new Error(`${variableName} environment variable is not set`);
  }

  return value;
}
