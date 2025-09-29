import { app } from './app.js';
import { config } from './config/index.js';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 PhishGuard Backend running on port ${PORT}`);
  console.log(`📋 Environment: ${config.nodeEnv}`);
  console.log(`🔒 Sandbox mode: ${config.sandboxMode}`);
});