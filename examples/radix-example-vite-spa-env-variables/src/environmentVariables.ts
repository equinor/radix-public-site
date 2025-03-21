const envVars = {
  deploymentEnvironment: "${VITE_DEPLOYMENT_ENVIRONMENT}",
};
  
export function envVariables() {
  return {
    deploymentEnvironment: !envVars.deploymentEnvironment.includes("{VITE_DEPLOYMENT_ENVIRONMENT}")
      ? envVars.deploymentEnvironment
      : import.meta.env.VITE_DEPLOYMENT_ENVIRONMENT,
  };
}