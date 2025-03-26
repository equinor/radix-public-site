const envVars = {
  deploymentEnvironment: "${VITE_DEPLOYMENT_ENVIRONMENT}",
};
  
export function envVariables() {
  return {
    // In our production setup, ${VITE_DEPLOYMENT_ENVIRONMENT} will (should) be replaced from envVars via envsubst.
    // For local development, envsubst does not run (since we are not using nginx, but the Vite development server)
    // So we instead make use of the VITE_* env variables.
    deploymentEnvironment: !envVars.deploymentEnvironment.includes("{VITE_DEPLOYMENT_ENVIRONMENT}")
      ? envVars.deploymentEnvironment
      : import.meta.env.VITE_DEPLOYMENT_ENVIRONMENT,
  };
}