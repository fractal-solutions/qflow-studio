
const activeWebhooks = new Map(); // Map<string, http.Server>

export const registerWebhook = (id, serverInstance) => {
  if (activeWebhooks.has(id)) {
    console.warn(`Webhook with ID ${id} already registered. Overwriting.`);
    activeWebhooks.get(id).close(); // Close existing one before overwriting
  }
  activeWebhooks.set(id, serverInstance);
  console.log(`Webhook ${id} registered.`);
};

export const stopWebhook = (id) => {
  if (activeWebhooks.has(id)) {
    const serverInstance = activeWebhooks.get(id);
    return new Promise((resolve, reject) => {
      serverInstance.close((err) => {
        if (err) {
          console.error(`Error closing webhook ${id}:`, err);
          reject(err);
        } else {
          activeWebhooks.delete(id);
          console.log(`Webhook ${id} stopped and unregistered.`);
          resolve();
        }
      });
    });
  } else {
    console.warn(`Webhook with ID ${id} not found in registry.`);
    return Promise.resolve(); // Resolve even if not found, to avoid hanging
  }
};

export const getActiveWebhook = (id) => {
  return activeWebhooks.get(id);
};

export const getAllActiveWebhooks = () => {
  return Array.from(activeWebhooks.keys());
};
