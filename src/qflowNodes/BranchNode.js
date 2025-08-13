import { AsyncNode } from '@fractal-solutions/qflow';

class BranchNode extends AsyncNode {
  constructor() {
    super();
    this.conditionSource = 'static'; // 'static', 'sharedState', 'expression'
    this.conditionValue = '';
    this.branches = [{ value: 'default', label: 'Default Branch' }];
    this.previousNodeResult = null;
  }

  async prepAsync(shared, prepRes) {
    this.previousNodeResult = prepRes;
    return prepRes;
  }

  async execAsync() {
    // This node's primary execution doesn't produce a direct output for the next node.
    // It determines the branch, which will be returned by postAsync.
    console.log(`BranchNode: Executing execAsync to determine branch.`);
    return undefined; // Or a generic success/status object if needed
  }

  async postAsync(shared, prepRes, execRes) {
    let result = 'default';

    switch (this.conditionSource) {
      case 'static':
        result = this.conditionValue;
        break;
      case 'sharedState':
        const sharedStateValue = this.getSharedState(this.conditionValue);
        const matchingBranchByValue = this.branches.find(b => b.value === String(sharedStateValue));
        if (matchingBranchByValue) {
          result = matchingBranchByValue.value;
        } else {
          console.warn(`BranchNode: No matching branch found for shared state value '${sharedStateValue}'. Falling back to default.`);
          result = 'default';
        }
        break;
      case 'expression':
        try {
          const evaluate = new Function('sharedState', `return ${this.conditionValue};`);
          const expressionResult = evaluate(this.getSharedState());
          const matchingBranchByExpression = this.branches.find(b => b.value === String(expressionResult));
          if (matchingBranchByExpression) {
            result = matchingBranchByExpression.value;
          } else {
            console.warn(`BranchNode: No matching branch found for expression result '${expressionResult}'. Falling back to default.`);
            result = 'default';
          }
        } catch (e) {
          console.error(`BranchNode: Error evaluating expression '${this.conditionValue}':`, e);
          result = 'default';
        }
        break;
      case 'previousNodeResult':
        result = this.previousNodeResult;
        break;
      default:
        console.warn(`BranchNode: Unknown condition source '${this.conditionSource}'. Falling back to default.`);
        result = 'default';
    }

    const isValidBranch = this.branches.some(b => b.value === result);
    if (!isValidBranch) {
      console.warn(`BranchNode: Determined branch '${result}' is not defined in branches. Falling back to default.`);
      result = 'default';
    }

    console.log(`BranchNode: postAsync returning branch: ${result}`);
    return result; // Return the branch name
  }
}

export { BranchNode };