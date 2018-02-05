
export default class Workflow {
  private steps: IStep[];
  /************************************************************************************************
    * Constructor
    ************************************************************************************************/
 constructor(stepCollection: IStep[]) {
   // Vérification intégrité de la step collection
   // 1) 1 seul début
   if (stepCollection.filter((step) => step.type === StepType.START).length !== 1) {
    console.log('Invalid stepCollection');
    throw new Error('Invalid stepCollection');
    // TODO : 2) tous les enchainements sont valides
   } else {
     this.steps = stepCollection;
   }

 }

  /************************************************************************************************
   * Public methods
   ************************************************************************************************/
  public startWorkflow() {
    this.stepResolver(this.steps.find((step) => step.type === StepType.START));
  }

  /************************************************************************************************
   * Privates methods
   ************************************************************************************************/
  /**
   * Workflow Step resolver
   */
  private stepResolver = (step: IStep) => {
    // console.log('stepResolver', step.id);
    step.payload().then((res) => {
      // console.log('stepResolver THEN');
      step.onResolve ? this.stepResolver(step.onResolve(res)) : console.log('stepResolver NO MORE ACTION');
    }).catch((err) => {
      // console.log('stepResolver CATCH');
      step.onReject ? this.stepResolver(step.onReject(err)) : console.log('stepResolver NO MORE ACTION');
    });
  }
}
  /**
   * Workflow Steps Defintions
   */

  /**
   * Workflow Steps Payload Definitions
   */
export interface IActionResult {
  id: string;
  res: any;
}

export interface IStep {
  id: string;
  type: StepType;
  payload: (iteration?: number) => Promise<IActionResult>;
  onResolve?: (res: IActionResult) => IStep;
  onReject?: (err: Error) => IStep;
}

export enum StepType {
  START = 'START',
  NORMAL = 'NORMAL',
  END = 'END',
}
