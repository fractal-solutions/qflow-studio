import { AsyncNode } from '@fractal-solutions/qflow';

export class SharedStateWriterNode extends AsyncNode {
  constructor() {
    super();
  }

  setParams(params) {
    super.setParams(params);
    // params will now contain the structured data from the frontend
    // e.g., { key: { type: 'static', value: 'my_key' }, value: { type: 'static', value: 'my_value' } }
  }

  async prepAsync(shared) {
    // Access parameters from this.params, which was set by setParams
    // We need to resolve them from the structured data
    const keyConfig = this.params.key;
    const valueConfig = this.params.value;

    // Helper to resolve the parameter based on its type
    const resolveParam = (paramConfig, sharedObj) => {
      if (!paramConfig || typeof paramConfig !== 'object' || !paramConfig.type) {
        return paramConfig; // Treat as static if not structured
      }
      if (paramConfig.type === 'static') {
        return paramConfig.value;
      } else if (paramConfig.type === 'shared') {
        // This is where we resolve from the actual shared object at runtime
        return getNestedProperty(sharedObj, paramConfig.value);
      }
      return undefined;
    };

    // We need getNestedProperty here, so let's define it locally or import it
    // For now, I'll assume it's available or we'll add it.
    const getNestedProperty = (obj, path) => {
      return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    const key = resolveParam(keyConfig, shared);
    const value = resolveParam(valueConfig, shared);

    if (!key) {
      throw new Error('SharedStateWriterNode: key parameter is not set or resolved.');
    }
    // Return the parameters so they are available in execAsync via prepRes
    return { key, value };
  }

  async execAsync(prepRes, shared) {
    const { key, value } = prepRes;

    console.log(`SharedStateWriterNode: Writing '${value}' to shared.'${key}'`);
    shared[key] = value;
    return `Successfully wrote '${value}' to shared.'${key}'`;
  }
}