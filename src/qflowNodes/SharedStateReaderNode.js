import { AsyncNode } from '@fractal-solutions/qflow';

export class SharedStateReaderNode extends AsyncNode {
  constructor() {
    super();
  }

  setParams(params) {
    super.setParams(params);
  }

  async prepAsync(shared) {
    const sharedKeyConfig = this.params.sharedKey;

    const resolveParam = (paramConfig, sharedObj) => {
      if (!paramConfig || typeof paramConfig !== 'object' || !paramConfig.type) {
        return paramConfig;
      }
      if (paramConfig.type === 'static') {
        return paramConfig.value;
      } else if (paramConfig.type === 'shared') {
        return getNestedProperty(sharedObj, paramConfig.value);
      }
      return undefined;
    };

    const getNestedProperty = (obj, path) => {
      return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    const sharedKey = resolveParam(sharedKeyConfig, shared);

    if (!sharedKey) {
      throw new Error('SharedStateReaderNode: sharedKey parameter is not set or resolved.');
    }
    
    const value = shared[sharedKey];
    if (value === undefined) {
      console.warn(`SharedStateReaderNode: Key '${sharedKey}' not found in shared state.`);
    }
    
    return { sharedKey, valueFromShared: value };
  }

  async execAsync(prepRes) {
    const { sharedKey, valueFromShared } = prepRes;

    console.log('SharedStateReaderNode: Executing with prepared data:', valueFromShared);
    return `Successfully read '${sharedKey}': ${JSON.stringify(valueFromShared)}`;
  }
}