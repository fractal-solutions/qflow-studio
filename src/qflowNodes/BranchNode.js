import { AsyncNode } from '@fractal-solutions/qflow';

class BranchNode extends AsyncNode {
  constructor() {
    super();
    this.conditionSource = 'static'; // 'static', 'sharedState', 'expression'
    this.conditionValue = '';
    this.branches = [{ value: 'default', label: 'Default Branch' }];
  }

  async execAsync() {
    let result = 'default';

    switch (this.conditionSource) {
      case 'static':
        // For static, the conditionValue itself is the branch to take
        result = this.conditionValue;
        break;
      case 'sharedState':
        // For sharedState, conditionValue is the key to look up in shared state
        // The value of that shared state key determines the branch
        const sharedStateValue = this.getSharedState(this.conditionValue);
        // Find a branch whose 'value' matches the shared state value
        const matchingBranchByValue = this.branches.find(b => b.value === String(sharedStateValue));
        if (matchingBranchByValue) {
          result = matchingBranchByValue.value;
        } else {
          console.warn(`BranchNode: No matching branch found for shared state value '${sharedStateValue}'. Falling back to default.`);
          result = 'default';
        }
        break;
      case 'expression':
        // For expression, conditionValue is a JavaScript expression to evaluate
        // The result of the expression determines the branch
        try {
          // Create a function from the expression, passing sharedState as context
          const evaluate = new Function('sharedState', `return ${this.conditionValue};`);
          const expressionResult = evaluate(this.getSharedState());
          
          // Find a branch whose 'value' matches the expression result
          const matchingBranchByExpression = this.branches.find(b => b.value === String(expressionResult));
          if (matchingBranchByExpression) {
            result = matchingBranchByExpression.value;
          } else {
            console.warn(`BranchNode: No matching branch found for expression result '${expressionResult}'. Falling back to default.`);
            result = 'default';
          }
        } catch (e) {
          console.error(`BranchNode: Error evaluating expression '${this.conditionValue}':`, e);
          result = 'default'; // Fallback on error
        }
        break;
      default:
        console.warn(`BranchNode: Unknown condition source '${this.conditionSource}'. Falling back to default.`);
        result = 'default';
    }

    // Ensure the returned result is one of the defined branch values
    const isValidBranch = this.branches.some(b => b.value === result);
    if (!isValidBranch) {
      console.warn(`BranchNode: Determined branch '${result}' is not defined in branches. Falling back to default.`);
      result = 'default';
    }

    console.log(`BranchNode: Executed. Returning branch: ${result}`);
    return result;
  }
}

export { BranchNode };
